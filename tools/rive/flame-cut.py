"""Cuts the streak flame's drawings (docs/redesign/cse/flames, the Common Side Effects flames, transparent PNGs; each
level's idle, blink and joy share one canvas) to tools/rive/flame-art/L<level>-<expr>.webp + meta.json for
build-flame.mjs, and copies the idle faces to dist/assets/flame for when Rive is not running.

Levels: 0 smoke (no streak), 1 first days, 2 three days, 3 a week, 4 thirty days, 5 comeback (back after a break).
A level without a joy face uses its idle face. All faces of a level are cropped with the same box, so they stay
aligned, and every level keeps its size relative to the others (the drawings already grow with the streak).
Run: python tools/rive/flame-cut.py
"""
import json, os, shutil
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'docs', 'redesign', 'cse', 'flames')
ART = os.path.join(ROOT, 'tools', 'rive', 'flame-art')
STILL = os.path.join(ROOT, 'dist', 'assets', 'flame')
LEVELS = {0: 'flame-0', 1: 'flame-1', 2: 'flame-3', 3: 'flame-7', 4: 'flame-30', 5: 'flame-comeback'}
EXPR = ('idle', 'blink', 'joy')
K = .6  # px in the app per px of the source drawings (the biggest flame becomes about 330 px tall)

def box_of(im): return im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()

for d in (ART, STILL):
    os.makedirs(d, exist_ok=True)
    for f in os.listdir(d):
        if f.endswith('.webp'): os.remove(os.path.join(d, f))
meta = {}
for level, src in LEVELS.items():
    ims = {e: Image.open(os.path.join(SRC, f'{src}-{e}.png')).convert('RGBA') for e in EXPR if os.path.exists(os.path.join(SRC, f'{src}-{e}.png'))}
    ims.setdefault('joy', ims['idle'])
    boxes = [box_of(i) for i in ims.values()]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    for e, im in ims.items():
        im = im.crop(box); im = im.resize((round(im.width * K), round(im.height * K)), Image.LANCZOS)
        name = f'L{level}-{e}'
        im.save(os.path.join(ART, name + '.webp'), 'WEBP', quality=86, method=6)
        meta[name] = {'w': im.width, 'h': im.height}
    shutil.copy(os.path.join(ART, f'L{level}-idle.webp'), os.path.join(STILL, f'L{level}-idle.webp'))
json.dump(meta, open(os.path.join(ART, 'meta.json'), 'w'), indent=1)
print(json.dumps({k: v['h'] for k, v in meta.items() if k.endswith('idle')}))
