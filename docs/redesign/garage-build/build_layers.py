"""Build app assets for "Min bil" from the Codex images in docs/redesign/garage-build/<base>/.

- base.png      -> dist/assets/mybil/<base>/base.webp   (white background removed)
- nowheels.png  -> body.webp (vehicle without wheels) + wheels.webp (the base's own wheels), used for lowering
- <part>.png    -> <part>.webp: pixels that differ from the base, limited to the slot's region (catalog.json)
QA gate: a part is REJECTED when too much of the vehicle changed outside its region (the image model moved or
redrew the vehicle, e.g. a "ghost car"). Rejected parts are listed in rejects.json and left out of the manifest.
Writes dist/assets/mybil/manifest.json (approved parts per base) and a preview.jpg per base.

Usage: python build_layers.py [base ...]
"""
import json, os, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
# --src <dir> selects the image set (default: this folder); v5 lives in docs/redesign/garage-v5
HERE = os.path.abspath(sys.argv[sys.argv.index('--src') + 1]) if '--src' in sys.argv else os.path.dirname(os.path.abspath(__file__))
if '--src' in sys.argv: del sys.argv[sys.argv.index('--src'):sys.argv.index('--src') + 2]
OUT = os.path.join(ROOT, 'dist', 'assets', 'mybil')
SIZE = 768
OUTSIDE_LIMIT = 0.035   # max share of the vehicle area that may change outside the part's region
CAT = json.load(open(os.path.join(HERE, 'catalog.json'), encoding='utf-8'))
SLOTS, PARTS = CAT['slots'], CAT['parts']

def largest_island(mask):
    """bounding box of the biggest connected white area of a mask"""
    import numpy as np
    from scipy import ndimage
    labels, n = ndimage.label(np.asarray(mask) > 128)
    if not n: return None
    sizes = ndimage.sum(np.ones_like(labels), labels, range(1, n + 1)); sl = ndimage.find_objects((labels == int(np.argmax(sizes)) + 1).astype(int))[0]
    return (sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)

def subject_bbox(im, tol=18):
    return im.convert('L').point(lambda v: 255 if v < 255 - tol else 0).getbbox()

def white_alpha(im, tol=18):
    from collections import deque
    rgb = im.convert('RGB'); W, H = rgb.size; px = rgb.load(); seen = bytearray(W * H); q = deque()
    for x in range(W): q.extend(((x, 0), (x, H - 1)))
    for y in range(H): q.extend(((0, y), (W - 1, y)))
    while q:
        x, y = q.popleft(); i = y * W + x
        if seen[i] or min(px[x, y]) < 255 - tol: continue
        seen[i] = 1
        if x: q.append((x - 1, y))
        if x < W - 1: q.append((x + 1, y))
        if y: q.append((x, y - 1))
        if y < H - 1: q.append((x, y + 1))
    return Image.frombytes('L', (W, H), bytes(0 if s else 255 for s in seen)).filter(ImageFilter.GaussianBlur(0.7))

def _shift(img, dx, dy):
    canvas = Image.new('RGB', img.size, 'white'); canvas.paste(img, (dx, dy)); return canvas

def _score(a, b):
    return sum(ImageChops.difference(a, b).getdata())

