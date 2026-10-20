"""Compose character images into a labelled grid.
Usage: python grid.py <base_dir> <out.jpg> <rows: slug,...> <cols: file-stem,...> [tile]
Example: python grid.py docs/redesign/characters-v3 out.jpg mira,knur,tordis hero-3d,hero-flat,hero-book
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

base, out, rows, cols = sys.argv[1], sys.argv[2], sys.argv[3].split(","), sys.argv[4].split(",")
T = int(sys.argv[5]) if len(sys.argv) > 5 else 520
try:
    font = ImageFont.truetype("arial.ttf", 22)
except OSError:
    font = ImageFont.load_default()
L = 34
grid = Image.new("RGB", (T * len(cols), (T + L) * len(rows)), "white")
d = ImageDraw.Draw(grid)
for r, slug in enumerate(rows):
    for c, stem in enumerate(cols):
        x, y = c * T, r * (T + L)
        p = os.path.join(base, slug, stem + ".png")
        d.text((x + 10, y + 6), f"{slug} / {stem}", fill="black", font=font)
        if os.path.exists(p):
            im = Image.open(p).convert("RGB"); im.thumbnail((T, T))
            grid.paste(im, (x + (T - im.width) // 2, y + L + (T - im.height) // 2))
        else:
            d.text((x + 10, y + L + 10), "missing", fill="red", font=font)
grid.save(out, quality=90)
print(out)
