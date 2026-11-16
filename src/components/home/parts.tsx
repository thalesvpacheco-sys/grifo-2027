import Link from 'next/link';
import type { ElementType } from 'react';

/** Seta diagonal dos botões e cartões (gira para a direita no hover). */
export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Título da Home: o texto aprovado é exibido na íntegra. Onde o CMS tem quebra de linha,
 * a primeira frase fica em tinta e a segunda em cinza (contraste por cor, não por peso).
 */
export function HTitle({ text, as: Tag = 'h2', id, className = '' }: { text?: string; as?: ElementType; id?: string; className?: string }) {
  if (!text) return null;
  const [a, ...rest] = text.split('\n');
  const b = rest.join(' ').trim();
  return (
    <Tag id={id} className={className}>
      <span className="block">{a}</span>
      {b ? <> <span className="hm-l2 block">{b}</span></> : null}
    </Tag>
  );
}

type Variant = 'ink' | 'white' | 'line' | 'line-dark';
export function HButton({ href, label, variant = 'ink', track, className = '' }: { href?: string; label?: string; variant?: Variant; track?: string; className?: string }) {
  if (!href || !label) return null;
  const arrow = variant === 'ink' || variant === 'white';
  return (
    <Link href={href} data-cta={track} className={`hm-btn hm-btn--${variant} ${className}`}>
      <span>{label}</span>
      {arrow && (
        <span className="hm-btn-ico" aria-hidden="true">
          <Arrow />
        </span>
      )}
    </Link>
  );
}

/** Faixa contínua com os nomes reais das frentes e especialidades (do CMS). Estática com movimento reduzido. */
export function Marquee({ items, label }: { items: string[]; label: string }) {
  if (!items.length) return null;
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 gap-2.5 pr-2.5" aria-hidden={hidden || undefined} role="list">
      {items.map((t, i) => (
        <li key={`${t}-${i}`} className="hm-chip">
          <b aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="hm-marquee overflow-hidden" aria-label={label}>
      <div className="hm-marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function Kicker({ children, as: Tag = 'p', className = '' }: { children: React.ReactNode; as?: ElementType; className?: string }) {
  return <Tag className={`hm-kicker ${className}`}>{children}</Tag>;
}