def align(edited, base):
    """Translation-only alignment (no scaling): added parts like spoilers enlarge the outline, so matching
    bounding boxes would distort the vehicle. Coarse search at 1/4 scale, then refine at full scale.
    The image model sometimes returns another canvas size (e.g. 1254 px); the whole canvas is scaled first."""
    if edited.size != base.size:
        edited = edited.resize(base.size, Image.LANCZOS)
    small = (base.width // 4, base.height // 4)
    b4, e4 = base.convert('L').resize(small), edited.convert('L').resize(small)
    best = min(((_score(b4, ImageChops.offset(e4, dx, dy)), dx, dy) for dx in range(-8, 9) for dy in range(-8, 9)))
    dx, dy = best[1] * 4, best[2] * 4
    bL, eL = base.convert('L'), edited.convert('L')
    fine = min(((_score(bL, ImageChops.offset(eL, dx + fx, dy + fy)), fx, fy) for fx in range(-3, 4) for fy in range(-3, 4)))
    return _shift(edited, dx + fine[1], dy + fine[2])

PENDING = []

def save(img, path):
    """Deferred: all layers of a vehicle are cropped to one shared square box before writing (see flush)."""
    PENDING.append((img, path))

def flush():
    """Crop every layer of the vehicle to the union of everything drawn (base + all parts), as a padded square,
    so every vehicle fills the stage equally and all layers keep lining up. Returns the crop box."""
    box = None
    for img, _ in PENDING:
        b = img.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
        if b: box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    side = int(max(box[2] - box[0], box[3] - box[1]) * 1.08)
    cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    crop = (cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side)
    for img, path in PENDING:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        img.crop(crop).resize((SIZE, SIZE), Image.LANCZOS).save(path, 'WEBP', quality=86, method=6)
    PENDING.clear()
    return crop

def region_mask(size, bb, frac, pad=8):
    x0, y0, x1, y1 = frac; bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rectangle([bb[0] + x0 * bw - pad, bb[1] + y0 * bh - pad, bb[0] + x1 * bw + pad, bb[1] + y1 * bh + pad], fill=255)
    return m

def count(mask):
    return sum(1 for v in mask.getdata() if v > 128)

def tint_layer(part, base, edited, base_alpha, region, vehicle_area, base_id, approved, rejects, tiles):
    """A recolourable mask: flat light panels (white/grey, or a magenta key on light vehicles) bounded by the black outlines.
    A panel counts when a good share of it changed from the base, so untouched grey rims and mirrors stay out.
    The saved layer is grey shading only; the app puts the chosen colour under it."""
    import numpy as np
    from scipy import ndimage
    b = np.asarray(base, dtype=np.int16); e = np.asarray(edited, dtype=np.int16)
    spread = e.max(2) - e.min(2)
    magenta = (e[..., 0] > 140) & (e[..., 2] > 140) & (e[..., 1] < 90)
    key = ((e.min(2) >= 190) & (spread <= 22)) | magenta
    key &= np.asarray(base_alpha) > 0  # only on the vehicle: a white panel can touch the white background through a gap in its outline
    changed = np.abs(b - e).max(2) > 16
    lab, n = ndimage.label(key)
    idx = range(1, n + 1)
    area = ndimage.sum(np.ones_like(lab), lab, idx); share = ndimage.sum(changed, lab, idx) / np.maximum(area, 1)
    keep = np.zeros(n + 1, bool); keep[1:] = (area > 60) & (share > 0.35)
    if part['slot'] == 'paint':  # a white vehicle is already "painted": its big white panels count too
        white = ndimage.mean(b.min(2), lab, idx) >= 232
        keep[1:] |= white & (area > 0.004 * vehicle_area) & (area < vehicle_area)
    m = keep[lab] & (np.asarray(base_alpha) > 0) & (np.asarray(region) > 0)
    dark = e.max(2) < 120
    m = m | (ndimage.binary_dilation(m, iterations=3) & dark)  # cover the outline's soft edge, never the background
    inside = m.sum() / vehicle_area
    if inside < 0.002:
        rejects.append({'part': part['id'], 'outside': 0, 'inside': round(float(inside), 4)}); return
    grey = np.where(magenta, e[..., 0], e.mean(2)).clip(0, 255).astype(np.uint8)
    rgba = np.dstack([grey, grey, grey, (m * 255).astype(np.uint8)])
    layer = Image.fromarray(rgba, 'RGBA')
    layer.putalpha(layer.getchannel('A').filter(ImageFilter.GaussianBlur(0.6)))
    save(layer, os.path.join(OUT, base_id, part['id'] + '.webp'))
    approved.append(part['id']); tiles.append((part['id'], layer))

def build(base_id):
    d = os.path.join(HERE, base_id)
    base = Image.open(os.path.join(d, 'base.png')).convert('RGB')
    base_alpha = white_alpha(base)
    base_rgba = base.convert('RGBA'); base_rgba.putalpha(base_alpha); save(base_rgba, os.path.join(OUT, base_id, 'base.webp'))
    bb = subject_bbox(base); vehicle_area = max(1, count(base_alpha))
    approved, rejects, tiles = [], [], [('base', base_rgba)]

    nowheels = os.path.join(d, 'nowheels.png')
    split = False
    wheel_mask = None  # where the base's own wheels are; a wheel part always replaces all of it
    if os.path.exists(nowheels):
        body = align(Image.open(nowheels).convert('RGB'), base)
        diff = ImageChops.difference(base, body).convert('L').point(lambda v: 255 if v > 38 else 0)
        diff = diff.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(7))
        outside = count(ImageChops.multiply(diff, ImageChops.invert(region_mask(base.size, bb, SLOTS['wheels']['region'])))) / vehicle_area
        if outside <= OUTSIDE_LIMIT:
            body_rgba = body.convert('RGBA'); body_rgba.putalpha(white_alpha(body)); save(body_rgba, os.path.join(OUT, base_id, 'body.webp'))
            wheels = base.convert('RGBA'); wheels.putalpha(ImageChops.multiply(ImageChops.multiply(diff, region_mask(base.size, bb, SLOTS['wheels']['region'])), base_alpha))
            save(wheels, os.path.join(OUT, base_id, 'wheels.webp')); split = True
            wheel_mask = ImageChops.multiply(diff, region_mask(base.size, bb, SLOTS['wheels']['region']))
        else:
            rejects.append({'part': 'nowheels', 'outside': round(outside, 3)})

    for part in PARTS:
        if part.get('bases') and base_id not in part['bases']: continue
        p = os.path.join(d, part['id'] + '.png')
        if not os.path.exists(p): continue
        slot = SLOTS[part['slot']]
        edited = align(Image.open(p).convert('RGB'), base)
        region = region_mask(base.size, bb, slot['region'])
        if part.get('tint'):
            tint_layer(part, base, edited, base_alpha, region, vehicle_area, base_id, approved, rejects, tiles); continue
        diff = ImageChops.difference(base, edited).convert('L').point(lambda v: 255 if v > 38 else 0)
        diff = diff.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(5))
        if part['slot'] == 'restore' and wheel_mask is not None:  # the body layer must not carry wheels when lowered
            diff = ImageChops.multiply(diff, ImageChops.invert(wheel_mask))
        if part['slot'] == 'wheels' and wheel_mask is not None:  # similar-looking rims only differ in specks
            diff = ImageChops.lighter(diff, ImageChops.multiply(wheel_mask, region))
        outside = count(ImageChops.multiply(diff, ImageChops.invert(region))) / vehicle_area
        inside = count(ImageChops.multiply(diff, region)) / vehicle_area
        if outside > OUTSIDE_LIMIT or inside < 0.002:
            rejects.append({'part': part['id'], 'outside': round(outside, 3), 'inside': round(inside, 4)}); continue
        alpha = ImageChops.multiply(ImageChops.multiply(diff, region), white_alpha(edited)).filter(ImageFilter.GaussianBlur(0.8))
        layer = edited.convert('RGBA'); layer.putalpha(alpha)
        save(layer, os.path.join(OUT, base_id, part['id'] + '.webp'))
        approved.append(part['id']); tiles.append((part['id'], layer))

    cols = 6
    sheet = Image.new('RGB', (220 * cols, 244 * ((len(tiles) + cols - 1) // cols)), 'white'); dr = ImageDraw.Draw(sheet)
    for i, (name, layer) in enumerate(tiles):
        c = Image.new('RGBA', base.size, (255, 255, 255, 255)); c.alpha_composite(base_rgba)
        if name != 'base': c.alpha_composite(layer)
        x, y = (i % cols) * 220, (i // cols) * 244
        sheet.paste(c.convert('RGB').crop(bb).resize((216, 216 * (bb[3] - bb[1]) // max(1, bb[2] - bb[0])) if bb[2] > bb[0] else (216, 216)), (x + 2, y + 24))
        dr.text((x + 6, y + 6), name, fill='black')
    sheet.save(os.path.join(d, 'preview.jpg'), quality=86)
    json.dump(rejects, open(os.path.join(d, 'rejects.json'), 'w'), indent=1)
    print(f"{base_id}: {len(approved)} approved, {len(rejects)} rejected {[r['part'] for r in rejects]}, split={'yes' if split else 'no'}")
    tint = {p['id']: p['tint'] for p in PARTS if p.get('tint') and p['id'] in approved}
    crop = flush()
    S = crop[2] - crop[0]
    frac = lambda b: [round((b[0] - crop[0]) / S, 4), round((b[1] - crop[1]) / S, 4), round((b[2] - crop[0]) / S, 4), round((b[3] - crop[1]) / S, 4)]
    info = {'parts': approved, 'split': split, 'tint': tint, 'bbox': frac(bb)}
    plate = os.path.join(d, 'plate-blank.png')
    if os.path.exists(plate):  # a blank licence plate edit: its changed area is where the app writes the text
        edited = align(Image.open(plate).convert('RGB'), base)
        pd = ImageChops.difference(base, edited).convert('L').point(lambda v: 255 if v > 38 else 0)
        # only the plate itself: changed pixels that are now near white (the model may also nudge shading elsewhere)
        white = edited.convert('L').point(lambda v: 255 if v > 205 else 0)
        pd = ImageChops.multiply(pd, white).filter(ImageFilter.MedianFilter(5))
        pb = largest_island(pd)
        if pb: info['plate'] = frac(pb)
    return info

manifest_path = os.path.join(OUT, 'manifest.json')
manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
for b in (sys.argv[1:] or ['scooter', 'smallcar', 'bigcar', 'racecar']):
    if os.path.exists(os.path.join(HERE, b, 'base.png')): manifest[b] = build(b)
    else: print(b, 'no base yet')
os.makedirs(OUT, exist_ok=True)
json.dump(manifest, open(manifest_path, 'w'), indent=1)
