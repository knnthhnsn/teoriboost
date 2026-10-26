"""The Common Side Effects icons, illustrations and top-down vehicles (docs/redesign/cse, drawn by Codex) into the app:
  icons/<name>.png         -> dist/assets/icons/<name>.webp            (128 px, transparent, used by ui-icons.js)
  nav/<name>.png           -> dist/assets/nav/<name>.webp              (128 px, the menu's sticker icons)
  illustrations/<name>.png -> dist/assets/illustrations/<name>.webp   (720 px, transparent, used by art.js)
  topdown/<name>.png       -> tools/rive/road-art/<name>.webp + meta.json (for build-road.mjs, magenta keyed out)
                              and dist/assets/road/<name>-top.webp       (the still for when Rive does not run)
Run: python tools/cse-assets.py
"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CSE = os.path.join(ROOT, 'docs', 'redesign', 'cse')
DIST = os.path.join(ROOT, 'dist', 'assets')

def crop(im):
    """drop stray specks, crop to the figure"""
    a = np.asarray(im)[:, :, 3] > 24
    labels, n = ndimage.label(ndimage.binary_dilation(a, iterations=6))
    if n > 1:
        sizes = ndimage.sum(a, labels, range(1, n + 1)); keep = sizes >= sizes.max() * .02
        mask = keep[labels - 1] & (labels > 0); px = np.asarray(im).copy(); px[~mask] = 0; im = Image.fromarray(px)
    return im.crop(im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())

def square(im, size, fill=.9):
    k = size * fill / max(im.size); im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    c = Image.new('RGBA', (size, size), (0, 0, 0, 0)); c.alpha_composite(im, ((size - im.width) // 2, (size - im.height) // 2)); return c

def unkey(path):
    """magenta background out, everywhere (the art never uses it)"""
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(float)
    alpha = np.clip((np.abs(rgb - [255, 0, 255]).sum(axis=2) - 60) / 90, 0, 1) * 255
    return Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')

for sub, out, size in (('icons', os.path.join(DIST, 'icons'), 128), ('nav', os.path.join(DIST, 'nav'), 128), ('illustrations', os.path.join(DIST, 'illustrations'), 720)):
    src = os.path.join(CSE, sub); os.makedirs(out, exist_ok=True)
    for f in sorted(os.listdir(src)) if os.path.isdir(src) else []:
        if not f.endswith('.png') or f.endswith('-old.png'): continue
        square(crop(Image.open(os.path.join(src, f)).convert('RGBA')), size).save(os.path.join(out, f[:-4] + '.webp'), 'WEBP', quality=88, method=6)
        print(sub, f)

top = os.path.join(CSE, 'topdown'); art = os.path.join(ROOT, 'tools', 'rive', 'road-art'); os.makedirs(art, exist_ok=True)
meta = {}
cars = {n: crop(unkey(os.path.join(top, n + '.png'))) for n in ('scooter', 'smallcar', 'bigcar', 'racecar') if os.path.exists(os.path.join(top, n + '.png'))}
k = 360 / max([c.height for c in cars.values()] or [1])  # one scale for all, so they keep their relative sizes
for name, car in cars.items():
    car = car.resize((round(car.width * k), round(car.height * k)), Image.LANCZOS)
    car.save(os.path.join(art, name + '.webp'), 'WEBP', quality=88, method=6); meta[name] = {'w': car.width, 'h': car.height}
    car.save(os.path.join(DIST, 'road', name + '-top.webp'), 'WEBP', quality=88, method=6)
    print('topdown', name, car.size)
if meta: json.dump(meta, open(os.path.join(art, 'meta.json'), 'w'), indent=1)
