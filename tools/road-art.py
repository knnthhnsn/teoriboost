"""Turns the road graphics Codex drew (docs/redesign/concepts) into app assets in dist/assets/road:
  car-top.webp  the yellow car seen from above, cut out of its magenta background
  tyre.webp     the big tyre, cut out of its magenta background
  skid.webp     the white skid marks, faint: their brightness becomes the alpha (at 18 %), so they lie on any dark
                surface as a texture
Run: python tools/road-art.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, 'docs', 'redesign', 'concepts')
OUT = os.path.join(ROOT, 'dist', 'assets', 'road')

def cut(path):
    """everything connected to the border that is close to the border colour becomes transparent, with a soft edge"""
    im = np.asarray(Image.open(path).convert('RGB')).astype(float)
    bg = np.median(np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]]), axis=0)
    dist = np.abs(im - bg).sum(axis=2)
    labels, _ = ndimage.label(dist < 90)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    outside = np.isin(labels, edge[edge > 0])
    ring = ndimage.binary_dilation(outside, iterations=2) & ~outside
    alpha = np.where(outside, 0, 255).astype(float)
    alpha[ring] = np.clip((dist[ring] - 40) / 120, 0, 1) * 255
    out = Image.fromarray(np.dstack([im, alpha]).astype(np.uint8), 'RGBA')
    return out.crop(out.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())

def fit(im, longest):
    k = longest / max(im.size)
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS) if k < 1 else im

os.makedirs(OUT, exist_ok=True)
for name, longest in (('car-top', 640), ('tyre', 760)):
    src = os.path.join(SRC, name + '.png')
    if os.path.exists(src):
        fit(cut(src), longest).save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=86, method=6)
        print(name, 'ok')
skid = Image.open(os.path.join(SRC, 'skid.png')).convert('L')
skid = fit(skid, 1600).point(lambda v: round(v * .18))
white = Image.new('L', skid.size, 255)
Image.merge('RGBA', (white, white, white, skid)).save(os.path.join(OUT, 'skid.webp'), 'WEBP', quality=80, method=6)
print('skid ok', skid.size)
