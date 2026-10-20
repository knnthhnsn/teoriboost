"""Extract a customisation layer: the pixels that differ between an edited image and its base.

Usage:
  python extract_layer.py base <base.png> <out.png>              # cut the base out of its white background
  python extract_layer.py part <base.png> <edited.png> <out.png> [--thr 38]
The edited image is first aligned to the base by matching the bounding box of the vehicle (corrects the
small shifts/scales image models introduce). Output layers are RGBA PNGs on the base's canvas, so
stacking base + layers in the app lines up.
"""
import sys
from PIL import Image, ImageChops, ImageFilter

def bbox_of_subject(im, tol=18):
    """Bounding box of non-white pixels."""
    g = im.convert("L").point(lambda v: 255 if v < 255 - tol else 0)
    return g.getbbox()

def white_cutout(im, tol=18):
    """Alpha = 0 for near-white pixels connected to the border (flood fill), so interior whites survive."""
    from collections import deque
    rgb = im.convert("RGB"); W, H = rgb.size; px = rgb.load()
    seen = bytearray(W * H); q = deque()
    for x in range(W): q.extend(((x, 0), (x, H - 1)))
    for y in range(H): q.extend(((0, y), (W - 1, y)))
    while q:
        x, y = q.popleft(); i = y * W + x
        if seen[i]: continue
        r, g, b = px[x, y]
        if min(r, g, b) < 255 - tol: continue
        seen[i] = 1
        if x: q.append((x - 1, y))
        if x < W - 1: q.append((x + 1, y))
        if y: q.append((x, y - 1))
        if y < H - 1: q.append((x, y + 1))
    a = Image.frombytes("L", (W, H), bytes(0 if s else 255 for s in seen)).filter(ImageFilter.GaussianBlur(0.7))
    out = rgb.convert("RGBA"); out.putalpha(a); return out

def align(edited, base):
    bb, be = bbox_of_subject(base), bbox_of_subject(edited)
    if not bb or not be: return edited
    crop = edited.crop(be).resize((bb[2] - bb[0], bb[3] - bb[1]), Image.LANCZOS)
    canvas = Image.new("RGB", base.size, "white"); canvas.paste(crop, bb[:2]); return canvas

mode = sys.argv[1]
if mode == "base":
    base = Image.open(sys.argv[2]).convert("RGB")
    white_cutout(base).save(sys.argv[3]); print("base ->", sys.argv[3])
else:
    base = Image.open(sys.argv[2]).convert("RGB")
    edited = align(Image.open(sys.argv[3]).convert("RGB"), base)
    thr = int(sys.argv[sys.argv.index("--thr") + 1]) if "--thr" in sys.argv else 38
    diff = ImageChops.difference(base, edited).convert("L").point(lambda v: 255 if v > thr else 0)
    # remove speckle, then grow slightly so the part's own outline is included
    diff = diff.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1))
    layer = white_cutout(edited)
    alpha = ImageChops.multiply(layer.getchannel("A"), diff)
    layer.putalpha(alpha)
    changed = sum(1 for v in alpha.getdata() if v > 128) / (base.size[0] * base.size[1])
    layer.save(sys.argv[4]); print(f"part -> {sys.argv[4]}  changed {changed:.1%} of canvas")
