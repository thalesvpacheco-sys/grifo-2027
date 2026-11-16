import Link from 'next/link';
import { listDocs } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { BHero, BPage, Object3D, Panel, nn } from '@/components/home/boutique';
import { HButton } from '@/components/home/parts';
import { ObjParallax } from '@/components/home/ObjParallax';

export async function generateMetadata() {
  return buildMetadata({ path: '/especialidades', title: 'Marketing especializado por mercado | Grifo Agency', description: 'Estratégias de marketing para mercado imobiliário, educação, empresas de tecnologia e concessionárias, adaptadas à jornada de compra de cada setor.' });
}

type Spec = { name: string; tagline?: string; hero?: { eyebrow?: string }; fronts?: { items?: { title: string }[] } };
// ritmo dos painéis: o mercado imobiliário (Grifo Core) abre em preto; os demais alternam claro/névoa (o rodapé já fecha em preto)
const TONES = ['ink', 'white', 'mist', 'white'] as const;

export default async function SpecialtiesIndex() {
  const items = await listDocs<Spec>('specialty');
  return (
    <BPage>
      <BHero
        hero={{ eyebrow: 'ESPECIALIDADES', title: 'Entendemos de marketing.\nMas, principalmente, entendemos do seu mercado.', text: 'Cada setor possui uma jornada de compra, uma dinâmica comercial e desafios específicos. Desenvolvemos estratégias adaptadas à realidade de cada negócio.' }}
        crumbs={[{ name: 'Especialidades', path: '/especialidades' }]}
        visual={
          <span className="hm-cluster">
            {items.slice(0, 4).map((s, i) => (
              <Object3D key={s.slug} src={`/home/icone-${s.slug}-lg.webp`} priority={i < 2} delay={i * -1.7} />
            ))}
          </span>
        }
      >
        <nav aria-label="Especialidades nesta página" className="mt-10 flex flex-wrap gap-2 lg:mt-12">
          {items.map((s, i) => (
            <a key={s.slug} href={`#sp-${s.slug}`} className="sp-jump">
              <span className="tabular-nums text-[#81807c]">{nn(i + 1)}</span>
              {s.data.name}
            </a>
          ))}
        </nav>
      </BHero>

      {items.map((s, i) => {
        const tone = TONES[i % TONES.length];
        const dark = tone === 'ink';
        const fronts = (s.data.fronts?.items ?? []).slice(0, 6);
        const flip = i % 2 === 1;
        return (
          <Panel key={s.slug} id={`sp-${s.slug}`} labelledby={`sp-${s.slug}-t`} tone={tone} glow={dark} className="sp-sec">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div className={`lg:col-span-6 ${flip ? 'lg:order-2' : 'lg:order-1'}`} data-reveal>
                <p className="flex items-center gap-3">
                  <span className="hm-kicker">{nn(i + 1)}</span>
                  <span className={`text-sm tabular-nums ${dark ? 'text-[#8f8e8b]' : 'text-[#6f6e6b]'}`}>/ {nn(items.length)}</span>
                </p>
                {s.data.hero?.eyebrow && <p className={`mt-8 font-display text-[0.7rem] font-medium uppercase tracking-[0.2em] ${dark ? 'text-[#a4a3a0]' : 'text-[#6f6e6b]'}`}>{s.data.hero.eyebrow}</p>}
                <h2 id={`sp-${s.slug}-t`} className="sp-name mt-4">{s.data.name}</h2>
                {s.data.tagline && <p className="hm-lead mt-6 max-w-[44ch]">{s.data.tagline}</p>}
                {fronts.length ? (
                  <ol className={`sp-fronts mt-10 ${dark ? 'sp-fronts--dark' : ''}`}>
                    {fronts.map((f, k) => (
                      <li key={f.title}><span aria-hidden="true">{nn(k + 1)}</span>{f.title}</li>
                    ))}
                  </ol>
                ) : null}
                <div className="mt-10 flex flex-wrap gap-3">
                  <HButton href={`/especialidades/${s.slug}`} label="Conhecer a especialidade" variant={dark ? 'white' : 'ink'} track={`especialidades_${s.slug}`} />
                  {s.slug === 'imobiliario' && <HButton href="/grifo-core" label="Grifo Core Assessment" variant={dark ? 'line-dark' : 'line'} track="especialidades_core" />}
                </div>
              </div>
              <Link href={`/especialidades/${s.slug}`} tabIndex={-1} aria-hidden="true" className={`sp-stage ${dark ? 'sp-stage--dark' : ''} order-first lg:col-span-6 ${flip ? 'lg:order-1' : 'lg:order-2'}`}>
                <span className="sp-stage-n" aria-hidden="true">{nn(i + 1)}</span>
                <Object3D src={`/home/icone-${s.slug}-lg.webp`} delay={i * -1.5} className="sp-obj" />
              </Link>
            </div>
          </Panel>
        );
      })}
      <ObjParallax />
    </BPage>
  );
}
