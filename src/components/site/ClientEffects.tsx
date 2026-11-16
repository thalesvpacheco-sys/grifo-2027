'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { captureAttribution } from '@/lib/attribution';

/**
 * Efeitos globais leves:
 *  - revela blocos marcados com [data-reveal] ao entrar na tela (uma vez);
 *  - rastreia click_cta e click_whatsapp por delegação de eventos (sem depender do texto do botão).
 */
export function ClientEffects() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.remove('no-js');
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a,button') as HTMLElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('https://wa.me/')) {
        track('click_whatsapp', { page_path: location.pathname, placement: a.dataset.placement || 'inline' });
      } else if (a.dataset.cta) {
        track('click_cta', { cta_id: a.dataset.cta, page_path: location.pathname, destination: href });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
