import { test, expect } from '@playwright/test';
import { HOMOLOG, PROD, consent, watchErrors } from './env';
import { LEGACY_REDIRECTS } from '../../src/lib/cms/seed';

/* ───────── Comportamento de produção (CONTENT_SHOW_PLACEHOLDERS=false) ───────── */
test('produção: nenhum case, indicador ou rascunho pendente aparece', async ({ page, context }) => {
  await consent(context, PROD);
  for (const slug of ['reserva-dos-ipes', 'nova-harmonia', 'reserva-harmonia', 'aero', 'eldorado-veredas', 'uniceug-vestibular-2025-1', 'pinauto', 'esfiharia-brasil']) {
    const r = await page.request.get(`${PROD}/projetos/${slug}`);
    expect(r.status(), slug).toBe(404);
  }
  await page.goto(PROD + '/');
  await expect(page.locator('#proj-title')).toHaveCount(0);
  // Insights aprovados pela gerência (13/11/2026) aparecem em produção, sem selo de rascunho
  await expect(page.locator('#ins-title')).toHaveCount(1);
  await expect(page.locator('.placeholder-flag')).toHaveCount(0);
  // indicadores validados pela gerência (13/11/2026) aparecem em produção
  await expect(page.locator('#proof-title')).toHaveCount(1);
  await page.goto(PROD + '/projetos');
  await expect(page.getByText('Os projetos estão em fase de aprovação de portfólio e serão publicados em breve.')).toBeVisible();
  const ins = await page.request.get(`${PROD}/insights/micca-decisoes-antes-da-campanha`);
  expect(ins.status()).toBe(200);
});

test('produção: Concessionárias publicada, no sitemap e com metadados próprios', async ({ page }) => {
  const res = await page.goto(PROD + '/especialidades/concessionarias');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle('Marketing para concessionárias e automotivo | Grifo');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Estratégia, campanhas, mídia regional, audiovisual e CRM para concessionárias e grupos automotivos que precisam conectar marca, loja e vendas.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${PROD}/especialidades/concessionarias`);
  await page.goto(PROD + '/especialidades');
  await expect(page).toHaveTitle(/Marketing especializado por mercado/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /imobiliário, educação, empresas de tecnologia e concessionárias/);
  const sm = await (await page.request.get(`${PROD}/sitemap.xml`)).text();
  expect(sm).toContain('/especialidades/concessionarias');
  expect(sm).not.toContain('/projetos/');
  expect(sm).toContain('/insights/micca-decisoes-antes-da-campanha');
  expect(sm).toContain('/insights/midia-2026-copa-eleicoes-planejamento-2027');
  expect(sm).not.toContain('/admin');
  const rb = await (await page.request.get(`${PROD}/robots.txt`)).text();
  expect(rb).toContain('Disallow: /admin');
});

test('produção: cabeçalhos de segurança preservados (CSP com nonce, HSTS, XFO, nosniff)', async ({ page }) => {
  const r = await page.request.get(PROD + '/');
  const h = r.headers();
  expect(h['content-security-policy']).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['strict-transport-security']).toContain('max-age=63072000');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['x-content-type-options']).toBe('nosniff');
  const a = await page.request.get(PROD + '/admin', { maxRedirects: 0 });
  expect([302, 307, 308]).toContain(a.status());
});

test('produção: URLs do site antigo redirecionam (308) para a rota equivalente', async ({ page }) => {
  const all: [string, string][] = [['/servicos', '/solucoes/marketing'], ['/quem-somos', '/sobre'], ['/blog', '/insights'], ...LEGACY_REDIRECTS];
  for (const [from, to] of all) {
    const r = await page.request.get(PROD + from, { maxRedirects: 0 });
    expect(r.status(), from).toBe(308);
    expect(new URL(r.headers()['location'], PROD).pathname, from).toBe(to);
  }
});

/* ───────── Captação (homologação, banco descartável) ───────── */
test('lead real no banco de homologação: formulário de Concessionárias com UTMs, roteado no painel', async ({ page, context }) => {
  await consent(context, HOMOLOG);
  const errors = watchErrors(page);
  await page.goto(HOMOLOG + '/especialidades/concessionarias?utm_source=qa&utm_medium=teste&utm_campaign=homologacao-2027');
  const form = page.locator('#formulario form');
  await expect(form.locator('select[name="segment"]')).toHaveValue('concessionarias');
  await expect(form.locator('select[name="demand"]')).toHaveValue('campanha');
  const who = `QA Automatizado ${Date.now().toString(36)}`; // único por execução
  await form.locator('input[name="name"]').fill(who);
  await form.locator('input[name="company"]').fill('Rede Teste Homologação');
  await form.locator('input[name="email"]').fill('qa.homologacao@grifo.local');
  await form.locator('input[name="whatsapp"]').fill('62999990000');
  await form.locator('input[name="consent"]').check();
  await page.waitForTimeout(2800); // o token recusa envios em menos de 2,5 s (antispam)
  await form.getByRole('button', { name: 'Converse com a Grifo.' }).click();
  await expect(page.getByRole('status')).toContainText('Recebemos sua mensagem.');
  expect(errors).toEqual([]);

  // painel: login com o administrador de homologação e lead roteado para o segmento
  await page.goto(HOMOLOG + '/admin/login');
  await page.fill('#email', 'qa@grifo.local');
  await page.fill('#password', 'Homolog#2027-Grifo!');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/admin(\/)?$/);
  await page.goto(HOMOLOG + '/admin/leads?segmento=concessionarias');
  await expect(page.getByText(who)).toBeVisible();
  await expect(page.locator('table')).toContainText('Concessionárias');
  await page.getByText(who).click();
  await expect(page.locator('main')).toContainText('homologacao-2027');
});

test('API de leads: origem externa e honeypot são recusados', async ({ request }) => {
  const base = { name: 'Robô', company: 'X', email: 'x@exemplo.com', whatsapp: '62999990000', segment: 'concessionarias', demand: 'campanha', consent: true, token: 'x' };
  const cross = await request.post(HOMOLOG + '/api/leads', { data: base, headers: { origin: 'https://evil.example' } });
  expect(cross.status()).toBe(403);
  const hp = await request.post(HOMOLOG + '/api/leads', { data: { ...base, website: 'spam' }, headers: { origin: HOMOLOG } });
  expect(hp.status()).toBeGreaterThanOrEqual(400);
});

test('painel: especialidade Concessionárias e blocos de case disponíveis no CMS', async ({ page }) => {
  await page.goto(HOMOLOG + '/admin/login');
  await page.fill('#email', 'qa@grifo.local');
  await page.fill('#password', 'Homolog#2027-Grifo!');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/admin(\/)?$/);
  await page.goto(HOMOLOG + '/admin/conteudo/specialty');
  await expect(page.getByRole('link', { name: /Concessionárias/ }).first()).toBeVisible();
  await page.goto(HOMOLOG + '/admin/conteudo/case');
  await page.getByRole('link', { name: /UNICEUG/ }).first().click();
  await expect(page.getByText('Blocos do estudo de caso')).toBeVisible();
  await expect(page.getByText('Linguagem visual da página')).toBeVisible();
  await page.getByRole('button', { name: '+ Adicionar bloco' }).click();
  const type = page.getByLabel('Tipo de bloco').last();
  await type.selectOption('quote');
  await expect(page.getByLabel('Fonte (nome e cargo)').last()).toBeVisible();
  await expect(page.getByLabel('Capítulo')).toHaveCount(0); // campos condicionais: só os do tipo escolhido
  // não salva: a alteração fica só no formulário (o conteúdo do case permanece intacto)
});
