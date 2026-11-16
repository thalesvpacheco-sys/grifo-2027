import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HOMOLOG, FIXTURE, consent, revealAll } from './env';

const KEY = ['/', '/sobre', '/solucoes', '/especialidades', '/especialidades/imobiliario', '/especialidades/concessionarias', '/metodologia-micca', '/projetos', '/projetos/uniceug-vestibular-2025-1', '/insights', '/contato', '/grifo-core'];
const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1366, 1440, 1920];

for (const vw of [390, 1440]) {
  for (const r of KEY) {
    test(`axe (WCAG 2.1 AA) ${vw}px ${r}`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: vw, height: 900 }, reducedMotion: 'reduce' });
      await consent(ctx, HOMOLOG);
      const page = await ctx.newPage();
      await page.goto(HOMOLOG + r, { waitUntil: 'networkidle' });
      await revealAll(page);
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).exclude('.placeholder-flag').analyze();
      const serious = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
      await ctx.close();
    });
  }
}

for (const vw of WIDTHS) {
  test(`sem rolagem horizontal e CTAs acessíveis em ${vw}px`, async ({ browser }) => {
    test.setTimeout(300_000);
    const ctx = await browser.newContext({ viewport: { width: vw, height: 800 } });
    await consent(ctx, HOMOLOG);
    const page = await ctx.newPage();
    for (const r of [...KEY, '/especialidades/concessionarias']) {
      await page.goto(HOMOLOG + r, { waitUntil: 'domcontentloaded' });
      await revealAll(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${r} @${vw}`).toBeLessThanOrEqual(0);
      // o CTA principal existe e é clicável (não está coberto por 3D, overlays ou menus)
      const ctas = page.locator('main a.btn:visible, main button.btn:visible');
      if ((await ctas.count()) === 0) continue; // páginas-índice sem botão no corpo (o CTA fica no header)
      const cta = ctas.first();
      await cta.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(400);
      await expect(cta, `${r} @${vw}`).toBeVisible();
      const ok = await cta.evaluate((el) => {
        const b = el.getBoundingClientRect();
        const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        return !!hit && (el === hit || el.contains(hit));
      });
      expect(ok, `CTA coberto em ${r} @${vw}`).toBe(true);
    }
    await ctx.close();
  });
}

test('prefers-reduced-motion: hero estático e conteúdo visível', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  await consent(ctx, HOMOLOG);
  const page = await ctx.newPage();
  await page.goto(HOMOLOG + '/');
  const op = await page.locator('#hero-title').evaluate((el) => getComputedStyle(el.parentElement!).opacity);
  expect(op).toBe('1');
  const hidden = await page.$$eval('[data-reveal]', (l) => l.filter((e) => getComputedStyle(e).opacity !== '1').length);
  expect(hidden).toBe(0);
  await ctx.close();
});

test('sem JavaScript: todo o conteúdo editorial permanece legível', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(HOMOLOG + '/');
  const hidden = await page.$$eval('[data-reveal]', (l) => l.filter((e) => getComputedStyle(e).opacity !== '1' || getComputedStyle(e).clipPath.startsWith('inset(0px 0px 100%')).length);
  expect(hidden).toBe(0);
  await expect(page.getByText('Experiência que constrói histórias.')).toBeVisible();
  await ctx.close();
});

test('escultura 3D do hero: imagem renderizada imediata, loop de vídeo só no desktop e liberado ao navegar', async ({ page, context }) => {
  await consent(context, HOMOLOG);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(HOMOLOG + '/');
  // A imagem (LCP) existe desde o HTML; o vídeo mudo em loop é anexado depois, sem WebGL no navegador.
  await expect(page.locator('img[data-poster]')).toHaveCount(1);
  await expect(page.locator('.hm-sculpt video')).toHaveCount(1, { timeout: 8000 });
  expect(await page.locator('.hm-sculpt video').evaluate((v: HTMLVideoElement) => v.muted && v.loop)).toBe(true);
  expect(await page.locator('canvas').count()).toBe(0);
  await page.getByRole('link', { name: 'Projetos', exact: true }).first().click();
  await page.waitForURL(/\/projetos$/);
  await expect(page.locator('img[data-poster], .hm-sculpt video')).toHaveCount(0);
});

test('escultura 3D no celular e com movimento reduzido: só a imagem, nenhum vídeo baixado', async ({ browser }) => {
  for (const opts of [{ viewport: { width: 390, height: 844 } }, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' as const }]) {
    const ctx = await browser.newContext(opts);
    await consent(ctx, HOMOLOG);
    const page = await ctx.newPage();
    const mp4: string[] = [];
    page.on('request', (r) => { if (r.url().endsWith('.mp4')) mp4.push(r.url()); });
    await page.goto(HOMOLOG + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await expect(page.locator('img[data-poster]')).toHaveCount(1);
    expect(mp4).toEqual([]);
    await ctx.close();
  }
});

test('fixture: axe na página de case com todos os blocos', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await consent(ctx, FIXTURE);
  const page = await ctx.newPage();
  await page.goto(FIXTURE + '/projetos/qa-fixture-blocos', { waitUntil: 'networkidle' });
  await revealAll(page);
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).exclude('.placeholder-flag').analyze();
  expect(res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  await ctx.close();
});
