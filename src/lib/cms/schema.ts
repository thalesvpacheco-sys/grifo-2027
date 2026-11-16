/**
 * Registro de tipos de conteúdo do CMS.
 * O painel administrativo gera formulários automaticamente a partir destas definições,
 * e o site lê os mesmos campos. Para criar um novo campo, adicione-o aqui e use-o no template.
 */

/**
 * `showWhen`: exibe o campo no painel somente quando outro campo do MESMO nível tem um dos valores indicados
 * (usado nos blocos de case, onde cada tipo de bloco usa só alguns campos). Não afeta a validação.
 */
type Conditional = { showWhen?: { field: string; equals: string[] } };

export type Field = Conditional & (
  | { kind: 'text'; name: string; label: string; help?: string; required?: boolean; max?: number; placeholder?: string }
  | { kind: 'textarea'; name: string; label: string; help?: string; required?: boolean; max?: number; rows?: number }
  | { kind: 'markdown'; name: string; label: string; help?: string; required?: boolean }
  | { kind: 'image'; name: string; label: string; help?: string }
  | { kind: 'video'; name: string; label: string; help?: string }
  | { kind: 'url'; name: string; label: string; help?: string; placeholder?: string }
  | { kind: 'number'; name: string; label: string; help?: string }
  | { kind: 'date'; name: string; label: string; help?: string }
  | { kind: 'boolean'; name: string; label: string; help?: string }
  | { kind: 'select'; name: string; label: string; options: { value: string; label: string }[]; help?: string; required?: boolean }
  | { kind: 'multiselect'; name: string; label: string; options: { value: string; label: string }[]; help?: string }
  | { kind: 'tags'; name: string; label: string; help?: string }
  | { kind: 'cta'; name: string; label: string; help?: string }
  | { kind: 'reference'; name: string; label: string; to: string; multiple?: boolean; help?: string }
  | { kind: 'group'; name: string; label: string; fields: Field[]; help?: string; collapsed?: boolean }
  | { kind: 'list'; name: string; label: string; fields: Field[]; itemLabel?: string; help?: string; max?: number }
);

export type DocType = {
  type: string;
  label: string;
  plural: string;
  /** singleton: documentos fixos (slugs pré-definidos), sem criar/excluir. */
  singleton?: boolean;
  /** Rota pública. Use {slug} para documentos múltiplos. */
  route?: string;
  icon: string;
  group: 'Páginas' | 'Conteúdo' | 'Estrutura' | 'Sistema';
  description: string;
  fields: Field[];
  /** Campo usado como título na listagem. */
  titleField?: string;
  hasSeo?: boolean;
};

export const SECTORS = [
  { value: 'imobiliario', label: 'Mercado Imobiliário' },
  { value: 'educacao', label: 'Educação' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'concessionarias', label: 'Concessionárias' },
  { value: 'outros', label: 'Outros segmentos' },
];

/** Setores com especialidade própria (exclui "Outros"). Usado no seletor MICCA. */
export const SPECIALTY_SECTORS = SECTORS.filter((s) => s.value !== 'outros');

export const COMPETENCIES = [
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'studios', label: 'Studios' },
  { value: 'tech', label: 'Tech' },
];

export const ARTICLE_CATEGORIES = [
  { value: 'publicidade', label: 'Mundo da Publicidade' },
  { value: 'imobiliario', label: 'Marketing Imobiliário' },
  { value: 'estrategia', label: 'Marketing de Estratégia' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'educacao', label: 'Educação' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'micca', label: 'MICCA' },
];

