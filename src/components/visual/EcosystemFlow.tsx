'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EcosystemArc } from './EcosystemArc';

type Item = { slug: string; name: string; tagline?: string };

/**
 * Ecosystem Flow: o arco (Consulting envolvendo Marketing, Studios e Tech) e a lista das frentes
 * compartilham o mesmo estado — passar o mouse ou o foco numa frente acende a parte correspondente da estrutura.
 * Sem JavaScript, arco e lista continuam navegáveis.
 */
export function EcosystemFlow({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string | null>(null);
  const labels = Object.fromEntries(items.map((s) => [s.slug, s.name]));
  return (
    <div className="grid items-center gap-14 lg:grid-cols-12">
      <div className="lg:col-span-6" data-reveal>
        <EcosystemArc labels={labels} active={active} onActive={setActive} flow />
      </div>
      <ul className="lg:col-span-6" data-reveal>
        {items.map((s, i) => (
          <li key={s.slug} data-stagger style={{ ['--i' as string]: i }} className="border-t border-white/15 last:border-b">
            <Link
              href={`/solucoes/${s.slug}`}
              onMouseEnter={() => setActive(s.slug)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(s.slug)}
              onBlur={() => setActive(null)}
              className="group grid grid-cols-[48px_1fr_auto] items-start gap-4 py-6"
            >
              <span aria-hidden="true" className={`pt-1.5 font-display text-sm font-semibold tabular-nums transition-colors ${active === s.slug ? 'text-ambar' : 'text-white/40'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <span className={`block font-display text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold leading-tight transition-colors ${active === s.slug ? 'text-ambar' : ''}`}>Grifo {s.name}</span>
                <span className="mt-1 block text-white/65">{s.tagline}</span>
              </span>
              <span aria-hidden="true" className={`mt-1 font-display text-2xl transition-all duration-300 ${active === s.slug ? 'translate-x-1 text-ambar' : 'text-white/30'}`}>›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
