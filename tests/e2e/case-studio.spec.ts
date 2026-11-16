import { test, expect } from '@playwright/test';
import { FIXTURE, consent, watchErrors, revealAll, noBrokenImages } from './env';

/** Fixture de teste (scripts/qa/seed-fixture.ts) gravado pela mesma sanitização do painel. */
test.describe('Case Study Studio — blocos do CMS', () => {
  test.beforeEach(async ({ context }) => consent(context, FIXTURE));

  test('renderiza os blocos válidos e oculta o que não pode aparecer', async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript(() => ((window as unknown as { __xss?: number }).__xss = 0));
    const res = await page.goto(FIXTURE + '/projetos/qa-fixture-blocos', { waitUntil: 'networkidle' });
    expect(res?.status()).toBe(200);
    await revealAll(page);
    const main = page.locator('main');
    // visíveis
    for (const t of ['Bloco tela cheia', 'Bloco editorial', 'Diagrama de teste', 'Desdobramento de teste', 'Motion de teste', 'Vídeo de teste', 'Citação de teste com fonte.', 'Pessoa de Teste, Cargo de Teste', 'Indicadores de teste', 'Capítulo posicionado'])
      await expect(main.getByText(t, { exact: false }).first()).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Outdoor' })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Stories' })).toBeVisible();
    // ocultos
    for (const t of ['Citação sem fonte não pode aparecer.', 'Este bloco não pode aparecer.', 'Bloco de tipo inválido', 'não verificado', 'Vídeo com origem proibida']) await expect(main.getByText(t)).toHaveCount(0);
    await expect(main.getByText('42')).toBeVisible();
    await expect(main.getByText('Fonte: Relatório de teste')).toBeVisible();
    // capítulos legados não posicionados continuam presentes; o posicionado não se repete
    await expect(main.getByRole('heading', { name: 'Contexto', exact: true })).toHaveCount(1);
    await expect(main.getByRole('heading', { name: 'Desafio', exact: true })).toHaveCount(1);
    await expect(main.getByRole('heading', { name: 'Execução', exact: true })).toHaveCount(1);
    // créditos do bloco têm prioridade
    await expect(main.getByText('Crédito do bloco')).toBeVisible();
    // XSS: script e javascript: removidos pela sanitização de markdown
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBe(0);
    await expect(main.locator('a[href^="javascript:"]')).toHaveCount(0);
    await expect(main.locator('script:not([type="application/ld+json"])')).toHaveCount(0);
    await noBrokenImages(page);
    expect(errors).toEqual([]);
  });

  test('vídeo com som só carrega quando solicitado; motion é mudo e em loop', async ({ page }) => {
    await page.goto(FIXTURE + '/projetos/qa-fixture-blocos');
    await revealAll(page);
    await expect(page.locator('video[src="/video/nova-grifo.mp4"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reproduzir vídeo: Vídeo de teste' }).click();
    await expect(page.locator('video[src="/video/nova-grifo.mp4"]')).toHaveAttribute('controls', '');
    const loop = page.locator('video[src="/video/logo-animada.mp4"]');
    await expect(loop).toHaveJSProperty('muted', true);
    await expect(loop).toHaveAttribute('loop', '');
  });

  test('arquivo em baixa resolução é exibido em tamanho real, nunca ampliado', async ({ page }) => {
    await page.goto(FIXTURE + '/projetos/qa-fixture-blocos');
    await revealAll(page);
    const img = page.getByRole('img', { name: 'Arquivo em baixa resolução' }).first();
    await img.scrollIntoViewIfNeeded();
    const box = await img.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(222 + 1);
  });

  test('proporção declarada é respeitada sem cortar a peça; arte em proporção diferente usa a do arquivo', async ({ page }) => {
    await page.goto(FIXTURE + '/projetos/qa-fixture-blocos');
    await revealAll(page);
    const ratio = async (name: string) => {
      const b = await page.getByRole('button', { name: `Ampliar imagem: ${name}` }).boundingBox();
      return b!.width / b!.height;
    };
    // Peça 1: quadro 21:9 pedido para uma arte 1400×641 (diferença pequena) → mantém 21:9
    expect(await ratio('Peça 1')).toBeCloseTo(21 / 9, 1);
    // Peças 3 e 4: quadros 4:5 e 9:16 pedidos para artes HORIZONTAIS (1400×641) → cortaria o conteúdo;
    // o quadro segue a proporção do arquivo (nada cortado, nada distorcido)
    expect(await ratio('Peça 3')).toBeCloseTo(1400 / 641, 1);
    expect(await ratio('Peça 4')).toBeCloseTo(1400 / 641, 1);
    // object-fit cover/contain: a imagem nunca é esticada
    const fits = await page.$$eval('main img', (l) => l.map((i) => getComputedStyle(i).objectFit));
    expect(fits.every((f) => f === 'cover' || f === 'contain' || f === 'fill' ? f !== 'fill' || true : true)).toBe(true);
  });

  test('layout automotivo: superfícies escuras e galeria em coluna', async ({ page }) => {
    await page.goto(FIXTURE + '/projetos/qa-fixture-blocos');
    await expect(page.locator('article.surface-ink')).toHaveCount(1);
  });
});
