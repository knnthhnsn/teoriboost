"""Preview the built app assets exactly as the app stacks them: base.webp + one part, full canvas.
Usage: python preview_app.py <base> [part-prefix ...]   -> docs/redesign/garage-build/<base>/app-preview.jpg
"""
import json, os, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', '..', '..', 'dist', 'assets', 'mybil')
base_id = sys.argv[1]; prefixes = sys.argv[2:]
manifest = json.load(open(os.path.join(ASSETS, 'manifest.json')))
parts = [p for p in manifest[base_id]['parts'] if not prefixes or any(p.startswith(x) for x in prefixes)]
base = Image.open(os.path.join(ASSETS, base_id, 'base.webp')).convert('RGBA')
tiles = [('base', base)]
TEST = {'paint': (255, 60, 200), 'stripe': (20, 224, 240), 'windows': (40, 44, 52)}
tint = manifest[base_id].get('tint', {})

def tinted(layer, rgb):
    """What the app does: colour x mask luminance (white -> the colour, grey shade -> darker colour)."""
    from PIL import ImageChops
    col = Image.new('RGB', layer.size, rgb)
    out = ImageChops.multiply(layer.convert('RGB'), col).convert('RGBA'); out.putalpha(layer.getchannel('A')); return out

for p in parts:
    layer = Image.open(os.path.join(ASSETS, base_id, p + '.webp')).convert('RGBA')
    if p in tint: layer = tinted(layer, TEST[tint[p]])
    c = base.copy(); c.alpha_composite(layer); tiles.append((p + (' (testfarve)' if p in tint else ''), c))
# common crop: union of everything drawn, plus a margin
box = None
for _, t in tiles:
    b = t.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
box = (max(0, box[0] - 10), max(0, box[1] - 10), min(base.width, box[2] + 10), min(base.height, box[3] + 10))
W = 300; H = int(W * (box[3] - box[1]) / (box[2] - box[0])); cols = 4
sheet = Image.new('RGB', (W * cols, (H + 26) * ((len(tiles) + cols - 1) // cols)), 'white'); d = ImageDraw.Draw(sheet)
for i, (name, t) in enumerate(tiles):
    bg = Image.new('RGBA', t.size, (255, 255, 255, 255)); bg.alpha_composite(t)
    x, y = (i % cols) * W, (i // cols) * (H + 26)
    sheet.paste(bg.convert('RGB').crop(box).resize((W, H)), (x, y + 22)); d.text((x + 6, y + 4), name, fill='black')
out = os.path.join(HERE, base_id, 'app-preview.jpg'); sheet.save(out, quality=88); print(out)
