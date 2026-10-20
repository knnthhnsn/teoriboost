// Check domain availability via the registries' whois servers (no purchase, read-only).
// Usage: node domains.mjs name1 name2 ...   -> checks <name>.dk and <name>.com
import net from 'node:net';

const SERVERS = { dk: 'whois.punktum.dk', com: 'whois.verisign-grs.com' };
function whois(server, query) {
  return new Promise(resolve => {
    let out = '';
    const s = net.connect(43, server, () => s.write(query + '\r\n'));
    s.setTimeout(12000, () => { s.destroy(); resolve('TIMEOUT'); });
    s.on('data', d => { out += d; }); s.on('end', () => resolve(out)); s.on('error', e => resolve('ERROR ' + e.message));
  });
}
const free = (tld, text) => tld === 'dk' ? /No entries found/i.test(text) : /No match for/i.test(text);

const names = process.argv.slice(2);
for (const name of names) {
  const row = [];
  for (const tld of Object.keys(SERVERS)) {
    const text = await whois(SERVERS[tld], tld === 'com' ? `domain ${name}.com` : `${name}.dk`);
    row.push(`${name}.${tld}: ${text.startsWith('ERROR') || text === 'TIMEOUT' ? text : free(tld, text) ? 'LEDIG' : 'optaget'}`);
    await new Promise(r => setTimeout(r, 400));
  }
  console.log(row.join('   '));
}
