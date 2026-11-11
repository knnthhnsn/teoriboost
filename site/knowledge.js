// Search is progressive enhancement; every article and link exists in the HTML.
const search=document.querySelector('[data-search-input]');
const searchForm=document.querySelector('[data-search-form]');
if(searchForm)searchForm.hidden=false;
const filters=document.querySelector('[data-filters]');
let category='Alle';
const normalise=value=>value.toLocaleLowerCase('da').replace(/\bb\s*\+/g,'bplus').replace(/\bb\s*\/\s*e\b/g,'be').replaceAll('ø','o').replaceAll('æ','ae').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ');
const containsSearchWord=(text,word)=>word.length<=2?text.split(/\s+/).includes(word):text.includes(word);
const stopWords=new Set(['hvor','hvad','hvordan','hvilken','hvilke','kan','skal','ma','jeg','man','du','der','det','er','til','i','en','et','pa','om','med','for','har','have','og','at','af','sin','sit','mig']);
const questionSearch=document.querySelector('[data-question-search-input]');
const questionForm=document.querySelector('[data-question-search-form]');
const questionMore=document.querySelector('[data-question-more]');
const questionItems=[...document.querySelectorAll('[data-question-search]')];
const questionBatchSize=8;
let questionLimit=questionMore?questionBatchSize:questionItems.length;
function filterQuestions(){
 const query=questionSearch?.value||'';
 const searching=query.trim().length>0;
 const words=normalise(query).trim().split(/\s+/).filter(word=>word&&!stopWords.has(word));let count=0;
 for(const [index,item] of questionItems.entries()){
  const match=words.every(word=>containsSearchWord(normalise(item.dataset.questionSearch),word));
  const visible=searching?match:index<questionLimit;
  item.hidden=!visible;if(visible)count++;
 }
 const label=document.querySelector('[data-question-count]');if(label)label.textContent=searching?`${count} spørgsmål`:`${count} af ${questionItems.length} spørgsmål`;
 const empty=document.querySelector('[data-question-empty]');if(empty)empty.hidden=count>0;
 if(questionMore)questionMore.hidden=searching||questionLimit>=questionItems.length;
}
if(questionForm){
 questionForm.hidden=false;
 const label=document.querySelector('[data-question-count]');if(label)label.hidden=false;
 questionSearch?.addEventListener('input',()=>{questionLimit=questionMore?questionBatchSize:questionItems.length;filterQuestions();});
 questionForm.addEventListener('submit',event=>{event.preventDefault();filterQuestions();});
}
questionMore?.addEventListener('click',event=>{
 event.preventDefault();
 const previousLimit=questionLimit,left=window.scrollX,top=window.scrollY;
 questionLimit+=questionBatchSize;
 filterQuestions();
 // Move into the newly available questions, including when the button disappears.
 questionItems[previousLimit]?.querySelector('summary')?.focus({preventScroll:true});
 window.scrollTo(left,top);
});
if(questionItems.length)filterQuestions();
function revealQuestionHash(){
 if(!/^#spoergsmaal-\d+$/.test(location.hash))return;
 const target=document.getElementById(location.hash.slice(1));
 const item=target?.closest('.question-item');
 if(!item)return;
 if(item.hidden&&questionSearch)questionSearch.value='';
 const index=questionItems.indexOf(item);
 if(index>=0)questionLimit=Math.max(questionLimit,Math.ceil((index+1)/questionBatchSize)*questionBatchSize);
 filterQuestions();
 item.open=true;
 requestAnimationFrame(()=>item.scrollIntoView({block:'start'}));
}
if(questionItems.length){addEventListener('hashchange',revealQuestionHash);revealQuestionHash();}
function filterGuides(){
 const words=normalise(search?.value||'').trim().split(/\s+/).filter(word=>word&&!stopWords.has(word));let count=0;
 for(const card of document.querySelectorAll('[data-card]')){
  const text=normalise(card.dataset.search);
  const match=(category==='Alle'||card.dataset.category===category)&&words.every(word=>containsSearchWord(text,word));
  card.hidden=!match;if(match)count++;
 }
 const label=document.querySelector('[data-result-count]');if(label)label.textContent=`${count} ${count===1?'guide':'guider'}`;
 const empty=document.querySelector('[data-empty]');if(empty)empty.hidden=count>0;
}
if(filters){filters.hidden=false;filters.addEventListener('click',event=>{const b=event.target.closest('[data-filter]');if(!b)return;category=b.dataset.filter;for(const item of filters.querySelectorAll('button'))item.setAttribute('aria-pressed',String(item===b));filterGuides();});}
search?.addEventListener('input',filterGuides);
document.querySelector('[data-search-form]')?.addEventListener('submit',event=>{event.preventDefault();filterGuides();});
const form=document.querySelector('[data-reaction]');
const budget=document.querySelector('[data-budget]');
if(budget){
 budget.hidden=false;
 const update=()=>{
  const included=budget.elements.feeIncluded.checked;let sum=included?0:1600,missing=0,invalid=false;
  for(const field of budget.querySelectorAll('input[type="number"]')){if(field.value.trim()==='')missing++;const value=Number(field.value),bad=!Number.isFinite(value)||value<0||value>999999;field.setAttribute('aria-invalid',String(bad));if(bad)invalid=true;else sum+=value;}
  budget.querySelector('[data-budget-fee]').textContent=included?'1.600 kr. · i pakken':'1.600 kr.';
  budget.querySelector('[data-budget-total]').textContent=sum.toLocaleString('da-DK',{style:'currency',currency:'DKK',minimumFractionDigits:0,maximumFractionDigits:2});
  budget.querySelector('[data-budget-note]').textContent=invalid?'Ret de markerede beløb. Brug priser fra 0 til 999.999 kr.':missing?`${missing} ${missing===1?'post mangler':'poster mangler'} din pris. Tomme felter er endnu ikke medregnet.`:'Alle felter er udfyldt. Kontrollér stadig, hvad dine aftaler indeholder, og om der kommer flere udgifter.';
 };
 budget.addEventListener('input',update);budget.addEventListener('submit',event=>event.preventDefault());update();
}
if(form){form.hidden=false;const update=()=>{const speed=Number(form.elements.speed.value),reaction=Number(form.elements.reaction.value);form.querySelector('[data-speed-label]').textContent=`${speed} km/t`;form.querySelector('[data-distance]').textContent=(speed/3.6*reaction).toLocaleString('da-DK',{minimumFractionDigits:1,maximumFractionDigits:1});};form.addEventListener('input',update);form.addEventListener('submit',event=>event.preventDefault());update();}
// The billed-energy tool reveals its controls only after all hooks are bound.
for(const energyForm of document.querySelectorAll('[data-ev-energy]')){
 if(energyForm.dataset.energyReady==='true')continue;
 const distance=energyForm.elements.namedItem('distance');
 const consumption=energyForm.elements.namedItem('consumption');
 const price=energyForm.elements.namedItem('price');
 const purchased=energyForm.querySelector('[data-ev-energy-kwh]');
 const cost=energyForm.querySelector('[data-ev-energy-cost]');
 const message=energyForm.querySelector('[data-ev-energy-message]');
 if(!distance||!consumption||!price||!purchased||!cost||!message)continue;
 const amountFormat=new Intl.NumberFormat('da-DK',{minimumFractionDigits:0,maximumFractionDigits:2});
 const priceFormat=new Intl.NumberFormat('da-DK',{style:'currency',currency:'DKK',minimumFractionDigits:0,maximumFractionDigits:2});
 const largeAmountFormat=new Intl.NumberFormat('da-DK',{notation:'scientific',maximumFractionDigits:2});
 const largePriceFormat=new Intl.NumberFormat('da-DK',{style:'currency',currency:'DKK',notation:'scientific',maximumFractionDigits:2});
 const displayEnergy=(value,currency=false)=>{
  const magnitude=Math.abs(value);
  const scientific=magnitude>=1e6||(magnitude>0&&magnitude<0.005);
  return (currency?(scientific?largePriceFormat:priceFormat):(scientific?largeAmountFormat:amountFormat)).format(value===0?0:value);
 };
 const fields=[[distance,'afstand i km',true],[consumption,'købte kWh pr. 100 km',true],[price,'samlet pris i kr. pr. kWh',false]];
 const clear=error=>{purchased.textContent='—';cost.textContent='—';message.textContent=error;};
 const updateEnergy=()=>{
  const values=[];const errors=[];
  for(const [field,label,nonnegative] of fields){
   const value=field.valueAsNumber;
   const invalid=field.value.trim()===''||!field.validity.valid||!Number.isFinite(value)||(nonnegative&&value<0);
   field.setAttribute('aria-invalid',String(invalid));
   values.push(value);
   if(invalid)errors.push(`Udfyld ${label} med et gyldigt tal${nonnegative?' på mindst 0':''}.`);
  }
  if(errors.length){clear(errors.join(' '));return;}
  const kwh=values[0]/100*values[1];
  const total=kwh*values[2];
  if(!Number.isFinite(kwh)||!Number.isFinite(total)){
   clear('Tallene giver et for stort resultat. Brug mindre tal for afstand, forbrug eller pris.');return;
  }
  purchased.textContent=`${displayEnergy(kwh)} kWh`;
  cost.textContent=displayEnergy(total,true);
  message.textContent='';
 };
 energyForm.addEventListener('input',updateEnergy);
 energyForm.addEventListener('submit',event=>event.preventDefault());
 updateEnergy();
 energyForm.dataset.energyReady='true';
 energyForm.hidden=false;
}
for(const form of document.querySelectorAll('form[data-car-budget]')){
 if(form.dataset.carBudgetReady==='true')continue;
 const fields=[
  ['purchase','købspris',0],
  ['resale','salgspris',0],
  ['months','ejertid',1],
  ['annualKm','kilometer pr. år',0],
  ['annualRunning','driftsudgifter pr. år',0],
  ['monthlyPayment','låneydelse pr. måned',0],
  ['monthlyFinance','renter og gebyrer pr. måned',0]
 ].map(([name,label,min])=>({input:form.elements.namedItem(name),label,min}));
 const ownershipResult=form.querySelector('[data-budget-result="ownership"]');
 const cashResult=form.querySelector('[data-budget-result="cash"]');
 const kilometreResult=form.querySelector('[data-budget-result="kilometre"]');
 const status=form.querySelector('[data-budget-status]');
 if(fields.some(({input})=>input?.type!=='number')||!ownershipResult||!cashResult||!kilometreResult||!status)continue;

 const money=new Intl.NumberFormat('da-DK',{style:'currency',currency:'DKK',maximumFractionDigits:0});
 const rate=new Intl.NumberFormat('da-DK',{style:'currency',currency:'DKK',minimumFractionDigits:2,maximumFractionDigits:2});
 const clear=message=>{
  ownershipResult.textContent='—';
  cashResult.textContent='—';
  kilometreResult.textContent='—';
  status.textContent=message;
 };
 const calculate=announce=>{
  const invalidFields=[];
  const values=fields.map(({input,label,min})=>{
   const value=input.valueAsNumber;
   if(!Number.isFinite(value)||value<min||!input.validity.valid){
    input.setAttribute('aria-invalid','true');
    invalidFields.push({input,label});
   }else input.removeAttribute('aria-invalid');
   return value;
  });
  if(invalidFields.length){
   clear(`Kontrollér følgende felter: ${invalidFields.map(({label})=>label).join(', ')}.`);
   if(announce)invalidFields[0].input.focus();
   return;
  }
  const [purchase,resale,months,annualKm,annualRunning,monthlyPayment,monthlyFinance]=values;
  const running=annualRunning/12;
  const ownership=(purchase-resale)/months+running+monthlyFinance;
  const cash=running+monthlyPayment;
  const kilometre=annualKm===0?null:ownership/annualKm*12;
  if(!Number.isFinite(ownership)||!Number.isFinite(cash)||(kilometre!==null&&!Number.isFinite(kilometre))){
   clear('Tallene giver et for stort resultat. Prøv med mindre beløb eller et højere kilometertal.');
   return;
  }
  ownershipResult.textContent=money.format(ownership);
  cashResult.textContent=money.format(cash);
  kilometreResult.textContent=kilometre===null?'—':rate.format(kilometre);
  const summary=announce?`Ejeromkostning ${ownershipResult.textContent} pr. måned. Betalinger ${cashResult.textContent} pr. måned. `:'';
  const distance=kilometre===null?'Pris pr. kilometer kan ikke beregnes ved 0 km.':announce?`${kilometreResult.textContent} pr. kilometer.`:'';
  status.textContent=(summary+distance).trim();
 };
 form.noValidate=true;
 form.addEventListener('input',event=>{
  if(!fields.some(({input})=>input===event.target))return;
  event.target.removeAttribute('aria-invalid');
  const message='Beregn igen for at se resultatet med de nye tal.';
  if(status.textContent!==message)clear(message);
 });
 form.addEventListener('submit',event=>{event.preventDefault();calculate(true);});
 form.addEventListener('reset',()=>setTimeout(()=>calculate(true),0));
 form.dataset.carBudgetReady='true';
 calculate(false);
 const submit=form.querySelector('button[type="submit"]');
 if(submit)submit.disabled=false;
}
const progress=document.querySelector('[data-read-progress]');
const content=document.querySelector('.article-body');
if(progress&&content){let pending=false;const update=()=>{const rect=content.getBoundingClientRect();const distance=Math.max(1,rect.height-innerHeight);progress.style.width=`${Math.max(0,Math.min(1,-rect.top/distance))*100}%`;pending=false;};addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();}
const masthead=document.querySelector('[data-knowledge-header]');
const cover=document.querySelector('.knowledge-billboard,.article-intro');
if(masthead&&cover){let scheduled=false;const update=()=>{masthead.classList.toggle('is-light',cover.getBoundingClientRect().bottom<84);scheduled=false;};addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();}
const contents=document.querySelector('.toc details');
if(contents){const compactContents=matchMedia('(max-width:900px)');const syncContents=()=>{contents.open=!compactContents.matches;};syncContents();compactContents.addEventListener('change',syncContents);}
if('IntersectionObserver' in window){
 const chapterLinks=[...document.querySelectorAll('.toc nav a')];
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){for(const link of chapterLinks)link.classList.toggle('is-active',link.hash==='#'+entry.target.id);}},{rootMargin:'-110px 0px -65% 0px'});
 for(const section of document.querySelectorAll('.article-body section[id]'))observer.observe(section);
 const motion=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.style.animationPlayState=entry.isIntersecting?'running':'paused';});
 for(const element of document.querySelectorAll('.hero-snail,.knowledge-ticker>span,.article-art>img'))motion.observe(element);
}

;(function () {
  'use strict';

  var root = document.documentElement;
  var guard = '__natkoerselScrollbarRuntime';
  if (window[guard]) return;
  window[guard] = true;

  var media = window.matchMedia('(hover: hover) and (pointer: fine) and (forced-colors: none)');
  var pending = false;

  function update() {
    pending = false;
    if (!media.matches) {
      root.removeAttribute('data-scrollbar-theme');
      return;
    }

    var sample = document.elementFromPoint(
      Math.max(0, root.clientWidth - 2),
      Math.max(0, Math.floor(window.innerHeight / 2))
    );
    if (!sample) return;

    var surface = window.getComputedStyle(sample).getPropertyValue('--brand-scroll-surface').trim();
    var theme = surface === 'dark' ? 'dark' : 'light';
    if (root.getAttribute('data-scrollbar-theme') !== theme) {
      root.setAttribute('data-scrollbar-theme', theme);
    }
  }

  function schedule() {
    if (!media.matches) {
      root.removeAttribute('data-scrollbar-theme');
      return;
    }
    if (!pending) {
      pending = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (media.addEventListener) media.addEventListener('change', schedule);
  else if (media.addListener) media.addListener(schedule);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
}());
