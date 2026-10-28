#!/usr/bin/env node
// Static, dependency-free checks for the standalone marketing site.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const home = resolve(root, 'index.html');
const expectedApp = 'https://app.teoriboost.dk/';
const siteOrigin = 'https://teoriboost.dk';
const errors = [];
const checkedFiles = new Set();
const cssQueue = [];
const jsFiles = new Set();
const ids = new Map();
const anchorTargets = [];
let localReferences = 0;
let appLinks = 0;

function fail(message) { errors.push(message); }
function read(path) { return readFileSync(path, 'utf8'); }
function inside(path) { return path === root || path.startsWith(root + sep); }
function lineAt(text, offset) { return text.slice(0, offset).split('\n').length; }
function tags(html) {
  // A small tag scanner that respects quoted > characters and skips comments.
  const found = [];
  for (let i = 0; i < html.length;) {
    if (html.startsWith('<!--', i)) { const end = html.indexOf('-->', i + 4); i = end < 0 ? html.length : end + 3; continue; }
    if (html[i] !== '<' || !/[A-Za-z]/.test(html[i + 1] || '')) { i++; continue; }
    const start = i++; let quote = '';
    for (; i < html.length; i++) {
      const ch = html[i];
      if (quote) { if (ch === quote) quote = ''; }
      else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '>') { i++; break; }
    }
    found.push({ raw: html.slice(start, i), line: lineAt(html, start) });
  }
  return found;
}
function attrs(raw) {
  const result = new Map();
  const body = raw.replace(/^<[^\s/>]+/, '').replace(/\/?\s*>$/, '');
  for (const match of body.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}
function localFile(raw, from, label) {
  const value = raw.trim();
  if (!value || value === '#' || /^(?:data|blob|mailto|tel|javascript):/i.test(value)) return null;
  let url;
  try { url = new URL(value, new URL('https://teoriboost.dk/' + from.slice(root.length + 1).replaceAll('\\', '/'))); }
  catch { fail(`${label}: invalid URL ${JSON.stringify(value)}`); return null; }
  if (url.origin !== siteOrigin) return null;
  let relative;
  try { relative = decodeURIComponent(url.pathname).replace(/^\/+/, ''); }
  catch { fail(`${label}: invalid path encoding ${JSON.stringify(value)}`); return null; }
  const target = resolve(root, relative);
  if (!inside(target)) { fail(`${label}: path leaves site directory: ${value}`); return null; }
  const candidates = url.pathname.endsWith('/')
    ? [resolve(target, 'index.html')]
    : [target, target + '.html', resolve(target, 'index.html')];
  const file = candidates.find(path => existsSync(path) && statSync(path).isFile());
  if (!file) fail(`${label}: missing local file ${value}`);
  else { localReferences++; checkedFiles.add(file); }
  return { file, fragment: url.hash ? decodeURIComponent(url.hash.slice(1)) : '', pathname: url.pathname, url };
}
function cssUrls(css, file) {
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi)) {
    const value = (match[1] ?? match[2] ?? match[3]).trim();
    const target = localFile(value, file, `${file.slice(root.length + 1)}:${lineAt(css, match.index)} CSS url()`);
    if (target?.file && extname(target.file).toLowerCase() === '.css') cssQueue.push(target.file);
  }
  for (const match of css.matchAll(/@import\s+["']([^"']+)["']/gi)) {
    const target = localFile(match[1], file, `${file.slice(root.length + 1)}:${lineAt(css, match.index)} @import`);
    if (target?.file) cssQueue.push(target.file);
  }
}

if (!existsSync(home)) fail('site/index.html is missing');
else {
  const html = read(home);
  for (const tag of tags(html)) {
    const name = /^<([\w:-]+)/.exec(tag.raw)?.[1].toLowerCase();
    const a = attrs(tag.raw);
    const label = `index.html:${tag.line} <${name}>`;
    const id = a.get('id');
    if (id) {
      if (ids.has(id)) fail(`${label}: duplicate id ${JSON.stringify(id)} (first at line ${ids.get(id)})`);
      else ids.set(id, tag.line);
    }
    for (const key of ['href', 'src', 'poster']) {
      if (!a.has(key)) continue;
      const value = a.get(key);
      if (key === 'href' && name === 'a') {
        try {
          const url = new URL(value, siteOrigin + '/');
          if (url.hostname === 'app.teoriboost.dk' || (url.origin === siteOrigin && url.pathname === '/app')) {
            appLinks++;
            if (url.href !== expectedApp) fail(`${label}: app link differs from ${expectedApp}: ${value}`);
          } else if (/^app\./i.test(url.hostname)) fail(`${label}: unexpected app host ${url.hostname}`);
        } catch { /* localFile reports malformed URLs */ }
      }
      const target = localFile(value, home, `${label} ${key}`);
      if (target?.file && extname(target.file).toLowerCase() === '.css') cssQueue.push(target.file);
      if (target?.file && extname(target.file).toLowerCase() === '.js') jsFiles.add(target.file);
      if (key === 'href' && name === 'a' && target?.fragment && target.file === home)
        anchorTargets.push({ fragment: target.fragment, line: tag.line });
    }
    if (a.has('srcset')) {
      for (const item of a.get('srcset').split(',')) {
        const value = item.trim().split(/\s+/)[0];
        if (value) localFile(value, home, `${label} srcset`);
      }
    }
  }
  for (const target of anchorTargets)
    if (!ids.has(target.fragment)) fail(`index.html:${target.line}: missing anchor target #${target.fragment}`);
  cssUrls(html, home); // Inline style declarations can contain local url() assets.
}

const seenCss = new Set();
while (cssQueue.length) {
  const file = cssQueue.shift();
  if (seenCss.has(file)) continue;
  seenCss.add(file);
  cssUrls(read(file), file);
}
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) fail(`${file.slice(root.length + 1)}: JavaScript syntax check failed: ${(result.stderr || result.stdout).trim()}`);
}
if (appLinks === 0) fail('No app links found in site/index.html');
const redirect = resolve(root, 'vercel.json');
if (existsSync(redirect)) {
  try {
    const config = JSON.parse(read(redirect));
    const appRedirect = config.redirects?.find(item => item.source === '/app');
    if (appRedirect && appRedirect.destination !== expectedApp)
      fail(`vercel.json: /app redirect differs from ${expectedApp}`);
  } catch (error) { fail(`vercel.json: ${error.message}`); }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR ${error}`);
  console.error(`Marketing validation failed: ${errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log(`Marketing validation passed: ${ids.size} IDs, ${localReferences} local references, ${checkedFiles.size} files, ${seenCss.size} CSS files, ${jsFiles.size} JavaScript files, ${appLinks} app links.`);
}
