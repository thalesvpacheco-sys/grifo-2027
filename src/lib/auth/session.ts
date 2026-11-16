import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { db, now } from '../db';
import { env } from '../env';
import { randomToken, sha256 } from '../security/crypto';
import { ipHash } from '../security/request';

export const SESSION_COOKIE = env.isProd ? '__Host-grifo_session' : 'grifo_session';
const IDLE_MS = 2 * 3600_000; // 2h sem atividade
const ABSOLUTE_MS = 12 * 3600_000; // 12h no máximo

export type Role = 'admin' | 'editor';
export type SessionUser = { id: number; email: string; name: string; role: Role; totpEnabled: boolean; sessionId: string; mfaPending: boolean };

export async function createSession(userId: number, mfaPending: boolean) {
  const token = randomToken(32);
  const id = sha256(token);
  const t = now();
  const h = await headers();
  db()
    .prepare('INSERT INTO sessions (id, user_id, created_at, last_seen_at, expires_at, ip_hash, user_agent, mfa_pending) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, userId, t, t, t + ABSOLUTE_MS, await ipHash(), (h.get('user-agent') || '').slice(0, 200), mfaPending ? 1 : 0);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: ABSOLUTE_MS / 1000,
  });
}

export async function destroySession() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) db().prepare('DELETE FROM sessions WHERE id = ?').run(sha256(token));
  c.delete(SESSION_COOKIE);
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const id = sha256(token);
  const row = db()
    .prepare(
      `SELECT s.id sid, s.last_seen_at, s.expires_at, s.mfa_pending, u.id, u.email, u.name, u.role, u.totp_enabled, u.active
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
    )
    .get(id) as
    | { sid: string; last_seen_at: number; expires_at: number; mfa_pending: number; id: number; email: string; name: string; role: Role; totp_enabled: number; active: number }
    | undefined;
  if (!row) return null;
  const t = now();
  if (!row.active || t > row.expires_at || t - row.last_seen_at > IDLE_MS) {
    db().prepare('DELETE FROM sessions WHERE id = ?').run(id);
    return null;
  }
  if (t - row.last_seen_at > 60_000) db().prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?').run(t, id);
  return { id: row.id, email: row.email, name: row.name, role: row.role, totpEnabled: !!row.totp_enabled, sessionId: row.sid, mfaPending: !!row.mfa_pending };
});

/** Exige usuário autenticado (e 2FA concluído). Use em toda página e server action do painel. */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const u = await getSession();
  if (!u) redirect('/admin/login');
  if (u.mfaPending) redirect('/admin/login/2fa');
  if (role === 'admin' && u.role !== 'admin') redirect('/admin?erro=permissao');
  return u;
}

export async function audit(userId: number | null, action: string, target?: string, detail?: string) {
  db().prepare('INSERT INTO audit_log (user_id, action, target, detail, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(userId, action, target ?? null, detail ?? null, await ipHash(), now());
}
