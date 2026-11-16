import { NextResponse } from 'next/server';
import { leadSchema } from '@/lib/leads/schema';
import { checkFormToken, forwardToCrm, notifyTeam, saveLead } from '@/lib/leads/service';
import { clientIpFrom, rateLimit, sameOrigin } from '@/lib/security/request';
import { hashIp } from '@/lib/security/crypto';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
const MAX_BYTES = 16 * 1024;

const fail = (status: number, error: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

export async function POST(req: Request) {
  // 1. Origem: apenas o próprio site pode enviar (CSRF).
  if (!sameOrigin(req)) return fail(403, 'Origem não autorizada.');
  if (!(req.headers.get('content-type') || '').includes('application/json')) return fail(415, 'Formato inválido.');

  // 2. Rate limit por IP (pseudonimizado): 5 envios a cada 10 min, 20 por dia.
  const ip = clientIpFrom(req.headers);
  const ipH = hashIp(ip, env.appSecret);
  const short = rateLimit(`lead:10m:${ipH}`, 5, 10 * 60_000);
  const day = rateLimit(`lead:1d:${ipH}`, 20, 24 * 3600_000);
  if (!short.ok || !day.ok) {
    const retry = Math.max(short.retryAfter, day.retryAfter);
    return fail(429, `Muitos envios em sequência. Tente novamente em ${Math.ceil(retry / 60)} minuto(s).`, {}, { 'Retry-After': String(retry) });
  }

  // 3. Tamanho máximo do corpo.
  const raw = await req.text();
  if (raw.length > MAX_BYTES) return fail(413, 'Mensagem longa demais.');
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, 'Formato inválido.');
  }

  // 4. Validação server-side (fonte de verdade).
  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0]);
      if (k === 'website' || k === 'token') continue;
      fields[k] ??= i.message;
    }
    // Honeypot preenchido → resposta genérica (não revela a armadilha), nada é salvo.
    if (parsed.error.issues.some((i) => i.path[0] === 'website')) return fail(400, 'Não foi possível enviar. Atualize a página e tente novamente.');
    return fail(422, 'Revise os campos destacados.', { fields });
  }

  // 5. Token de tempo assinado.
  const tk = checkFormToken(parsed.data.token);
  if (tk === 'too_fast') return fail(400, 'Envio rápido demais. Aguarde alguns segundos e tente novamente.');
  if (tk !== 'ok') return fail(400, 'Sua sessão expirou. Atualize a página e envie novamente.');

  // 6. Persistência — o sucesso só é retornado após gravar.
  let id: number;
  try {
    id = saveLead(parsed.data, ipH);
  } catch (e) {
    console.error('[grifo] Falha ao salvar lead:', (e as Error).message);
    return fail(500, 'Não foi possível registrar seu contato agora. Tente novamente em instantes.');
  }

  // 7. Integrações (CRM + aviso interno). Falhas ficam registradas para reenvio pelo painel.
  await Promise.allSettled([forwardToCrm(id), notifyTeam(id)]);

  return NextResponse.json({ ok: true, id }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}

export function GET() {
  return fail(405, 'Método não permitido.', {}, { Allow: 'POST' });
}
