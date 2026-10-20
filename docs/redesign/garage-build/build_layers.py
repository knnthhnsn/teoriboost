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

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'dist', 'assets', 'mybil')
SIZE = 768
OUTSIDE_LIMIT = 0.035   # max share of the vehicle area that may change outside the part's region
CAT = json.load(open(os.path.join(HERE, 'catalog.json'), encoding='utf-8'))
SLOTS, PARTS = CAT['slots'], CAT['parts']

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

def save(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.resize((SIZE, SIZE), Image.LANCZOS).save(path, 'WEBP', quality=86, method=6)

def region_mask(size, bb, frac, pad=8):
    x0, y0, x1, y1 = frac; bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rectangle([bb[0] + x0 * bw - pad, bb[1] + y0 * bh - pad, bb[0] + x1 * bw + pad, bb[1] + y1 * bh + pad], fill=255)
    return m

def count(mask):
    return sum(1 for v in mask.getdata() if v > 128)

def build(base_id):
    d = os.path.join(HERE, base_id)
    base = Image.open(os.path.join(d, 'base.png')).convert('RGB')
    base_alpha = white_alpha(base)
    base_rgba = base.convert('RGBA'); base_rgba.putalpha(base_alpha); save(base_rgba, os.path.join(OUT, base_id, 'base.webp'))
    bb = subject_bbox(base); vehicle_area = max(1, count(base_alpha))
    approved, rejects, tiles = [], [], [('base', base_rgba)]

    nowheels = os.path.join(d, 'nowheels.png')
    split = False
    if os.path.exists(nowheels):
        body = align(Image.open(nowheels).convert('RGB'), base)
        diff = ImageChops.difference(base, body).convert('L').point(lambda v: 255 if v > 38 else 0)
        diff = diff.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(7))
        outside = count(ImageChops.multiply(diff, ImageChops.invert(region_mask(base.size, bb, SLOTS['wheels']['region'])))) / vehicle_area
        if outside <= OUTSIDE_LIMIT:
            body_rgba = body.convert('RGBA'); body_rgba.putalpha(white_alpha(body)); save(body_rgba, os.path.join(OUT, base_id, 'body.webp'))
            wheels = base.convert('RGBA'); wheels.putalpha(ImageChops.multiply(ImageChops.multiply(diff, region_mask(base.size, bb, SLOTS['wheels']['region'])), base_alpha))
            save(wheels, os.path.join(OUT, base_id, 'wheels.webp')); split = True
        else:
            rejects.append({'part': 'nowheels', 'outside': round(outside, 3)})

    for part in PARTS:
        if part.get('bases') and base_id not in part['bases']: continue
        p = os.path.join(d, part['id'] + '.png')
        if not os.path.exists(p): continue
        slot = SLOTS[part['slot']]
        edited = align(Image.open(p).convert('RGB'), base)
        diff = ImageChops.difference(base, edited).convert('L').point(lambda v: 255 if v > 38 else 0)
        diff = diff.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(5))
        region = region_mask(base.size, bb, slot['region'])
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
    return {'parts': approved, 'split': split}

manifest_path = os.path.join(OUT, 'manifest.json')
manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
for b in (sys.argv[1:] or ['scooter', 'smallcar', 'bigcar', 'racecar']):
    if os.path.exists(os.path.join(HERE, b, 'base.png')): manifest[b] = build(b)
    else: print(b, 'no base yet')
os.makedirs(OUT, exist_ok=True)
json.dump(manifest, open(manifest_path, 'w'), indent=1)
