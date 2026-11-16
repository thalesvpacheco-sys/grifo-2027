import { expect, type Page, type BrowserContext } from '@playwright/test';
export const HOMOLOG = process.env.HOMOLOG_URL || 'http://127.0.0.1:3300';
export const PROD = process.env.PROD_URL || 'http://127.0.0.1:3400';
export const FIXTURE = process.env.FIXTURE_URL || 'http://127.0.0.1:3500';
export const ROUTES = [
  '/', '/sobre', '/solucoes', '/solucoes/consulting', '/solucoes/marketing', '/solucoes/studios', '/solucoes/tech',
  '/especialidades', '/especialidades/imobiliario', '/especialidades/educacao', '/especialidades/tecnologia', '/especialidades/concessionarias',
  '/metodologia-micca', '/projetos', '/projetos/uniceug-vestibular-2025-1', '/projetos/reserva-dos-ipes', '/insights',
  '/insights/micca-decisoes-antes-da-campanha', '/contato', '/grifo-core', '/politica-de-privacidade',
];
export async function consent(ctx: BrowserContext, base: string) {
  await ctx.addCookies([{ name: 'grifo_consent', value: encodeURIComponent(JSON.stringify({ v: 1, analytics: false, marketing: false, ts: Date.now() })), url: base }]);
}
/** Coleta erros de console e de página (ignora 404 esperados de recursos de terceiros bloqueados). */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  return errors;
}
export async function noBrokenImages(page: Page) {
  const broken = await page.$$eval('img', (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0 && !i.closest('[hidden]')).map((i) => i.currentSrc || i.src));
  expect(broken, 'imagens quebradas').toEqual([]);
}
export async function revealAll(page: Page) {
  for (let y = 0; y < 30000; y += 1400) {
    const done = await page.evaluate((v) => { window.scrollTo(0, v); return v > document.body.scrollHeight; }, y);
    if (done) break;
    await page.waitForTimeout(15);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}
