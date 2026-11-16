import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { SEED_DOCS, applyContentMigrations } from '../src/lib/cms/seed.ts';

/** Simula um banco operacional criado com o seed ANTERIOR (sem Concessionárias) e com edições do cliente. */
function legacyDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE documents (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, slug TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', draft TEXT NOT NULL, published TEXT, draft_seo TEXT NOT NULL DEFAULT '{}', published_seo TEXT, placeholder INTEGER NOT NULL DEFAULT 0, sort INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, published_at INTEGER, updated_by INTEGER, UNIQUE(type, slug));
    CREATE TABLE revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, document_id INTEGER NOT NULL, action TEXT NOT NULL, data TEXT NOT NULL, seo TEXT NOT NULL DEFAULT '{}', user_id INTEGER, created_at INTEGER NOT NULL);
    CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
  const ins = db.prepare('INSERT INTO documents (type, slug, title, draft, published, placeholder, sort, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)');
  for (const d of SEED_DOCS()) {
    if (d.type === 'specialty' && d.slug === 'concessionarias') continue;
    if (d.type === 'redirect' && !['servicos', 'quem-somos', 'blog'].includes(d.slug)) continue;
    const data = structuredClone(d.data) as Record<string, any>;
    if (d.type === 'micca') data.applications = data.applications.filter((a: any) => a.sector !== 'concessionarias');
    if (d.type === 'settings') {
      data.leadRouting = data.leadRouting.filter((r: any) => r.segment !== 'concessionarias');
      data.leadRouting[0].emails = 'comercial@cliente.example'; // edição feita no painel
    }
    const j = JSON.stringify(data);
    ins.run(d.type, d.slug, d.title, j, j, d.placeholder ? 1 : 0, d.sort ?? 0);
  }
  // redirecionamento já cadastrado manualmente para uma URL antiga: não pode ser sobrescrito
  ins.run('redirect', 'manual-portfolio', '/portfolio', JSON.stringify({ from: '/portfolio', to: '/projetos?origem=legado' }), JSON.stringify({ from: '/portfolio', to: '/projetos?origem=legado' }), 0, 0);
  db.prepare("INSERT INTO meta VALUES ('seeded', '1')").run();
  return db;
}

test('migração 2027-studio: acrescenta Concessionárias sem apagar nem sobrescrever dados', () => {
  const db = legacyDb();
  const before = db.prepare('SELECT COUNT(*) n FROM documents').get() as { n: number };
  const ran = applyContentMigrations(db);
  assert.deepEqual(ran, ['2027-studio-concessionarias', '2027-studio-legacy-redirects', '2026-11-seo-review', '2026-11-insights-a-drafts', '2026-11-insights-a-photo-covers', '2026-11-insights-a-publish', '2026-11-metrics-validated', '2026-11-services-text', '2026-11-sobre-lancamentos-2026', '2026-11-insights-legacy-photo-covers', '2026-11-contatos-oficiais', '2026-11-insights-legacy-approved', '2026-11-insights-micca-approved']);
  const spec = db.prepare("SELECT published, placeholder FROM documents WHERE type='specialty' AND slug='concessionarias'").get() as { published: string; placeholder: number };
  assert.equal(JSON.parse(spec.published).name, 'Concessionárias');
  assert.equal(spec.placeholder, 0);
  const micca = JSON.parse((db.prepare("SELECT published FROM documents WHERE type='micca'").get() as { published: string }).published);
  assert.deepEqual(micca.applications.map((a: any) => a.sector), ['imobiliario', 'educacao', 'tecnologia', 'concessionarias']);
  const settings = JSON.parse((db.prepare("SELECT draft FROM documents WHERE type='settings'").get() as { draft: string }).draft);
  assert.equal(settings.leadRouting[0].emails, 'comercial@cliente.example', 'edição do painel preservada');
  assert.ok(settings.leadRouting.some((r: any) => r.segment === 'concessionarias'));
  const manual = db.prepare("SELECT COUNT(*) n FROM documents WHERE type='redirect' AND json_extract(published,'$.from')='/portfolio'").get() as { n: number };
  assert.equal(manual.n, 1, 'regra manual não duplicada');
  const art = db.prepare("SELECT published, placeholder FROM documents WHERE type='article' AND slug='captacao-de-alunos-jornada'").get() as { published: string; placeholder: number };
  assert.equal(art.placeholder, 0, 'artigo aprovado sem selo de rascunho');
  assert.ok(!JSON.parse(art.published).body.includes('Rascunho editorial'));
  const pend = db.prepare("SELECT COUNT(*) n FROM documents WHERE type='article' AND placeholder = 1").get() as { n: number };
  assert.equal(pend.n, 0, 'todos os artigos aprovados pela gerência estão publicados');
  const after = db.prepare('SELECT COUNT(*) n FROM documents').get() as { n: number };
  assert.ok(after.n > before.n);
});

