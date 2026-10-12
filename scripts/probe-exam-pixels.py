"""Read-only independent runtime/native pixel probe for the local release gate."""
from pathlib import Path
from PIL import Image
import json,hashlib,concurrent.futures
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'authoring/exam-visual-manifest.json').read_text(encoding='utf-8'))
sources={e['src']:e for e in manifest['entries']}
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rgb(p):
    with Image.open(p) as im:
        if im.mode=='RGBA' and im.getchannel('A').getextrema()!=(255,255):raise ValueError('Unexpected transparent photograph '+str(p))
        return im.size,hashlib.sha256(im.convert('RGB').tobytes()).hexdigest()
def probe(item):
    src,record=item
    runtime=(ROOT/'dist'/src).resolve();native=(ROOT/'reference/exam-native'/Path(src).with_suffix('.png').name).resolve()
    if not runtime.is_relative_to((ROOT/'dist/assets/exam').resolve()) or not native.is_relative_to((ROOT/'reference/exam-native').resolve()):raise ValueError('Image escaped asset directory')
    size,pixels=rgb(runtime);native_size,native_pixels=rgb(native)
    if size!=native_size or pixels!=native_pixels:raise ValueError('Runtime/native pixel mismatch '+src)
    return src,{'width':size[0],'height':size[1],'sha256':digest(runtime),'decodedRgbSha256':pixels,'nativeSha256':digest(native),'nativeBytes':native.stat().st_size}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:result=dict(pool.map(probe,sources.items()))
print(json.dumps(result))
