import {createHash} from 'node:crypto';
import {questionSignature} from './dist/core.js';
export function validateExamVisuals({questions,photos,manifest,readAsset,readPixelProbe,files=[]}){
  const errors=[],ids=new Set(questions.map(q=>q.id)),entries=manifest?.entries||[];
  if(manifest?.status!=='complete-agent-reviewed')errors.push('billedbanken mangler afsluttet agentkontrol');
  if(entries.length!==questions.length||new Set(entries.map(e=>e.id)).size!==entries.length)errors.push('billedmanifestets antal/id er forkert');
  if(Object.keys(photos).length!==questions.length||Object.keys(photos).some(id=>!ids.has(id)))errors.push('billedbanken matcher ikke spørgsmålsbanken');
  const checked=new Map(),expected=new Set();
  for(const q of questions){const p=photos[q.id],record=entries.find(e=>e.id===q.id);if(!p||!record){errors.push(`${q.id}: situationsbillede mangler`);continue;}
    if(record.questionSignature!==questionSignature(q)||record.context!==q.context)errors.push(`${q.id}: billedgennemgangen er forældet efter tekstændring`);
    if(!/^assets\/exam\/[a-z0-9-]+\.webp$/.test(p.src)||p.src!==record.src){errors.push(`${q.id}: ugyldig billedsti`);continue;}
    expected.add(p.src.split('/').at(-1));
    if(p.width!==record.width||p.height!==record.height||p.title!==record.title||JSON.stringify(p.facts)!==JSON.stringify(record.facts))errors.push(`${q.id}: billedmetadata er ændret`);
    if(record.encoding!=='lossless WebP'||!/^[a-f0-9]{64}$/.test(record.decodedRgbSha256||''))errors.push(`${q.id}: mangler pixelkontrol`);
    let probe;try{probe=readPixelProbe?.(p.src);}catch{}if(!probe||probe.decodedRgbSha256!==record.decodedRgbSha256||probe.nativeSha256!==record.nativeSha256||probe.nativeBytes!==record.nativeBytes||probe.sha256!==record.sha256||probe.width!==record.width||probe.height!==record.height)errors.push(`${q.id}: uafhængig native/pixelkontrol mangler eller matcher ikke`);
    let b=checked.get(p.src);if(!b){try{b=readAsset(p.src);checked.set(p.src,b);}catch{errors.push(`${q.id}: billedfilen mangler`);continue;}}
    if(b.length!==record.bytes||createHash('sha256').update(b).digest('hex')!==record.sha256)errors.push(`${q.id}: billedfilen er ændret`);
    if(b.length<25||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP'||b.toString('ascii',12,16)!=='VP8L'||b[20]!==0x2f){errors.push(`${q.id}: filen er ikke lossless WebP`);continue;}
    const bits=b.readUInt32LE(21);if((bits&0x3fff)+1!==p.width||((bits>>>14)&0x3fff)+1!==p.height)errors.push(`${q.id}: billedets native dimensioner matcher ikke`);
  }
  for(const file of files)if(!expected.has(file))errors.push(`ikke-gennemgået billedfil i udgivelsen: ${file}`);
  return {errors,images:checked.size,bindings:questions.length};
}