test('migração 2027-studio é idempotente', () => {
  const db = legacyDb();
  applyContentMigrations(db);
  const snap = JSON.stringify(db.prepare('SELECT type, slug, draft, published FROM documents ORDER BY id').all());
  assert.deepEqual(applyContentMigrations(db), []);
  // força reexecução das regras mesmo sem o registro em meta
  db.prepare("DELETE FROM meta WHERE key = 'content_migrations'").run();
  applyContentMigrations(db);
  assert.equal(JSON.stringify(db.prepare('SELECT type, slug, draft, published FROM documents ORDER BY id').all()), snap);
});

test('lead: segmento concessionarias é aceito pela validação', async () => {
  const { leadSchema } = await import('../src/lib/leads/schema.ts');
  const r = leadSchema.safeParse({ name: 'Ana Teste', company: 'Rede Exemplo', email: 'ana@exemplo.com.br', whatsapp: '(62) 99999-0000', segment: 'concessionarias', demand: 'campanha', consent: true, token: 'x' });
  assert.equal(r.success, true);
});

test('migração 2026-11: revisão de SEO não sobrescreve SEO editado no painel', () => {
  const db = legacyDb();
  const set = db.prepare('UPDATE documents SET published_seo = ?, draft_seo = ? WHERE type = ? AND slug = ?');
  set.run(JSON.stringify({ title: 'Grifo Agency — O ecossistema para marcas que fazem história' }), JSON.stringify({ title: 'Grifo Agency — O ecossistema para marcas que fazem história' }), 'home', 'home');
  set.run(JSON.stringify({ title: 'Título escrito pelo cliente' }), JSON.stringify({ title: 'Título escrito pelo cliente' }), 'about', 'sobre');
  applyContentMigrations(db);
  const seo = (t: string, s: string) => JSON.parse((db.prepare('SELECT published_seo FROM documents WHERE type = ? AND slug = ?').get(t, s) as { published_seo: string }).published_seo);
  assert.match(seo('home', 'home').title, /Agência de marketing/);
  assert.ok(seo('home', 'home').title.length <= 60);
  assert.equal(seo('about', 'sobre').title, 'Título escrito pelo cliente', 'edição do painel preservada');
});

test('migração 2026-11: artigos da edição entram como rascunho e são publicados após a aprovação', () => {
  const db = legacyDb();
  applyContentMigrations(db);
  const rows = db.prepare("SELECT slug, published, published_at, draft FROM documents WHERE type = 'article' AND slug IN ('midia-2026-copa-eleicoes-planejamento-2027','lancamentos-imobiliarios-2027-juros-estoque-mcmv','visibilidade-em-respostas-de-ia-estrategia-2027')").all() as { slug: string; published: string | null; published_at: number | null; draft: string }[];
  assert.equal(rows.length, 3);
  for (const r of rows) {
    assert.ok(r.published, `${r.slug} deve estar publicado (aprovado em 13/11/2026)`);
    assert.ok(r.published_at);
    assert.equal(JSON.parse(r.published as string).cover.src, JSON.parse(r.draft).cover.src);
    assert.ok(['publicidade', 'imobiliario', 'estrategia'].includes(JSON.parse(r.draft).category));
    assert.match(JSON.parse(r.draft).cover.src, /^\/acervo\/insights\/.+\.webp$/);
  }
});
