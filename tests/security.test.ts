import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, passwordProblems, totp, verifyTotp, newTotpSecret, hashIp } from '../src/lib/security/crypto.ts';

test('senha: hash scrypt verifica a correta e rejeita a errada', () => {
  const h = hashPassword('Grifo.Teste-2027!');
  assert.ok(h.startsWith('scrypt$'));
  assert.equal(verifyPassword('Grifo.Teste-2027!', h), true);
  assert.equal(verifyPassword('grifo.teste-2027!', h), false);
  assert.notEqual(h, hashPassword('Grifo.Teste-2027!'), 'salt aleatório');
});

test('política de senha forte', () => {
  assert.ok(passwordProblems('curta').length > 0);
  assert.ok(passwordProblems('semnumeroNemSimbolo').length > 0);
  assert.deepEqual(passwordProblems('Grifo.Painel-2027!', 'editor@grifo.agency'), []);
  assert.ok(passwordProblems('Maria.Silva-2027!', 'maria@grifo.agency').length > 0, 'não pode conter o e-mail');
});

test('TOTP RFC 6238: código atual é aceito, código errado não', () => {
  const s = newTotpSecret();
  assert.equal(verifyTotp(s, totp(s)), true);
  assert.equal(verifyTotp(s, '000000') && totp(s) !== '000000', false);
  assert.equal(verifyTotp(s, 'abc'), false);
});

test('IP pseudonimizado é estável e não revela o IP', () => {
  const a = hashIp('203.0.113.7', 'segredo-de-teste-com-mais-de-32-caracteres');
  assert.equal(a, hashIp('203.0.113.7', 'segredo-de-teste-com-mais-de-32-caracteres'));
  assert.ok(!a.includes('203'));
});
