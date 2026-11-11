import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL('C:/Users/kenne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const phase=process.argv.includes('--slice')?'slice':'final';await fs.mkdir('qa/'+phase,{recursive:true});
const manifest=JSON.parse(await fs.readFile('data/build-manifest.json','utf8'));
const wanted=['/koereskoler/','/koereskoler/aarhus/','/koereskoler/silkeborg/','/koereskoler/esbjerg/','/koereskoler/kalundborg/jakobs-koereskole/',...manifest.pages.filter(p=>p.kind==='school'&&/stavtrup|kvik-trafik|pers-koereskole/.test(p.path)).map(p=>p.path)];
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],executablePath:'C:/Users/kenne/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'});
const output={phase,startedAt:new Date().toISOString(),viewports:[],errors:[]};
for(const width of [320,390,768,1440]){
 for(const route of wanted){
  const page=await browser.newPage({viewport:{width,height:width>=768?1000:844},deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  const requests=[];page.on('request',r=>requests.push({url:r.url(),at:Date.now()}));
  await page.goto('http://127.0.0.1:4197'+route,{waitUntil:'networkidle',timeout:60000});await page.evaluate(()=>document.fonts.ready);
  if(route==='/koereskoler/'&&width<601){await page.locator('.view-tabs [data-view="map"]').click();}
  await page.waitForTimeout(3500);
  const name=route.split('/').filter(Boolean).slice(1).join('--')||'map';
  await page.screenshot({path:`qa/${phase}/${name}-${width}.png`,fullPage:true});
  if(route==='/koereskoler/')await page.screenshot({path:`qa/${phase}/map-viewport-${width}.png`});
  const audit=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.title,h1:document.querySelectorAll('h1').length,loadedMap:!!document.querySelector('.maplibregl-canvas'),smallControls:[...document.querySelectorAll('button,input,select,a[href]')].filter(e=>{const r=e.getBoundingClientRect(),st=getComputedStyle(e);return r.width>0&&r.height>0&&st.visibility!=='hidden'&&r.height<43&&e.closest('.knowledge-header,.search-panel,.results-bar,.result-list,.contact-copy,.maplibregl-ctrl,.view-tabs');}).map(e=>({tag:e.tagName,text:e.textContent.trim().slice(0,60),height:e.getBoundingClientRect().height})),overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&!e.closest('.maplibregl-canvas-container,.sr-only');}).slice(0,15).map(e=>({tag:e.tagName,cls:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}))}));
  output.viewports.push({route,width,...audit,pageErrors:errors,requests:requests.length});
  await page.close();
 }
}
await browser.close();await fs.writeFile(`qa/${phase}/visual-check.json`,JSON.stringify(output,null,2));console.log(JSON.stringify({phase,screenshots:output.viewports.length,overflow:output.viewports.filter(x=>x.scrollWidth>x.width),pageErrors:output.viewports.flatMap(x=>x.pageErrors),smallControls:output.viewports.filter(x=>x.smallControls.length).map(x=>({route:x.route,width:x.width,controls:x.smallControls}))},null,2));
