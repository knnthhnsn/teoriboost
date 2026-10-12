"""Package unchanged photograph pixels as lossless WebP, retaining native PNGs."""
from pathlib import Path
import hashlib,json,subprocess,concurrent.futures
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'dist/assets/exam'
NATIVE=ROOT/'reference/exam-native'
NATIVE.mkdir(parents=True,exist_ok=True)
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(name): return json.loads((ROOT/'authoring'/name).read_text(encoding='utf-8'))
def relative_src(s): return s.removeprefix('dist/')
by_id={}
for raw in read('exam-traffic-photo-manifest.json')['entries']+read('exam-late-photo-manifest.json')['assets']:
    by_id[raw['id']]={**raw,'src':relative_src(raw['src'])}
for raw in read('exam-photo-corrections.json').get('entries',[]):
    by_id[raw['id']]={**raw,'src':'assets/exam/'+Path(raw['nativePath']).name}
for raw in read('exam-final-photo-corrections.json').get('entries',[]):
    dst=ROOT/raw['nativePath'];source=Path(raw['originalSource']);dst.write_bytes(source.read_bytes())
    by_id[raw['id']]={**raw,'src':'assets/exam/'+dst.name,'sha256':sha(source),'bytes':source.stat().st_size}
for raw in read('exam-detail-photo-records.json'):
    if raw['approved']:
        dst=ROOT/'dist'/raw['src'];source=Path(raw['sourcePath']);dst.write_bytes(source.read_bytes())
        by_id[raw['id']]={**raw,'sha256':sha(source),'bytes':source.stat().st_size,'width':1586,'height':992,'originalSource':str(source)}
for raw in read('exam-photo-manifest.json')['assets']:
    for qid in raw['questionIds']:
        by_id[qid]={**raw,'id':qid,'src':'assets/exam/'+raw['filename'],'originalSource':raw['sourcePath']}
