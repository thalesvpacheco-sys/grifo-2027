import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leadSchema, maskPhoneBR } from '../src/lib/leads/schema.ts';

const base = { name: 'Maria Teste', company: 'Construtora', email: 'maria@exemplo.com.br', whatsapp: '(62) 99999-8888', segment: 'imobiliario', demand: 'lancamento', consent: true, token: 't' };

test('lead válido passa', () => {
  const r = leadSchema.safeParse(base);
  assert.equal(r.success, true);
});

test('consentimento LGPD é obrigatório', () => {
  const r = leadSchema.safeParse({ ...base, consent: false });
  assert.equal(r.success, false);
});

test('WhatsApp exige DDD válido', () => {
  assert.equal(leadSchema.safeParse({ ...base, whatsapp: '99999-8888' }).success, false);
  assert.equal(leadSchema.safeParse({ ...base, whatsapp: '+55 62 99999-8888' }).success, true);
  assert.equal(leadSchema.safeParse({ ...base, whatsapp: '(62) 3333-4444' }).success, true);
});

test('honeypot preenchido é rejeitado', () => {
  assert.equal(leadSchema.safeParse({ ...base, website: 'http://spam' }).success, false);
});

test('segmento e demanda só aceitam valores da lista', () => {
  assert.equal(leadSchema.safeParse({ ...base, segment: 'hack' }).success, false);
  assert.equal(leadSchema.safeParse({ ...base, demand: 'outro' }).success, false);
});

test('máscara BR', () => {
  assert.equal(maskPhoneBR('62999998888'), '(62) 99999-8888');
  assert.equal(maskPhoneBR('6233334444'), '(62) 3333-4444');
});
