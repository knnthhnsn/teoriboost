"""Composite transparent renders onto a solid background.
Usage: python on_bg.py <hex> <in.png> [<in.png> ...]   (writes <in>-bg.png next to each)
"""
import sys
from PIL import Image

hexc, files = sys.argv[1].lstrip("#"), sys.argv[2:]
rgb = tuple(int(hexc[i:i + 2], 16) for i in (0, 2, 4))
for f in files:
    im = Image.open(f).convert("RGBA")
    bg = Image.new("RGBA", im.size, rgb + (255,))
    bg.alpha_composite(im)
    out = f[:-4] + "-bg.png"
    bg.convert("RGB").save(out)
    print(out)
