"""The cast in the Common Side Effects style -> dist/assets/cast/<name>.webp (512 x 512, transparent, figure centred
and standing on the same baseline as before), plus sneglen-face.webp (256 x 256, the snail's head for the chat).
Sources: docs/redesign/cse/split (cut from the chosen sheets by cse-split.py) and docs/redesign/cse/cast (Codex).
Run: python tools/cse-cast.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CSE = os.path.join(ROOT, 'docs', 'redesign', 'cse')
OUT = os.path.join(ROOT, 'dist', 'assets', 'cast')
CAST = {'sneglen': 'split/sneglen-3.png', 'kegle': 'split/kegle-2.png',
        'blink': 'cast/blink.png', 'bobbel': 'cast/bobbel.png', 'krabbe': 'cast/krabbe.png', 'daek': 'cast/daek.png'}
SIZE, FILL = 512, .9

def clean(im):
    """keep the figure and what touches it; drop stray specks, then crop to it"""
    a = np.asarray(im)[:, :, 3] > 24
    labels, n = ndimage.label(ndimage.binary_dilation(a, iterations=4))
    if n > 1:
        sizes = ndimage.sum(a, labels, range(1, n + 1)); keep = labels == (np.argmax(sizes) + 1)
        px = np.asarray(im).copy(); px[~keep] = 0; im = Image.fromarray(px)
    return im.crop(im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())

for name, src in CAST.items():
    path = os.path.join(CSE, src)
    if not os.path.exists(path): print('skip', name); continue
    fig = clean(Image.open(path).convert('RGBA'))
    k = SIZE * FILL / max(fig.size)
    fig = fig.resize((round(fig.width * k), round(fig.height * k)), Image.LANCZOS)
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(fig, ((SIZE - fig.width) // 2, SIZE - fig.height - round(SIZE * (1 - FILL) / 2)))
    canvas.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=88, method=6)
    print(name, fig.size)
    if name == 'sneglen':
        # the head: the eyes on their stalks and the smile, top right
        w, h = canvas.size; box = (int(w * .52), int(h * .02), int(w * .52) + int(h * .44), int(h * .46))
        canvas.crop(box).resize((256, 256), Image.LANCZOS).save(os.path.join(OUT, 'sneglen-face.webp'), 'WEBP', quality=88, method=6)
