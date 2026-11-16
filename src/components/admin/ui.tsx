import Link from 'next/link';

export function PageTitle({ title, desc, actions }: { title: string; desc?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {desc && <p className="mt-1.5 max-w-2xl text-grafite/60">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '', title, action }: { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }) {
  return (
    <section className={`rounded-2xl bg-white p-5 ring-1 ring-grafite/[.08] sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const STATUS: Record<string, string> = {
  publicado: 'bg-[#e7f4ec] text-[#1f6b43]',
  rascunho: 'bg-grafite/[.07] text-grafite/70',
  alterado: 'bg-[#fff3dc] text-[#8a5a00]',
  novo: 'bg-[#fff3dc] text-[#8a5a00]',
  em_atendimento: 'bg-[#e8eefc] text-[#2a4a9a]',
  qualificado: 'bg-[#efe7fb] text-[#5b2c9a]',
  convertido: 'bg-[#e7f4ec] text-[#1f6b43]',
  descartado: 'bg-grafite/[.07] text-grafite/60',
  enviado: 'bg-[#e7f4ec] text-[#1f6b43]',
  falhou: 'bg-[#fbeaea] text-vinho',
  pendente: 'bg-grafite/[.07] text-grafite/70',
  desativado: 'bg-grafite/[.07] text-grafite/50',
};
const LABEL: Record<string, string> = { alterado: 'alterações não publicadas', em_atendimento: 'em atendimento' };

export function Badge({ status, children }: { status: string; children?: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[status] ?? STATUS.rascunho}`}>{children ?? LABEL[status] ?? status}</span>;
}

export function Empty({ title, text, href, cta }: { title: string; text?: string; href?: string; cta?: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-grafite/15 p-10 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      {text && <p className="mt-1 text-grafite/60">{text}</p>}
      {href && cta && <Link href={href} className="btn btn-vinho mt-5 min-h-[42px] px-5 text-sm">{cta}</Link>}
    </div>
  );
}

export const fmtDateTime = (t: number) => new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
