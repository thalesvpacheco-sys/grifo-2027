import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { db, now } from './db';
import { env } from './env';

export const MAX_IMAGE = 15 * 1024 * 1024;
export const MAX_VIDEO = 80 * 1024 * 1024;

export type MediaRow = { id: number; file: string; original_name: string; mime: string; size: number; width: number | null; height: number | null; alt: string; created_at: number };

function sniffVideo(buf: Buffer): 'video/mp4' | 'video/webm' | null {
  if (buf.length > 12 && buf.subarray(4, 8).toString('latin1') === 'ftyp') return 'video/mp4';
  if (buf.length > 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'video/webm';
  return null;
}

/**
 * Processa upload com verificação pelo conteúdo real (não pela extensão):
 *  - imagens: decodificadas pelo sharp, metadados EXIF removidos, re-encodadas em WebP (máx. 2560px);
 *  - vídeos: assinatura MP4/WebM verificada;
 *  - SVG, HTML e executáveis são recusados (vetores de XSS).
 */
export async function storeUpload(file: File, alt: string, userId: number): Promise<MediaRow> {
  const buf = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomBytes(9).toString('base64url').replace(/[-_]/g, 'x').toLowerCase();
  const base = path.join(env.dataDir, 'uploads');
  fs.mkdirSync(base, { recursive: true });
  const video = sniffVideo(buf);
  let out: { name: string; mime: string; size: number; w: number | null; h: number | null };

  if (video) {
    if (buf.length > MAX_VIDEO) throw new Error('Vídeo acima de 80 MB. Comprima antes de enviar.');
    const name = `${id}${video === 'video/mp4' ? '.mp4' : '.webm'}`;
    fs.writeFileSync(path.join(base, name), buf);
    out = { name, mime: video, size: buf.length, w: null, h: null };
  } else {
    if (buf.length > MAX_IMAGE) throw new Error('Imagem acima de 15 MB.');
    const head = buf.subarray(0, 512).toString('utf8').toLowerCase();
    if (head.includes('<svg') || head.includes('<html') || head.includes('<script')) throw new Error('Formato não permitido. Envie JPG, PNG, WebP, AVIF ou GIF.');
    let meta: Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>;
    try {
      meta = await sharp(buf, { limitInputPixels: 80_000_000 }).metadata();
    } catch {
      throw new Error('Arquivo não reconhecido como imagem. Envie JPG, PNG, WebP, AVIF ou GIF.');
    }
    if (!['jpeg', 'png', 'webp', 'avif', 'gif', 'heif', 'tiff'].includes(meta.format || '')) throw new Error('Formato não permitido. Envie JPG, PNG, WebP, AVIF ou GIF.');
    const name = `${id}.webp`;
    const info = await sharp(buf, { animated: meta.format === 'gif' })
      .rotate()
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(base, name));
    out = { name, mime: 'image/webp', size: info.size, w: info.width, h: info.height };
  }

  const r = db()
    .prepare('INSERT INTO media (file, original_name, mime, size, width, height, alt, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(out.name, file.name.slice(0, 200), out.mime, out.size, out.w, out.h, alt.slice(0, 300), userId, now());
  return { ...(db().prepare('SELECT * FROM media WHERE id = ?').get(Number(r.lastInsertRowid)) as object) } as MediaRow;
}

export function listMedia(q = '', limit = 200): MediaRow[] {
  const rows = q
    ? db().prepare('SELECT * FROM media WHERE original_name LIKE ? OR alt LIKE ? ORDER BY created_at DESC LIMIT ?').all(`%${q}%`, `%${q}%`, limit)
    : db().prepare('SELECT * FROM media ORDER BY created_at DESC LIMIT ?').all(limit);
  // node:sqlite devolve objetos sem protótipo; convertemos para objetos simples (serializáveis).
  return rows.map((r) => ({ ...(r as object) })) as MediaRow[];
}

export function deleteMedia(id: number) {
  const m = db().prepare('SELECT file FROM media WHERE id = ?').get(id) as { file: string } | undefined;
  if (!m) return;
  try {
    fs.unlinkSync(path.join(env.dataDir, 'uploads', m.file));
  } catch {
    /* já removido */
  }
  db().prepare('DELETE FROM media WHERE id = ?').run(id);
}
