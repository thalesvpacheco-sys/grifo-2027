// Uso: node scripts/qa/leaves-diff.mjs <antes.json> <depois.json> → JSON com textos removidos e acrescentados por rota
import fs from 'node:fs';
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
const norm = (s) => s.replace(/\s*·\s*/g, ', ').replace(/\s+/g, ' ').trim();
const count = (arr) => arr.reduce((m, t) => m.set(t, (m.get(t) || 0) + 1), new Map());
const report = { removed: 0, routes: {} };
for (const r of Object.keys(a)) {
  const A = a[r], B = b[r] || { leaves: [], status: 0 };
  const fullB = norm(B.leaves.join(' '));
  const removed = [...new Set(A.leaves.map(norm))].filter((t) => !fullB.includes(t));
  const fullA = norm(A.leaves.join(' '));
  const added = [...new Set(B.leaves.map(norm))].filter((t) => !fullA.includes(t));
  const meta = [];
  if (A.title !== B.title) meta.push({ field: 'title', before: A.title, after: B.title });
  if ((A.description || '') !== (B.description || '')) meta.push({ field: 'description', before: A.description, after: B.description });
  report.removed += removed.length;
  report.routes[r] = { before: A.status, after: B.status, removed, added, meta };
}
console.log(JSON.stringify(report, null, 1));
