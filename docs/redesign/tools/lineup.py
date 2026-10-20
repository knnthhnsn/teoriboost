"""Lay out hero images in a labelled grid.
Usage: python lineup.py <out.jpg> <cols> <path=Label> [<path=Label> ...]
"""
import sys
from PIL import Image, ImageDraw, ImageFont

out, cols, items = sys.argv[1], int(sys.argv[2]), [a.split("=", 1) for a in sys.argv[3:]]
T, L = 560, 40
font = ImageFont.truetype("arial.ttf", 26)
rows = (len(items) + cols - 1) // cols
grid = Image.new("RGB", (T * cols, (T + L) * rows), "white")
d = ImageDraw.Draw(grid)
for i, (path, label) in enumerate(items):
    x, y = (i % cols) * T, (i // cols) * (T + L)
    im = Image.open(path).convert("RGB"); im.thumbnail((T, T))
    grid.paste(im, (x + (T - im.width) // 2, y + L))
    d.text((x + 12, y + 8), label, fill="black", font=font)
grid.save(out, quality=90)
print(out)
