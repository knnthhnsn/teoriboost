// Safe text rendering for status labels with decorative separators.
export function setBrandText(element, value) {
 const parts=String(value ?? '').replace(/\s*…$/, ' · ').split(/\s+(?:·|\/{3})\s+/),nodes=[];
 parts.forEach((part,index)=>{if(index){nodes.push(document.createTextNode(' '));const mark=document.createElement('span');mark.className='tb-stripes';mark.setAttribute('aria-hidden','true');nodes.push(mark,document.createTextNode(' '));}nodes.push(document.createTextNode(part));});
 element.replaceChildren(...nodes);
 if(element.dataset)element.dataset.brandText=String(value ?? '');
}
