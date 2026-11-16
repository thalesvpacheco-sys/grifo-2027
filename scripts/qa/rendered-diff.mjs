// Compara o texto renderizado antes/depois. Todo texto editorial do baseline precisa continuar presente.
// Uso: node scripts/qa/rendered-diff.mjs qa/baseline/rendered-text-baseline.json qa/after-rendered-text.json
import fs from 'node:fs';
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s+([.,!?;:])/g, '$1').trim();
let missingTotal = 0;
const out = [];
for (const r of Object.keys(a)) {
  const A = a[r], B = b[r];
  if (A.status !== 200) { out.push({ r, note: `baseline ${A.status} → depois ${B?.status}` }); continue; }
  const textB = norm([B.title, B.description, ...B.blocks, B.header, B.footer].join(' \n '));
  const missing = A.blocks.map(norm).filter((t) => t && !textB.includes(t));
  const allA = norm([A.title, A.description, ...A.blocks].join(' \n '));
  const added = B.blocks.map(norm).filter((t) => t && !allA.includes(t));
  if (A.title !== B.title) missing.push(`[title] ${A.title} → ${B.title}`);
  if (A.description !== B.description) missing.push(`[description] ${A.description} → ${B.description}`);
  missingTotal += missing.length;
  out.push({ r, missing, added });
}
console.log(JSON.stringify({ missingTotal, routes: out }, null, 1));
