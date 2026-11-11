import {pathToFileURL} from 'node:url';
import fs from 'node:fs/promises';
const {chromium}=await import(pathToFileURL('C:/Users/kenne/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/kenne/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',m=>errors.push(m.message));
await page.goto('http://127.0.0.1:4197/koereskoler/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(9000);
console.log(await page.evaluate(()=>({error:document.documentElement.dataset.mapError,keys:window.maplibregl?Object.keys(maplibregl).slice(0,40):null,canvas:!!document.querySelector('.maplibregl-canvas'),mapText:document.querySelector('#map-loading')?.textContent,webgl:!!document.createElement('canvas').getContext('webgl2')})));console.log(errors.slice(0,15));
await page.screenshot({path:'qa/map-debug.png',fullPage:true});await browser.close();