node="""import {QUESTIONS} from './dist/content.js';import {questionSignature} from './dist/core.js';console.log(JSON.stringify(QUESTIONS.map(q=>({id:q.id,signature:questionSignature(q),context:q.context}))));"""
questions=json.loads(subprocess.run(['node','--input-type=module','-e',node],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',check=True).stdout)
assert set(by_id)=={q['id'] for q in questions},f'Missing/excess picture IDs: {set(by_id)^set(q["id"] for q in questions)}'
selected={raw['src']:raw for raw in by_id.values()}
def package(item):
    src,raw=item;p=(ROOT/'dist'/src).resolve();native=(NATIVE/p.name).resolve()
    assert p.is_relative_to(ASSETS.resolve()) and native.is_relative_to(NATIVE.resolve())
    if not p.exists():p.write_bytes(native.read_bytes())
    assert sha(p)==raw['sha256'].lower(),f'Changed native {src}'
    with Image.open(p) as im:
        rgb=im.convert('RGB');pixelhash=hashlib.sha256(rgb.tobytes()).hexdigest();w,h=im.size
    assert w>=1000 and h>=600 and 1.35<=w/h<=1.8,f'Unexpected native dimensions {src}: {w}x{h}'
    webp=p.with_suffix('.webp')
    same_pixels=False
    if webp.exists():
        with Image.open(webp) as im:same_pixels=im.size==(w,h) and hashlib.sha256(im.convert('RGB').tobytes()).hexdigest()==pixelhash
    if not same_pixels:subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',str(p),'-c:v','libwebp','-lossless','1','-compression_level','6','-pix_fmt','bgra',str(webp)],check=True,capture_output=True)
    with Image.open(webp) as im:assert im.size==(w,h) and hashlib.sha256(im.convert('RGB').tobytes()).hexdigest()==pixelhash,f'Pixel drift {src}'
    if native.exists():assert sha(native)==sha(p)
    else:native.write_bytes(p.read_bytes())
    return src,{'src':src.removesuffix('.png')+'.webp','nativePath':str(native),'nativeSha256':sha(p),'nativeBytes':p.stat().st_size,'width':w,'height':h,'sha256':sha(webp),'bytes':webp.stat().st_size,'decodedRgbSha256':pixelhash,'encoding':'lossless WebP','review':'agent pixel review; instructor approval pending'}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:packaged=dict(pool.map(package,selected.items()))
facts={
 'q-004':['Mønster: 1,3 mm','Skade i siden','Hurtigt højre blink'],
 'q-045':['Barn: 120 cm'], 'q-049':['Afgang: 19.45','Forventet hjemkomst: 20.10'],
 'q-051':['6 m fra tværgående kørebane'], 'q-052':['3 m før fodgængerfeltet'],
 'q-053':['Ventetid: 2 minutter'], 'q-054':['Påstigning: 4 minutter'],
 'q-055':['Onsdag kl. 10.00','2 timer · P-skive · hverdage 8–18'],
 'q-057':['Intet gyldigt parkeringskort','Ophold: 2 minutter'],
 'q-069':['Klokken er 05.00'], 'q-070':['Klokken er 20.00'],
 'q-073':['30 cm fra højre kant'], 'q-079':['Praktisk lektion: mindst 45 minutter']
}
titles=['Kabinen før turen','Assistentvisning og vejarbejde','Pedalen under fast tryk','Morgenkontrollen','Lampen på instrumentbrættet','Ved kantstenen','Svinget på øvelsespladsen','Indkørslen og hækken','Passagerdøren og cyklisten','Motorvejen foran bilen','Området til venstre for bilen','Lastbilen ved hjørnet','Et lys i mørket','Elcyklisten bagfra','Lasten i bagagerummet','Bolden mellem bilerne','En besked midt i trafikken','Den trætte fører','Bilen til festen','Bilen tæt bagved','Broen i frostvejret','Trafikken i dagsregnen','Bakketoppen forude','Kørslen ved skolen','Køen ved jernbanesporet','Politiet og signalet','Køen på den anden side','Blinklys ved sidevejen','Ambulancen ved krydset','Uheldet på landevejen','Udkørslen over fortovet','Det tomme kryds','Bilen fra højre','Cyklisten ved siden af bilen','Udkørslen fra rundkørslen','Vand og sigt i regnen','Bilen i venstre vognbane','Varebilen på den smalle vej','Bilen bagved har trukket ud','Punkteringen på motorvejen','Tagboksen og dæktrykket','Det uoverskuelige sving','Køen langt fremme','Løse blade på vejen','Barnet og den korte tur','Den gennemførte hjemmetræning','Det digitale prøveformat','Situation 8 til gennemgang','Den planlagte aftentur','Det første kørekort','Bilens placering ved krydset','Standsningen før fodgængerfeltet','Ventetiden ved kanten','Passagerens påstigning','Den frie parkeringsbås','Placeringen ved fortovet','Den reserverede bås','Tavlen og hajtænderne','Tavlen og stoplinjen','Hastighedstavlen i regnen','Hellen forude','Linjerne ved vejarbejdet','Bilens lys i dagsregnen','Muren ved krydset','Cyklisten fra højre','Cyklisten langs bilens side','Vejen til højre','Den gående ved feltet','Klokken bliver 05.00','Klokken bliver 20.00','Udkørslen fra gården','Parkering på den lukkede plads','Afstanden til højre kant','Barnet i boligområdet','Cyklisterne og bumpet','Motorcyklen ved venstresvinget','Cykelstien og den gående','Letbanen og signalet','Planen for letbaneundervisning','Ruten for lektionen','Den sene GPS-anvisning','Hjulene ved den høje kant','Planen på den offentlige vej']
assert len(titles)==83
photos={};entries=[]
for q in questions:
    raw=by_id[q['id']];asset=packaged[raw['src']]
    title=titles[int(q['id'].split('-')[1])-1]
    photos[q['id']]={k:asset[k] for k in ['src','width','height']};photos[q['id']].update(title=title,facts=facts.get(q['id'],[]))
    entries.append({**asset,'id':q['id'],'questionSignature':q['signature'],'context':q['context'],'title':title,'facts':facts.get(q['id'],[]),'originalSource':raw.get('originalSource',raw.get('sourcePath','')),'limits':['Still imagery cannot certify speeds, movement, blink frequency, measured metres or previous observations. Context provides those conditions.']})
(ROOT/'dist/exam-photos.js').write_text('// Generated by scripts/prepare-exam-photos.py. Native pixels retained unchanged.\nexport const EXAM_PHOTOS=Object.freeze('+json.dumps(photos,ensure_ascii=False,indent=2)+');\n',encoding='utf-8')
(ROOT/'authoring/exam-visual-manifest.json').write_text(json.dumps({'version':1,'status':'complete-agent-reviewed','qualifiedInstructorApproved':False,'questionCount':len(entries),'uniqueImages':len(packaged),'nativeBytes':sum(x['nativeBytes'] for x in packaged.values()),'runtimeBytes':sum(x['bytes'] for x in packaged.values()),'entries':entries},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Move only our new PNG files, never a directory or unrelated project asset.
for p in ASSETS.glob('*.png'):
    source=p.resolve();target=(NATIVE/p.name).resolve()
    assert source.is_relative_to(ASSETS.resolve()) and target.is_relative_to(NATIVE.resolve())
    if target.exists():assert sha(target)==sha(source);source.unlink()
    else:source.rename(target)
expected={x['src'].split('/')[-1] for x in packaged.values()}
retired=ROOT/'reference/exam-retired-runtime';retired.mkdir(parents=True,exist_ok=True)
for p in ASSETS.glob('*.webp'):
    if p.name not in expected:
        source=p.resolve();target=(retired/p.name).resolve()
        assert source.is_relative_to(ASSETS.resolve()) and target.is_relative_to(retired.resolve())
        if target.exists():assert sha(target)==sha(source);source.unlink()
        else:source.rename(target)
print(json.dumps({'questions':len(entries),'uniqueImages':len(packaged),'nativeBytes':sum(x['nativeBytes'] for x in packaged.values()),'runtimeBytes':sum(x['bytes'] for x in packaged.values()),'pixelEquality':'all decoded RGB pixels match native originals'}))
