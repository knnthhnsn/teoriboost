# Step 2 of the GlowUp art: crops each vehicle's layers (from glowup-render.mjs) to one shared box, scales them and
# writes webp next to this file, plus meta.json with what the animation needs: each add-on part's own crop and where
# its centre sits, where light catches the roof line (glints), and the tyre line.
# python glowup-pack.py <rendered pngs dir> [scale]
import sys, os, json
from PIL import Image
src = sys.argv[1]; scale = float(sys.argv[2]) if len(sys.argv) > 2 else 0.7
dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'glowup-art')
os.makedirs(dst, exist_ok=True)
for f in os.listdir(dst):
    if f.endswith('.webp'): os.remove(os.path.join(dst, f))
parts = json.load(open(f'{src}/parts.json'))
meta = {}

def bbox(im, cut=8):
    return im.getchannel('A').point(lambda a: 255 if a > cut else 0).getbbox()

def top_edge(alpha, x):
    for y in range(alpha.height):
        if alpha.getpixel((x, y)) > 200: return y
    return None

for base in ['scooter', 'smallcar', 'bigcar', 'racecar']:
    layers = {f'{s}-{p}': Image.open(f'{src}/{base}-{s}-{p}.png').convert('RGBA') for s in ('wreck', 'dream') for p in ('body', 'wheels')}
    pims = {pid: Image.open(f'{src}/{base}-part-{pid}.png').convert('RGBA') for pid in parts[base]['parts']}
    box = None
    for im in list(layers.values()) + list(pims.values()):
        bb = bbox(im)
        if not bb: continue
        box = bb if box is None else (min(box[0], bb[0]), min(box[1], bb[1]), max(box[2], bb[2]), max(box[3], bb[3]))
    box = (max(0, box[0] - 6), max(0, box[1] - 6), min(768, box[2] + 6), min(768, box[3] + 6))
    w, h = box[2] - box[0], box[3] - box[1]; W, H = round(w * scale), round(h * scale)
    out = {}
    for k, im in layers.items():
        c = im.crop(box).resize((W, H), Image.LANCZOS); out[k] = c
        c.save(f'{dst}/{base}-{k}.webp', 'WEBP', quality=88, method=6)
    plist = []
    for pid, im in pims.items():
        c = im.crop(box).resize((W, H), Image.LANCZOS); bb = bbox(c, 4)
        if not bb: continue
        bb = (max(0, bb[0] - 2), max(0, bb[1] - 2), min(W, bb[2] + 2), min(H, bb[3] + 2))
        c.crop(bb).save(f'{dst}/{base}-part-{pid}.webp', 'WEBP', quality=90, method=6)
        plist.append({'id': pid, 'w': bb[2] - bb[0], 'h': bb[3] - bb[1], 'x': (bb[0] + bb[2]) / 2 - W / 2, 'y': (bb[1] + bb[3]) / 2 - H / 2})
    full = out['dream-body'].copy()
    for pid, im in pims.items(): full.alpha_composite(im.crop(box).resize((W, H), Image.LANCZOS))
    alpha = Image.alpha_composite(full, out['dream-wheels']).getchannel('A')
    glints = []
    for fx in (0.3, 0.55, 0.8):
        x = round(W * fx); y = top_edge(alpha, x)
        if y is not None: glints.append([x - W / 2, y + 3 - H / 2])
    meta[base] = {'w': W, 'h': H, 'box': box, 'glints': glints, 'parts': plist}  # box: the crop in the app's 768px vehicle frame
json.dump(meta, open(f'{dst}/meta.json', 'w'), indent=1)
print(json.dumps({b: [p['id'] for p in m['parts']] for b, m in meta.items()}))
total = sum(os.path.getsize(os.path.join(dst, f)) for f in os.listdir(dst))
print('art bytes', total)
