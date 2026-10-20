"""Build app assets for "Min bil" from the Codex images in docs/redesign/garage-build/<base>/.

For every base: base.png -> dist/assets/mybil/<base>/base.webp (white background removed).
For every part: the pixels that differ from the base, limited to the part's region of the vehicle
(removes stray changes elsewhere, e.g. in the cabin) -> dist/assets/mybil/<base>/<part>.webp.
Also writes a preview sheet per base: docs/redesign/garage-build/<base>/preview.jpg

Usage: python build_layers.py [base ...]
"""
import os, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SRC = os.path.join(ROOT, 'docs', 'redesign', 'garage-build')
OUT = os.path.join(ROOT, 'dist', 'assets', 'mybil')
SIZE = 768
# Region of the vehicle's bounding box each slot may change: (x0, y0, x1, y1) as fractions.
REGIONS = {
    'paint': (0, 0, 1, 1), 'decal': (0, 0.1, 1, 0.9), 'wheels': (0, 0.5, 1, 1),
    'front': (0.45, 0.05, 1, 0.8), 'top': (0, 0, 1, 0.55),
}
PARTS = ['paint-mint', 'paint-pink', 'paint-black', 'paint-red', 'decal-hearts', 'decal-flames', 'decal-stripes',
         'wheels-pastel', 'wheels-sport', 'wheels-chrome', 'front-lashes', 'front-led', 'top-bow', 'top-spoiler']

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

def align(edited, base):
    bb, be = subject_bbox(base), subject_bbox(edited)
    if not bb or not be: return edited
    canvas = Image.new('RGB', base.size, 'white')
    canvas.paste(edited.crop(be).resize((bb[2] - bb[0], bb[3] - bb[1]), Image.LANCZOS), bb[:2]); return canvas

def save(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.resize((SIZE, SIZE), Image.LANCZOS).save(path, 'WEBP', quality=86, method=6)

def build(base_id):
    d = os.path.join(SRC, base_id)
    base = Image.open(os.path.join(d, 'base.png')).convert('RGB')
    base_rgba = base.convert('RGBA'); base_rgba.putalpha(white_alpha(base)); save(base_rgba, os.path.join(OUT, base_id, 'base.webp'))
    bb = subject_bbox(base); bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    tiles = [('base', base_rgba)]
    for part in PARTS:
        p = os.path.join(d, part + '.png')
        if not os.path.exists(p): print('  missing', part); continue
        edited = align(Image.open(p).convert('RGB'), base)
        diff = ImageChops.difference(base, edited).convert('L').point(lambda v: 255 if v > 38 else 0)
        diff = diff.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(5))
        x0, y0, x1, y1 = REGIONS[part.split('-')[0]]
        region = Image.new('L', base.size, 0)
        ImageDraw.Draw(region).rectangle([bb[0] + x0 * bw - 8, bb[1] + y0 * bh - 8, bb[0] + x1 * bw + 8, bb[1] + y1 * bh + 8], fill=255)
        alpha = ImageChops.multiply(ImageChops.multiply(diff, region), white_alpha(edited)).filter(ImageFilter.GaussianBlur(0.8))
        layer = edited.convert('RGBA'); layer.putalpha(alpha)
        save(layer, os.path.join(OUT, base_id, part + '.webp'))
        tiles.append((part, layer))
    # preview: each part on top of the base
    sheet = Image.new('RGB', (256 * 5, 280 * ((len(tiles) + 4) // 5)), 'white'); dr = ImageDraw.Draw(sheet)
    for i, (name, layer) in enumerate(tiles):
        c = Image.new('RGBA', base.size, (255, 255, 255, 255)); c.alpha_composite(base_rgba)
        if name != 'base': c.alpha_composite(layer)
        x, y = (i % 5) * 256, (i // 5) * 280
        sheet.paste(c.convert('RGB').resize((256, 256)), (x, y + 24)); dr.text((x + 6, y + 6), name, fill='black')
    sheet.save(os.path.join(d, 'preview.jpg'), quality=86)
    print(base_id, len(tiles) - 1, 'parts')

for b in (sys.argv[1:] or ['scooter', 'smallcar', 'bigcar', 'racecar']):
    if os.path.exists(os.path.join(SRC, b, 'base.png')): build(b)
    else: print(b, 'no base yet')
