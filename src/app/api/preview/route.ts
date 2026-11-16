import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

/** Ativa a pré-visualização de rascunhos — somente para usuários autenticados do painel. */
export async function GET(req: Request) {
  const user = await getSession();
  if (!user || user.mfaPending) return new Response('Não autorizado', { status: 401 });
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/';
  // Apenas caminhos internos (evita open redirect).
  const safe = path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') ? path : '/';
  (await draftMode()).enable();
  redirect(safe);
}
