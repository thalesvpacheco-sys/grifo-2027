// Exporta todo o conteúdo editorial do seed (títulos, textos, CTAs, listas, SEO) para JSON.
// Uso: node --experimental-strip-types scripts/qa/export-content-lock.ts <saida.json>
import fs from 'node:fs';
import { SEED_DOCS } from '../../src/lib/cms/seed.ts';

const out = process.argv[2] || 'CONTENT_LOCK_BASELINE.json';
const docs = SEED_DOCS().map((d) => ({ key: `${d.type}/${d.slug}`, type: d.type, slug: d.slug, title: d.title, placeholder: !!d.placeholder, sort: d.sort ?? 0, seo: d.seo ?? {}, data: d.data }));
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), source: 'src/lib/cms/seed.ts', count: docs.length, docs }, null, 2));
console.log('docs', docs.length, '->', out);
