import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { env } from './env';
import type { Img } from './cms/content';

/**
 * Dimensões reais das imagens do acervo e dos uploads (lidas uma vez e mantidas em memória).
 * Usadas para nunca ampliar arquivos de baixa resolução como se fossem arte-final:
 * imagens abaixo de LOWRES_WIDTH são exibidas em tamanho real, dentro de um quadro.
 */
export const LOWRES_WIDTH = 900;
export type SizedImg = Img & { w?: number; h?: number; lowres?: boolean };

const cache = new Map<string, { w: number; h: number } | null>();

function fileFor(src: string): string | null {
  if (src.startsWith('/media/')) {
    const name = src.slice('/media/'.length);
    if (!/^[a-z0-9][a-z0-9._-]{0,120}$/i.test(name)) return null;
    return path.join(env.dataDir, 'uploads', name);
  }
  if (/^\/(acervo|brand|video)\/[\w./-]+$/.test(src) && !src.includes('..')) return path.join(process.cwd(), 'public', src);
  return null;
}

export async function imageSize(src?: string): Promise<{ w: number; h: number } | null> {
  if (!src) return null;
  if (cache.has(src)) return cache.get(src)!;
  const file = fileFor(src);
  let out: { w: number; h: number } | null = null;
  if (file && fs.existsSync(file)) {
    try {
      const m = await sharp(file).metadata();
      if (m.width && m.height) out = { w: m.width, h: m.height };
    } catch {
      out = null;
    }
  }
  cache.set(src, out);
  return out;
}

export async function sized(img?: Img | null): Promise<SizedImg | undefined> {
  if (!img?.src) return img ?? undefined;
  const s = await imageSize(img.src);
  return s ? { ...img, w: s.w, h: s.h, lowres: s.w < LOWRES_WIDTH } : { ...img };
}
