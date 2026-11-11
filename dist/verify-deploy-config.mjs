import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Deployment-only gate. The public module is evaluated without browser or network access.
try {
  const source = await readFile(new URL('./firebase-config.js', import.meta.url), 'utf8');
  if ((source.match(/\bexport\s+const\s+FIREBASE_CONFIG\s*=/g) || []).length !== 1) throw Error();
  const script = source.replace(/\bexport\s+const\s+FIREBASE_CONFIG\s*=/, 'const FIREBASE_CONFIG =');
  const config = vm.runInNewContext(`${script}\n;FIREBASE_CONFIG`, { location: { hostname: 'app.teoriboost.dk' } }, { timeout: 1000 });
  if (!config || typeof config !== 'object' || config.authDomain !== 'app.teoriboost.dk' || typeof config.apiKey !== 'string' || !/^[^\s]{10,}$/.test(config.apiKey) || typeof config.projectId !== 'string' || !/^[a-z][a-z0-9-]{4,29}$/.test(config.projectId)) throw Error();
  console.log('Firebase deployment configuration validated.');
} catch {
  console.error('Firebase deployment configuration is missing or invalid.');
  process.exitCode = 1;
}
