"""Cuts the traffic light Codex drew (docs/redesign/concepts/tl-{off,red,yellow,green}.png, identical but for the lit
lamp, on magenta) into tools/rive/traffic-art: base.webp (the light with every lamp off) and red/yellow/green.webp,
each only its lit lamp (the pixels that differ from the base), plus meta.json with every layer's size and its
centre's offset from the base's centre, for build-signal.mjs. The still base and the three lit states also go to
dist/assets/traffic for when Rive is not running.
Run: python tools/rive/traffic-cut.py
"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'docs', 'redesign', 'concepts')
ART = os.path.join(ROOT, 'tools', 'rive', 'traffic-art')
STILL = os.path.join(ROOT, 'dist', 'assets', 'traffic')
HEIGHT = 520  # the base's height in px

def load(name): return np.asarray(Image.open(os.path.join(SRC, f'tl-{name}.png')).convert('RGB')).astype(float)

def alpha_of(im):
    """everything close to the background colour (magenta, which the drawing never uses) is transparent, also the
    pockets the border cannot reach, like the gap between the housing and its arm"""
    bg = np.median(np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]]), axis=0)
    dist = np.abs(im - bg).sum(axis=2)
    outside = dist < 90
    ring = ndimage.binary_dilation(outside, iterations=2) & ~outside
    a = np.where(outside, 0, 255).astype(float)
    a[ring] = np.clip((dist[ring] - 40) / 120, 0, 1) * 255
    return a

off = load('off'); a_off = alpha_of(off)
box = Image.fromarray(a_off.astype(np.uint8)).point(lambda v: 255 if v > 8 else 0).getbbox()
k = HEIGHT / (box[3] - box[1])
cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
os.makedirs(ART, exist_ok=True); os.makedirs(STILL, exist_ok=True)
meta = {}

def save(name, rgba, crop):
    im = Image.fromarray(rgba.astype(np.uint8), 'RGBA').crop(crop)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(os.path.join(ART, name + '.webp'), 'WEBP', quality=88, method=6)
    meta[name] = {'w': im.width, 'h': im.height, 'dx': round(((crop[0] + crop[2]) / 2 - cx) * k, 2), 'dy': round(((crop[1] + crop[3]) / 2 - cy) * k, 2)}
    return im

base = save('base', np.dstack([off, a_off]), box)
for lamp in ('red', 'yellow', 'green'):
    lit = load(lamp)
    diff = np.abs(lit - off).sum(axis=2)
    mask = ndimage.binary_opening(diff > 60, iterations=2)
    labels, n = ndimage.label(mask)
    if n: mask = labels == (np.argmax(ndimage.sum(mask, labels, range(1, n + 1))) + 1)  # the lamp: the biggest changed area
    mask = ndimage.binary_dilation(mask, iterations=3)
    soft = ndimage.gaussian_filter(mask.astype(float), 1.2) * 255
    layer = save(lamp, np.dstack([lit, np.minimum(soft, alpha_of(lit))]), Image.fromarray(mask.astype(np.uint8) * 255).getbbox())
    still = Image.fromarray(np.dstack([lit, alpha_of(lit)]).astype(np.uint8), 'RGBA').crop(box)
    still.resize((round(still.width * k * .5), round(still.height * k * .5)), Image.LANCZOS).save(os.path.join(STILL, lamp + '.webp'), 'WEBP', quality=86, method=6)
base.resize((base.width // 2, base.height // 2), Image.LANCZOS).save(os.path.join(STILL, 'off.webp'), 'WEBP', quality=86, method=6)
json.dump(meta, open(os.path.join(ART, 'meta.json'), 'w'), indent=1)
print(json.dumps(meta))
