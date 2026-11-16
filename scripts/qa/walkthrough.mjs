// Grava um percurso navegável real (vídeo) pela homologação: rolagem, menu, MICCA, vitrine, case, Concessionárias e formulário.
// Uso: node scripts/qa/walkthrough.mjs <baseURL> <pasta>   → gera desktop.webm e mobile.webm
// Nenhum formulário é enviado. O vídeo mostra a interface como ela roda (WebGL, motion e interações reais).
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const base = process.argv[2] || 'http://127.0.0.1:3300';
const dir = process.argv[3] || 'qa/walkthrough';
fs.mkdirSync(dir, { recursive: true });
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
const glide = async (p, to, steps = 40) => {
  const from = await p.evaluate(() => window.scrollY);
  for (let i = 1; i <= steps; i++) { await p.evaluate((y) => window.scrollTo(0, y), from + ((to - from) * i) / steps); await sleep(28); }
};
const glideTo = async (p, sel, offset = -90) => {
  const y = await p.evaluate(([s, o]) => { const el = document.querySelector(s); return el ? el.getBoundingClientRect().top + window.scrollY + o : null; }, [sel, offset]);
  if (y !== null) await glide(p, y);
};

const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, recordVideo: { dir, size: { width: w, height: h } }, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: 'grifo_consent', value: encodeURIComponent(JSON.stringify({ v: 1, analytics: false, marketing: false, ts: Date.now() })), url: base }]);
  const p = await ctx.newPage();
  await p.addInitScript(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await sleep(3200); // hero: escultura WebGL e entrada do título
  if (tag === 'desktop') { await p.mouse.move(900, 400, { steps: 25 }); await p.mouse.move(1200, 300, { steps: 25 }); }
  const total = await p.evaluate(() => document.body.scrollHeight);
  await glide(p, total * 0.18, 70); await sleep(900);
  await glide(p, total * 0.36, 70); await sleep(900);
  // MICCA: percorre os pilares
  const arch = p.locator('[role="tab"]');
  const n = Math.min(await arch.count(), 5);
  if (n) { await arch.first().scrollIntoViewIfNeeded(); await sleep(500); for (let i = 0; i < n; i++) { await arch.nth(i).click(); await sleep(700); } }
  await glide(p, total * 0.62, 80); await sleep(1000);
  await glide(p, total, 90); await sleep(1200);

  // Menu (mobile) ou megamenu de Especialidades (desktop)
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(600);
  if (tag === 'mobile') {
    await p.getByRole('button', { name: /menu/i }).first().click(); await sleep(1400);
    await p.keyboard.press('Escape'); await sleep(600);
  } else {
    await p.getByRole('button', { name: /Especialidades/ }).first().click().catch(() => {}); await sleep(1600);
    await p.keyboard.press('Escape'); await sleep(500);
  }

  // Vitrine de projetos com filtro
  await p.goto(base + '/projetos', { waitUntil: 'networkidle' }); await sleep(1500);
  await glideTo(p, 'main ul'); await sleep(800);
  const filtro = p.getByRole('button', { name: 'Educação' }).first();
  if (await filtro.count()) { await filtro.scrollIntoViewIfNeeded(); await filtro.click(); await sleep(1400); await p.getByRole('button', { name: 'Todos' }).first().click(); await sleep(900); }
  await glide(p, (await p.evaluate(() => document.body.scrollHeight)) * 0.55, 80); await sleep(900);

  // Case Study Studio
  await p.goto(base + '/projetos/uniceug-vestibular-2025-1', { waitUntil: 'networkidle' }); await sleep(2200);
  const ch = await p.evaluate(() => document.body.scrollHeight);
  await glide(p, ch * 0.3, 70); await sleep(900);
  const peca = p.getByRole('button', { name: /Ampliar imagem/ }).first();
  if (await peca.count()) { await peca.scrollIntoViewIfNeeded(); await sleep(400); await peca.click(); await sleep(1600); await p.keyboard.press('Escape'); await sleep(700); }
  await glide(p, ch * 0.75, 70); await sleep(1000);

  // Concessionárias + formulário (preenchido com dados de exemplo e NÃO enviado)
  await p.goto(base + '/especialidades/concessionarias', { waitUntil: 'networkidle' }); await sleep(2200);
  const cc = await p.evaluate(() => document.body.scrollHeight);
  await glide(p, cc * 0.25, 60); await sleep(800);
  await glide(p, cc * 0.5, 60); await sleep(800);
  await glideTo(p, '#formulario'); await sleep(900);
  const f = p.locator('#formulario form');
  if (await f.count()) {
    await f.locator('input[name="name"]').pressSequentially('Exemplo de visitante', { delay: 35 });
    await f.locator('input[name="company"]').pressSequentially('Concessionária Exemplo', { delay: 35 });
    await sleep(1500);
  }
  await ctx.close();
  const vids = fs.readdirSync(dir).filter((x) => x.endsWith('.webm') && !['desktop.webm', 'mobile.webm'].includes(x));
  const newest = vids.map((x) => ({ x, t: fs.statSync(`${dir}/${x}`).mtimeMs })).sort((a, c) => c.t - a.t)[0];
  if (newest) fs.renameSync(`${dir}/${newest.x}`, `${dir}/${tag}.webm`);
  console.log('ok', tag);
}
await b.close();
