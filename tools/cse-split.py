"""Splits the Common Side Effects design sheets (docs/redesign/cse, transparent PNGs) into one figure per file in
docs/redesign/cse/split: every opaque island is a figure (small islands, like sparks, join the nearest figure),
the sheet is first cut into rows at its emptiest line, then read left to right, each centred on its own square transparent canvas.
Run: python tools/cse-split.py
"""
import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, 'docs', 'redesign', 'cse')
OUT = os.path.join(SRC, 'split')
SHEETS = {  # sheet: (names in reading order, rows)
    'biler.png': (['scooter-wreck', 'smallcar-wreck', 'bigcar-wreck', 'racecar-wreck', 'scooter-dream', 'smallcar-dream', 'bigcar-dream', 'racecar-dream'], 2),
    'streak-flammer.png': (['flame-0', 'flame-1', 'flame-3', 'flame-7', 'flame-30', 'flame-comeback'], 2),
    'sneglen-og-keglen.png': (['sneglen-1', 'sneglen-2', 'sneglen-3', 'kegle-1', 'kegle-2', 'kegle-3'], 2),
    'cast2/sheet-a.png': (['blink-1', 'blink-2', 'blink-3', 'bobbel-1', 'bobbel-2', 'bobbel-3'], 2),
    'cast2/sheet-b.png': (['krabbe-1', 'krabbe-2', 'krabbe-3', 'daek-1', 'daek-2', 'daek-3'], 2),
}

os.makedirs(OUT, exist_ok=True)
for sheet, (names, rows) in SHEETS.items():
    im = Image.open(os.path.join(SRC, sheet)).convert('RGBA')
    if np.asarray(im)[:, :, 3].min() == 255:  # drawn on white: the white connected to the border becomes transparent
        rgb = np.asarray(im)[:, :, :3].astype(int); light = rgb.min(axis=2) > 236
        lab, _ = ndimage.label(light); edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
        outside = np.isin(lab, edge[edge > 0]); a = np.where(outside, 0, 255).astype(np.uint8)
        a = np.asarray(Image.fromarray(a).filter(ImageFilter.GaussianBlur(.7)))
        im = Image.fromarray(np.dstack([rgb.astype(np.uint8), a]), 'RGBA')
    a = np.asarray(im)[:, :, 3] > 24
    # cut the rows apart at the emptiest line near each row boundary, so figures stacked close together stay apart
    load = a.sum(axis=1); cuts = []
    for r in range(1, rows):
        y0, y1 = int(im.height * (r - .25) / rows), int(im.height * (r + .25) / rows)
        cuts.append(y0 + int(np.argmin(load[y0:y1])))
    grown = ndimage.binary_dilation(a, iterations=6)
    for y in cuts: grown[y] = False
    labels, n = ndimage.label(grown)
    sizes = ndimage.sum(a, labels, range(1, n + 1))
    big = [i + 1 for i in np.argsort(-sizes)[:len(names)]]
    boxes = {i: ndimage.find_objects((labels == i).astype(int))[0] for i in big}
    centres = {i: ((b[0].start + b[0].stop) / 2, (b[1].start + b[1].stop) / 2) for i, b in boxes.items()}
    # small islands (sparks, smoke curls) join the figure whose centre is nearest
    owner = np.zeros_like(labels)
    for i in range(1, n + 1):
        if i in big: owner[labels == i] = i; continue
        ys, xs = np.nonzero(labels == i)
        cy, cx = ys.mean(), xs.mean()
        owner[labels == i] = min(big, key=lambda j: (centres[j][0] - cy) ** 2 + (centres[j][1] - cx) ** 2)
    row = lambda y: sum(y > c for c in cuts)
    order = sorted(big, key=lambda i: (row(centres[i][0]), centres[i][1]))
    for name, i in zip(names, order):
        ys, xs = np.nonzero((owner == i) & a)
        box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        part = np.asarray(im).copy(); part[owner != i] = 0
        fig = Image.fromarray(part).crop(box)
        side = int(max(fig.size) * 1.12)
        canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        canvas.alpha_composite(fig, ((side - fig.width) // 2, (side - fig.height) // 2))
        canvas.save(os.path.join(OUT, name + '.png'))
        print(name, fig.size)

# The race car was redrawn on its own (docs/redesign/cse/racecar-{wreck,dream}.png, on magenta): key the magenta out
# everywhere (the car never uses it) and replace the sheet's race car with it.
for state in ('wreck', 'dream'):
    path = os.path.join(SRC, f'racecar-{state}.png')
    if not os.path.exists(path): continue
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(float)
    dist = np.abs(rgb - np.array([255, 0, 255])).sum(axis=2)
    alpha = np.clip((dist - 60) / 90, 0, 1) * 255
    car = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')
    car = car.crop(car.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
    side = int(max(car.size) * 1.12)
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(car, ((side - car.width) // 2, (side - car.height) // 2))
    canvas.save(os.path.join(OUT, f'racecar-{state}.png'))
    print('racecar', state, car.size)
