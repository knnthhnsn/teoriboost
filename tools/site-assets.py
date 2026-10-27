"""Copies the art the teoriboost.dk website (site/) uses out of the app, so the site stays one small static folder:
fonts, the logo, the cast, streak flames, menu icons, the road scene, the race fire, the four vehicles and their
wreck/dream drawings (docs/redesign/cse/split). Run after the app art changes: python tools/site-assets.py
"""
import os, shutil
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
APP = os.path.join(ROOT, 'dist', 'assets'); OUT = os.path.join(ROOT, 'site', 'assets')
COPY = ['icon.svg', 'fonts/rubik-var.woff2', 'fonts/rubik-OFL.txt', 'fonts/atkinson-400.woff2', 'fonts/atkinson-700.woff2', 'fonts/atkinson-OFL.txt',
        *[f'cast/{n}.webp' for n in ('sneglen', 'kegle', 'blink', 'bobbel', 'krabbe', 'daek')],
        *[f'flame/L{n}-idle.webp' for n in range(1, 5)],
        *[f'nav/{n}.webp' for n in ('wheel', 'light', 'exam', 'car', 'snail')],
        *[f'scene/loop-{n}.webp' for n in ('far', 'near', 'clouds')],
        'race/nitro.webp', 'race/mega.webp', 'race/wind.webp', 'road/tyre.webp', 'road/skid.webp',
        *[f'traffic/{n}.webp' for n in ('red', 'yellow', 'green')]]
for rel in COPY:
    os.makedirs(os.path.dirname(os.path.join(OUT, rel)), exist_ok=True)
    shutil.copyfile(os.path.join(APP, rel), os.path.join(OUT, rel))
os.makedirs(os.path.join(OUT, 'cars'), exist_ok=True)
for base in ('scooter', 'smallcar', 'bigcar', 'racecar'):
    shutil.copyfile(os.path.join(APP, 'mybil', base, 'base.webp'), os.path.join(OUT, 'cars', base + '.webp'))
    for state in ('wreck', 'dream'):
        src = os.path.join(ROOT, 'docs', 'redesign', 'cse', 'split', f'{base}-{state}.png')
        im = Image.open(src).convert('RGBA'); im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()); im.thumbnail((720, 720), Image.LANCZOS)
        im.save(os.path.join(OUT, 'cars', f'{base}-{state}.webp'), 'WEBP', quality=86, method=6)
print('site assets:', sum(len(f) for _, _, f in os.walk(OUT)), 'files')
