"""Turns the road graphics Codex drew (docs/redesign/concepts) into app assets in dist/assets/road:
  tyre.webp     the big tyre on the Min bil header: Kenneth's painted one (docs/redesign/cse/tyre-painted.webp), cut out
                of its flat dark background
  skid.webp     the white skid marks, faint: their brightness becomes the alpha (at 18 %), so they lie on any dark
                surface as a texture
  skid-ink.webp the same marks in asphalt ink at 10 %, for the light page
Run: python tools/road-art.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, 'docs', 'redesign', 'concepts')
OUT = os.path.join(ROOT, 'dist', 'assets', 'road')

def cut(path, tol=90, ramp=(40, 120)):
    """everything connected to the border that is close to the border colour becomes transparent, with a soft edge.
    A dark background sits close to the ink, so it needs a tight tolerance and a short ramp."""
    im = np.asarray(Image.open(path).convert('RGB')).astype(float)
    bg = np.median(np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]]), axis=0)
    dist = np.abs(im - bg).sum(axis=2)
    labels, _ = ndimage.label(dist < tol)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    outside = np.isin(labels, edge[edge > 0])
    ring = ndimage.binary_dilation(outside, iterations=2) & ~outside
    alpha = np.where(outside, 0, 255).astype(float)
    alpha[ring] = np.clip((dist[ring] - ramp[0]) / ramp[1], 0, 1) * 255
    out = Image.fromarray(np.dstack([im, alpha]).astype(np.uint8), 'RGBA')
    return out.crop(out.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())

def fit(im, longest):
    k = longest / max(im.size)
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS) if k < 1 else im

os.makedirs(OUT, exist_ok=True)
def inked(im):
    """the soft edge takes the ink colour, so no magenta is left in it"""
    a = np.asarray(im).copy(); soft = (a[:, :, 3] > 0) & (a[:, :, 3] < 250); a[soft, :3] = (30, 28, 28)
    return Image.fromarray(a, 'RGBA')

CSE = os.path.join(ROOT, 'docs', 'redesign', 'cse')
fit(inked(cut(os.path.join(CSE, 'tyre-painted.webp'), tol=16, ramp=(6, 30))), 760).save(os.path.join(OUT, 'tyre.webp'), 'WEBP', quality=86, method=6)
print('tyre ok')
marks = fit(Image.open(os.path.join(SRC, 'skid.png')).convert('L'), 1600)
for name, rgb, strength in (('skid', (255, 255, 255), .18), ('skid-ink', (31, 35, 40), .1)):
    channels = [Image.new('L', marks.size, v) for v in rgb]
    Image.merge('RGBA', (*channels, marks.point(lambda v: round(v * strength)))).save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=80, method=6)
skid = marks
print('skid ok', skid.size)
