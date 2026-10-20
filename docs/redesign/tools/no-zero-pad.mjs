// Remove leading zeros from displayed numbers (01 -> 1). Keeps clock formatting (mm:ss).
// Usage: node docs/redesign/tools/no-zero-pad.mjs dist/*.js dist/*.html
import fs from 'node:fs';

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf8');
  let s = src;
  // String(x).padStart(2,'0') -> String(x), but not the exam clock's toString().padStart.
  s = s.replace(/(?<!toString\(\))\.padStart\(2,\s*(['"])0\1\)/g, '');
  // template literals like `MISSION 0${i+1}` / `>0${index + 1}<`
  s = s.replace(/([>\s'"`(])0\$\{/g, '$1${');
  // hard-coded labels: "01 / COCKPIT", "VÆRKSTED 01", "KØRETIME 01"
  s = s.replace(/([>'"`\s])0([1-9]) \//g, '$1$2 /');
  s = s.replace(/\b(VÆRKSTED|KØRETIME|MODUL|REGEL|MISSION) 0([1-9])\b/g, '$1 $2');
  if (s !== src) { fs.writeFileSync(file, s); console.log('updated', file); }
}
