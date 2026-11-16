import { z } from 'zod';

// Sem compilação JIT do zod: evita a sondagem `Function('')`, bloqueada (corretamente) pela CSP sem 'unsafe-eval'.
z.config({ jitless: true });

export const SEGMENTS = [
  { value: 'imobiliario', label: 'Imobiliário' },
  { value: 'educacao', label: 'Educação' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'concessionarias', label: 'Concessionárias' },
  { value: 'outros', label: 'Outro' },
] as const;

export const DEMANDS = [
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'campanha', label: 'Campanha' },
  { value: 'lancamento', label: 'Lançamento' },
  { value: 'producao', label: 'Produção' },
  { value: 'tech', label: 'Tech' },
] as const;

const clean = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim())
    .pipe(z.string().max(max, `Máximo de ${max} caracteres.`));

export const phoneDigits = (s: string) => s.replace(/\D/g, '');

/** Validação compartilhada (cliente para feedback imediato; servidor como fonte de verdade). */
export const leadSchema = z.object({
  name: clean(120).pipe(z.string().min(2, 'Informe seu nome.')),
  company: clean(160).pipe(z.string().min(2, 'Informe a empresa.')),
  email: clean(160).pipe(z.string().regex(/^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/, 'Informe um e-mail válido.')),
  whatsapp: clean(30).refine((s) => {
    const d = phoneDigits(s).replace(/^55(?=\d{10,11}$)/, '');
    return /^[1-9]{2}9?\d{8}$/.test(d);
  }, 'Informe um WhatsApp válido com DDD.'),
  segment: z.enum(['imobiliario', 'educacao', 'tecnologia', 'concessionarias', 'outros'], { message: 'Selecione o segmento.' }),
  demand: z.enum(['consultoria', 'campanha', 'lancamento', 'producao', 'tech'], { message: 'Selecione o tipo de demanda.' }),
  message: clean(3000).optional().default(''),
  consent: z.literal(true, { message: 'É preciso concordar com a Política de Privacidade.' }),
  form: z.enum(['contato', 'especialidade', 'assessment']).default('contato'),
  extra: z.record(z.string().max(40), clean(200)).optional().default({}),
  page: clean(300).optional().default(''),
  attribution: z
    .object({
      utm_source: clean(120).optional(),
      utm_medium: clean(120).optional(),
      utm_campaign: clean(120).optional(),
      utm_content: clean(120).optional(),
      utm_term: clean(120).optional(),
      landing_page: clean(500).optional(),
      referrer: clean(500).optional(),
      first_seen: clean(40).optional(),
    })
    .optional()
    .default({}),
  // Antispam
  website: z.string().max(0).optional().default(''), // honeypot: precisa vir vazio
  token: z.string().max(200),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const ASSESSMENT_FIELDS = [
  { name: 'empreendimento', label: 'Empreendimento e cidade' },
  { name: 'vgv', label: 'VGV estimado' },
  { name: 'unidades', label: 'Número de unidades' },
  { name: 'ticket', label: 'Ticket médio' },
  { name: 'prazo', label: 'Previsão de lançamento' },
  { name: 'verba', label: 'Verba de marketing prevista' },
  { name: 'crm', label: 'CRM utilizado' },
] as const;

export function maskPhoneBR(v: string): string {
  const d = phoneDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
