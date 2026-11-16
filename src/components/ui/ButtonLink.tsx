import Link from 'next/link';
import { Wing } from '../brand/Logo';

type Variant = 'primary' | 'ghost-dark' | 'ghost-light' | 'vinho';

/**
 * Botão de ação real (navega ou ancora). `track` gera o evento click_cta no dataLayer
 * via listener global (sem depender do texto para atribuição).
 */
export function ButtonLink({
  href,
  children,
  variant = 'primary',
  track,
  className = '',
  wing = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  track?: string;
  className?: string;
  wing?: boolean;
}) {
  const external = /^https?:\/\//.test(href);
  const cls = `btn btn-${variant} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {wing && <Wing className="wing h-3 w-5 shrink-0" />}
    </>
  );
  if (external)
    return (
      <a href={href} className={cls} data-cta={track} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  return (
    <Link href={href} className={cls} data-cta={track}>
      {inner}
    </Link>
  );
}

export function CtaLink({ cta, variant, track, className }: { cta?: { label?: string; href?: string }; variant?: Variant; track?: string; className?: string }) {
  if (!cta?.label || !cta?.href) return null;
  return (
    <ButtonLink href={cta.href} variant={variant} track={track} className={className}>
      {cta.label}
    </ButtonLink>
  );
}
