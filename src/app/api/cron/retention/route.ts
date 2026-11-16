import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { safeEqual } from '@/lib/security/crypto';
import { purgeExpiredLeads } from '@/lib/leads/service';
import { pruneRateLimits } from '@/lib/security/request';
import { db } from '@/lib/db';

/** Manutenção diária: expurgo LGPD de leads, sessões e limites expirados. Protegido por CRON_SECRET (Bearer). */
export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!env.cronSecret || !safeEqual(auth, `Bearer ${env.cronSecret}`)) return NextResponse.json({ ok: false }, { status: 401 });
  const leads = purgeExpiredLeads();
  pruneRateLimits();
  const sessions = db().prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now()).changes;
  return NextResponse.json({ ok: true, leadsRemoved: leads, sessionsRemoved: Number(sessions) });
}
