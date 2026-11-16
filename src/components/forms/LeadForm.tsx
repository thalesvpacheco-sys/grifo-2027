'use client';

import Link from 'next/link';
import { useId, useRef, useState, type FormEvent } from 'react';
import { ASSESSMENT_FIELDS, DEMANDS, SEGMENTS, leadSchema, maskPhoneBR } from '@/lib/leads/schema';
import { readAttribution } from '@/lib/attribution';
import { track } from '@/lib/analytics';

type Status = 'idle' | 'sending' | 'success' | 'error';
type Errors = Partial<Record<string, string>>;

export function LeadForm({
  token,
  form = 'contato',
  defaultSegment,
  defaultDemand,
  successTitle = 'Recebemos sua mensagem.',
  successText = 'Nossa equipe vai retornar em breve.',
  tone = 'light',
  submitLabel = 'Enviar mensagem',
}: {
  token: string;
  form?: 'contato' | 'especialidade' | 'assessment';
  defaultSegment?: string;
  defaultDemand?: string;
  successTitle?: string;
  successText?: string;
  tone?: 'light' | 'dark';
  submitLabel?: string;
}) {
  const uid = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Errors>({});
  const [serverMsg, setServerMsg] = useState('');
  const [phone, setPhone] = useState('');
  const started = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dark = tone === 'dark';

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track('form_start', { form_id: form, page_path: location.pathname });
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;
    const fd = new FormData(e.currentTarget);
    const extra: Record<string, string> = {};
    if (form === 'assessment') for (const f of ASSESSMENT_FIELDS) extra[f.name] = String(fd.get(`extra_${f.name}`) || '');
    const payload = {
      name: String(fd.get('name') || ''),
      company: String(fd.get('company') || ''),
      email: String(fd.get('email') || ''),
      whatsapp: String(fd.get('whatsapp') || ''),
      segment: String(fd.get('segment') || ''),
      demand: String(fd.get('demand') || ''),
      message: String(fd.get('message') || ''),
      consent: fd.get('consent') === 'on' ? true : false,
      form,
      extra,
      page: location.pathname,
      attribution: readAttribution(),
      website: String(fd.get('website') || ''),
      token,
    };

    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      setStatus('idle');
      const first = Object.keys(errs)[0];
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
      return;
    }
    setErrors({});
    setStatus('sending');
    setServerMsg('');
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; fields?: Errors } | null;
      // Sucesso só com resposta válida do servidor.
      if (res.ok && body?.ok === true) {
        setStatus('success');
        track('generate_lead', { form_id: form, segment: payload.segment, demand: payload.demand, page_path: location.pathname });
        requestAnimationFrame(() => successRef.current?.focus());
        return;
      }
      if (body?.fields) setErrors(body.fields);
      setServerMsg(body?.error || 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.');
      setStatus('error');
    } catch {
      setServerMsg('Não foi possível enviar agora. Verifique sua conexão e tente novamente.');
      setStatus('error');
    }
  }

  if (status === 'success')
    return (
      <div ref={successRef} tabIndex={-1} role="status" className={`rounded-[24px] p-8 outline-none sm:p-10 ${dark ? 'bg-[#18181a] text-white ring-1 ring-white/10' : 'bg-[#f4f3f0] text-[#0f0f10]'}`}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ambar text-grafite" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-7 w-7"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h3 className="mt-6 font-display text-h3 font-medium tracking-[-0.03em]">{successTitle}</h3>
        <p className={`mt-3 text-lead ${dark ? 'text-white/75' : 'text-grafite/70'}`}>{successText}</p>
      </div>
    );

  const lbl = `field-label ${dark ? '!text-white/90' : ''}`;
  const err = (k: string) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className={`field-error ${dark ? '!text-[#ffb4b4]' : ''}`}>
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: string) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `${uid}-${k}-err` : undefined });

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} onFocus={onStart} aria-busy={status === 'sending'} className={dark ? '' : 'on-light'}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className={lbl}>Nome</label>
          <input id={`${uid}-name`} name="name" autoComplete="name" required maxLength={120} className="field" {...aria('name')} />
          {err('name')}
        </div>
        <div>
          <label htmlFor={`${uid}-company`} className={lbl}>Empresa</label>
          <input id={`${uid}-company`} name="company" autoComplete="organization" required maxLength={160} className="field" {...aria('company')} />
          {err('company')}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className={lbl}>E-mail</label>
          <input id={`${uid}-email`} name="email" type="email" inputMode="email" autoComplete="email" required maxLength={160} className="field" {...aria('email')} />
          {err('email')}
        </div>
        <div>
          <label htmlFor={`${uid}-whatsapp`} className={lbl}>WhatsApp</label>
          <input
            id={`${uid}-whatsapp`}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            required
            value={phone}
            onChange={(e) => setPhone(maskPhoneBR(e.target.value))}
            className="field"
            {...aria('whatsapp')}
          />
          {err('whatsapp')}
        </div>
        <div>
          <label htmlFor={`${uid}-segment`} className={lbl}>Segmento</label>
          <select id={`${uid}-segment`} name="segment" required defaultValue={defaultSegment || ''} className="field field-select" {...aria('segment')}>
            <option value="" disabled>Selecione</option>
            {SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {err('segment')}
        </div>
        <div>
          <label htmlFor={`${uid}-demand`} className={lbl}>Tipo de demanda</label>
          <select id={`${uid}-demand`} name="demand" required defaultValue={defaultDemand || ''} className="field field-select" {...aria('demand')}>
            <option value="" disabled>Selecione</option>
            {DEMANDS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {err('demand')}
        </div>

        {form === 'assessment' && (
          <fieldset className="grid gap-5 sm:col-span-2 sm:grid-cols-2">
            <legend className={`mb-1 font-display text-lg font-semibold ${dark ? 'text-white' : ''}`}>Sobre o empreendimento <span className={`text-sm font-normal ${dark ? 'text-[#a4a3a0]' : 'text-[#6f6e6b]'}`}>(opcional)</span></legend>
            {ASSESSMENT_FIELDS.map((f) => (
              <div key={f.name}>
                <label htmlFor={`${uid}-x-${f.name}`} className={lbl}>{f.label}</label>
                <input id={`${uid}-x-${f.name}`} name={`extra_${f.name}`} maxLength={200} className="field" />
              </div>
            ))}
          </fieldset>
        )}

        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-message`} className={lbl}>
            Mensagem <span className={`font-normal ${dark ? 'text-[#a4a3a0]' : 'text-[#6f6e6b]'}`}>(opcional)</span>
          </label>
          <textarea id={`${uid}-message`} name="message" rows={4} maxLength={3000} className="field resize-y" placeholder="Conte brevemente seu desafio." {...aria('message')} />
          {err('message')}
        </div>

        {/* Honeypot: invisível para pessoas, preenchido por robôs */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${uid}-website`}>Não preencha este campo</label>
          <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="sm:col-span-2">
          <label className={`flex cursor-pointer items-start gap-3 text-[0.95rem] leading-relaxed ${dark ? 'text-white/80' : 'text-grafite/80'}`}>
            <input type="checkbox" name="consent" required className={`mt-1 h-5 w-5 shrink-0 ${dark ? "accent-[#e5a12e]" : "accent-[#0f0f10]"}`} {...aria('consent')} />
            <span>
              Concordo com o tratamento dos meus dados para contato comercial, conforme a{' '}
              <Link href="/politica-de-privacidade" target="_blank" className={`font-semibold underline underline-offset-2 ${dark ? 'text-ambar' : 'text-vinho'}`}>
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          {err('consent')}
        </div>
      </div>

      {status === 'error' && serverMsg && (
        <p role="alert" className={`mt-6 rounded-xl px-4 py-3 text-sm font-medium ${dark ? 'bg-[#5a1414] text-white' : 'bg-[#fbeaea] text-vinho'}`}>
          {serverMsg}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" className={`hm-btn ${dark ? 'hm-btn--white' : 'hm-btn--ink'} min-w-[220px] justify-between disabled:opacity-70`} disabled={status === 'sending'}>
          <span>{status === 'sending' ? 'Enviando…' : submitLabel}</span>
          <span className="hm-btn-ico" aria-hidden="true">
            {status === 'sending' ? (
              <span className={`h-4 w-4 animate-spin rounded-full border-2 ${dark ? 'border-white/30 border-t-white' : 'border-[#0f0f10]/25 border-t-[#0f0f10]'}`} />
            ) : (
              <svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </span>
        </button>
        <p className={`text-sm ${dark ? 'text-white/55' : 'text-grafite/70'}`}>Seus dados são tratados conforme a LGPD.</p>
      </div>
    </form>
  );
}
