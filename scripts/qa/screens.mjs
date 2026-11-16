// Capturas de página inteira e primeira dobra. Uso: node scripts/qa/screens.mjs <baseURL> <pasta> [rotas separadas por vírgula]
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const base = process.argv[2]; const dir = process.argv[3];
const routes = (process.argv[4] || '/,/sobre,/solucoes,/solucoes/marketing,/especialidades,/especialidades/imobiliario,/especialidades/educacao,/especialidades/tecnologia,/especialidades/concessionarias,/metodologia-micca,/projetos,/projetos/uniceug-vestibular-2025-1,/projetos/reserva-dos-ipes,/insights,/insights/micca-decisoes-antes-da-campanha,/contato,/grifo-core').split(',');
fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch();
for (const [vw, vh, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
  // consentimento "somente necessários" já registrado: o banner não cobre as capturas
  await ctx.addCookies([{ name: 'grifo_consent', value: encodeURIComponent(JSON.stringify({ v: 1, analytics: false, marketing: false, ts: Date.now() })), url: base }]);
  const p = await ctx.newPage();
  // aquecimento: a primeira página aberta num servidor recém-iniciado saía em branco na captura
  await p.goto(base + '/', { waitUntil: 'networkidle' }).catch(() => null);
  await p.waitForTimeout(1500);
  for (const r of routes) {
    const res = await p.goto(base + r, { waitUntil: 'networkidle' }).catch(() => null);
    if (!res || res.status() >= 400) { console.log('skip', r, res?.status()); continue; }
    await p.waitForTimeout(1200);
    // rolagem instantânea durante a captura (o site usa scroll-behavior: smooth; a volta ao topo saía no meio do caminho)
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    for (let y = 0; y < 30000; y += 700) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(40); if (await p.evaluate((v) => v > document.body.scrollHeight, y)) break; }
    await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')); window.scrollTo(0, 0); });
    await p.waitForTimeout(700);
    const name = (r === '/' ? 'home' : r.slice(1).replace(/\//g, '_'));
    await p.screenshot({ path: `${dir}/${tag}-${name}-fold.jpg`, quality: 78, type: 'jpeg' });
    await p.addStyleTag({ content: 'header.fixed{position:absolute!important}' });
    await p.screenshot({ path: `${dir}/${tag}-${name}-full.jpg`, quality: 70, type: 'jpeg', fullPage: true });
    await p.addStyleTag({ content: 'header.fixed{position:fixed!important}' });
    console.log(tag, r);
  }
  await ctx.close();
}
await b.close();
