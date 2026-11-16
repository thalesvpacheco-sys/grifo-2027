// Gera a tabela de diferenças do CMS (seed atual × CONTENT_LOCK_BASELINE.json).
// Uso: node --experimental-strip-types scripts/qa/content-diff-report.ts
import fs from 'node:fs';
import { SEED_DOCS } from '../../src/lib/cms/seed.ts';
import { diffContent, isAllowed } from './content-diff-lib.ts';
const base = JSON.parse(fs.readFileSync('CONTENT_LOCK_BASELINE.json', 'utf8')).docs;
const cur = SEED_DOCS().map((d) => ({ key: `${d.type}/${d.slug}`, title: d.title, placeholder: !!d.placeholder, sort: d.sort ?? 0, seo: d.seo ?? {}, data: d.data }));
const ch = diffContent(base, cur);
const short = (v: unknown) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s.length > 110 ? s.slice(0, 107) + '…' : s; };
console.log(`| Documento | Caminho | Tipo | Conteúdo | Permitido |\n|---|---|---|---|---|`);
for (const c of ch) console.log(`| \`${c.key}\` | \`${c.path || '—'}\` | ${c.kind} | ${short(c.after ?? c.before).replace(/\|/g, '\\|')} | ${isAllowed(c) ? 'sim' : '**NÃO**'} |`);
console.log(`\nTotal: ${ch.length} diferença(s); não permitidas: ${ch.filter((c) => !isAllowed(c)).length}.`);
