// Captura o texto visível de cada rota pública (prova de preservação editorial).
// Uso: node scripts/qa/snapshot-text.mjs <baseURL> <saida.json>
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const base = process.argv[2] || 'http://127.0.0.1:3000';
const out = process.argv[3] || 'snapshot.json';
export const ROUTES = [
  '/', '/sobre', '/solucoes', '/solucoes/consulting', '/solucoes/marketing', '/solucoes/studios', '/solucoes/tech',
  '/especialidades', '/especialidades/imobiliario', '/especialidades/educacao', '/especialidades/tecnologia', '/especialidades/concessionarias',
  '/metodologia-micca', '/projetos', '/projetos/reserva-dos-ipes', '/projetos/nova-harmonia', '/projetos/reserva-harmonia', '/projetos/aero',
  '/projetos/eldorado-veredas', '/projetos/uniceug-vestibular-2025-1', '/projetos/pinauto', '/projetos/esfiharia-brasil',
  '/insights', '/insights/micca-decisoes-antes-da-campanha', '/insights/lancamento-imobiliario-mais-que-campanha', '/insights/captacao-de-alunos-jornada',
  '/contato', '/grifo-core', '/politica-de-privacidade', '/politica-de-cookies', '/termos-de-uso',
];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const result = {};
for (const r of ROUTES) {
  const res = await page.goto(base + r, { waitUntil: 'domcontentloaded' });
  const status = res?.status() ?? 0;
  const data = await page.evaluate(() => {
    const clean = (s) => s.replace(/\s+/g, ' ').trim();
    const pick = (sel) => { const el = document.querySelector(sel); return el ? el.textContent : ''; };
    // textContent inclui painéis ocultos (abas), garantindo que nenhum texto suma sem ser notado
    const blocks = [...document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main li, main dt, main dd, main figcaption, main blockquote, main button, main a, main label, main legend, main option')]
      .filter((el) => !el.closest('[data-qa-ignore]'))
      .map((el) => clean(el.textContent || '')).filter(Boolean);
    return { title: document.title, description: document.querySelector('meta[name=description]')?.content || '', h1: [...document.querySelectorAll('h1')].map((h) => clean(h.textContent || '')), blocks: [...new Set(blocks)], header: clean(pick('header')), footer: clean(pick('footer')) };
  });
  result[r] = { status, ...data };
  console.log(status, r, data.blocks.length);
}
fs.writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
