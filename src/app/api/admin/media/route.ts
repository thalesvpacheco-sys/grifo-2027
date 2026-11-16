import { NextResponse } from 'next/server';
import { getSession, audit } from '@/lib/auth/session';
import { sameOrigin, rateLimit } from '@/lib/security/request';
import { storeUpload, listMedia } from '@/lib/media';

export const runtime = 'nodejs';

async function guard(req: Request) {
  const u = await getSession();
  if (!u || u.mfaPending) return { error: NextResponse.json({ ok: false, error: 'Sessão expirada. Entre novamente.' }, { status: 401 }) };
  if (req.method !== 'GET' && !sameOrigin(req)) return { error: NextResponse.json({ ok: false, error: 'Origem não autorizada.' }, { status: 403 }) };
  return { user: u };
}

export async function GET(req: Request) {
  const g = await guard(req);
  if (g.error) return g.error;
  const q = new URL(req.url).searchParams.get('q') || '';
  return NextResponse.json({ ok: true, items: listMedia(q.slice(0, 80)).map((m) => ({ ...m, url: `/media/${m.file}` })) });
}

export async function POST(req: Request) {
  const g = await guard(req);
  if (g.error) return g.error;
  if (!rateLimit(`upload:${g.user.id}`, 60, 10 * 60_000).ok) return NextResponse.json({ ok: false, error: 'Muitos envios. Aguarde alguns minutos.' }, { status: 429 });
  const len = Number(req.headers.get('content-length') || 0);
  if (len > 85 * 1024 * 1024) return NextResponse.json({ ok: false, error: 'Arquivo grande demais.' }, { status: 413 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Envio inválido.' }, { status: 400 });
  }
  const file = form.get('file');
  const alt = String(form.get('alt') || '');
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ ok: false, error: 'Selecione um arquivo.' }, { status: 400 });
  try {
    const m = await storeUpload(file, alt, g.user.id);
    await audit(g.user.id, 'media.upload', `media:${m.id}`, m.original_name);
    return NextResponse.json({ ok: true, item: { ...m, url: `/media/${m.file}` } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 422 });
  }
}
