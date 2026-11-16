import type { DatabaseSync } from 'node:sqlite';
import { hashPassword, passwordProblems } from '../security/crypto';

/** Cria o primeiro administrador a partir de ADMIN_EMAIL/ADMIN_PASSWORD, apenas se não houver usuários. */
export function ensureBootstrapAdmin(db: DatabaseSync) {
  const count = (db.prepare('SELECT COUNT(*) c FROM users').get() as { c: number }).c;
  if (count > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn('[grifo] Nenhum usuário no painel. Defina ADMIN_EMAIL e ADMIN_PASSWORD ou rode `npm run create-admin`.');
    return;
  }
  const problems = passwordProblems(password, email);
  if (problems.length) {
    console.error(`[grifo] ADMIN_PASSWORD fraca: ${problems.join(', ')}. Administrador não criado.`);
    return;
  }
  db.prepare('INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)').run(
    email,
    process.env.ADMIN_NAME || 'Administrador',
    hashPassword(password),
    'admin',
    Date.now(),
  );
  console.info(`[grifo] Administrador inicial criado: ${email}. Remova ADMIN_PASSWORD do ambiente.`);
}
