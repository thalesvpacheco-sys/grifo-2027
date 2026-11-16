import 'server-only';
import { headers } from 'next/headers';
import { env } from '../env';
import { db } from '../db';
import { hashIp } from './crypto';

export function clientIpFrom(h: Headers): string {
  if (env.trustProxy) {
    const xff = h.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    const real = h.get('x-real-ip');
    if (real) return real.trim();
  }
  // Sem proxy confiável, não aceitamos cabeçalhos falsificáveis: agrupamos por "local".
  // Em produção, defina TRUST_PROXY=true atrás de Nginx/Vercel/Cloudflare.
  return 'local';
}

export async function clientIp(): Promise<string> {
  return clientIpFrom(await headers());
}

export async function ipHash(): Promise<string> {
  return hashIp(await clientIp(), env.appSecret);
}

/** Bloqueia requisições cross-site (CSRF) em rotas de API que alteram estado. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!origin || !host) return false;
  try {
    const o = new URL(origin);
    if (o.host === host) return true;
    return o.origin === new URL(env.siteUrl).origin;
  } catch {
    return false;
  }
}

/**
 * Rate limit em janela fixa persistido no SQLite (sobrevive a restarts e é compartilhado entre workers do mesmo host).
 * Retorna { ok, retryAfter } — retryAfter em segundos.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number; remaining: number } {
  const d = db();
  const t = Date.now();
  const row = d.prepare('SELECT count, window_start FROM rate_limits WHERE key = ?').get(key) as { count: number; window_start: number } | undefined;
  if (!row || t - row.window_start >= windowMs) {
    d.prepare('INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start').run(key, t);
    return { ok: true, retryAfter: 0, remaining: limit - 1 };
  }
  if (row.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((row.window_start + windowMs - t) / 1000), remaining: 0 };
  }
  d.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').run(key);
  return { ok: true, retryAfter: 0, remaining: limit - row.count - 1 };
}

export function resetRateLimit(key: string) {
  db().prepare('DELETE FROM rate_limits WHERE key = ?').run(key);
}

/** Limpeza periódica de chaves expiradas (chamada oportunisticamente). */
export function pruneRateLimits(maxAgeMs = 24 * 3600_000) {
  db().prepare('DELETE FROM rate_limits WHERE window_start < ?').run(Date.now() - maxAgeMs);
}
