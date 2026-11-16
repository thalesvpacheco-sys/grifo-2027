import Link from 'next/link';

/**
 * Arquitetura do ecossistema (linguagem boutique 2027): Consulting no topo, como direção estratégica,
 * conectado às três frentes de execução — Marketing, Studios e Tech —, sobre a base "grifo · o ecossistema".
 * Cada bloco é um link focável para a página da frente. Mantém a API anterior (center, centerSub, labels, active, onActive, flow).
 */
const FRONTS = [
  { slug: 'marketing', desc: 'Planejamento e comunicação' },
  { slug: 'studios', desc: 'Produção criativa e audiovisual' },
  { slug: 'tech', desc: 'Tecnologia e integrações' },
];

function Ico({ slug, className = '' }: { slug: string; className?: string }) {
  return (
    <span className={`eco-ico ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/home/icone-${slug}.webp`} alt="" width={360} height={360} loading="lazy" decoding="async" />
    </span>
  );
}

const Arrow = () => (
  <span className="eco-arrow" aria-hidden="true">
    <svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

export function EcosystemArc({
  center = 'grifo',
  centerSub = 'o ecossistema',
  labels = { consulting: 'Consulting', marketing: 'Marketing', studios: 'Studios', tech: 'Tech' },
  active,
  onActive,
  flow = false,
}: {
  center?: string;
  centerSub?: string;
  labels?: Record<string, string>;
  /** Frente destacada (sincronizada com a lista ao lado, no Ecosystem Flow). */
  active?: string | null;
  onActive?: (slug: string | null) => void;
  /** Traço animado nas conexões: a estratégia (Consulting) alimentando as frentes. */
  flow?: boolean;
}) {
  const ev = (slug: string) => (onActive ? { onMouseEnter: () => onActive(slug), onMouseLeave: () => onActive(null), onFocus: () => onActive(slug), onBlur: () => onActive(null) } : {});
  const on = (slug: string) => (active === slug ? 'is-on' : '');
  const [c1, ...cRest] = center.split(' ');
  return (
    <div className={`eco-map ${flow ? 'eco-map--flow' : ''}`} role="group" aria-label="Arquitetura do ecossistema Grifo">
      <Link href="/solucoes/consulting" aria-label={`${labels.consulting}: direção estratégica`} className={`eco-lead group ${on('consulting')}`} {...ev('consulting')}>
        <Ico slug="consulting" className="eco-ico--lead" />
        <span className="min-w-0 flex-1">
          <span className="eco-kicker"><i aria-hidden="true" />{labels.consulting.toUpperCase()} · DIREÇÃO ESTRATÉGICA</span>
          <span className="eco-name mt-2 block text-white">{labels.consulting}</span>
        </span>
        <Arrow />
      </Link>

      <div className="eco-links" aria-hidden="true"><span /><span /><span /></div>

      <ul className="eco-fronts" role="list">
        {FRONTS.map((f) => (
          <li key={f.slug}>
            <Link href={`/solucoes/${f.slug}`} aria-label={`${labels[f.slug]}: ${f.desc}`} className={`eco-front group ${on(f.slug)}`} {...ev(f.slug)}>
              <span className="flex items-start justify-between">
                <Ico slug={f.slug} />
                <Arrow />
              </span>
              <span className="eco-name mt-auto block pt-4">{labels[f.slug]}</span>
              <span className="mt-1 block text-[0.86rem] leading-snug text-[#6f6e6b]">{f.desc}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="eco-base">
        <span className="font-display text-[1.5rem] font-medium leading-none tracking-[-0.04em] text-white">
          {c1}
          {cRest.length ? <span className="text-ambar"> {cRest.join(' ')}</span> : null}
        </span>
        <span className="text-[0.86rem] text-[#a4a3a0]">{centerSub}</span>
      </p>
    </div>
  );
}
