"""Lægger de tegnede øveprøvebilleder (docs/redesign/exam-toon/v2/q-XXX.png) ind i en udgave af appen.

Brug: python scripts/install-toon-exam.py <public- eller dist-mappe> [--native <mappe til PNG-originaler>] [--manifest <sti>]

- Hvert billede gemmes som assets/exam/toon-q-XXX.webp (lossy WebP, kvalitet 82, ca. 70 kB i stedet for 1,1 MB lossless).
- exam-photos.js får ny sti og nye mål. Titel og fakta under billedet bevares.
- De gamle AI-fotos flyttes ud af assets/exam til en backup-mappe ved siden af, så de ikke udgives.
- Med --native og --manifest skrives også PNG-originalerne og billedmanifestet, som udgivelsestjekket i main bruger.
"""
from pathlib import Path
import sys, re, json, hashlib, shutil, subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'docs/redesign/exam-toon/v2'
QUALITY = 82
args = sys.argv[1:]
target = Path(args[0]).resolve()
native = Path(args[args.index('--native') + 1]).resolve() if '--native' in args else None
manifest_path = Path(args[args.index('--manifest') + 1]).resolve() if '--manifest' in args else None
# spørgsmålenes signatur regnes ud fra den checkout, manifestet hører til (standard: mappen over public/dist)
qroot = Path(args[args.index('--repo') + 1]).resolve() if '--repo' in args else target.parent
assets = target / 'assets/exam'
sha = lambda b: hashlib.sha256(b).hexdigest()

js = (target / 'exam-photos.js').read_text(encoding='utf-8')
head, body = js.split('export const EXAM_PHOTOS=Object.freeze(', 1)
photos = json.loads(body.rsplit(');', 1)[0])
old_files = {p['src'].split('/')[-1] for p in photos.values()}

entries = []
for qid in sorted(photos):
    png = SRC / f'{qid}.png'
    assert png.exists(), f'mangler tegning til {qid}'
    with Image.open(png) as im:
        rgb = im.convert('RGB')
    name = f'toon-{qid}.webp'
    out = assets / name
    rgb.save(out, 'WEBP', quality=QUALITY, method=6)
    with Image.open(out) as w:
        w_rgb = w.convert('RGB'); width, height = w.size
    photos[qid] = {**photos[qid], 'src': f'assets/exam/{name}', 'width': width, 'height': height}
    data = out.read_bytes()
    entry = {'src': f'assets/exam/{name}', 'width': width, 'height': height, 'sha256': sha(data), 'bytes': len(data),
             'decodedRgbSha256': sha(w_rgb.tobytes()), 'encoding': 'lossy WebP', 'quality': QUALITY,
             'review': 'toon redraw checked against the question statements 26 Nov 2026; instructor approval pending',
             'id': qid, 'title': photos[qid]['title'], 'facts': photos[qid]['facts']}
    if native:
        native.mkdir(parents=True, exist_ok=True)
        dst = native / f'toon-{qid}.png'; rgb.save(dst, 'PNG', optimize=True)  # RGB uden alfa: samme pixels som appen viser
        entry.update(nativeSha256=sha(dst.read_bytes()), nativeBytes=dst.stat().st_size)
    entries.append(entry)

(target / 'exam-photos.js').write_text(
    '// Tegnede øveprøvebilleder (toon 3D) fra docs/redesign/exam-toon, lagt ind af scripts/install-toon-exam.py.\n'
    'export const EXAM_PHOTOS=Object.freeze(' + json.dumps(photos, ensure_ascii=False, indent=2) + ');\n', encoding='utf-8')

backup = target.parent / 'exam-photos-retired'
backup.mkdir(exist_ok=True)
moved = 0
for f in old_files:
    p = assets / f
    if p.exists() and not f.startswith('toon-'):
        shutil.move(str(p), backup / f); moved += 1

if manifest_path:
    node = "import {QUESTIONS} from './dist/content.js';import {questionSignature} from './dist/core.js';console.log(JSON.stringify(QUESTIONS.map(q=>({id:q.id,signature:questionSignature(q),context:q.context}))))"
    qs = {q['id']: q for q in json.loads(subprocess.run(['node', '--input-type=module', '-e', node], cwd=qroot, capture_output=True, text=True, encoding='utf-8', check=True).stdout)}
    for e in entries:
        e['questionSignature'] = qs[e['id']]['signature']; e['context'] = qs[e['id']]['context']
    manifest_path.write_text(json.dumps({'version': 2, 'status': 'complete-agent-reviewed', 'qualifiedInstructorApproved': False,
        'questionCount': len(entries), 'uniqueImages': len({e['src'] for e in entries}),
        'runtimeBytes': sum(e['bytes'] for e in entries), 'entries': entries}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

print(f'{len(entries)} billeder, {sum(e["bytes"] for e in entries) // 1024} kB i alt, {moved} gamle fotos flyttet til {backup.name}')