const t = (name: string, label: string, extra: Partial<Extract<Field, { kind: 'text' }>> = {}): Field => ({ kind: 'text', name, label, ...extra });
const ta = (name: string, label: string, extra: Partial<Extract<Field, { kind: 'textarea' }>> = {}): Field => ({ kind: 'textarea', name, label, ...extra });
const cta = (name: string, label: string, help?: string): Field => ({ kind: 'cta', name, label, help });
const items = (name: string, label: string, itemLabel = 'Item', fields?: Field[]): Field => ({
  kind: 'list',
  name,
  label,
  itemLabel,
  fields: fields ?? [t('title', 'Título', { required: true }), ta('text', 'Descrição', { rows: 2 })],
});
const hero = (help?: string): Field => ({
  kind: 'group',
  name: 'hero',
  label: 'Topo da página (hero)',
  help,
  fields: [t('eyebrow', 'Sobretítulo', { help: 'Linha curta acima do título.' }), ta('title', 'Título principal (H1)', { required: true, rows: 2, help: 'Use uma quebra de linha para separar a frase de destaque (negrito) da complementar (leve).' }), ta('text', 'Texto de apoio', { rows: 3 }), cta('cta', 'Botão principal'), cta('cta2', 'Botão secundário')],
});
const section = (name: string, label: string, more: Field[] = []): Field => ({
  kind: 'group',
  name,
  label,
  fields: [ta('title', 'Título (H2)', { rows: 2 }), ta('text', 'Texto', { rows: 4 }), ...more],
});
const MICCA_LIST: Field = {
  kind: 'list',
  name: 'items',
  label: 'Aplicação por pilar',
  itemLabel: 'Pilar',
  max: 5,
  fields: [
    { kind: 'select', name: 'pillar', label: 'Pilar', options: ['Meta', 'Investimento', 'Conteúdo', 'Canais', 'Atendimento'].map((v) => ({ value: v, label: v })) },
    ta('text', 'Pergunta / aplicação', { rows: 2 }),
  ],
};

/* ───────── Case Study Studio: tipos de bloco ───────── */
export const CASE_LAYOUTS = [
  { value: '', label: 'Automático (pelo setor)' },
  { value: 'imobiliario', label: 'Imobiliário — conceito, jornada de lançamento, peças e mídia' },
  { value: 'educacao', label: 'Educação — campanha institucional e peças por curso' },
  { value: 'automotivo', label: 'Automotivo — KV, desdobramentos e peças de campanha' },
  { value: 'branding', label: 'Branding — identidade e aplicações' },
  { value: 'editorial', label: 'Editorial — texto e imagem em equilíbrio' },
];

export const CASE_BLOCK_TYPES = [
  { value: 'chapter', label: 'Capítulo do case (campo existente)' },
  { value: 'textChapter', label: 'Capítulo de texto' },
  { value: 'editorialSplit', label: 'Texto + imagem (editorial)' },
  { value: 'fullBleedMedia', label: 'Imagem ou vídeo em tela cheia' },
  { value: 'imageGallery', label: 'Galeria' },
  { value: 'video', label: 'Vídeo (com som, sob demanda)' },
  { value: 'motionAsset', label: 'Motion (vídeo curto em loop, sem som)' },
  { value: 'strategyDiagram', label: 'Diagrama de estratégia' },
  { value: 'campaignRollout', label: 'Desdobramento da campanha (peças por formato/canal)' },
  { value: 'quote', label: 'Citação (com fonte)' },
  { value: 'metrics', label: 'Indicadores (somente verificados)' },
  { value: 'credits', label: 'Créditos' },
  { value: 'relatedProjects', label: 'Projetos relacionados' },
  { value: 'nextProject', label: 'Próximo projeto' },
];

export const CASE_CHAPTERS = [
  { value: 'context', label: 'Contexto' },
  { value: 'challenge', label: 'Desafio' },
  { value: 'strategy', label: 'Estratégia' },
  { value: 'execution', label: 'Execução' },
  { value: 'results', label: 'Resultados' },
  { value: 'gallery', label: 'Galeria' },
];

