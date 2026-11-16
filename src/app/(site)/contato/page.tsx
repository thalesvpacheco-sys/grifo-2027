import { getDoc } from '@/lib/cms/content';
import { buildMetadata, telHref } from '@/lib/seo';
import { type HeroData } from '@/components/site/blocks';
import { BCrumbs, BPage } from '@/components/home/boutique';
import { HTitle } from '@/components/home/parts';
import { LeadForm } from '@/components/forms/LeadForm';
import { issueFormToken } from '@/lib/leads/service';
import { getSettings } from '@/lib/cms/content';

type C = { hero: HeroData; successTitle?: string; successText?: string; next?: { title: string; text?: string }[] };
type SP = { searchParams: Promise<{ segmento?: string; demanda?: string }> };

export async function generateMetadata() {
  const d = await getDoc<C>('contactPage', 'contato');
  return buildMetadata({ path: '/contato', seo: d?.seo, title: 'Contato' });
}

const SEG = ['imobiliario', 'educacao', 'tecnologia', 'outros'];
const DEM = ['consultoria', 'campanha', 'lancamento', 'producao', 'tech'];

export default async function ContactPage({ searchParams }: SP) {
  const [d, settings, sp] = await Promise.all([getDoc<C>('contactPage', 'contato'), getSettings(), searchParams]);
  const c = d?.data;
  const ct = settings.contact;
  return (
    <BPage>
      <section className="hm-panel hm-panel--hero" aria-labelledby="page-title">
        <div className="hm-in pb-10 pt-[calc(var(--header-h)+34px)] lg:pb-16 lg:pt-[calc(var(--header-h)+48px)]">
          <BCrumbs items={[{ name: 'Contato', path: '/contato' }]} />
          <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="hero-seq">
                {c?.hero.eyebrow ? <p className="hm-pill"><i aria-hidden="true" />{c.hero.eyebrow}</p> : <span />}
                <HTitle as="h1" id="page-title" text={c?.hero.title} className="hm-h1 hm-h1--page mt-7" />
                {c?.hero.text ? <p className="hm-lead mt-8 !text-[#4b4a47]">{c.hero.text}</p> : <span />}
              </div>
              {c?.next?.length ? (
                <ol className="mt-12 space-y-2.5">
                  {c.next.map((n, i) => (
                    <li key={i} className="flex gap-5 rounded-[20px] bg-white/70 p-5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f0f10] font-display text-sm font-medium tabular-nums text-white">{i + 1}</span>
                      <div>
                        <p className="font-display text-lg font-medium tracking-[-0.02em]">{n.title}</p>
                        {n.text && <p className="text-[#6f6e6b]">{n.text}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
              {(ct.email || ct.phone) && (
                <div className="mt-10 space-y-1 border-t border-black/10 pt-8 text-[#4b4a47]">
                  {ct.email && <p><a className="link-underline" href={`mailto:${ct.email}`}>{ct.email}</a></p>}
                  {ct.phone && <p><a className="link-underline" href={telHref(ct.phone)}>{ct.phone}</a></p>}
                </div>
              )}
            </div>
            <div className="lg:col-span-7">
              <div className="hm-formcard p-6 shadow-[0_40px_80px_-50px_rgba(0,0,0,.35)] sm:p-10">
                <h2 className="hm-h3 mb-8">Conte seu desafio</h2>
                <LeadForm
                  token={issueFormToken()}
                  form="contato"
                  defaultSegment={SEG.includes(sp.segmento || '') ? sp.segmento : undefined}
                  defaultDemand={DEM.includes(sp.demanda || '') ? sp.demanda : undefined}
                  successTitle={c?.successTitle}
                  successText={c?.successText}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </BPage>
  );
}
