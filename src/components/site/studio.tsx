import Image from 'next/image';
import Link from 'next/link';
import type { Cta } from '@/lib/cms/content';
import type { SizedImg } from '@/lib/media-meta';
import { Duo, PlaceholderFlag } from '../ui/Duo';
import { CtaLink } from '../ui/ButtonLink';
import { Wing } from '../brand/Logo';

/* Componentes do sistema visual 2027 ("A marca em movimento"). Sem hooks: usáveis em Server e Client Components. */

export const RATIO: Record<string, string> = {
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '9:16': 'aspect-[9/16]',
  '16:10': 'aspect-[16/10]',
  '8:7': 'aspect-[8/7]',
};

/**
 * Quadro de mídia que respeita o arquivo:
 *  - arte em boa resolução → preenche o quadro (object-cover) com zoom contido no hover;
 *  - arquivo em baixa resolução → tamanho real, centralizado num quadro neutro (nunca ampliado);
 *  - sem arquivo → espaço identificado como pendente.
 */
export function Frame({
  img,
  ratio,
  sizes,
  priority = false,
  className = '',
  contain = false,
  showFlags = false,
}: {
  img?: SizedImg;
  ratio?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  contain?: boolean;
  showFlags?: boolean;
}) {
  let aspect = ratio && RATIO[ratio] ? RATIO[ratio] : '';
  // Se o quadro pedido cortaria demais a peça (KV horizontal num quadro vertical, p.ex.), usa a proporção do arquivo.
  if (aspect && img?.w && img?.h && !img.lowres) {
    const [a, b] = (ratio as string).split(':').map(Number);
    const target = a / b, natural = img.w / img.h;
    if (Math.abs(natural - target) / Math.min(natural, target) > 0.45) aspect = '';
  }
  const style = !aspect && img?.w && img?.h ? { aspectRatio: `${img.w} / ${img.h}` } : undefined;
  if (!img?.src)
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-grafite-800 ${aspect || 'aspect-[4/3]'} ${className}`} role="img" aria-label="Imagem pendente">
        <Wing className="h-10 w-16 text-white/10" />
        <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/60">Imagem pendente</span>
      </div>
    );
  if (img.lowres && img.w && img.h)
    return (
      <div className={`lowres-frame relative isolate flex items-center justify-center overflow-hidden p-6 ${aspect || 'aspect-[4/3]'} ${className}`}>
        {/* Ambiência: a própria peça, desfocada, tinge o quadro. A peça em si aparece no tamanho real (nunca ampliada). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt="" aria-hidden="true" loading={priority ? 'eager' : 'lazy'} decoding="async" className="lowres-ambient" />
        <Image src={img.src} alt={img.alt || ''} width={img.w} height={img.h} sizes={`${img.w}px`} priority={priority} className="relative h-auto max-h-full w-auto max-w-full rounded-[6px] object-contain shadow-[0_30px_60px_-24px_rgba(0,0,0,.85)] ring-1 ring-white/10" />
        {showFlags && (
          <span className="absolute bottom-3 left-3">
            <PlaceholderFlag>Arquivo em baixa resolução — aguardando original</PlaceholderFlag>
          </span>
        )}
      </div>
    );
  return (
    <div className={`media-zoom relative overflow-hidden bg-grafite-800 ${aspect} ${className}`} style={style}>
      <Image src={img.src} alt={img.alt || ''} fill sizes={sizes} priority={priority} className={contain ? 'object-contain' : 'object-cover'} />
    </div>
  );
}

/** Numeração de capítulo (apenas números: nenhum texto novo é introduzido). */
export function ChapterLabel({ n, total, tone = 'light', className = '' }: { n: number; total?: number; tone?: 'light' | 'dark'; className?: string }) {
  return (
    <p aria-hidden="true" className={`chapter ${tone === 'dark' ? 'text-ambar' : 'text-vinho'} ${className}`}>
      {String(n).padStart(2, '0')}
      {total ? <span className="opacity-50">/ {String(total).padStart(2, '0')}</span> : null}
    </p>
  );
}

/** Cabeçalho editorial: título em grande escala e texto deslocado em coluna estreita. */
export function EditorialHead({
  title,
  text,
  id,
  n,
  tone = 'light',
  size = 'h1',
  children,
}: {
  title?: string;
  text?: string;
  id?: string;
  n?: number;
  tone?: 'light' | 'dark';
  size?: 'h1' | 'h2' | 'mega';
  children?: React.ReactNode;
}) {
  if (!title && !text) return null;
  const dark = tone === 'dark';
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
      <div className="lg:col-span-9" data-reveal>
        {n ? <ChapterLabel n={n} tone={tone} className="mb-8" /> : <span className="bar mb-8" aria-hidden="true" />}
        <Duo id={id} text={title} className={`${size === 'mega' ? 'text-mega' : size === 'h2' ? 'text-h2' : 'text-h1'} ${dark ? 'text-white' : 'text-grafite'}`} />
      </div>
      {(text || children) && (
        <div className="lg:col-span-5 lg:col-start-8" data-reveal>
          {text && <p className={`text-lead ${dark ? 'text-white/70' : 'text-grafite/70'}`}>{text}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

/** Índice editorial das especialidades (linhas tipográficas grandes, não cards). */
export function SpecialtyIndex(props: { items: { slug: string; name: string; tagline?: string }[]; tone?: 'light' | 'dark'; linkLabel?: string }) {
  return <EditorialIndex {...props} base="/especialidades" />;
}

/** Índice editorial genérico (especialidades, frentes do ecossistema). */
export function EditorialIndex({ items, tone = 'light', linkLabel, base, prefix = '' }: { items: { slug: string; name: string; tagline?: string }[]; tone?: 'light' | 'dark'; linkLabel?: string; base: string; prefix?: string }) {
  const dark = tone === 'dark';
  return (
    <ul className={`border-t ${dark ? 'border-white/15' : 'border-grafite/15'}`} data-reveal>
      {items.map((s, i) => (
        <li key={s.slug} data-stagger style={{ ['--i' as string]: i }} className={`border-b ${dark ? 'border-white/15' : 'border-grafite/15'}`}>
          <Link href={`${base}/${s.slug}`} className="group relative isolate grid grid-cols-[auto_1fr_auto] items-center gap-x-5 overflow-hidden py-7 sm:gap-x-10 sm:py-9 lg:grid-cols-[90px_minmax(0,1.1fr)_minmax(0,1fr)_60px]">
            <span aria-hidden="true" className="absolute inset-0 -z-10 origin-left scale-x-0 bg-vinho transition-transform duration-700 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
            <span aria-hidden="true" className={`font-display text-sm font-semibold tabular-nums transition-colors group-hover:text-ambar ${dark ? 'text-white/45' : 'text-grafite/70'}`}>{String(i + 1).padStart(2, '0')}</span>
            <span className={`font-display text-[clamp(1.8rem,4.6vw,4rem)] font-bold leading-[1] tracking-[-0.03em] transition-[color,transform] duration-500 group-hover:translate-x-2 group-hover:text-white ${dark ? 'text-white' : 'text-grafite'}`}>{prefix}{s.name}</span>
            <span className={`col-span-3 mt-3 max-w-md leading-relaxed transition-colors group-hover:text-white/80 lg:col-span-1 lg:mt-0 ${dark ? 'text-white/65' : 'text-grafite/65'}`}>
              {s.tagline}
              {linkLabel && <span className="sr-only"> — {linkLabel}</span>}
            </span>
            <span aria-hidden="true" className="col-start-3 row-start-1 justify-self-end lg:col-start-4">
              <Wing className={`h-4 w-7 transition-all duration-500 group-hover:translate-x-1 group-hover:text-ambar ${dark ? 'text-white/30' : 'text-grafite/30'}`} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Sequência real (processo): linha que se desenha, numerais vazados e etapas. */
export function ProcessLine({ steps }: { steps?: { title: string; text?: string }[] }) {
  if (!steps?.length) return null;
  return (
    <div data-reveal className="relative">
      <span data-reveal="line" aria-hidden="true" className="absolute left-0 right-0 top-[3.1rem] hidden h-px bg-vinho/30 md:block" />
      <ol className="grid gap-10 md:grid-cols-5 md:gap-6">
        {steps.map((s, i) => (
          <li key={i} data-stagger style={{ ['--i' as string]: i }} className="relative grid grid-cols-[84px_1fr] items-start gap-4 md:block">
            <span aria-hidden="true" className="outline-num relative block bg-[#fbfaf7] pr-3 font-display text-[clamp(3.4rem,5.6vw,5.4rem)] font-extrabold leading-none tracking-[-0.04em] text-vinho md:inline-block">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="md:mt-6">
              <h3 className="font-display text-2xl font-bold">{s.title}</h3>
              {s.text && <p className="mt-1.5 text-grafite/65">{s.text}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Momento final da marca: superfície clara (diferente do hero escuro), título em grande escala
 * e as três faixas da asa entrando pela direita.
 */
export function StudioFinal({ data, track = 'final', tone = 'paper' }: { data?: { title?: string; text?: string; cta?: Cta }; track?: string; tone?: 'paper' | 'vinho' }) {
  if (!data?.title) return null;
  const v = tone === 'vinho';
  return (
    <section className={`relative isolate overflow-hidden py-28 sm:py-40 ${v ? 'surface-vinho text-white' : 'surface-paper text-grafite'}`} aria-labelledby={`${track}-title`}>
      <div aria-hidden="true" data-reveal className="pointer-events-none absolute -right-[6vw] top-1/2 -z-10 hidden w-[46vw] max-w-[760px] -translate-y-1/2 flex-col gap-[1.6vw] md:flex">
        <span className={`sweep block h-[4.2vw] max-h-[70px] rounded-l-full ${v ? 'bg-ambar/80' : 'bg-vinho'}`} />
        <span className={`sweep ml-[12%] block h-[4.2vw] max-h-[70px] rounded-l-full ${v ? 'bg-ambar/55' : 'bg-vinho/80'}`} />
        <span className={`sweep ml-[24%] block h-[4.2vw] max-h-[70px] rounded-l-full ${v ? 'bg-ambar/35' : 'bg-ambar'}`} />
      </div>
      <div className="wrap">
        <div className="max-w-[min(100%,58rem)] md:max-w-[62%]" data-reveal>
          <Duo id={`${track}-title`} text={data.title} className={`text-mega ${v ? 'text-white' : 'text-grafite'}`} />
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-12" data-reveal>
          {data.text && <p className={`text-lead md:col-span-5 ${v ? 'text-white/80' : 'text-grafite/70'}`}>{data.text}</p>}
          <div className="flex items-end md:col-span-6 md:col-start-7 md:justify-end lg:col-span-5 lg:col-start-6 lg:justify-start">
            <CtaLink cta={data.cta} variant={v ? 'primary' : 'vinho'} track={track} className="min-h-[56px] px-8 text-[1.05rem]" />
          </div>
        </div>
      </div>
    </section>
  );
}
