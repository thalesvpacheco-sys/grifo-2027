import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { env } from '@/lib/env';

const TYPES: Record<string, string> = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.avif': 'image/avif', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf' };

/** Serve arquivos enviados pelo painel, com proteção contra path traversal e cabeçalhos seguros. */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const name = parts.join('/');
  if (!/^[a-z0-9][a-z0-9._-]{0,120}$/i.test(name) || name.includes('..')) return new Response('Not found', { status: 404 });
  const base = path.join(env.dataDir, 'uploads');
  const file = path.join(base, name);
  if (!file.startsWith(base + path.sep)) return new Response('Not found', { status: 404 });
  const ext = path.extname(file).toLowerCase();
  const type = TYPES[ext];
  if (!type) return new Response('Not found', { status: 404 });
  let stat: fs.Stats;
  try {
    stat = fs.statSync(file);
  } catch {
    return new Response('Not found', { status: 404 });
  }
  const headers: Record<string, string> = {
    'Content-Type': type,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    'Accept-Ranges': 'bytes',
  };
  // Suporte a Range para vídeos.
  const range = req.headers.get('range');
  if (range && type.startsWith('video/')) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m?.[1] ? Number(m[1]) : 0;
    const end = m?.[2] ? Math.min(Number(m[2]), stat.size - 1) : Math.min(start + 2 ** 20 * 4, stat.size - 1);
    if (start >= stat.size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } });
    const stream = fs.createReadStream(file, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, { status: 206, headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': String(end - start + 1) } });
  }
  return new Response(fs.readFileSync(file), { headers: { ...headers, 'Content-Length': String(stat.size) } });
}
