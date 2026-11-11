#!/usr/bin/env node
// Static QA for the generated /koereskoler section. This is deliberately not a formal HTML or Schema.org validator.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkGuideDesign } from './check-guide-design.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sectionRoot = path.join(projectRoot, 'site', 'koereskoler');
const siteRoot = path.join(projectRoot, 'site');
const releaseRoot = path.resolve(projectRoot, '..', 'teoriboost-release-site-perf-20261108');
const reportPath = path.join(projectRoot, 'qa', 'static-check.json');
const designPath = path.join(projectRoot, 'qa', 'design-check.json');
const siteOrigin = 'https://teoriboost.dk';
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const allowedColors = new Set('#FFD60A #FFF6C7 #FFEB85 #FFE45C #E8BC00 #C9A200 #4A4127 #FEFFED #0F1215 #F4F5F7 #E3E5E8 #C2CCD6 #5F656D #525C65 #3A434C #2B3138 #1F2328 #58CC02 #2F6F00 #E8FBD5 #FF4B4B #D42F2F #FFE5E5 #1CB0F6 #0A7BBF #FF9600'.split(' '));

function attrs(tag) {
  const found = {};
  for (const m of tag.replace(/^<\/?\s*[\w:-]+/, '').matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) found[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return found;
}
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (all, x) => {
    if (x[0] === '#') { const n = Number.parseInt(x.slice(x[1].toLowerCase() === 'x' ? 2 : 1), x[1].toLowerCase() === 'x' ? 16 : 10); return n <= 0x10ffff ? String.fromCodePoint(n) : all; }
    return { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ' }[x.toLowerCase()] ?? all;
  });
}
function textOnly(html) {
  return decode(html.replace(/<!--[^]*?-->/g, ' ').replace(/<(script|style|template|svg)\b[^>]*>[^]*?<\/\1\s*>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}
function cleanUrl(url) { const u = new URL(url, siteOrigin); u.hash = ''; return u.href.replace(/\/$/, '') + '/'; }
function rel(file) { return path.relative(projectRoot, file).split(path.sep).join('/'); }
function issue(issues, file, kind, message) { issues.push({ file: rel(file), kind, message }); }
async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes:true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(file)); else if (entry.isFile()) out.push(file);
  }
  return out;
}
function tagMatches(html, name) { return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))]; }
function oneTag(html, name) { return tagMatches(html, name)[0]?.[0] ?? null; }
function pageUrl(file) { const relative = path.relative(siteRoot, file).split(path.sep).join('/'); return new URL('/' + relative.replace(/index\.html$/, ''), siteOrigin).href; }
function stripRaw(html) { return html.replace(/<!--[^]*?-->/g, '').replace(/<(script|style|template)\b[^>]*>[^]*?<\/\1\s*>/gi, ''); }
function stackCheck(html) {
  const stack = []; const findings = []; const source = stripRaw(html);
  for (const m of source.matchAll(/<\/?[a-z][^>]*>/gi)) {
    const raw = m[0], tag = /^<\/?\s*([\w:-]+)/.exec(raw)?.[1]?.toLowerCase(); if (!tag || voidTags.has(tag) || /\/\s*>$/.test(raw)) continue;
    if (raw.startsWith('</')) { if (stack.at(-1) === tag) stack.pop(); else findings.push(`Unexpected closing </${tag}>`); }
    else stack.push(tag);
  }
  if (stack.length) findings.push(`Unclosed tags: ${stack.slice(-6).join(', ')}`);
  return findings;
}
function schemaTerm(value) {
  if (typeof value !== 'string') return null;
  if (value.startsWith('schema:')) return value;
  if (/^https?:\/\/schema\.org\//.test(value)) return 'schema:' + value.split('/').filter(Boolean).at(-1);
  if (/^[A-Za-z][A-Za-z0-9]*$/.test(value)) return 'schema:' + value;
  return null;
}
function schemaCheck(json, vocab, file, issues) {
  let nodes = 0;
  function visit(value) {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!value || typeof value !== 'object') return;
    if ('@type' in value) {
      nodes += 1;
      for (const type of [value['@type']].flat()) {
        const term = schemaTerm(type);
        if (!term || !vocab.classes.has(term)) issue(issues, file, 'schema-type', `Unknown Schema.org type ${JSON.stringify(type)}`);
      }
    }
    for (const [key, child] of Object.entries(value)) {
      if (!key.startsWith('@')) {
        const term = schemaTerm(key);
        if (!term || !vocab.properties.has(term)) issue(issues, file, 'schema-property', `Unknown Schema.org property ${key}`);
      }
      if (key !== '@context') visit(child);
    }
  }
  visit(json); return nodes;
}
function breadcrumbJson(scripts) {
  const found = [];
  function visit(x) {
    if (Array.isArray(x)) { x.forEach(visit); return; }
    if (!x || typeof x !== 'object') return;
    if ([x['@type']].flat().some(t => schemaTerm(t) === 'schema:BreadcrumbList')) found.push(x);
    if (x['@graph']) visit(x['@graph']);
  }
  scripts.forEach(visit); return found;
}
function crumbsFromHtml(html) {
  const nav = [...html.matchAll(/<nav\b([^>]*)>([^]*?)<\/nav>/gi)].find(m => /(?:bread|brød|broed|sti)/i.test(JSON.stringify(attrs('<nav ' + m[1] + '>'))));
  if (!nav) return null;
  return [...nav[2].matchAll(/<(a|span)\b([^>]*)>([^]*?)<\/\1>/gi)]
    .filter(m => !('aria-hidden' in attrs('<'+m[1]+' '+m[2]+'>')))
    .map(m => ({name:textOnly(m[3]),href:m[1].toLowerCase()==='a' ? attrs('<a '+m[2]+'>').href : null}))
    .filter(x => x.name);
}
function shingles(text) {
  const tokens = text.toLocaleLowerCase('da').match(/[\p{L}\p{N}]+/gu) ?? [];
  const set = new Set(); for (let i=0; i+5<=tokens.length; i++) set.add(tokens.slice(i,i+5).join(' ')); return set;
}
function jaccard(a,b) { if (!a.size || !b.size) return 0; let n=0; for (const s of a) if (b.has(s)) n++; return n/(a.size+b.size-n); }
function uniqueContent(html) {
  const m = /<([a-z][\w-]*)\b[^>]*\bdata-unique(?:-content)?(?:\s|=|>)[^>]*>([^]*?)<\/\1\s*>/i.exec(html);
  if (m) return { basis:'data-unique', text:textOnly(m[2]) };
  const main = /<main\b[^>]*>([^]*?)<\/main>/i.exec(html)?.[1] ?? '';
  return { basis:'main-without-nav-aside', text:textOnly(main.replace(/<(nav|aside)\b[^>]*>[^]*?<\/\1\s*>/gi,' ')) };
}
function hexColor(raw) { const h=raw.toUpperCase().slice(1); return '#' + (h.length === 3 || h.length === 4 ? h.slice(0,3).split('').map(x=>x+x).join('') : h.slice(0,6)); }
function checkHtmlColors(html,file,issues) {
  const candidates = [...html.matchAll(/<(?:meta|[a-z][\w-]*)\b[^>]*\b(?:style|fill|stroke|color|bgcolor|content)\s*=\s*(?:"[^"]*"|'[^']*')[^>]*>/gi)];
  for (const [tag] of candidates) {
    for (const m of tag.matchAll(/#[0-9a-f]{3,8}\b/gi)) if (!allowedColors.has(hexColor(m[0]))) issue(issues,file,'off-palette-html',m[0]);
  }
  // Script literals are checked as a warning because some values may be non-visual IDs.
  for (const m of html.matchAll(/(?:fill|stroke|color|backgroundColor)\s*[:=]\s*['"](#[0-9a-f]{3,8})['"]/gi)) if (!allowedColors.has(hexColor(m[1]))) issue(issues,file,'off-palette-script',m[1]);
}
async function resolveInternal(href, from, htmlCache) {
  let u; try { u = new URL(href, pageUrl(from)); } catch { return { error:'Malformed URL' }; }
  if (u.origin !== siteOrigin) return null;
  let pathname; try { pathname = decodeURIComponent(u.pathname); } catch { return { error:'Malformed percent encoding' }; }
  if (pathname.includes('..')) return { error:'Path traversal' };
  const candidate = pathname.endsWith('/') ? pathname + 'index.html' : pathname;
  const local = path.join(siteRoot, candidate.replace(/^\//,''));
  let target = local;
  try { if (!(await fs.stat(local)).isFile()) throw new Error(); }
  catch {
    target = path.join(releaseRoot, candidate.replace(/^\//,''));
    try { if (!(await fs.stat(target)).isFile()) throw new Error(); } catch { return { error:`Missing internal target ${pathname}` }; }
  }
  if (u.hash && /\.html$/i.test(target)) {
    let content = htmlCache.get(target); if (content === undefined) { content = await fs.readFile(target,'utf8'); htmlCache.set(target,content); }
    const fragment = decodeURIComponent(u.hash.slice(1));
    const ids = [...content.matchAll(/\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map(m=>decode(m[1]??m[2]));
    if (!ids.includes(fragment)) return { error:`Missing fragment #${fragment} in ${pathname}` };
  }
  return null;
}

async function main() {
  const issues = []; const warnings = []; let files;
  try { files = (await walk(sectionRoot)).filter(f=>f.endsWith('.html')).sort(); }
  catch (error) { console.error(`Cannot read generated section: ${error.message}`); process.exitCode=2; return; }
  const vocabJson = JSON.parse(await fs.readFile(path.join(projectRoot,'data/raw/schema-vocabulary.json'),'utf8'));
  const vocab = { classes:new Set(), properties:new Set() };
  for (const term of vocabJson['@graph']) { if (term['@type'] === 'rdfs:Class') vocab.classes.add(term['@id']); if (term['@type'] === 'rdf:Property') vocab.properties.add(term['@id']); }
  const htmlCache=new Map(), pages=[];
  for (const file of files) {
    const html=await fs.readFile(file,'utf8'); htmlCache.set(file,html);
    for (const finding of stackCheck(html)) issue(issues,file,'html-structure',finding);
    const title = textOnly(/<title\b[^>]*>([^]*?)<\/title>/i.exec(html)?.[1] ?? '');
    const meta = tagMatches(html,'meta').map(m=>attrs(m[0]));
    const desc = decode(meta.find(a=>a.name?.toLowerCase()==='description')?.content ?? '').trim();
    const noindex = meta.some(a=>a.name?.toLowerCase()==='robots' && /\bnoindex\b/i.test(a.content??''));
    const canonicals = tagMatches(html,'link').map(m=>attrs(m[0])).filter(a=>a.rel?.toLowerCase().split(/\s+/).includes('canonical'));
    const canonical = canonicals[0]?.href ?? '';
    const h1 = tagMatches(html,'h1').length;
    const ids=[...html.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map(m=>m[1]??m[2]);
    const idCounts=new Map(); for(const id of ids)idCounts.set(id,(idCounts.get(id)??0)+1);
    for(const [id,count] of idCounts)if(count>1)issue(issues,file,'duplicate-id',`${id} occurs ${count} times`);
    const scripts=[]; let schemaNodes=0;
    for (const m of html.matchAll(/<script\b([^>]*)>([^]*?)<\/script\s*>/gi)) {
      if (!/application\/ld\+json/i.test(attrs('<script '+m[1]+'>').type??'')) continue;
      try { const json=JSON.parse(m[2]);scripts.push(json);schemaNodes+=schemaCheck(json,vocab,file,issues); }
      catch(e) { issue(issues,file,'jsonld-parse',e.message); }
    }
    if (!title) issue(issues,file,'title','Missing title');
    if (!desc) issue(issues,file,'description','Missing meta description');
    if (canonicals.length!==1) issue(issues,file,'canonical',`Expected one canonical; found ${canonicals.length}`);
    if (canonical && cleanUrl(canonical)!==cleanUrl(pageUrl(file))) issue(issues,file,'canonical',`Expected ${pageUrl(file)}, got ${canonical}`);
    if (h1!==1) issue(issues,file,'h1',`Expected one h1; found ${h1}`);
    if (!scripts.length || !schemaNodes) issue(issues,file,'jsonld','Missing typed JSON-LD');
    const crumbs=breadcrumbJson(scripts); const htmlCrumbs=crumbsFromHtml(html);
    if (crumbs.length!==1) issue(issues,file,'breadcrumb',`Expected one BreadcrumbList; found ${crumbs.length}`);
    else if (htmlCrumbs) {
      const jsonCrumbs=[crumbs[0].itemListElement].flat().map(x=>({name:decode(String(x?.name??x?.item?.name??'')),url:typeof x?.item==='string'?x.item:x?.item?.['@id']??x?.item?.url??''})).filter(x=>x.name);
      if (jsonCrumbs.length!==htmlCrumbs.length || jsonCrumbs.some((x,i)=>x.name!==htmlCrumbs[i].name || cleanUrl(x.url)!==cleanUrl(htmlCrumbs[i].href??pageUrl(file)))) issue(issues,file,'breadcrumb',`HTML/JSON-LD breadcrumb labels or URLs differ: ${JSON.stringify(htmlCrumbs)} vs ${JSON.stringify(jsonCrumbs)}`);
    } else issue(issues,file,'breadcrumb','No recognizable HTML breadcrumb nav');
    checkHtmlColors(html,file,issues);
    const visible=textOnly(html.replace(/<head\b[^>]*>[^]*?<\/head\s*>/i,''));
    const emoji=[...visible.matchAll(/[\p{Extended_Pictographic}]/gu)].map(x=>x[0]).filter(x=>!['©','®','™'].includes(x));
    if (emoji.length) issue(issues,file,'visible-emoji',[...new Set(emoji)].join(' '));
    const unique=uniqueContent(html);
    if (unique.text.split(/\s+/).length<35) warnings.push({file:rel(file),kind:'thin-main-text',message:'Fewer than 35 words in unique/main content'});
    pages.push({file,url:pageUrl(file),title,desc,noindex,canonical,unique,visible,links:tagMatches(html,'a').map(m=>attrs(m[0]).href).filter(Boolean)});
  }
  for (const field of ['title','desc']) {
    const byValue=new Map();
    for (const p of pages.filter(x=>!x.noindex)) {const val=p[field].trim().toLocaleLowerCase('da');if (!val) continue;const others=byValue.get(val)??[];others.push(p.file);byValue.set(val,others);}
    for (const [value,owners] of byValue) if (owners.length>1) owners.forEach(file=>issue(issues,file,`duplicate-${field}`,`${owners.length} pages share ${field}: ${value}`));
  }
  const sitemapFile=path.join(sectionRoot,'sitemap.xml'); let locs=[];
  try { const xml=await fs.readFile(sitemapFile,'utf8'); locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1].trim())); if (!locs.length) issue(issues,sitemapFile,'sitemap','No loc entries'); }
  catch(e) { issue(issues,sitemapFile,'sitemap',`Cannot read sitemap: ${e.message}`); }
  const counts=new Map();for(const u of locs){const k=cleanUrl(u);counts.set(k,(counts.get(k)??0)+1);}
  for(const p of pages){const n=counts.get(cleanUrl(p.url))??0;if(p.noindex&&n) issue(issues,p.file,'sitemap','Noindex page appears in sitemap');if(!p.noindex&&n!==1) issue(issues,p.file,'sitemap',`Indexable page appears ${n} times in sitemap`);}
  const known=new Set(pages.map(p=>cleanUrl(p.url)));for(const u of locs)if(!known.has(cleanUrl(u)))issue(issues,sitemapFile,'sitemap',`Sitemap URL has no generated HTML page: ${u}`);
  for(const p of pages)for(const href of p.links){const result=await resolveInternal(href,p.file,htmlCache);if(result?.error)issue(issues,p.file,'link',`${href}: ${result.error}`);}
  const duplicates=[],fullBodyPairs=[];
  for(let i=0;i<pages.length;i++)for(let j=i+1;j<pages.length;j++){
    const a=pages[i],b=pages[j],score=jaccard(shingles(a.unique.text),shingles(b.unique.text));
    if(score>=.82)duplicates.push({a:rel(a.file),b:rel(b.file),score:Number(score.toFixed(3)),basis:a.unique.basis===b.unique.basis?a.unique.basis:'mixed'});
    const bodyScore=jaccard(shingles(a.visible),shingles(b.visible));
    if(bodyScore>=.82)fullBodyPairs.push({a:rel(a.file),b:rel(b.file),score:Number(bodyScore.toFixed(3))});
  }
  duplicates.forEach(x=>issue(issues,path.join(projectRoot,x.a),'near-duplicate',`${x.b} has ${x.score} Jaccard 5-token similarity (${x.basis})`));
  const design=await checkGuideDesign({siteRoot:sectionRoot,reportPath:designPath});
  const report={status:issues.length===0&&design.status==='PASS'?'PASS':'FAIL',generatedAt:new Date().toISOString(),inventory:{html:files.length,indexable:pages.filter(p=>!p.noindex).length,noindex:pages.filter(p=>p.noindex).length,sitemapLocs:locs.length,schemaClasses:vocab.classes.size,schemaProperties:vocab.properties.size},issues,warnings,nearDuplicates:duplicates,fullVisibleBodyPairs:fullBodyPairs,designStatus:design.status,limits:['HTML tag stack check is a structural smoke test, not WHATWG or Nu HTML conformance validation.','Schema.org check validates JSON syntax and vocabulary membership of types/properties, not property domains, value ranges, or Google rich-result eligibility.','Near-duplicate comparison uses 5-token Jaccard shingles from data-unique blocks when present, otherwise main content with nav/aside removed; full visible body pairs are informational.','External links, live map tiles, interactive behavior, contrast, and viewport overflow require browser checks.']};
  await fs.mkdir(path.dirname(reportPath),{recursive:true});await fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n','utf8');
  console.log(JSON.stringify({status:report.status,inventory:report.inventory,issueCount:issues.length,warningCount:warnings.length,nearDuplicates:duplicates.length,fullBodyPairs:fullBodyPairs.length,designStatus:design.status},null,2));
  process.exitCode=report.status==='PASS'?0:1;
}
await main();
