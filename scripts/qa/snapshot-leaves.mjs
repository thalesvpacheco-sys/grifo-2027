// Prova de preservação editorial: coleta TODOS os nós de texto (folhas) do conteúdo principal, de cada rota,
// e compara baseline × versão nova. Separadores visuais (", " × " · ") são normalizados.
// Uso: node scripts/qa/snapshot-leaves.mjs <baseURL> <saida.json>
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const base = process.argv[2]; const out = process.argv[3];
const ROUTES = JSON.parse(fs.readFileSync(new URL('./routes.json', import.meta.url), 'utf8'));
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
const res = {};
for (const r of ROUTES) {
  const resp = await page.goto(base + r, { waitUntil: 'domcontentloaded' });
  const leaves = resp && resp.status() === 200 ? await page.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.querySelector('main') || document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const p = n.parentElement;
      if (!p || p.closest('script,style,noscript')) continue;
      const t = n.textContent.replace(/\s+/g, ' ').trim();
      if (t) out.push(t);
    }
    // atributos que carregam texto aprovado (alt, aria-label de seções)
    document.querySelectorAll('main img[alt]').forEach((i) => i.alt && out.push(`[alt] ${i.alt}`));
    return out;
  }) : [];
  res[r] = { status: resp?.status() ?? 0, title: await page.title(), description: await page.locator('meta[name=description]').getAttribute('content').catch(() => ''), leaves };
}
fs.writeFileSync(out, JSON.stringify(res, null, 1));
await b.close();
