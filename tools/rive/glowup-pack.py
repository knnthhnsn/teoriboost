# Step 2 of the GlowUp art: crops each vehicle's four layers (from glowup-render.mjs) to one shared box,
# scales them, writes webp next to this file, plus meta.json with the points the animation needs:
# where light catches the roof line (glints) and where the tyres touch the floor (dust).
# python glowup-pack.py <rendered pngs dir> [scale]
import sys, os, json
from PIL import Image
src = sys.argv[1]; scale = float(sys.argv[2]) if len(sys.argv) > 2 else 0.7
dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'glowup-art')
os.makedirs(dst, exist_ok=True)
meta = {}

def top_edge(alpha, x):
    for y in range(alpha.height):
        if alpha.getpixel((x, y)) > 200: return y
    return None

for base in ['scooter', 'smallcar', 'bigcar', 'racecar']:
    ims = {f'{s}-{p}': Image.open(f'{src}/{base}-{s}-{p}.png').convert('RGBA') for s in ('wreck', 'dream') for p in ('body', 'wheels')}
    box = None
    for im in ims.values():
        bb = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        box = bb if box is None else (min(box[0], bb[0]), min(box[1], bb[1]), max(box[2], bb[2]), max(box[3], bb[3]))
    box = (max(0, box[0] - 6), max(0, box[1] - 6), min(768, box[2] + 6), min(768, box[3] + 6))
    w, h = box[2] - box[0], box[3] - box[1]; W, H = round(w * scale), round(h * scale)
    out = {}
    for k, im in ims.items():
        c = im.crop(box).resize((W, H), Image.LANCZOS); out[k] = c
        c.save(f'{dst}/{base}-{k}.webp', 'WEBP', quality=88, method=6)
    body = Image.alpha_composite(out['dream-body'], out['dream-wheels']).getchannel('A')
    glints = []
    for fx in (0.3, 0.55, 0.8):
        x = round(W * fx); y = top_edge(body, x)
        if y is not None: glints.append([x - W / 2, y + 3 - H / 2])
    wb = out['dream-wheels'].getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox() or (0, 0, W, H)
    ww = wb[2] - wb[0]
    meta[base] = {'w': W, 'h': H, 'glints': glints,
                  'tyres': [[wb[0] + ww * .12 - W / 2, wb[3] - H / 2], [wb[2] - ww * .12 - W / 2, wb[3] - H / 2]]}
json.dump(meta, open(f'{dst}/meta.json', 'w'), indent=1)
print(json.dumps(meta))
