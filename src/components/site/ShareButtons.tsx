'use client';

import { useState } from 'react';

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const cls = 'flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-grafite/20 transition-colors hover:bg-grafite hover:text-white';
  return (
    <div>
      <p className="text-sm font-semibold text-grafite/70">Compartilhar</p>
      <ul className="mt-2 flex gap-2">
        <li><a className={cls} href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no LinkedIn (nova aba)">in</a></li>
        <li><a className={cls} href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" data-placement="share" aria-label="Compartilhar no WhatsApp (nova aba)">wa</a></li>
        <li><a className={cls} href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no X (nova aba)">x</a></li>
        <li>
          <button
            type="button"
            className={`${cls} w-auto px-4 text-sm font-semibold`}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                /* sem permissão de clipboard */
              }
            }}
          >
            {copied ? 'Link copiado' : 'Copiar link'}
          </button>
        </li>
      </ul>
      <span className="sr-only" aria-live="polite">{copied ? 'Link copiado' : ''}</span>
    </div>
  );
}
