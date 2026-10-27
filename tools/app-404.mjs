// Builds dist/404.html, the app's "Vejen er spærret" page, from the website's (site/404.html, site.css, 404.css):
// one self-contained file, so it works on any path, with the app's own art and links back into the app.
// Run: node tools/app-404.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = (read('site/site.css') + '\n' + read('site/404.css')).replace(/url\('assets\//g, "url('/assets/").replace(/url\("assets\//g, 'url("/assets/');
let html = read('site/404.html')
  .replace('<link rel="stylesheet" href="/site.css">\n  <link rel="stylesheet" href="/404.css">', `<style>\n${css}\n</style>`)
  .replace('/assets/cars/scooter-wreck.webp', '/assets/mybil/scooter/base.webp')
  .replace('<a class="btn btn-yellow btn-small" href="https://app.teoriboost.dk/">Åbn appen</a>', '<a class="btn btn-yellow btn-small" href="/">Til appen</a>')
  .replace('<a class="brand" href="/" aria-label="TeoriBoost, forsiden">', '<a class="brand" href="/" aria-label="TeoriBoost, til appen">')
  .replace('<a class="btn btn-yellow" href="/">Til forsiden</a>', '<a class="btn btn-yellow" href="/">Tilbage til appen</a>')
  .replace('<a class="btn btn-ghost" href="https://app.teoriboost.dk/">Åbn appen</a>', '<a class="btn btn-ghost" href="https://teoriboost.dk/">teoriboost.dk</a>');
if (html.includes('href="/site.css"') || !html.includes('Tilbage til appen')) throw new Error('404: a replacement did not apply');
writeFileSync(new URL('../dist/404.html', import.meta.url), html);
console.log('dist/404.html', html.length, 'bytes');
