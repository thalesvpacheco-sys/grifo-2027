import { getSession, audit } from '@/lib/auth/session';
import { db } from '@/lib/db';

/** Exportação CSV de leads (somente administradores; registrada em auditoria). */
export async function GET(req: Request) {
  const u = await getSession();
  if (!u || u.mfaPending || u.role !== 'admin') return new Response('Não autorizado', { status: 403 });
  const sp = new URL(req.url).searchParams;
  const where: string[] = [];
  const args: string[] = [];
  if (sp.get('status')) (where.push('status = ?'), args.push(sp.get('status')!));
  if (sp.get('segmento')) (where.push('segment = ?'), args.push(sp.get('segmento')!));
  const rows = db().prepare(`SELECT * FROM leads ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC`).all(...args) as Record<string, unknown>[];
  const cols = ['id', 'created_at', 'name', 'company', 'email', 'whatsapp', 'segment', 'demand', 'message', 'form', 'extra', 'status', 'notes', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'landing_page', 'referrer', 'page', 'consent_at', 'consent_version', 'crm_status'];
  // Escapa aspas e neutraliza fórmulas (CSV injection: =, +, -, @).
  const cell = (v: unknown, k: string) => {
    let s = v == null ? '' : k.endsWith('_at') ? new Date(Number(v)).toISOString() : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = '﻿' + [cols.join(';'), ...rows.map((r) => cols.map((c) => cell(r[c], c)).join(';'))].join('\r\n');
  await audit(u.id, 'lead.exportar', undefined, `${rows.length} registros`);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-grifo-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
