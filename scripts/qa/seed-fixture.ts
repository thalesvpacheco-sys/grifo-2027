/**
 * Fixture de TESTE do Case Study Studio (nunca usar em produção).
 * Grava um case pendente "qa-fixture-blocos" passando pela MESMA sanitização do painel (sanitizeFields),
 * com todos os tipos de bloco, tentativas de XSS e dados que precisam ser ocultados.
 * Uso: DATA_DIR=<pasta do banco de teste> node --experimental-strip-types scripts/qa/seed-fixture.ts
 */
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { getDocType } from '../../src/lib/cms/schema.ts';
import { sanitizeFields } from '../../src/lib/cms/validate.ts';

const dir = process.env.DATA_DIR;
if (!dir) throw new Error('DATA_DIR obrigatório');
const db = new DatabaseSync(path.join(dir, 'grifo.db'));
const T = 'Texto de teste automatizado.';
const img = (src: string, alt: string) => ({ src, alt });
const raw = {
  title: 'QA · Fixture de blocos',
  client: 'Fixture de teste',
  sector: 'concessionarias',
  competencies: ['marketing', 'studios'],
  year: '',
  summary: 'Fixture usado pelos testes automatizados do Case Study Studio.',
  cover: img('/acervo/marca-capa.webp', 'Capa de teste'),
  context: `${T} Contexto.`,
  challenge: `${T} Desafio.\n\n<script>window.__xss=1</script>\n\n[link perigoso](javascript:alert(1))`,
  strategy: '',
  execution: `${T} Execução.`,
  results: '',
  gallery: [{ image: img('/acervo/marca-papelaria.webp', 'Galeria legada'), caption: 'Legado' }],
  credits: ['Crédito de teste'],
  featured: false,
  layout: 'automotivo',
  heroMedia: { video: { src: '', poster: '' }, poster: { src: '', alt: '' } },
  blocks: [
    { type: 'fullBleedMedia', image: img('/acervo/marca-cores.webp', 'Tela cheia de teste'), ratio: '21:9', title: 'Bloco tela cheia' },
    { type: 'chapter', chapter: 'context', title: 'Capítulo posicionado' },
    { type: 'editorialSplit', title: 'Bloco editorial', text: `${T} **negrito**`, image: img('/acervo/marca-submarcas.webp', 'Editorial de teste'), imageSide: 'left' },
    { type: 'strategyDiagram', title: 'Diagrama de teste', steps: [{ label: 'Problema', text: 'A' }, { label: 'Insight', text: 'B' }, { label: 'Conceito', text: 'C' }] },
    { type: 'campaignRollout', title: 'Desdobramento de teste', gallery: 'grid', items: [
      { image: img('/acervo/marca-consulting.webp', 'Peça 1'), channel: 'Outdoor', title: 'Peça 1', ratio: '21:9' },
      { image: img('/acervo/marca-marketing.webp', 'Peça 2'), channel: 'Outdoor', title: 'Peça 2' },
      { image: img('/acervo/marca-studios.webp', 'Peça 3'), channel: 'Feed', title: 'Peça 3', ratio: '4:5' },
      { image: img('/acervo/marca-tech.webp', 'Peça 4'), channel: 'Stories', title: 'Peça 4', ratio: '9:16' },
    ] },
    { type: 'imageGallery', gallery: 'mosaic', items: [
      { image: img('/acervo/marca-camisetas.webp', 'Mosaico 1') },
      { image: img('/acervo/marca-cracha-polo.webp', 'Mosaico 2') },
      { image: img('/acervo/case-aero.webp', 'Arquivo em baixa resolução') },
    ] },
    { type: 'motionAsset', title: 'Motion de teste', video: { src: '/video/logo-animada.mp4', poster: '/video/logo-animada-poster.jpg' }, ratio: '16:9' },
    { type: 'video', title: 'Vídeo de teste', video: { src: '/video/nova-grifo.mp4', poster: '/video/nova-grifo-poster.jpg' } },
    { type: 'video', title: 'Vídeo com origem proibida', video: { src: 'javascript:alert(1)', poster: '' } },
    { type: 'quote', quote: 'Citação sem fonte não pode aparecer.', source: '' },
    { type: 'quote', quote: 'Citação de teste com fonte.', source: 'Pessoa de Teste, Cargo de Teste' },
    { type: 'metrics', title: 'Indicadores de teste', metrics: [{ value: '999', label: 'não verificado', source: 'x', verified: false }, { value: '42', label: 'verificado', source: 'Relatório de teste', verified: true }] },
    { type: 'textChapter', title: 'Bloco oculto', text: 'Este bloco não pode aparecer.', hidden: true },
    { type: 'credits', credits: ['Crédito do bloco'] },
    { type: 'tipoInexistente', title: 'Bloco de tipo inválido' },
  ],
};
const data = sanitizeFields(getDocType('case')!.fields, raw);
const json = JSON.stringify(data);
const t = Date.now();
db.prepare("DELETE FROM documents WHERE type='case' AND slug='qa-fixture-blocos'").run();
db.prepare(`INSERT INTO documents (type, slug, title, draft, published, draft_seo, published_seo, placeholder, sort, created_at, updated_at, published_at) VALUES ('case', 'qa-fixture-blocos', ?, ?, ?, '{}', '{}', 1, 999, ?, ?, ?)`).run(raw.title, json, json, t, t, t);
const back = JSON.parse(json);
console.log('fixture gravado; blocos:', back.blocks.length, '| tipo inválido sanitizado para:', JSON.stringify(back.blocks.at(-1).type), '| vídeo proibido:', JSON.stringify(back.blocks[8].video.src));
