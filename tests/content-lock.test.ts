import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SEED_DOCS } from '../src/lib/cms/seed.ts';
import { diffContent, isAllowed } from '../scripts/qa/content-diff-lib.ts';

const baseline = JSON.parse(fs.readFileSync(new URL('../CONTENT_LOCK_BASELINE.json', import.meta.url), 'utf8')).docs;
const current = SEED_DOCS().map((d) => ({ key: `${d.type}/${d.slug}`, title: d.title, placeholder: !!d.placeholder, sort: d.sort ?? 0, seo: d.seo ?? {}, data: d.data }));

test('content lock: o copy aprovado do ZIP 2027 permanece idêntico', () => {
  const changes = diffContent(baseline, current);
  const forbidden = changes.filter((c) => !isAllowed(c));
  assert.deepEqual(forbidden, [], `Diferenças não autorizadas:\n${JSON.stringify(forbidden, null, 2)}`);
});

test('content lock: as diferenças permitidas existem (Concessionárias integrada)', () => {
  const changes = diffContent(baseline, current);
  assert.ok(changes.some((c) => c.key === 'specialty/concessionarias' && c.kind === 'added'));
  assert.ok(changes.some((c) => c.key === 'micca/metodologia-micca'));
  assert.ok(changes.some((c) => c.key === 'settings/global'));
});

test('cases continuam pendentes de aprovação (nenhum case publicado por engano)', () => {
  for (const d of SEED_DOCS().filter((x) => x.type === 'case')) assert.equal(d.placeholder, true, d.slug);
});

test('Concessionárias: copy autorizada exatamente como no prompt mestre', () => {
  const c = SEED_DOCS().find((d) => d.type === 'specialty' && d.slug === 'concessionarias')!;
  const data = c.data as Record<string, any>;
  assert.equal(data.tagline, 'Estratégia, campanhas e experiências para marcas que movimentam o mercado automotivo.');
  assert.equal(data.hero.title.replace('\n', ' '), 'Sua concessionária precisa de mais que campanhas. Precisa de uma estratégia que conecta marca e vendas.');
  assert.equal(data.hero.cta.label, 'Vamos construir sua próxima campanha.');
  assert.equal(data.fronts.items.length, 6);
  assert.equal(data.segments.items.length, 6);
  assert.deepEqual(data.micca.items.map((x: any) => x.pillar), ['Meta', 'Investimento', 'Conteúdo', 'Canais', 'Atendimento']);
  assert.equal(data.final.cta.label, 'Converse com a Grifo.');
  assert.equal(data.final.title, 'Sua próxima campanha começa com uma estratégia à altura da sua operação.');
  assert.ok(!/\d+%|R\$|garant/i.test(JSON.stringify(data)), 'sem preços, taxas ou garantias');
});
