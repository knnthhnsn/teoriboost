"""Cut a character out of a flat background and export a square transparent WebP for the app.

Usage: python cutout.py <in.png> <out.webp> [--size 512] [--tol 28]
The background is removed by flood fill from the image border (not a global colour key), so
background-coloured areas inside the character survive. A flat ground-shadow ellipse touching the
background is removed too when it is low-saturation and darker than the background.
"""
import argparse
from collections import deque
from PIL import Image, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--size", type=int, default=512); ap.add_argument("--tol", type=int, default=28)
a = ap.parse_args()

im = Image.open(a.src).convert("RGB")
W, H = im.size
px = im.load()
# Background colour = median of the border pixels.
border = [px[x, 0] for x in range(W)] + [px[x, H - 1] for x in range(W)] + [px[0, y] for y in range(H)] + [px[W - 1, y] for y in range(H)]
bg = tuple(sorted(c[i] for c in border)[len(border) // 2] for i in range(3))

def is_bg(c):
    if sum(abs(c[i] - bg[i]) for i in range(3)) <= a.tol:
        return True
    # soft grey ground shadow: low saturation, a bit darker than bg
    mx, mn = max(c), min(c)
    return (mx - mn) < 30 and 0 < (sum(bg) - sum(c)) < 140

seen = bytearray(W * H)
q = deque((x, y) for x in range(W) for y in (0, H - 1))
q.extend((x, y) for y in range(H) for x in (0, W - 1))
while q:
    x, y = q.popleft()
    i = y * W + x
    if seen[i] or not is_bg(px[x, y]):
        continue
    seen[i] = 1
    if x > 0: q.append((x - 1, y))
    if x < W - 1: q.append((x + 1, y))
    if y > 0: q.append((x, y - 1))
    if y < H - 1: q.append((x, y + 1))

alpha = Image.frombytes("L", (W, H), bytes(0 if s else 255 for s in seen))
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))  # trim halo, soften edge
rgba = im.convert("RGBA"); rgba.putalpha(alpha)
box = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
rgba = rgba.crop(box)
# Square canvas with a little padding, character standing on the bottom.
side = int(max(rgba.size) * 1.06)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(rgba, ((side - rgba.width) // 2, side - rgba.height - int(side * 0.02)), rgba)
canvas = canvas.resize((a.size, a.size), Image.LANCZOS)
canvas.save(a.out, "WEBP", quality=88, method=6)
print(a.out, canvas.size, "bg", bg)

