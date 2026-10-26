"""Cuts the streak flame's drawings (docs/redesign/flame, drawn by Codex on a flat background) out to
tools/rive/flame-art/<name>.webp + meta.json for build-flame.mjs, and copies the still images to dist/assets/flame.

Names: L<level>-<idle|blink|joy> for levels 1-5, and smoke (level 0).
The background is whatever colour fills the border; every pixel connected to the border that is close to it
becomes transparent, with a soft edge. Unlike docs/redesign/tools/cutout.py there is no shadow rule, so the grey
smoke survives on a light background. Each level is scaled so its idle drawing has the level's height; its blink
and joy use the same scale, so the joy's taller tips stay taller.
Run: python tools/rive/flame-cut.py
"""
import json, os, shutil
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'docs', 'redesign', 'flame')
ART = os.path.join(ROOT, 'tools', 'rive', 'flame-art')
STILL = os.path.join(ROOT, 'dist', 'assets', 'flame')
# the idle drawing's height in px per level (the Rive board draws 6 px per unit); level 0 is the smoke
HEIGHT = {0: 252, 1: 180, 2: 264, 3: 288, 4: 306, 5: 318}

def cut(path):
    im = np.asarray(Image.open(path).convert('RGB')).astype(float)
    border = np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.abs(im - bg).sum(axis=2)
    labels, _ = ndimage.label(dist < 36)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    outside = np.isin(labels, edge[edge > 0])
    # soft edge: pixels next to the outside fade by how close they are to the background
    ring = ndimage.binary_dilation(outside, iterations=2) & ~outside
    alpha = np.where(outside, 0, 255).astype(float)
    alpha[ring] = np.clip((dist[ring] - 12) / 60, 0, 1) * 255
    out = Image.fromarray(np.dstack([im, alpha]).astype(np.uint8), 'RGBA')
    return out.crop(out.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())

def save(name, im, k):
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(os.path.join(ART, name + '.webp'), 'WEBP', quality=86, method=6)
    meta[name] = {'w': im.width, 'h': im.height}

os.makedirs(ART, exist_ok=True); os.makedirs(STILL, exist_ok=True)
for f in os.listdir(ART):
    if f.endswith('.webp'): os.remove(os.path.join(ART, f))
meta = {}
smoke = cut(os.path.join(SRC, 'flame-smoke.png'))
save('smoke', smoke, HEIGHT[0] / smoke.height)
for level in range(1, 6):
    ims = {e: cut(os.path.join(SRC, 'levels', f'L{level}-{e}.png')) for e in ('idle', 'blink', 'joy')}
    k = HEIGHT[level] / ims['idle'].height
    for e, im in ims.items(): save(f'L{level}-{e}', im, k)
json.dump(meta, open(os.path.join(ART, 'meta.json'), 'w'), indent=1)
for f in os.listdir(STILL): os.remove(os.path.join(STILL, f))
for name in ['smoke'] + [f'L{level}-idle' for level in range(1, 6)]:
    shutil.copy(os.path.join(ART, name + '.webp'), os.path.join(STILL, name + '.webp'))
print(json.dumps(meta))
