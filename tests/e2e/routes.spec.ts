import { test, expect } from '@playwright/test';
import { HOMOLOG, FIXTURE, ROUTES, consent, watchErrors, noBrokenImages, revealAll } from './env';

for (const r of ROUTES) {
  test(`homologação ${r}: 200, um H1, sem erros de console, sem imagem quebrada`, async ({ page, context }) => {
    await consent(context, HOMOLOG);
    const errors = watchErrors(page);
    const res = await page.goto(HOMOLOG + r, { waitUntil: 'networkidle' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await revealAll(page);
    await page.waitForLoadState('networkidle');
    await noBrokenImages(page);
    expect(errors).toEqual([]);
  });
}

test('navegação: menu mobile abre, Escape fecha e devolve o foco', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await consent(ctx, HOMOLOG);
  const page = await ctx.newPage();
  await page.goto(HOMOLOG + '/');
  const burger = page.getByRole('button', { name: 'Abrir menu' });
  await burger.click();
  await expect(page.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'Especialidades' }).last().click();
  await expect(page.locator('a[href="/especialidades/concessionarias"]').last()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused();
  await ctx.close();
});

test('navegação desktop: megamenu de Especialidades lista as quatro especialidades', async ({ page, context }) => {
  await consent(context, HOMOLOG);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(HOMOLOG + '/');
  await page.getByRole('button', { name: 'Especialidades' }).first().click();
  for (const s of ['imobiliario', 'educacao', 'tecnologia', 'concessionarias']) await expect(page.locator(`header a[href="/especialidades/${s}"]`).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator(`header a[href="/especialidades/concessionarias"]`).first()).toBeHidden();
});

test('home: as nove seções aprovadas estão presentes e Especialidades mostra quatro áreas', async ({ page, context }) => {
  await consent(context, HOMOLOG);
  await page.goto(HOMOLOG + '/');
  for (const id of ['hero-title', 'proof-title', 'eco-title', 'spec-title', 'micca-title', 'proj-title', 'process-title', 'ins-title', 'home_final-title']) await expect(page.locator(`#${id}`)).toHaveCount(1);
  await expect(page.locator('section[aria-labelledby="spec-title"] a[href^="/especialidades/"]')).toHaveCount(4);
  await expect(page.locator('#hero-title')).toHaveText('Marcas que pensam grande precisam de estratégias à altura.');
});

test('portfólio: filtros por setor e competência, anúncio do resultado e limpeza', async ({ page, context }) => {
  await consent(context, HOMOLOG);
  await page.goto(HOMOLOG + '/projetos');
  const edu = page.getByRole('button', { name: 'Educação' });
  await edu.click();
  await expect(edu).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: 'projeto(s)' })).toHaveText('1 projeto(s) encontrado(s)');
  await expect(page.getByRole('link', { name: 'UNICEUG — Vestibular 2025/1' })).toBeVisible();
  await page.getByRole('button', { name: 'Todos' }).click();
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: 'projeto(s)' })).toHaveText('8 projeto(s) encontrado(s)');
});

test('MICCA: seletor inclui Concessionárias e mostra a aplicação autorizada', async ({ page, context }) => {
  await consent(context, HOMOLOG);
  await page.goto(HOMOLOG + '/metodologia-micca');
  await page.getByRole('tab', { name: 'Concessionárias' }).click();
  await expect(page.getByText('Objetivos comerciais e indicadores por unidade/modelo.')).toBeVisible();
  // navegação por teclado nos pilares
  await page.getByRole('tab', { name: /Meta/ }).first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Orçamento e alocação por canal/período.')).toBeVisible();
});

test('galeria de case: lightbox abre com teclado, navega com setas e fecha com Escape', async ({ page, context }) => {
  // a galeria saiu da página Sobre (pedido da gerência, 13/11/2026); o lightbox segue nos cases
  await consent(context, FIXTURE);
  await page.goto(FIXTURE + '/projetos/qa-fixture-blocos');
  const first = page.getByRole('button', { name: /Ampliar imagem/ }).first();
  await first.focus();
  await page.keyboard.press('Enter');
  const dlg = page.getByRole('dialog', { name: 'Visualização ampliada' });
  await expect(dlg).toBeVisible();
  await expect(dlg.getByText(/^1 \/ \d+$/)).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dlg.getByText(/^2 \/ \d+$/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await expect(first).toBeFocused();
});

test('case UNICEUG: capítulos existentes, navegação real e CTA para a especialidade', async ({ page, context }) => {
  await consent(context, HOMOLOG);
  await page.goto(HOMOLOG + '/projetos/uniceug-vestibular-2025-1');
  for (const h of ['Contexto', 'Desafio', 'Estratégia', 'Execução']) await expect(page.getByRole('heading', { name: h, exact: true })).toBeVisible();
  await expect(page.getByText('Case aguardando aprovação do cliente')).toBeVisible();
  const next = page.locator('a[rel="next"]');
  await expect(next).toHaveAttribute('href', /\/projetos\//);
  await expect(page.locator('a[data-cta="case_uniceug-vestibular-2025-1"]')).toHaveAttribute('href', '/especialidades/educacao#formulario');
  expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex');
});
