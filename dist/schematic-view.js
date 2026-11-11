/** Presentation only. Approved question/diagram source and bindings stay intact. */
export function mountSchematic(host){
  const svg=host.querySelector('svg[role="img"]');
  const body=[...svg?.children||[]].find(e=>e.tagName.toLowerCase()==='g'&&e.getAttribute('aria-hidden')==='true');
  if(!svg||!body)return null;
  let disposed=false;
  // The source header and legend duplicate the app frame and become tiny on a phone.
  const background=[...svg.children].find(e=>e.tagName.toLowerCase()==='rect');
  for(const e of [...svg.children])if(e!==body&&e!==background&&!['title','desc','defs'].includes(e.tagName.toLowerCase()))e.remove();
  svg.setAttribute('viewBox','0 44 640 280');
  const notes=document.createElement('div');notes.className='schematic-notes';
  const seen=new Set();
  const baseFonts=new WeakMap([...body.querySelectorAll('text')].map(text=>[text,text.style.fontSize]));
  function moveToNote(text){
    const copy=text.textContent.trim();
    if(copy&&!seen.has(copy)){const p=document.createElement('p');p.textContent=copy;notes.append(p);seen.add(copy);}
    const previous=text.previousElementSibling;
    if(previous?.tagName.toLowerCase()==='rect'&&Number(previous.getAttribute('height'))<=40&&Number(previous.getAttribute('width'))>=250)previous.remove();
    text.remove();
  }
  for(const text of [...body.querySelectorAll('text')]){
    const prev=text.previousElementSibling;
    if(text.textContent.length>65||(Number(text.getAttribute('y'))>=280&&prev?.tagName.toLowerCase()==='rect'&&Number(prev.getAttribute('width'))>=250))moveToNote(text);
  }
  host.querySelector('.scene-photo-stage').after(notes);
  function resize(){
    if(disposed||!svg.isConnected)return;
    const bounds=svg.getBoundingClientRect();if(!bounds.width)return;
    for(const text of [...body.querySelectorAll('text')]){
      text.style.fontSize=baseFonts.get(text)||'';
      const matrix=text.getScreenCTM();if(!matrix)continue;
      const scale=Math.hypot(matrix.a,matrix.b);if(!scale)continue;
      const font=parseFloat(getComputedStyle(text).fontSize);
      if(font*scale<12)text.style.fontSize=`${12/scale}px`;
      // A caption outside the SVG is preferable to clipped, compressed micro-copy.
      const r=text.getBoundingClientRect();
      if(r.left<bounds.left-1||r.right>bounds.right+1||r.top<bounds.top-1||r.bottom>bounds.bottom+1)moveToNote(text);
    }
    notes.hidden=!notes.childElementCount;
    host.dataset.visualStatus='ready';
  }
  resize();
  const observer=new ResizeObserver(resize);observer.observe(svg);
  document.fonts?.ready.then(()=>{if(!disposed)resize();});
  return {dispose(){disposed=true;observer.disconnect();}};
}