export const MEDIA_RATIOS = [
  { value: '', label: 'Original / automático' },
  { value: '16:9', label: '16:9 (horizontal)' },
  { value: '21:9', label: '21:9 (panorâmico)' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1 (feed quadrado)' },
  { value: '4:5', label: '4:5 (feed vertical)' },
  { value: '9:16', label: '9:16 (stories / reels)' },
];

const when = (...types: string[]) => ({ showWhen: { field: 'type', equals: types } });
const MEDIA_ITEM: Field[] = [
  { kind: 'image', name: 'image', label: 'Imagem' },
  { kind: 'video', name: 'video', label: 'Vídeo curto (opcional, substitui a imagem)' },
  t('title', 'Título / peça', { help: 'Ex.: Outdoor, Feed, Landing page.' }),
  t('channel', 'Formato ou canal'),
  t('caption', 'Legenda'),
  { kind: 'select', name: 'ratio', label: 'Proporção', options: MEDIA_RATIOS, help: 'A imagem nunca é distorcida; a proporção define o quadro.' },
];

export const CASE_BLOCK_FIELDS: Field[] = [
  { kind: 'select', name: 'type', label: 'Tipo de bloco', options: CASE_BLOCK_TYPES, required: true },
  { kind: 'boolean', name: 'hidden', label: 'Ocultar este bloco no site' },
  { kind: 'select', name: 'chapter', label: 'Capítulo', options: CASE_CHAPTERS, ...when('chapter') },
  { ...t('eyebrow', 'Sobretítulo'), ...when('textChapter', 'editorialSplit', 'fullBleedMedia', 'imageGallery', 'video', 'motionAsset', 'strategyDiagram', 'campaignRollout', 'metrics') },
  { ...ta('title', 'Título', { rows: 2 }), ...when('chapter', 'textChapter', 'editorialSplit', 'fullBleedMedia', 'imageGallery', 'video', 'motionAsset', 'strategyDiagram', 'campaignRollout', 'metrics', 'credits', 'relatedProjects') },
  { kind: 'markdown', name: 'text', label: 'Texto', ...when('textChapter', 'editorialSplit', 'strategyDiagram', 'campaignRollout') },
  { kind: 'image', name: 'image', label: 'Imagem', ...when('editorialSplit', 'fullBleedMedia') },
  { kind: 'video', name: 'video', label: 'Vídeo', ...when('fullBleedMedia', 'video', 'motionAsset') },
  { kind: 'image', name: 'poster', label: 'Quadro de capa do vídeo', ...when('video', 'motionAsset') },
  { kind: 'select', name: 'ratio', label: 'Proporção', options: MEDIA_RATIOS, ...when('editorialSplit', 'fullBleedMedia', 'video', 'motionAsset') },
  { kind: 'select', name: 'imageSide', label: 'Lado da imagem', options: [{ value: 'right', label: 'Direita' }, { value: 'left', label: 'Esquerda' }], ...when('editorialSplit') },
  { kind: 'select', name: 'gallery', label: 'Composição', options: [{ value: 'mosaic', label: 'Mosaico assimétrico' }, { value: 'grid', label: 'Grade regular' }, { value: 'sequence', label: 'Sequência horizontal' }, { value: 'stack', label: 'Coluna única (peças grandes)' }], ...when('imageGallery', 'campaignRollout') },
  { kind: 'list', name: 'items', label: 'Mídias', itemLabel: 'Mídia', max: 40, fields: MEDIA_ITEM, ...when('imageGallery', 'campaignRollout') },
  { kind: 'list', name: 'steps', label: 'Etapas do raciocínio', itemLabel: 'Etapa', max: 8, help: 'Ex.: Problema → Insight → Público → Posicionamento → Conceito → Canais. Somente dados reais do projeto.', fields: [t('label', 'Rótulo', { help: 'Ex.: Insight' }), ta('text', 'Conteúdo', { rows: 2 })], ...when('strategyDiagram') },
  { ...ta('quote', 'Citação', { rows: 3 }), ...when('quote') },
  { ...t('source', 'Fonte (nome e cargo)', { help: 'Obrigatória: citações sem fonte não aparecem no site.' }), ...when('quote') },
  { kind: 'list', name: 'metrics', label: 'Indicadores', itemLabel: 'Indicador', max: 6, help: 'Só aparecem no site os indicadores marcados como verificados e com fonte.', fields: [t('value', 'Valor'), t('label', 'Rótulo'), t('source', 'Fonte / critério'), { kind: 'boolean', name: 'verified', label: 'Verificado e autorizado pelo cliente' }], ...when('metrics') },
  { kind: 'tags', name: 'credits', label: 'Créditos', help: 'Somente informações confirmadas.', ...when('credits') },
  { kind: 'reference', name: 'cases', label: 'Projetos', to: 'case', multiple: true, help: 'Vazio = projetos do mesmo setor.', ...when('relatedProjects') },
  { kind: 'reference', name: 'next', label: 'Próximo projeto', to: 'case', help: 'Vazio = próximo projeto publicado.', ...when('nextProject') },
];

export const DOC_TYPES: DocType[] = [
  // ───────────── Páginas (singletons) ─────────────
  {
    type: 'home',
    label: 'Home',
    plural: 'Home',
    singleton: true,
    route: '/',
    icon: 'home',
    group: 'Páginas',
    description: 'Página inicial: hero, ecossistema, especialidades, MICCA, projetos, processo e insights.',
    hasSeo: true,
    fields: [
      hero(),
      section('proof', 'Prova de experiência', [{ kind: 'boolean', name: 'showMetrics', label: 'Exibir indicadores validados' }]),
      section('ecosystem', 'Ecossistema'),
      section('specialties', 'Especialidades'),
      section('micca', 'MICCA', [cta('cta', 'Botão')]),
      section('projects', 'Projetos', [{ kind: 'reference', name: 'cases', label: 'Projetos em destaque', to: 'case', multiple: true }, cta('cta', 'Botão')]),
      {
        kind: 'group',
        name: 'process',
        label: 'Processo',
        fields: [ta('title', 'Título (H2)', { rows: 2 }), items('steps', 'Etapas', 'Etapa')],
      },
      section('insights', 'Insights', [cta('cta', 'Botão')]),
      section('final', 'Chamada final', [cta('cta', 'Botão')]),
    ],
  },
  {
    type: 'about',
    label: 'Sobre',
    plural: 'Sobre',
    singleton: true,
    route: '/sobre',
    icon: 'info',
    group: 'Páginas',
    description: 'História, visão, linha do tempo, equipe, números e cultura.',
    hasSeo: true,
    fields: [
      hero(),
      section('vision', 'Visão'),
      { kind: 'group', name: 'manifesto', label: 'Vídeo manifesto', fields: [t('title', 'Título'), { kind: 'video', name: 'video', label: 'Vídeo' }, { kind: 'image', name: 'poster', label: 'Imagem de capa do vídeo' }] },
      {
        kind: 'group',
        name: 'timeline',
        label: 'Linha do tempo',
        fields: [ta('title', 'Título', { rows: 2 }), items('items', 'Marcos', 'Marco', [t('year', 'Ano', { required: true }), t('title', 'Marco', { required: true }), ta('text', 'Descrição', { rows: 2 }), { kind: 'boolean', name: 'pending', label: 'Pendente de confirmação' }])],
      },
      section('team', 'Equipe'),
      section('metrics', 'Números'),
      section('culture', 'Cultura', [items('values', 'Valores', 'Valor'), { kind: 'list', name: 'gallery', label: 'Galeria', itemLabel: 'Imagem', fields: [{ kind: 'image', name: 'image', label: 'Imagem' }, t('caption', 'Legenda')] }]),
      section('final', 'Chamada final', [cta('cta', 'Botão')]),
    ],
  },
  {
    type: 'micca',
    label: 'Metodologia MICCA',
    plural: 'MICCA',
    singleton: true,
    route: '/metodologia-micca',
    icon: 'layers',
    group: 'Páginas',
    description: 'Pilares do método e exemplos de aplicação por setor (seletor interativo).',
    hasSeo: true,
    fields: [
      hero(),
      {
        kind: 'list',
        name: 'pillars',
        label: 'Pilares',
        itemLabel: 'Pilar',
        max: 5,
        fields: [t('letter', 'Letra', { max: 1 }), t('name', 'Nome', { required: true }), t('summary', 'Resumo curto'), ta('text', 'Descrição', { rows: 3 })],
      },
      {
        kind: 'list',
        name: 'applications',
        label: 'Aplicações por setor (seletor)',
        itemLabel: 'Setor',
        fields: [
          { kind: 'select', name: 'sector', label: 'Setor', options: SPECIALTY_SECTORS },
          t('label', 'Rótulo da aba'),
          MICCA_LIST,
        ],
      },
      section('why', 'Por que um método'),
      section('final', 'Chamada final', [cta('cta', 'Botão')]),
    ],
  },
  {
    type: 'projectsPage',
    label: 'Página de Projetos',
    plural: 'Página de Projetos',
    singleton: true,
    route: '/projetos',
    icon: 'grid',
    group: 'Páginas',
    description: 'Textos da listagem de projetos. Os cases são cadastrados em "Projetos (cases)".',
    hasSeo: true,
    fields: [hero(), section('final', 'Chamada final', [cta('cta', 'Botão')])],
  },
  {
    type: 'insightsPage',
    label: 'Página de Insights',
    plural: 'Página de Insights',
    singleton: true,
    route: '/insights',
    icon: 'book',
    group: 'Páginas',
    description: 'Textos da listagem editorial. Os artigos são cadastrados em "Artigos".',
    hasSeo: true,
    fields: [hero()],
  },
  {
    type: 'contactPage',
    label: 'Página de Contato',
    plural: 'Contato',
    singleton: true,
    route: '/contato',
    icon: 'mail',
    group: 'Páginas',
    description: 'Textos do formulário de contato e mensagens de confirmação.',
    hasSeo: true,
    fields: [
      hero(),
      ta('successTitle', 'Título de sucesso', { rows: 1 }),
      ta('successText', 'Texto de sucesso', { rows: 2 }),
      items('next', 'O que acontece depois', 'Passo'),
    ],
  },
  {
    type: 'coreLanding',
    label: 'Landing Grifo Core',
    plural: 'Grifo Core',
    singleton: true,
    route: '/grifo-core',
    icon: 'target',
    group: 'Páginas',
    description: 'Landing page de aquisição do Grifo Core (Assessment).',
    hasSeo: true,
    fields: [hero(), section('assessment', 'Assessment', [items('checklist', 'O que avaliamos', 'Item')])],
  },
  {
    type: 'legal',
    label: 'Página legal',
    plural: 'Políticas',
    route: '/{slug}',
    icon: 'shield',
    group: 'Páginas',
    description: 'Política de privacidade, cookies e termos. Requer revisão jurídica.',
    hasSeo: true,
    fields: [t('title', 'Título', { required: true }), { kind: 'date', name: 'updatedAt', label: 'Última atualização' }, { kind: 'markdown', name: 'body', label: 'Conteúdo', required: true }],
  },

  // ───────────── Estrutura ─────────────
  {
    type: 'solution',
    label: 'Solução',
    plural: 'Soluções',
    route: '/solucoes/{slug}',
    icon: 'spark',
    group: 'Estrutura',
    description: 'Frentes do ecossistema: Consulting, Marketing, Studios e Tech.',
    hasSeo: true,
    titleField: 'name',
    fields: [
      t('name', 'Nome da frente', { required: true }),
      t('tagline', 'Assinatura curta', { help: 'Frase de 1 linha usada nos cards da Home.' }),
      hero(),
      { kind: 'image', name: 'image', label: 'Imagem de destaque' },
      { kind: 'video', name: 'video', label: 'Vídeo (opcional, sob demanda)' },
      section('services', 'Serviços', [items('items', 'Serviços', 'Serviço')]),
      section('final', 'Chamada final', [cta('cta', 'Botão')]),
      { kind: 'number', name: 'order', label: 'Ordem' },
    ],
  },
  {
    type: 'specialty',
    label: 'Especialidade',
    plural: 'Especialidades',
    route: '/especialidades/{slug}',
    icon: 'compass',
    group: 'Estrutura',
    description: 'Mercado Imobiliário, Educação, Tecnologia e Concessionárias. Seções vazias não aparecem no site.',
    hasSeo: true,
    titleField: 'name',
    fields: [
      t('name', 'Nome', { required: true }),
      t('tagline', 'Assinatura curta (cards)'),
      hero(),
      section('challenge', 'Desafio'),
      section('product', 'Produto (ex.: Grifo Core)', [{ kind: 'image', name: 'image', label: 'Imagem' }]),
      section('fronts', 'Frentes / soluções', [items('items', 'Itens', 'Item')]),
      {
        kind: 'group',
        name: 'journey',
        label: 'Jornada interativa (timeline)',
        fields: [ta('title', 'Título', { rows: 2 }), ta('text', 'Texto', { rows: 2 }), items('steps', 'Etapas', 'Etapa', [t('title', 'Etapa', { required: true }), ta('objective', 'Objetivo', { rows: 2 }), { kind: 'tags', name: 'deliverables', label: 'Entregas' }])],
      },
      section('plan', 'Plano (ex.: Core Plan)', [{ kind: 'tags', name: 'layers', label: 'Camadas do plano' }]),
      section('modules', 'Módulos', [t('coreLabel', 'Núcleo obrigatório'), ta('coreText', 'Descrição do núcleo', { rows: 2 }), { kind: 'tags', name: 'optional', label: 'Módulos opcionais' }, ta('note', 'Observação', { rows: 2 })]),
      { kind: 'group', name: 'micca', label: 'MICCA aplicado', fields: [ta('title', 'Título', { rows: 2 }), MICCA_LIST] },
      section('segments', 'Segmentos atendidos', [items('items', 'Segmentos', 'Segmento')]),
      section('proof', 'Prova / cases', [{ kind: 'reference', name: 'cases', label: 'Cases relacionados', to: 'case', multiple: true }]),
      section('final', 'Chamada final', [cta('cta', 'Botão')]),
      { kind: 'select', name: 'formDemand', label: 'Tipo de demanda pré-selecionado no formulário', options: [{ value: 'consultoria', label: 'Consultoria' }, { value: 'campanha', label: 'Campanha' }, { value: 'lancamento', label: 'Lançamento' }, { value: 'producao', label: 'Produção' }, { value: 'tech', label: 'Tech' }] },
      { kind: 'number', name: 'order', label: 'Ordem' },
    ],
  },

  // ───────────── Conteúdo ─────────────
  {
    type: 'case',
    label: 'Projeto (case)',
    plural: 'Projetos (cases)',
    route: '/projetos/{slug}',
    icon: 'image',
    group: 'Conteúdo',
    description: 'Estudos de caso. Resultados: somente dados validados e autorizados pelo cliente.',
    hasSeo: true,
    fields: [
      t('title', 'Nome do projeto', { required: true }),
      t('client', 'Cliente'),
      { kind: 'select', name: 'sector', label: 'Setor', options: SECTORS, required: true },
      { kind: 'multiselect', name: 'competencies', label: 'Competências', options: COMPETENCIES },
      t('year', 'Ano'),
      ta('summary', 'Resumo (card)', { rows: 2, max: 220 }),
      { kind: 'image', name: 'cover', label: 'Imagem de capa' },
      { kind: 'markdown', name: 'context', label: 'Contexto' },
      { kind: 'markdown', name: 'challenge', label: 'Desafio' },
      { kind: 'markdown', name: 'strategy', label: 'Estratégia' },
      { kind: 'markdown', name: 'execution', label: 'Execução' },
      { kind: 'markdown', name: 'results', label: 'Resultados', help: 'Apenas dados validados. Deixe vazio se não houver autorização.' },
      { kind: 'list', name: 'gallery', label: 'Galeria', itemLabel: 'Mídia', fields: [{ kind: 'image', name: 'image', label: 'Imagem' }, t('caption', 'Legenda')] },
      { kind: 'tags', name: 'credits', label: 'Créditos' },
      { kind: 'boolean', name: 'featured', label: 'Destaque' },
      // ── Case Study Studio (opcionais; cases sem estes campos continuam funcionando como antes) ──
      {
        kind: 'select',
        name: 'layout',
        label: 'Linguagem visual da página',
        help: 'Define ritmo e tratamento da página. "Automático" segue o setor do projeto.',
        options: CASE_LAYOUTS,
      },
      {
        kind: 'group',
        name: 'heroMedia',
        label: 'Abertura cinematográfica (opcional)',
        help: 'Vídeo curto de abertura. Sem vídeo, a capa é usada. O vídeo só é carregado em telas maiores e nunca com som automático.',
        collapsed: true,
        fields: [{ kind: 'video', name: 'video', label: 'Vídeo de abertura (mudo, em loop)' }, { kind: 'image', name: 'poster', label: 'Quadro de capa do vídeo' }],
      },
      {
        kind: 'list',
        name: 'blocks',
        label: 'Blocos do estudo de caso',
        itemLabel: 'Bloco',
        max: 40,
        help: 'Monte a narrativa do case na ordem desejada. Contexto, Desafio, Estratégia, Execução, Resultados e Galeria acima continuam valendo: use o bloco "Capítulo do case" para posicioná-los; os que não forem posicionados aparecem na ordem padrão.',
        fields: CASE_BLOCK_FIELDS,
      },
    ],
  },
  {
    type: 'article',
    label: 'Artigo',
    plural: 'Artigos (Insights)',
    route: '/insights/{slug}',
    icon: 'pen',
    group: 'Conteúdo',
    description: 'Conteúdo editorial com categoria, tags, autor, leitura estimada e SEO.',
    hasSeo: true,
    fields: [
      t('title', 'Título', { required: true }),
      ta('excerpt', 'Resumo', { rows: 2, max: 260 }),
      { kind: 'select', name: 'category', label: 'Categoria', options: ARTICLE_CATEGORIES, required: true },
      { kind: 'tags', name: 'tags', label: 'Tags' },
      { kind: 'reference', name: 'author', label: 'Autor', to: 'team' },
      { kind: 'date', name: 'date', label: 'Data de publicação' },
      { kind: 'image', name: 'cover', label: 'Imagem de capa' },
      { kind: 'markdown', name: 'body', label: 'Texto', required: true },
    ],
  },
  {
    type: 'team',
    label: 'Pessoa da equipe',
    plural: 'Equipe',
    icon: 'user',
    group: 'Conteúdo',
    description: 'Equipe exibida em /sobre e como autores dos artigos.',
    titleField: 'name',
    fields: [t('name', 'Nome', { required: true }), t('role', 'Cargo'), { kind: 'image', name: 'photo', label: 'Foto' }, ta('bio', 'Mini bio', { rows: 3 }), { kind: 'url', name: 'linkedin', label: 'LinkedIn' }, { kind: 'number', name: 'order', label: 'Ordem' }],
  },
  {
    type: 'metric',
    label: 'Indicador',
    plural: 'Indicadores',
    icon: 'chart',
    group: 'Conteúdo',
    description: 'Números institucionais. Só aparecem em produção quando marcados como validados.',
    titleField: 'label',
    fields: [
      t('value', 'Valor', { required: true, help: 'Ex.: 11, 100+' }),
      t('label', 'Rótulo', { required: true }),
      t('detail', 'Detalhe'),
      ta('criteria', 'Critério de contagem / fonte', { rows: 2, help: 'Uso interno. Não aparece no site.' }),
      { kind: 'boolean', name: 'validated', label: 'Validado para publicação' },
      { kind: 'multiselect', name: 'contexts', label: 'Onde exibir', options: [{ value: 'home', label: 'Home' }, { value: 'sobre', label: 'Sobre' }, { value: 'imobiliario', label: 'Imobiliário' }] },
      { kind: 'number', name: 'order', label: 'Ordem' },
    ],
  },

  // ───────────── Sistema ─────────────
  {
    type: 'settings',
    label: 'Configurações gerais',
    plural: 'Configurações',
    singleton: true,
    icon: 'settings',
    group: 'Sistema',
    description: 'Contatos oficiais, redes, roteamento de leads, analytics e retenção de dados.',
    fields: [
      t('siteName', 'Nome do site'),
      t('tagline', 'Assinatura institucional'),
      ta('description', 'Descrição padrão (SEO)', { rows: 2 }),
      { kind: 'image', name: 'ogImage', label: 'Imagem padrão de compartilhamento' },
      {
        kind: 'group',
        name: 'contact',
        label: 'Contatos oficiais',
        fields: [t('email', 'E-mail comercial'), t('phone', 'Telefone'), t('whatsapp', 'WhatsApp (somente dígitos com DDI, ex.: 5562999999999)'), ta('address', 'Endereço', { rows: 2 })],
      },
      { kind: 'list', name: 'socials', label: 'Redes sociais', itemLabel: 'Rede', fields: [t('name', 'Rede'), { kind: 'url', name: 'url', label: 'URL' }] },
      { kind: 'group', name: 'legal', label: 'Dados jurídicos', fields: [t('company', 'Razão social'), t('cnpj', 'CNPJ'), t('dpo', 'Encarregado (DPO) — e-mail')] },
      {
        kind: 'list',
        name: 'leadRouting',
        label: 'Roteamento de leads por segmento',
        itemLabel: 'Regra',
        help: 'Cada lead dispara aviso interno para os e-mails do segmento (requer SMTP configurado).',
        fields: [{ kind: 'select', name: 'segment', label: 'Segmento', options: SECTORS }, t('emails', 'E-mails (separados por vírgula)')],
      },
      t('gtmId', 'Google Tag Manager ID', { help: 'Ex.: GTM-XXXXXXX. Carregado somente após consentimento.' }),
      { kind: 'number', name: 'retentionMonths', label: 'Retenção de leads (meses)', help: 'Leads mais antigos são excluídos automaticamente.' },
      t('privacyVersion', 'Versão da política de privacidade', { help: 'Registrada junto ao consentimento de cada lead.' }),
    ],
  },
  {
    type: 'redirect',
    label: 'Redirecionamento 301',
    plural: 'Redirecionamentos',
    icon: 'shuffle',
    group: 'Sistema',
    description: 'URLs antigas do site anterior apontando para as novas rotas.',
    titleField: 'from',
    fields: [t('from', 'De (caminho antigo)', { required: true, placeholder: '/servicos' }), t('to', 'Para (novo caminho)', { required: true, placeholder: '/solucoes/marketing' })],
  },
];

export const SEO_FIELDS: Field[] = [
  t('title', 'Título SEO', { max: 70, help: 'Até ~60 caracteres. Se vazio, usa o título da página.' }),
  ta('description', 'Meta description', { rows: 2, max: 170, help: 'Até ~155 caracteres.' }),
  { kind: 'image', name: 'ogImage', label: 'Imagem Open Graph' },
  { kind: 'boolean', name: 'noindex', label: 'Ocultar dos buscadores (noindex)' },
];

export function getDocType(type: string): DocType | undefined {
  return DOC_TYPES.find((d) => d.type === type);
}

export function publicPath(type: string, slug: string): string | null {
  const dt = getDocType(type);
  if (!dt?.route) return null;
  return dt.route.replace('{slug}', slug);
}
