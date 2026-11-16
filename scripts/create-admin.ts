/**
 * Cria (ou redefine a senha de) um usuário do painel pela linha de comando.
 * Uso:  npm run create-admin -- email@empresa.com "Nome Completo" admin|editor
 * A senha é solicitada no terminal (não fica no histórico do shell).
 */
import path from 'node:path';
import fs from 'node:fs';
import readline from 'node:readline';
import { DatabaseSync } from 'node:sqlite';
import { hashPassword, passwordProblems } from '../src/lib/security/crypto.ts';

const [email, name = 'Administrador', role = 'admin'] = process.argv.slice(2);
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Uso: npm run create-admin -- email@empresa.com "Nome" admin|editor');
  process.exit(1);
}
const dbPath = path.resolve(process.env.DATA_DIR || './data', 'grifo.db');
if (!fs.existsSync(dbPath)) {
  console.error(`Banco não encontrado em ${dbPath}. Inicie o site uma vez (npm run dev ou npm start) para criá-lo.`);
  process.exit(1);
}
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((r) => rl.question(q, r));
const pw = process.env.NEW_PASSWORD || (await ask('Senha (mín. 12, maiúsc./minúsc./número/símbolo): '));
rl.close();
const probs = passwordProblems(pw, email);
if (probs.length) {
  console.error('Senha fraca: ' + probs.join(', '));
  process.exit(1);
}
const db = new DatabaseSync(dbPath);
const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
if (exists) {
  db.prepare('UPDATE users SET password_hash = ?, name = ?, role = ?, active = 1, failed_attempts = 0, locked_until = NULL WHERE email = ?').run(hashPassword(pw), name, role === 'editor' ? 'editor' : 'admin', email.toLowerCase());
  console.log(`Usuário ${email} atualizado.`);
} else {
  db.prepare('INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)').run(email.toLowerCase(), name, hashPassword(pw), role === 'editor' ? 'editor' : 'admin', Date.now());
  console.log(`Usuário ${email} criado (${role}).`);
}
