import { EDITION_2026_11_A } from './editorial/2026-11-a.ts';
import type { DatabaseSync } from 'node:sqlite';

/**
 * Conteúdo inicial (seed) extraído do Briefing Mestre v1.0 (03/11/2026).
 * placeholder: true → conteúdo pendente de validação/autorização. Não aparece em produção
 * enquanto CONTENT_SHOW_PLACEHOLDERS=false e enquanto o item não for revisado no painel.
 */
type SeedDoc = { type: string; slug: string; title: string; data: Record<string, unknown>; seo?: Record<string, unknown>; placeholder?: boolean; sort?: number };

const cta = (label: string, href: string) => ({ label, href });
const lst = (arr: [string, string?][]) => arr.map(([title, text]) => ({ title, text: text ?? '' }));
const img = (src: string, alt: string) => ({ src, alt });

const MICCA_PILLARS = [
  { letter: 'M', name: 'Meta', summary: 'Objetivos e indicadores', text: 'O que queremos alcançar, em quanto tempo e como vamos medir. Toda decisão posterior responde à meta.' },
  { letter: 'I', name: 'Investimento', summary: 'Recursos e eficiência', text: 'Quanto investir para atingir a meta, como distribuir a verba e qual custo por resultado é aceitável.' },
  { letter: 'C', name: 'Conteúdo', summary: 'Mensagem e proposta de valor', text: 'Qual conceito, quais argumentos e quais criativos vão comunicar o valor certo para o público certo.' },
  { letter: 'C', name: 'Canais', summary: 'Distribuição', text: 'Onde o público está e quais canais — online e offline — entregam alcance com qualidade.' },
  { letter: 'A', name: 'Atendimento', summary: 'Conversão e experiência', text: 'O que acontece depois do contato: velocidade de resposta, qualificação, acompanhamento e venda.' },
];

const MICCA_IMOB = [
  { pillar: 'Meta', text: 'Quantas unidades vender, em quanto tempo e com qual velocidade de vendas?' },
  { pillar: 'Investimento', text: 'Qual orçamento de lançamento, distribuição de mídia e custo por venda esperado?' },
  { pillar: 'Conteúdo', text: 'Qual conceito vai vender o produto, com quais argumentos e criativos?' },
  { pillar: 'Canais', text: 'Meta, Google, portais, outdoor, rádio, influenciadores, eventos, corretores, imobiliárias e PDV.' },
  { pillar: 'Atendimento', text: 'O que acontece depois do lead: CRM, distribuição, velocidade de atendimento, qualificação, visita, proposta e venda.' },
];
const MICCA_EDU = [
  { pillar: 'Meta', text: 'Quantas matrículas alcançar?' },
  { pillar: 'Investimento', text: 'Qual verba e qual custo por matrícula?' },
  { pillar: 'Conteúdo', text: 'Quais diferenciais e quais cursos comunicar?' },
  { pillar: 'Canais', text: 'Onde estão os alunos?' },
  { pillar: 'Atendimento', text: 'Como converter interessados em inscritos e matriculados?' },
];
const MICCA_TECH = [
  { pillar: 'Meta', text: 'Leads qualificados, demos e clientes.' },
  { pillar: 'Investimento', text: 'CAC e eficiência.' },
  { pillar: 'Conteúdo', text: 'Proposta de valor e casos de uso.' },
  { pillar: 'Canais', text: 'Search, social, parceiros e comunidades.' },
  { pillar: 'Atendimento', text: 'Qualificação, demo, CRM e follow-up.' },
];

// Concessionárias — copy autorizada no Prompt Mestre 2027 (§09). Única expansão editorial permitida.
const MICCA_AUTO = [
  { pillar: 'Meta', text: 'Objetivos comerciais e indicadores por unidade/modelo.' },
  { pillar: 'Investimento', text: 'Orçamento e alocação por canal/período.' },
  { pillar: 'Conteúdo', text: 'Mensagem, oferta, KV e produção fiel às marcas.' },
  { pillar: 'Canais', text: 'Mídia digital, regional, offline e PDV.' },
  { pillar: 'Atendimento', text: 'Origem, qualificação, follow-up, visita, test-drive e negociação.' },
];

export const CONCESSIONARIAS_DOC: SeedDoc = {
  type: 'specialty',
  slug: 'concessionarias',
  title: 'Concessionárias',
  sort: 4,
  seo: {
    title: 'Grifo Concessionárias — Estratégia, campanhas e experiências para o mercado automotivo',
    description: 'Estratégia, campanhas e experiências para marcas que movimentam o mercado automotivo.',
  },
  data: {
    name: 'Concessionárias',
    tagline: 'Estratégia, campanhas e experiências para marcas que movimentam o mercado automotivo.',
    hero: {
      eyebrow: 'CONCESSIONÁRIAS / MERCADO AUTOMOTIVO',
      title: 'Sua concessionária precisa de mais que campanhas.\nPrecisa de uma estratégia que conecta marca e vendas.',
      text: 'Integramos inteligência de mercado, planejamento de mídia, criação, produção audiovisual, tecnologia e atendimento para concessionárias e grupos automotivos. Da força da marca à jornada comercial, cada ponto de contato precisa trabalhar na mesma direção.',
      cta: { label: 'Vamos construir sua próxima campanha.', href: '#formulario' },
      cta2: { label: '', href: '' },
    },
    challenge: {
      title: 'O mercado muda rápido.\nSua comunicação precisa acompanhar cada movimento.',
      text: 'Lançamentos, campanhas de varejo, seminovos, pós-venda e relacionamento exigem equilíbrio entre posicionamento institucional, condições comerciais, mídia regional e atendimento. Uma campanha só gera oportunidades quando a operação está preparada para recebê-las e acompanhá-las.',
    },
    product: { title: '', text: '', image: { src: '', alt: '' } },
    fronts: {
      title: '',
      text: '',
      items: [
        { title: 'Estratégia e calendário comercial', text: '' },
        { title: 'Branding, conceito e campanhas', text: '' },
        { title: 'Lançamentos e eventos', text: '' },
        { title: 'Performance e mídia regional', text: '' },
        { title: 'Audiovisual e conteúdo automotivo', text: '' },
        { title: 'CRM, atendimento e inteligência comercial', text: '' },
      ],
    },
    journey: { title: '', text: '', steps: [] },
    plan: { title: '', text: '', layers: [] },
    modules: { title: '', text: '', coreLabel: '', coreText: '', optional: [], note: '' },
    micca: { title: 'MICCA aplicado.', items: MICCA_AUTO },
    segments: {
      title: '',
      text: '',
      items: [
        { title: 'Concessionárias e redes multimarcas', text: '' },
        { title: 'Lançamentos de bandeiras e novas unidades', text: '' },
        { title: 'Campanhas táticas e varejo', text: '' },
        { title: 'Seminovos', text: '' },
        { title: 'Pós-venda', text: '' },
        { title: 'Relacionamento com públicos regionais', text: '' },
      ],
    },
    proof: { title: '', text: '', cases: [] },
    final: { title: 'Sua próxima campanha começa com uma estratégia à altura da sua operação.', text: '', cta: { label: 'Converse com a Grifo.', href: '#formulario' } },
    formDemand: 'campanha',
    order: 4,
  },
};

export const MICCA_AUTO_APPLICATION = { sector: 'concessionarias', label: 'Concessionárias', items: MICCA_AUTO };

/** URLs do site atual (grifo.agency) auditadas em 03/11/2026 → rota 2027 mais equivalente. Ver docs/SEO_MIGRATION.md. */
export const LEGACY_REDIRECTS: [string, string][] = [
  ['/portfolio', '/projetos'],
  ['/portfolio/up-buriti', '/projetos'],
  ['/portfolio/mirage-sky-houses-sorrisomt', '/projetos'],
  ['/portfolio/primus-parque-novo-mundo-construtora', '/projetos'],
  ['/portfolio/campanha-nota-1000-fix-urbanismo', '/projetos'],
  ['/portfolio/branding-pousada-flor-de-anis', '/projetos'],
  ['/portfolio/rebranding-pz-construtora', '/projetos'],
  ['/blog/comemore-as-olimpiadas-de-paris-2024', '/insights'],
  ['/blog/grifo-propaganda-e-destaque-no-premio-mais-influentes-da-comunicacao-em-goias', '/insights'],
  ['/blog/dia-dos-namorados-no-brasil-uma-jornada-de-criatividade-e-comercio', '/insights'],
  ['/blog/o-segredo-da-longevidade-nos-relacionamentos-uma-reflexao-a-partir-da-campanha-do-burger-king', '/insights'],
  ['/blog/como-utilizar-o-marketing-digital-para-a-geracao-de-leads-qualificados', '/insights'],
  ['/blog/celebrando-o-futuro-com-a-campanha-centenaria-do-itau-unibanco', '/insights'],
];
const redirectSlug = (from: string) => from.replace(/^\/+/, '').replace(/[^a-z0-9]+/g, '-').slice(0, 80);

const JOURNEY = [
  ['Imersão', 'Entender o empreendimento, a incorporadora, o terreno e o momento de mercado.', ['Reunião de imersão', 'Levantamento de dados do produto', 'Mapa de stakeholders']],
  ['Estratégia', 'Definir metas, público, concorrência e a tese de venda do lançamento.', ['Diagnóstico de mercado', 'Análise de concorrência', 'Metas e indicadores']],
  ['Posicionamento', 'Determinar como o empreendimento deve ser percebido e por quem.', ['Proposta de valor', 'Território de comunicação', 'Argumentos de venda']],
  ['Branding', 'Dar nome, identidade e conceito ao produto.', ['Naming (quando necessário)', 'Identidade visual', 'Key visual e conceito']],
  ['Planejamento', 'Organizar cronograma, orçamento, fases e canais em um só plano.', ['Cronograma master', 'Orçamento por fase', 'Plano de mídia']],
  ['Produção', 'Transformar o conceito em materiais, peças e conteúdos.', ['Peças de campanha', 'Materiais comerciais', 'Audiovisual']],
  ['Pré-lançamento', 'Gerar expectativa e formar base de interessados antes da abertura de vendas.', ['Campanha de teaser', 'Landing page', 'Captação de leads']],
  ['Meeting', 'Preparar e engajar corretores e imobiliárias para vender o produto.', ['Evento de meeting', 'Kit do corretor', 'Treinamento comercial']],
  ['Lançamento', 'Abrir vendas com comunicação coordenada em todos os canais.', ['Campanha de lançamento', 'Ativação de PDV', 'Eventos']],
  ['Performance', 'Acompanhar mídia, leads e custo por resultado em tempo real.', ['Gestão de mídia', 'Tracking', 'Dashboards']],
  ['Vendas', 'Integrar marketing e comercial para converter oportunidades.', ['Jornada do lead', 'SLA de atendimento', 'Acompanhamento do funil']],
  ['Otimização', 'Ajustar estratégia, verba e mensagens a partir dos dados.', ['Análise de conversão', 'Relatórios', 'Plano de otimização']],
] as const;

function docs(): SeedDoc[] {
  const out: SeedDoc[] = [];

  out.push({
    type: 'settings',
    slug: 'global',
    title: 'Configurações gerais',
    data: {
      siteName: 'Grifo Agency',
      tagline: 'O ecossistema para marcas que fazem história.',
      description: 'Consulting, Marketing, Studios e Tech conectados para transformar desafios em oportunidades de crescimento. Especialistas em Mercado Imobiliário, Educação e Empresas de Tecnologia.',
      ogImage: img('/brand/og-default.jpg', 'Grifo — Ecossistema de marcas que fazem história'),
      contact: { email: '', phone: '', whatsapp: '', address: '' },
      socials: [],
      legal: { company: '', cnpj: '', dpo: '' },
      leadRouting: [
        { segment: 'imobiliario', emails: '' },
        { segment: 'educacao', emails: '' },
        { segment: 'tecnologia', emails: '' },
        { segment: 'concessionarias', emails: '' },
        { segment: 'outros', emails: '' },
      ],
      gtmId: '',
      retentionMonths: 24,
      privacyVersion: '2026-11',
    },
  });

  out.push({
    type: 'home',
    slug: 'home',
    title: 'Home',
    seo: { title: 'Grifo Agency — O ecossistema para marcas que fazem história', description: 'Inteligência, criatividade, comunicação e tecnologia conectadas para transformar desafios em oportunidades de crescimento.' },
    data: {
      hero: {
        eyebrow: 'CONSULTING / MARKETING / STUDIOS / TECH',
        title: 'Marcas que pensam grande precisam de estratégias à altura.',
        text: 'Conectamos inteligência de mercado, criatividade, comunicação e tecnologia para transformar desafios em oportunidades de crescimento.',
        cta: cta('Conheça nosso ecossistema', '/sobre'),
        cta2: cta('Vamos conversar', '/contato'),
      },
      proof: {
        title: 'Experiência que constrói histórias.\nEstratégia que impulsiona resultados.',
        text: 'Nossa trajetória reúne projetos de diferentes portes e segmentos. Uma experiência construída na prática, conectando visão estratégica, criatividade e capacidade de execução.',
        showMetrics: true,
      },
      ecosystem: {
        title: 'Diferentes especialidades.\nUma única visão de negócio.',
        text: 'Os melhores resultados acontecem quando estratégia, comunicação, conteúdo e tecnologia trabalham na mesma direção. Por isso, organizamos nossas competências em quatro frentes que se complementam.',
      },
      specialties: {
        title: 'Entendemos de marketing.\nMas, principalmente, entendemos do seu mercado.',
        text: 'Cada setor possui uma jornada de compra, uma dinâmica comercial e desafios específicos. Desenvolvemos estratégias adaptadas à realidade de cada negócio.',
      },
      micca: {
        title: 'Resultados não começam na campanha.\nComeçam no método.',
        text: 'Criamos o MICCA para conectar as decisões que determinam o desempenho de uma campanha: o que queremos alcançar, quanto investir, o que comunicar, onde encontrar o público e como transformar oportunidades em negócios.',
        cta: cta('Descubra o método MICCA', '/metodologia-micca'),
      },
      projects: {
        title: 'Estratégia aplicada.\nCriatividade em movimento.',
        text: 'Cada projeto começa com um desafio de negócio e se transforma em uma solução construída para aquela realidade.',
        cases: ['reserva-dos-ipes', 'nova-harmonia', 'uniceug-vestibular-2025-1', 'pinauto', 'esfiharia-brasil'],
        cta: cta('Ver todos os projetos', '/projetos'),
      },
      process: {
        title: 'Do primeiro diagnóstico à próxima oportunidade de crescimento.',
        steps: lst([
          ['Entendemos', 'Negócio e desafios.'],
          ['Planejamos', 'Metas e investimentos.'],
          ['Criamos', 'Conceitos e campanhas.'],
          ['Executamos', 'Canais e operação.'],
          ['Evoluímos', 'Indicadores e otimizações.'],
        ]),
      },
      insights: {
        title: 'Ideias que provocam.\nConhecimento que movimenta negócios.',
        text: '',
        cta: cta('Ver todos os insights', '/insights'),
      },
      final: {
        title: 'Seu próximo grande resultado começa com uma boa estratégia.',
        text: 'Conte seu desafio. Vamos descobrir como conectar inteligência, criatividade e execução para impulsionar seu negócio.',
        cta: cta('Converse com a Grifo', '/contato'),
      },
    },
  });

  out.push({
    type: 'about',
    slug: 'sobre',
    title: 'Sobre',
    seo: { title: 'Sobre a Grifo — Ecossistema de marcas que fazem história', description: 'Desde 2016, conectamos estratégia, criatividade e comunicação para construir marcas fortes e novas oportunidades de negócio.' },
    data: {
      hero: {
        eyebrow: 'SOBRE A GRIFO',
        title: 'Somos a Grifo.\nUm ecossistema criado para marcas que fazem história.',
        text: 'Desde 2016, conectamos estratégia, criatividade e comunicação para ajudar empresas a construir marcas fortes e desenvolver novas oportunidades de negócio. Nossa trajetória nasceu na publicidade e evoluiu para um ecossistema integrado de inteligência, marketing, produção audiovisual e tecnologia.',
        cta: cta('Vamos conversar', '/contato'),
        cta2: cta('Conheça o método MICCA', '/metodologia-micca'),
      },
      vision: {
        title: 'Inteligência, criatividade, comunicação e tecnologia.\nConectadas.',
        text: 'Acreditamos que marcas crescem quando as decisões de negócio, a comunicação e a operação caminham juntas. Por isso, em vez de serviços avulsos, a Grifo organiza suas competências como um ecossistema: Consulting lidera a estratégia; Marketing, Studios e Tech transformam a estratégia em presença, conteúdo e resultado.',
      },
      manifesto: { title: 'Chegou a hora. A nova Grifo.', video: { src: '/video/nova-grifo.mp4', poster: '/video/nova-grifo-poster.jpg' }, poster: img('/video/nova-grifo-poster.jpg', 'Quadro do filme de reposicionamento da Grifo') },
      timeline: {
        title: 'Uma trajetória construída na prática.',
        items: [
          { year: '2016', title: 'Fundação', text: 'A Grifo nasce na publicidade.', pending: false },
          { year: '2025', title: 'Reposicionamento', text: 'A Grifo se organiza como ecossistema: Consulting, Marketing, Studios e Tech.', pending: false },
          { year: '2026', title: 'Consolidação do modelo integrado', text: 'Metodologia MICCA e soluções especializadas por mercado.', pending: false },
        ],
      },
      team: { title: 'Quem faz a Grifo acontecer.', text: '' },
      metrics: { title: 'Experiência construída em projetos reais.', text: '' },
      culture: {
        title: 'Uma marca que incomoda, engaja, transforma e impacta.',
        text: 'Nossa cultura está na forma como trabalhamos: perguntas antes de respostas, método antes da execução e responsabilidade com o resultado de cada cliente.',
        values: lst([
          ['Estratégia primeiro', 'Toda entrega começa por uma decisão de negócio.'],
          ['Uma só operação', 'Especialidades diferentes trabalhando na mesma direção.'],
          ['Clareza', 'Comunicação direta, sem jargão e sem promessas vazias.'],
        ]),
        gallery: [
          { image: img('/acervo/marca-papelaria.webp', 'Aplicações da marca Grifo em papelaria'), caption: 'Identidade Grifo' },
          { image: img('/acervo/marca-camisetas.webp', 'Camisetas com o manifesto Incomode, engaje, transforme, impacte'), caption: 'Manifesto' },
          { image: img('/acervo/marca-cracha-polo.webp', 'Crachá e uniforme com a marca Grifo'), caption: 'Cultura no dia a dia' },
        ],
      },
      final: { title: 'Vamos construir a próxima história juntos?', text: 'Conte seu desafio e descubra como o ecossistema Grifo pode apoiar seu crescimento.', cta: cta('Vamos conversar', '/contato') },
    },
  });

  out.push({
    type: 'micca',
    slug: 'metodologia-micca',
    title: 'Metodologia MICCA',
    seo: { title: 'MICCA — Inteligência antes da campanha | Grifo', description: 'Meta, Investimento, Conteúdo, Canais e Atendimento: as cinco decisões que determinam o desempenho de uma campanha.' },
    data: {
      hero: {
        eyebrow: 'METODOLOGIA PROPRIETÁRIA',
        title: 'MICCA.\nInteligência antes da campanha. Método durante toda a operação.',
        text: 'Desenvolvido a partir da experiência prática da Grifo, o MICCA organiza cinco decisões fundamentais para o desempenho de campanhas: Meta, Investimento, Conteúdo, Canais e Atendimento.',
        cta: cta('Aplicar o MICCA no meu negócio', '/contato'),
      },
      pillars: MICCA_PILLARS,
      applications: [
        { sector: 'imobiliario', label: 'Imobiliário', items: MICCA_IMOB },
        { sector: 'educacao', label: 'Educação', items: MICCA_EDU },
        { sector: 'tecnologia', label: 'Tecnologia', items: MICCA_TECH },
        MICCA_AUTO_APPLICATION,
      ],
      why: {
        title: 'Método antes da execução.\nInteligência em cada decisão.',
        text: 'O MICCA não elimina os riscos próprios de um mercado. Ele reduz decisões tomadas no escuro: cada peça, cada real investido e cada contato passam a responder a uma meta comum.',
      },
      final: { title: 'Sua próxima campanha começa com cinco boas decisões.', text: 'Vamos aplicar o MICCA à realidade do seu negócio.', cta: cta('Vamos conversar', '/contato') },
    },
  });

  out.push({
    type: 'projectsPage',
    slug: 'projetos',
    title: 'Projetos',
    seo: { title: 'Projetos — Estratégia aplicada | Grifo', description: 'Cases de lançamentos imobiliários, educação e marcas: contexto, desafio, estratégia e execução.' },
    data: {
      hero: { eyebrow: 'PROJETOS', title: 'Projetos diferentes.\nUm compromisso em comum: fazer cada estratégia acontecer.', text: '' },
      final: { title: 'Seu projeto pode ser o próximo.', text: 'Conte seu desafio de negócio.', cta: cta('Vamos conversar', '/contato') },
    },
  });

  out.push({
    type: 'insightsPage',
    slug: 'insights',
    title: 'Insights',
    seo: { title: 'Insights — Ideias que movimentam negócios | Grifo', description: 'Conteúdo sobre marketing, mercado imobiliário, educação, tecnologia e o método MICCA.' },
    data: { hero: { eyebrow: 'INSIGHTS', title: 'Ideias que provocam.\nConhecimento que movimenta negócios.', text: '' } },
  });

  out.push({
    type: 'contactPage',
    slug: 'contato',
    title: 'Contato',
    seo: { title: 'Contato — Vamos conversar | Grifo', description: 'Conte seu desafio. Vamos descobrir como conectar inteligência, criatividade e execução para impulsionar seu negócio.' },
    data: {
      hero: { eyebrow: 'CONTATO', title: 'Vamos conversar.', text: 'Conte seu desafio. Vamos descobrir como conectar inteligência, criatividade e execução para impulsionar seu negócio.' },
      successTitle: 'Recebemos sua mensagem.',
      successText: 'Um especialista da Grifo vai analisar seu desafio e retornar pelo e-mail ou WhatsApp informado.',
      next: lst([
        ['Análise do seu desafio', 'Direcionamos seu contato para o especialista do seu segmento.'],
        ['Primeira conversa', 'Entendemos objetivos, prazos e contexto do negócio.'],
        ['Proposta de caminho', 'Apresentamos como o ecossistema Grifo pode apoiar seu crescimento.'],
      ]),
    },
  });

  out.push({
    type: 'coreLanding',
    slug: 'grifo-core',
    title: 'Grifo Core',
    seo: { title: 'Grifo Core Assessment — Diagnóstico para lançamentos imobiliários', description: 'Solicite o Grifo Core Assessment: diagnóstico de produto, VGV, unidades, ticket, público, prazo, verba, canais, CRM e metas.' },
    data: {
      hero: {
        eyebrow: 'GRIFO REAL ESTATE • POWERED BY MICCA™',
        title: 'Seu próximo lançamento começa com uma estratégia.',
        text: 'O Grifo Core Assessment organiza as informações que orientam um lançamento antes de qualquer investimento em mídia.',
        cta: cta('Solicitar Grifo Core Assessment', '#assessment'),
        cta2: cta('Conheça o Grifo Core', '/especialidades/imobiliario'),
      },
      assessment: {
        title: 'Grifo Core Assessment.',
        text: 'Um diagnóstico inicial do seu empreendimento para entender o ponto de partida e o caminho até as metas de venda.',
        checklist: lst([['Produto'], ['VGV'], ['Unidades'], ['Ticket'], ['Público'], ['Prazo'], ['Verba'], ['Canais'], ['CRM'], ['Metas']]),
      },
    },
  });

  // ───────── Soluções ─────────
  const sol = (slug: string, name: string, tagline: string, title: string, text: string, services: string[], image: { src: string; alt: string }, order: number, video?: { src: string; poster: string }) =>
    out.push({
      type: 'solution',
      slug,
      title: name,
      sort: order,
      seo: { title: `Grifo ${name} — ${title.replace(/\.$/, '')}`, description: text.slice(0, 155) },
      data: {
        name,
        tagline,
        hero: { eyebrow: `GRIFO ${name.toUpperCase()}`, title, text, cta: cta('Vamos conversar', `/contato?demanda=${slug === 'tech' ? 'tech' : slug === 'studios' ? 'producao' : slug === 'consulting' ? 'consultoria' : 'campanha'}`) },
        image,
        video: video ?? { src: '', poster: '' },
        services: { title: 'O que fazemos.', text: '', items: services.map((s) => ({ title: s, text: '' })) },
        final: { title: 'Vamos colocar essa frente para trabalhar pelo seu negócio?', text: '', cta: cta('Vamos conversar', '/contato') },
        order,
      },
    });
  sol(
    'consulting',
    'Consulting',
    'Inteligência para tomar decisões melhores.',
    'Boas decisões constroem grandes resultados.',
    'Acreditamos que as melhores campanhas começam muito antes da primeira peça criativa. Começam com boas perguntas, inteligência de mercado e decisões estratégicas. A Grifo Consulting conecta diagnóstico, posicionamento, planejamento e gestão para ajudar empresas a identificar oportunidades, organizar investimentos e desenvolver estratégias consistentes de crescimento.',
    ['Diagnóstico', 'Planejamento', 'Posicionamento', 'Lançamentos', 'Consultoria comercial', 'Indicadores'],
    img('/acervo/marca-consulting.webp', 'Grifo Consulting — estratégias para escalar negócios'),
    1,
  );
  sol(
    'marketing',
    'Marketing',
    'Marcas fortes, campanhas relevantes e comunicação orientada a resultados.',
    'Ideias que conectam marcas, pessoas e resultados.',
    'Criamos marcas relevantes e campanhas que fazem sentido para o público e para o negócio. Combinamos criatividade, planejamento e inteligência de mídia para desenvolver experiências de comunicação que fortalecem marcas, geram demanda e apoiam resultados comerciais.',
    ['Branding', 'Campanhas', 'Social', 'Mídia online e offline', 'Performance', 'Conteúdo', 'Inbound', 'SEO'],
    img('/acervo/marca-marketing.webp', 'Grifo Marketing — estratégia, criatividade e performance'),
    2,
  );
  sol(
    'studios',
    'Studios',
    'Histórias que ganham forma, movimento e emoção.',
    'Histórias que merecem ser vistas, sentidas e lembradas.',
    'Uma boa história merece uma grande produção. Transformamos conceitos e estratégias em experiências audiovisuais que aproximam marcas de pessoas, despertam emoções e valorizam cada mensagem.',
    ['Filmes', 'Institucionais', 'Vídeos sociais', 'Fotografia', 'Drone', 'Motion', 'Animação'],
    img('/acervo/marca-studios.webp', 'Grifo Studios — conteúdo visual que conecta e engaja'),
    3,
    { src: '/video/logo-animada.mp4', poster: '/video/logo-animada-poster.jpg' },
  );
  sol(
    'tech',
    'Tech',
    'Tecnologia para conectar dados, operações e oportunidades.',
    'Tecnologia que conecta estratégias a resultados.',
    'Conectamos comunicação, dados e tecnologia para tornar as estratégias mais inteligentes e as operações mais eficientes. Desenvolvemos experiências digitais e integrações que aproximam marcas dos seus públicos, organizam informações e facilitam a jornada de conversão.',
    ['Websites', 'Landing pages', 'Soluções web', 'Integrações', 'Automações', 'Dashboards', 'Tracking'],
    img('/acervo/marca-tech.webp', 'Grifo Tech — tecnologia para performance e inovação'),
    4,
  );

  // ───────── Especialidades ─────────
  out.push({
    type: 'specialty',
    slug: 'imobiliario',
    title: 'Mercado Imobiliário',
    sort: 1,
    seo: { title: 'Grifo Core — Estratégia integrada para lançamentos imobiliários', description: 'Inteligência de mercado, posicionamento, branding, planejamento, mídia, tecnologia e integração comercial em uma estratégia coordenada.' },
    data: {
      name: 'Mercado Imobiliário',
      tagline: 'Da inteligência de mercado à velocidade de vendas.',
      hero: {
        eyebrow: 'GRIFO REAL ESTATE • POWERED BY MICCA™',
        title: 'Você desenvolve o empreendimento.\nA Grifo estrutura o lançamento.',
        text: 'Inteligência de mercado, posicionamento, branding, planejamento, mídia, tecnologia e integração comercial em uma estratégia coordenada para transformar lançamentos em operações orientadas a resultados.',
        cta: cta('Planeje seu próximo lançamento', '#formulario'),
      },
      challenge: {
        title: 'Um lançamento imobiliário exige muito mais do que uma campanha.',
        text: 'Da definição do produto à última etapa de vendas, um lançamento envolve decisões estratégicas, investimentos, posicionamento, comunicação, tecnologia e operação comercial. Quando essas frentes trabalham isoladamente, aumentam os riscos de desperdício, inconsistência e perda de oportunidades. A Grifo conecta essas especialidades dentro de um mesmo planejamento.',
      },
      product: {
        title: 'Grifo Core.\nUma estratégia. Um cronograma. Uma operação.',
        text: 'O Grifo Core é uma solução da Grifo Consulting, apoiada pelas estruturas de Marketing, Studios e Tech. Foi desenvolvido para organizar lançamentos imobiliários de ponta a ponta, conectando planejamento estratégico, execução de campanhas e inteligência comercial.',
        image: img('/acervo/core-capa.webp', 'Grifo Core — estratégia integrada para lançamentos imobiliários'),
      },
      fronts: {
        title: 'Seis frentes.\nUma operação.',
        text: 'A incorporadora não está comprando posts, tráfego ou identidade visual. Está comprando metodologia, planejamento, execução e inteligência para lançar um empreendimento.',
        items: lst([
          ['Intelligence', 'Diagnóstico, público, concorrência, metas e estratégia.'],
          ['Brand & Concept', 'Naming, identidade, KV, conceito e narrativa.'],
          ['Launch Planning', 'Cronograma, orçamento, fases e canais.'],
          ['Activation', 'Mídia, PDV, meeting, eventos e materiais.'],
          ['Performance & Tech', 'LPs, campanhas, tracking, dashboards e CRM.'],
          ['Sales Integration', 'Lead, SLA, funil e otimização.'],
        ]),
      },
      journey: {
        title: 'Doze etapas.\nDo primeiro estudo à otimização das vendas.',
        text: 'Selecione uma etapa para ver o objetivo e as principais entregas.',
        steps: JOURNEY.map(([title, objective, deliverables]) => ({ title, objective, deliverables: [...deliverables] })),
      },
      plan: {
        title: 'Cada empreendimento tem uma realidade.\nCada lançamento precisa de um plano.',
        text: 'Antes de executar, organizamos as decisões que orientam o projeto em um plano executivo: diagnóstico, estratégia, cronograma, investimento, conceito, mídia, tecnologia, funil comercial, metas e indicadores.',
        layers: ['Diagnóstico', 'Estratégia', 'Cronograma', 'Investimento', 'Conceito', 'Mídia', 'Tecnologia', 'Funil comercial', 'Metas', 'Indicadores'],
      },
      modules: {
        title: 'Um núcleo estratégico.\nMódulos conforme a necessidade.',
        text: '',
        coreLabel: 'Consultoria e gestão estratégica',
        coreText: 'Núcleo obrigatório em todo projeto Grifo Core.',
        optional: ['Branding', 'Performance', 'Studios', 'Tech', 'Experience', 'Sales'],
        note: 'Escopo e contratação variam conforme o projeto. Os módulos são definidos a partir do diagnóstico de cada empreendimento.',
      },
      micca: { title: 'MICCA aplicado a lançamentos.', items: MICCA_IMOB },
      segments: { title: '', text: '', items: [] },
      proof: {
        title: 'Mais de 100 lançamentos.\nExperiência que vai além da teoria.',
        text: '',
        cases: ['reserva-dos-ipes', 'reserva-harmonia', 'aero', 'eldorado-veredas'],
      },
      final: {
        title: 'Seu próximo lançamento começa com uma estratégia.',
        text: 'Solicite o Grifo Core Assessment — diagnóstico de produto, VGV, unidades, ticket, público, prazo, verba, canais, CRM e metas.',
        cta: cta('Solicitar Grifo Core Assessment', '#formulario'),
      },
      formDemand: 'lancamento',
      order: 1,
    },
  });

  out.push({
    type: 'specialty',
    slug: 'educacao',
    title: 'Educação',
    sort: 2,
    seo: { title: 'Grifo Education — Estratégias de captação e matrículas', description: 'Inteligência de mercado, posicionamento, campanhas de captação e tecnologia para transformar interesse em matrículas.' },
    data: {
      name: 'Educação',
      tagline: 'Estratégias para fortalecer instituições, atrair alunos e transformar interesse em matrículas.',
      hero: {
        eyebrow: 'GRIFO EDUCATION',
        title: 'Mais do que atrair alunos.\nCriamos estratégias para transformar interesse em matrículas.',
        text: 'Inteligência de mercado, posicionamento, campanhas de captação e tecnologia conectadas para fortalecer instituições de ensino e apoiar seu crescimento.',
        cta: cta('Planeje sua próxima campanha de matrículas', '#formulario'),
      },
      challenge: {
        title: 'A jornada do aluno mudou.\nSua estratégia de captação precisa acompanhar.',
        text: 'Escolher uma instituição de ensino envolve pesquisa, confiança, comparação, expectativa profissional e decisão financeira. Não basta alcançar potenciais alunos. É preciso comunicar diferenciais relevantes, construir credibilidade, facilitar o contato e acompanhar cada oportunidade até a matrícula.',
      },
      product: { title: '', text: '' },
      fronts: {
        title: 'Estratégias educacionais do posicionamento à matrícula.',
        text: '',
        items: lst([
          ['Inteligência e posicionamento', 'Mercado, concorrência e diferenciais que importam para o aluno.'],
          ['Campanhas de captação', 'Conceito e desdobramento por curso, formato e canal.'],
          ['Branding educacional', 'Marca que transmite confiança e expectativa de carreira.'],
          ['Performance e geração de leads', 'Mídia orientada a inscrições com custo acompanhado.'],
          ['Relacionamento e automação', 'Contato rápido e nutrição até a inscrição.'],
          ['Inteligência de matrículas', 'Indicadores do funil, da inscrição à matrícula.'],
        ]),
      },
      journey: { title: '', text: '', steps: [] },
      plan: { title: '', text: '', layers: [] },
      modules: { title: '', text: '', coreLabel: '', coreText: '', optional: [], note: '' },
      micca: { title: 'MICCA aplicado à captação.', items: MICCA_EDU },
      segments: { title: '', text: '', items: [] },
      proof: {
        title: 'Case UNICEUG — Vestibular 2025/1.',
        text: 'Campanha de captação com o conceito “Prática + conhecimento = carreira de sucesso”, desdobrada por curso e formatos.',
        cases: ['uniceug-vestibular-2025-1'],
      },
      final: { title: 'Sua próxima campanha de matrículas precisa começar antes da mídia.', text: '', cta: cta('Solicitar diagnóstico de captação', '#formulario') },
      formDemand: 'campanha',
      order: 2,
    },
  });

  out.push({
    type: 'specialty',
    slug: 'tecnologia',
    title: 'Tecnologia',
    sort: 3,
    seo: { title: 'Grifo Tech & Growth — Go-to-market e demanda B2B', description: 'Posicionamento, branding, marketing e inteligência de crescimento para empresas de tecnologia.' },
    data: {
      name: 'Tecnologia',
      tagline: 'Posicionamento, geração de demanda e crescimento para empresas que transformam mercados.',
      hero: {
        eyebrow: 'GRIFO TECH & GROWTH',
        title: 'Sua tecnologia pode transformar o mercado.\nSua estratégia precisa fazer o mercado perceber.',
        text: 'Posicionamento, branding, marketing e inteligência de crescimento para empresas que precisam transformar inovação em valor percebido, demanda e oportunidades comerciais.',
        cta: cta('Vamos acelerar sua estratégia', '#formulario'),
      },
      challenge: {
        title: 'Ter um grande produto não significa que o mercado entendeu seu valor.',
        text: 'Empresas de tecnologia enfrentam o desafio de transformar funcionalidades complexas em benefícios claros e relevantes. É preciso construir uma proposta de valor, educar o mercado e criar caminhos eficientes entre descoberta, interesse, demonstração e contratação.',
      },
      product: { title: '', text: '' },
      fronts: {
        title: 'Do posicionamento à operação de marketing.',
        text: '',
        items: lst([
          ['Brand Positioning', 'Proposta de valor e diferenciação.'],
          ['Go-to-Market', 'Públicos, canais e lançamento.'],
          ['Demand Generation', 'Conteúdo, mídia e aquisição.'],
          ['Product Marketing', 'Funcionalidades e casos de uso.'],
          ['Content & Authority', 'Conteúdo educativo e SEO.'],
          ['Marketing Operations', 'LPs, automações, tracking e CRM.'],
        ]),
      },
      journey: { title: '', text: '', steps: [] },
      plan: { title: '', text: '', layers: [] },
      modules: { title: '', text: '', coreLabel: '', coreText: '', optional: [], note: '' },
      micca: { title: 'MICCA aplicado a crescimento B2B.', items: MICCA_TECH },
      segments: { title: 'Para quem.', text: '', items: lst([['SaaS', 'Produtos por assinatura que precisam de aquisição eficiente e retenção.'], ['Startups', 'Empresas em fase de validação e escala de go-to-market.'], ['Tecnologia B2B', 'Soluções complexas com ciclos de venda consultivos.']]) },
      proof: { title: '', text: '', cases: [] },
      final: { title: 'A próxima fase de crescimento da sua empresa começa com uma estratégia mais clara.', text: '', cta: cta('Converse com nossos estrategistas', '#formulario') },
      formDemand: 'consultoria',
      order: 3,
    },
  });

  out.push(CONCESSIONARIAS_DOC);

  // ───────── Cases (pendentes de aprovação de portfólio) ─────────
  const caseDoc = (slug: string, title: string, client: string, sector: string, competencies: string[], summary: string, cover: string, extra: Record<string, unknown> = {}, featured = true) =>
    out.push({
      type: 'case',
      slug,
      title,
      placeholder: true,
      seo: { title: `${title} — Projeto Grifo`, description: summary },
      data: {
        title,
        client,
        sector,
        competencies,
        year: '',
        summary,
        cover: cover ? img(cover, `Peça de campanha do projeto ${title}`) : { src: '', alt: '' },
        context: '',
        challenge: '',
        strategy: '',
        execution: '',
        results: '',
        gallery: [],
        credits: [],
        featured,
        ...extra,
      },
    });
  caseDoc('reserva-dos-ipes', 'Reserva dos Ipês', 'Morais', 'imobiliario', ['consulting', 'marketing'], 'Lançamento imobiliário com conceito “Sua vida floresce aqui”.', '/acervo/case-reserva-dos-ipes.webp', {
    context: '_Conteúdo do case pendente: solicitar arquivos originais e autorização de uso ao cliente._',
  });
  caseDoc('nova-harmonia', 'Nova Harmonia', 'Caruaru', 'imobiliario', ['marketing', 'studios'], 'Campanha de lançamento com mídia exterior.', '/acervo/case-nova-harmonia.webp');
  caseDoc('reserva-harmonia', 'Reserva Harmonia', 'Nova Harmonia', 'imobiliario', ['marketing', 'studios'], 'Lançamento com comunicação centrada na vida em família.', '/acervo/case-reserva-harmonia.webp', {}, false);
  caseDoc('aero', 'AERO', 'PH Engenharia', 'imobiliario', ['marketing', 'studios'], 'Lançamento com experiência de PDV.', '/acervo/case-aero.webp', {}, false);
  caseDoc('eldorado-veredas', 'Eldorado Veredas', '', 'imobiliario', ['marketing'], 'Campanha de lançamento com mídia exterior.', '/acervo/case-eldorado-veredas.webp', {}, false);
  caseDoc('uniceug-vestibular-2025-1', 'UNICEUG — Vestibular 2025/1', 'UNICEUG — Centro Universitário de Goiânia', 'educacao', ['marketing', 'studios'], 'Campanha de captação “Prática + conhecimento = carreira de sucesso”, desdobrada por curso e formatos.', '/acervo/case-uniceug-hero.webp', {
    year: '2025',
    context: 'Campanha do Vestibular 2025/1 do UNICEUG — Centro Universitário de Goiânia.',
    challenge: 'Comunicar a proposta de formação do centro universitário para potenciais alunos e direcioná-los à inscrição.',
    strategy: 'Conceito criativo **“Prática + conhecimento = carreira de sucesso”**, conectando a escolha do curso à expectativa profissional.',
    execution: 'Campanha institucional desdobrada por curso (como Psicologia, Engenharia Civil e Biomedicina) em feed, stories, banners de site e mídia de performance.',
    gallery: [{ image: img('/acervo/case-uniceug-pecas.webp', 'Peças da campanha por curso: Psicologia, Engenharia Civil e Biomedicina'), caption: 'Desdobramento por curso' }],
    credits: ['Conceito criativo', 'Campanha institucional', 'Direção de arte', 'Desdobramento'],
  });
  caseDoc('pinauto', 'Pinauto', 'Pinauto', 'outros', ['marketing'], 'Projeto em fase de documentação.', '');
  caseDoc('esfiharia-brasil', 'Esfiharia Brasil', 'Esfiharia Brasil', 'outros', ['marketing'], 'Projeto em fase de documentação.', '');

  // ───────── Indicadores (do material comercial — confirmar antes de publicar) ─────────
  const metric = (slug: string, value: string, label: string, detail: string, contexts: string[], order: number) =>
    out.push({ type: 'metric', slug, title: label, sort: order, placeholder: true, data: { value, label, detail, criteria: 'Fonte: apresentação comercial Grifo Core. Confirmar atualização e critério de contagem antes da publicação.', validated: false, contexts, order } });
  metric('anos', '11', 'anos', 'de Grifo', ['home', 'sobre'], 1);
  metric('lancamentos', '100+', 'lançamentos', 'entregues', ['home', 'sobre', 'imobiliario'], 2);
  metric('lancamentos-2026', '18', 'lançamentos imobiliários', 'contratados em 2026', ['home', 'imobiliario'], 3);

  // ───────── Equipe (placeholders) ─────────
  out.push({ type: 'team', slug: 'equipe-grifo', title: 'Equipe Grifo', placeholder: false, data: { name: 'Equipe Grifo', role: 'Conteúdo editorial', photo: { src: '', alt: '' }, bio: '', linkedin: '', order: 0 } });
  for (let i = 1; i <= 4; i++) {
    out.push({ type: 'team', slug: `pessoa-${i}`, title: `Pessoa ${i}`, placeholder: true, data: { name: `Nome a definir ${i}`, role: 'Cargo a definir', photo: { src: '', alt: '' }, bio: '', linkedin: '', order: i } });
  }

  // ───────── Artigos (rascunhos editoriais para validação) ─────────
  const art = (slug: string, title: string, excerpt: string, category: string, tags: string[], date: string, body: string) =>
    out.push({ type: 'article', slug, title, placeholder: true, seo: { title: `${title} | Insights Grifo`, description: excerpt }, data: { title, excerpt, category, tags, author: 'equipe-grifo', date, cover: { src: '', alt: '' }, body } });
  art(
    'micca-decisoes-antes-da-campanha',
    'As cinco decisões que vêm antes de qualquer campanha',
    'Meta, Investimento, Conteúdo, Canais e Atendimento: por que organizar essas decisões muda o desempenho de uma campanha.',
    'micca',
    ['MICCA', 'Planejamento'],
    '2026-10-20',
    `Muitas campanhas começam pela peça criativa. O MICCA propõe outra ordem: primeiro, as decisões que determinam o desempenho.

## Meta
O que queremos alcançar, em quanto tempo e como vamos medir. Sem uma meta clara, qualquer resultado parece bom — ou ruim.

## Investimento
Quanto investir para atingir a meta e qual custo por resultado é aceitável. A verba deixa de ser um número solto e passa a ser uma decisão estratégica.

## Conteúdo
Qual mensagem e proposta de valor vão fazer o público escolher você. O criativo nasce da estratégia, não o contrário.

## Canais
Onde o público está. A escolha de canais considera alcance, qualidade e o papel de cada um na jornada.

## Atendimento
O que acontece depois do contato. É aqui que muitas oportunidades se perdem — e onde o método conecta marketing e vendas.

> Rascunho editorial preparado a partir do material da Grifo. Revisar antes de publicar.`,
  );
  art(
    'lancamento-imobiliario-mais-que-campanha',
    'Por que um lançamento imobiliário exige mais do que uma campanha',
    'Produto, investimento, posicionamento, comunicação, tecnologia e operação comercial precisam trabalhar no mesmo planejamento.',
    'imobiliario',
    ['Lançamentos', 'Grifo Core'],
    '2026-10-06',
    `Da definição do produto à última etapa de vendas, um lançamento envolve decisões que vão muito além da mídia.

Quando estratégia, branding, campanhas, tecnologia e atendimento comercial trabalham isoladamente, aumentam os riscos de desperdício, inconsistência e perda de oportunidades.

## Um plano antes da execução
Organizar diagnóstico, estratégia, cronograma, investimento, conceito, mídia, tecnologia, funil comercial, metas e indicadores em um só documento dá à incorporadora uma visão única do lançamento.

## Integração com vendas
O lead só vira venda quando existe SLA de atendimento, distribuição e acompanhamento do funil. Por isso, a integração comercial faz parte da estratégia desde o início.

> Rascunho editorial preparado a partir do material da Grifo. Revisar antes de publicar.`,
  );
  art(
    'captacao-de-alunos-jornada',
    'A jornada do aluno mudou. E a captação?',
    'Pesquisa, confiança, comparação e decisão financeira: o que considerar ao planejar campanhas de matrículas.',
    'educacao',
    ['Captação', 'Matrículas'],
    '2026-09-22',
    `Escolher uma instituição de ensino envolve pesquisa, confiança, comparação, expectativa profissional e decisão financeira.

## Alcançar não basta
É preciso comunicar diferenciais relevantes, construir credibilidade e facilitar o contato.

## Do interesse à matrícula
Acompanhar cada oportunidade — com resposta rápida e relacionamento — é o que transforma interessados em inscritos e matriculados.

> Rascunho editorial preparado a partir do material da Grifo. Revisar antes de publicar.`,
  );

  // ───────── Páginas legais (minutas — requerem revisão jurídica) ─────────
  out.push({
    type: 'legal',
    slug: 'politica-de-privacidade',
    title: 'Política de Privacidade',
    seo: { title: 'Política de Privacidade | Grifo', description: 'Como a Grifo trata dados pessoais coletados neste site, em conformidade com a LGPD.' },
    data: {
      title: 'Política de Privacidade',
      updatedAt: '2026-11-03',
      body: `Esta política explica como tratamos os dados pessoais coletados neste site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

## Quais dados coletamos
- **Formulários de contato:** nome, empresa, e-mail, WhatsApp, segmento, tipo de demanda e mensagem.
- **Dados de origem da visita:** parâmetros de campanha (UTM), página de entrada, página de origem e data/hora.
- **Dados técnicos:** um identificador pseudonimizado do endereço IP, usado exclusivamente para prevenção de abuso.
- **Cookies:** apenas os necessários ao funcionamento do site; cookies de análise e marketing somente com o seu consentimento.

## Para que usamos
- Responder à sua solicitação e apresentar propostas (execução de procedimentos preliminares a contrato).
- Medir o desempenho do site e de campanhas, quando você autoriza cookies de análise.
- Proteger o site contra spam e uso indevido (legítimo interesse).

## Compartilhamento
Os dados podem ser compartilhados com fornecedores que operam em nosso nome (hospedagem, CRM e envio de e-mails), sob obrigações de confidencialidade e segurança. Não vendemos dados pessoais.

## Retenção
Mantemos os dados de contato pelo prazo configurado em nossa política interna de retenção, após o qual são excluídos automaticamente, salvo obrigação legal.

## Seus direitos
Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação e revogação do consentimento a qualquer momento pelo canal do encarregado indicado no rodapé.

## Segurança
Adotamos conexão criptografada (HTTPS), controle de acesso ao painel com senha forte e autenticação em dois fatores, registros de auditoria e minimização de dados.`,
    },
  });
  out.push({
    type: 'legal',
    slug: 'politica-de-cookies',
    title: 'Política de Cookies',
    seo: { title: 'Política de Cookies | Grifo', description: 'Quais cookies usamos e como gerenciar suas preferências.' },
    data: {
      title: 'Política de Cookies',
      updatedAt: '2026-11-03',
      body: `## Cookies necessários
Garantem o funcionamento do site e guardam suas preferências de consentimento. Não podem ser desativados.

## Cookies de análise
Ajudam a entender como o site é usado (Google Analytics 4 via Google Tag Manager). Só são ativados com o seu consentimento.

## Cookies de marketing
Permitem medir campanhas e personalizar anúncios. Só são ativados com o seu consentimento.

## Como gerenciar
Você pode alterar suas escolhas a qualquer momento pelo link **Preferências de cookies** no rodapé do site.`,
    },
  });
  out.push({
    type: 'legal',
    slug: 'termos-de-uso',
    title: 'Termos de Uso',
    seo: { title: 'Termos de Uso | Grifo', description: 'Condições de uso do site da Grifo Agency.' },
    data: {
      title: 'Termos de Uso',
      updatedAt: '2026-11-03',
      body: `Ao acessar este site, você concorda com estes termos.

## Conteúdo
Textos, marcas, imagens e vídeos pertencem à Grifo ou a seus clientes e parceiros, e não podem ser reproduzidos sem autorização.

## Informações
As informações sobre serviços têm caráter institucional. Escopo, prazos e condições são definidos em proposta comercial específica.

## Links externos
Não nos responsabilizamos pelo conteúdo de sites de terceiros eventualmente indicados.`,
    },
  });

  // ───────── Redirecionamentos de exemplo (URLs antigas) ─────────
  out.push({ type: 'redirect', slug: 'servicos', title: '/servicos', data: { from: '/servicos', to: '/solucoes/marketing' } });
  out.push({ type: 'redirect', slug: 'quem-somos', title: '/quem-somos', data: { from: '/quem-somos', to: '/sobre' } });
  out.push({ type: 'redirect', slug: 'blog', title: '/blog', data: { from: '/blog', to: '/insights' } });
  for (const [from, to] of LEGACY_REDIRECTS) out.push({ type: 'redirect', slug: redirectSlug(from), title: from, data: { from, to } });

  return out;
}

export const SEED_DOCS = docs;

/* ───────── Migrações de conteúdo (incrementais, idempotentes, não destrutivas) ─────────
 * Bancos criados antes da versão 2027-studio já passaram pelo seed e não o executam de novo.
 * Cada migração só ACRESCENTA o que falta, preserva edições existentes e registra revisão para auditoria.
 */
type Row = { id: number; draft: string; published: string | null };
function patchDoc(db: DatabaseSync, type: string, slug: string, patch: (d: Record<string, unknown>) => boolean) {
  const r = db.prepare('SELECT id, draft, published FROM documents WHERE type = ? AND slug = ?').get(type, slug) as Row | undefined;
  if (!r) return;
  const t = Date.now();
  for (const col of ['draft', 'published'] as const) {
    const raw = r[col];
    if (!raw) continue;
    const d = JSON.parse(raw) as Record<string, unknown>;
    if (patch(d)) {
      const json = JSON.stringify(d);
      db.prepare(`UPDATE documents SET ${col} = ?, updated_at = ? WHERE id = ?`).run(json, t, r.id);
      if (col === 'draft') db.prepare('INSERT INTO revisions (document_id, action, data, seo, user_id, created_at) VALUES (?, ?, ?, ?, NULL, ?)').run(r.id, 'migração 2027-studio', json, '{}', t);
    }
  }
}

type SeoFix = { type: string; slug: string; title: string; description: string; from: string[] };
const SEO_REVIEW: SeoFix[] = [
  { type: 'home', slug: 'home', title: 'Grifo Agency | Agência de marketing, estratégia e conteúdo', description: 'Agência de marketing que integra consultoria, campanhas, produção audiovisual e tecnologia para marcas que querem crescer. Conheça o ecossistema Grifo.', from: ['Grifo Agency — O ecossistema para marcas que fazem história'] },
  { type: 'about', slug: 'sobre', title: 'Sobre a Grifo | Agência de marketing desde 2016', description: 'Desde 2016, a Grifo conecta estratégia, criatividade, produção audiovisual e tecnologia para construir marcas fortes e gerar novas oportunidades de negócio.', from: ['Sobre a Grifo — Ecossistema de marcas que fazem história'] },
  { type: 'solution', slug: 'consulting', title: 'Consultoria de marketing e estratégia | Grifo Consulting', description: 'Consultoria estratégica de marketing: diagnóstico, planejamento, posicionamento, lançamentos e indicadores para decidir melhor antes de investir em campanhas.', from: ['Grifo Consulting — Boas decisões constroem grandes resultados'] },
  { type: 'solution', slug: 'marketing', title: 'Agência de marketing e publicidade | Grifo Marketing', description: 'Branding, campanhas, social media, mídia online e offline, performance, conteúdo, inbound e SEO para marcas que querem gerar demanda e crescer.', from: ['Grifo Marketing — Ideias que conectam marcas, pessoas e resultados'] },
  { type: 'solution', slug: 'studios', title: 'Produtora audiovisual para marcas | Grifo Studios', description: 'Filmes publicitários, vídeos institucionais e para redes sociais, fotografia, drone, motion e animação que transformam estratégia em histórias lembradas.', from: ['Grifo Studios — Histórias que merecem ser vistas, sentidas e lembradas'] },
  { type: 'solution', slug: 'tech', title: 'Sites, landing pages e automação | Grifo Tech', description: 'Websites, landing pages, integrações, automações, dashboards e tracking para conectar marketing, dados e vendas com mais eficiência e controle.', from: ['Grifo Tech — Tecnologia que conecta estratégias a resultados'] },
  { type: 'specialty', slug: 'imobiliario', title: 'Marketing imobiliário para lançamentos | Grifo Core', description: 'Marketing imobiliário para incorporadoras: inteligência de mercado, branding, plano de lançamento, mídia, tecnologia e integração com o time de vendas.', from: ['Grifo Core — Estratégia integrada para lançamentos imobiliários'] },
  { type: 'specialty', slug: 'educacao', title: 'Marketing educacional e captação de alunos | Grifo', description: 'Marketing para instituições de ensino: posicionamento, campanhas de vestibular e captação, performance, automação e indicadores do funil de matrículas.', from: ['Grifo Education — Estratégias de captação e matrículas'] },
  { type: 'specialty', slug: 'tecnologia', title: 'Marketing B2B para empresas de tecnologia | Grifo', description: 'Posicionamento, go-to-market, geração de demanda, product marketing, conteúdo e SEO para empresas de tecnologia que precisam crescer com previsibilidade.', from: ['Grifo Tech & Growth — Go-to-market e demanda B2B'] },
  { type: 'specialty', slug: 'concessionarias', title: 'Marketing para concessionárias e automotivo | Grifo', description: 'Estratégia, campanhas, mídia regional, audiovisual e CRM para concessionárias e grupos automotivos que precisam conectar marca, loja e vendas.', from: ['Grifo Concessionárias — Estratégia, campanhas e experiências para o mercado automotivo'] },
  { type: 'micca', slug: 'metodologia-micca', title: 'Metodologia MICCA: planejamento de campanhas | Grifo', description: 'Meta, Investimento, Conteúdo, Canais e Atendimento: o método da Grifo para planejar campanhas com inteligência antes, durante e depois da execução.', from: ['MICCA — Inteligência antes da campanha | Grifo'] },
  { type: 'coreLanding', slug: 'grifo-core', title: 'Grifo Core Assessment | Diagnóstico de lançamento', description: 'Solicite o Grifo Core Assessment: diagnóstico do lançamento imobiliário com produto, VGV, unidades, ticket, público, prazo, verba, canais, CRM e metas.', from: ['Grifo Core Assessment — Diagnóstico para lançamentos imobiliários'] },
  { type: 'projectsPage', slug: 'projetos', title: 'Projetos e cases de marketing | Grifo Agency', description: 'Cases de lançamentos imobiliários, educação e marcas: contexto, desafio, estratégia e execução de projetos desenvolvidos pelo ecossistema Grifo.', from: ['Projetos — Estratégia aplicada | Grifo'] },
  { type: 'insightsPage', slug: 'insights', title: 'Blog de marketing e publicidade | Insights Grifo', description: 'Artigos sobre o mundo da publicidade, marketing imobiliário e marketing de estratégia, com dados, tendências e análises para quem decide.', from: ['Insights — Ideias que movimentam negócios | Grifo'] },
  { type: 'contactPage', slug: 'contato', title: 'Contato | Fale com a Grifo Agency', description: 'Conte seu desafio para a Grifo. Vamos entender seu negócio e mostrar como estratégia, criatividade, conteúdo e tecnologia podem impulsionar resultados.', from: ['Contato — Vamos conversar | Grifo'] },
];

const SERVICE_TEXT: Record<string, string> = {
  'Diagnóstico': 'Leitura do negócio, do mercado e da concorrência para encontrar gargalos e oportunidades antes de investir.',
  'Planejamento': 'Metas, prioridades, verba e cronograma organizados em um plano claro de marketing e comunicação.',
  'Posicionamento': 'Definição do que torna a marca única e de como ela deve ser percebida pelo público certo.',
  'Lançamentos': 'Estratégia de pré-lançamento, lançamento e sustentação para produtos, serviços e empreendimentos.',
  'Consultoria comercial': 'Processos, funil e rotina do time de vendas alinhados ao marketing para transformar contatos em negócios.',
  'Indicadores': 'KPIs, metas e painéis para acompanhar resultados e decidir com base em dados.',
  'Branding': 'Identidade, discurso e experiência de marca consistentes em todos os pontos de contato.',
  'Campanhas': 'Conceito criativo e peças que comunicam o valor certo para o público certo, no momento certo.',
  'Social': 'Planejamento, conteúdo e gestão das redes sociais com linha editorial e consistência de marca.',
  'Mídia online e offline': 'Planejamento e compra de mídia digital, TV, rádio, OOH e PDV, com um papel claro para cada meio.',
  'Performance': 'Campanhas pagas orientadas a conversão, com testes, otimização contínua e controle do custo por resultado.',
  'Conteúdo': 'Textos, roteiros e materiais que educam o público e sustentam a autoridade da marca.',
  'Inbound': 'Atração e nutrição de leads com conteúdo, automação e jornadas que levam até a venda.',
  'SEO': 'Otimização do site e do conteúdo para a marca ser encontrada no Google e nas buscas com IA.',
  'Filmes': 'Filmes publicitários do roteiro à finalização, para TV, digital e eventos.',
  'Institucionais': 'Vídeos que apresentam a empresa, sua história, cultura e diferenciais.',
  'Vídeos sociais': 'Vídeos pensados para cada rede: formatos curtos, verticais e com o ritmo certo.',
  'Fotografia': 'Ensaios de produtos, ambientes, pessoas e eventos com direção de arte.',
  'Drone': 'Imagens aéreas para empreendimentos, obras, eventos e paisagens.',
  'Motion': 'Vinhetas, peças animadas e motion graphics que dão movimento à comunicação.',
  'Animação': 'Animações que explicam produtos, processos e ideias de forma simples.',
  'Websites': 'Sites institucionais rápidos, seguros e fáceis de atualizar, pensados para gerar contatos.',
  'Landing pages': 'Páginas focadas em conversão para campanhas, lançamentos e captação de leads.',
  'Soluções web': 'Sistemas e ferramentas sob medida para necessidades específicas do negócio.',
  'Integrações': 'Site, CRM, mídia e ferramentas conectados para os dados circularem sem retrabalho.',
  'Automações': 'Fluxos automáticos de e-mail, WhatsApp e CRM para atender e nutrir leads no tempo certo.',
  'Dashboards': 'Indicadores de marketing e vendas reunidos em um só painel.',
  'Tracking': 'Tags, pixels e eventos configurados para medir cada etapa da jornada com precisão.',
};

/** Publica artigos aprovados pela gerência: remove a nota interna de rascunho, tira o selo e registra a revisão. */
function publishApprovedArticles(db: DatabaseSync, slugs: string[]) {
  const note = /\n*> Rascunho editorial preparado a partir do material da Grifo\. Revisar antes de publicar\.\n*/;
  const t = Date.now();
  const get = db.prepare("SELECT id, draft, draft_seo FROM documents WHERE type = 'article' AND slug = ?");
  const pub = db.prepare('UPDATE documents SET draft = ?, published = ?, published_seo = draft_seo, placeholder = 0, published_at = ?, updated_at = ? WHERE id = ?');
  const rev = db.prepare('INSERT INTO revisions (document_id, action, data, seo, user_id, created_at) VALUES (?, ?, ?, ?, NULL, ?)');
  for (const slug of slugs) {
    const r = get.get(slug) as { id: number; draft: string; draft_seo: string | null } | undefined;
    if (!r) continue;
    const d = JSON.parse(r.draft) as { body?: string };
    if (typeof d.body === 'string') d.body = d.body.replace(note, '\n\n').trim();
    const j = JSON.stringify(d);
    pub.run(j, j, t, t, r.id);
    rev.run(r.id, 'publicação aprovada (gerência, 13/11/2026)', j, r.draft_seo || '{}', t);
  }
}

export const CONTENT_MIGRATIONS: { id: string; run: (db: DatabaseSync) => void }[] = [
  {
    id: '2027-studio-concessionarias',
    run(db) {
      const t = Date.now();
      const ins = db.prepare(
        `INSERT OR IGNORE INTO documents (type, slug, title, draft, published, draft_seo, published_seo, placeholder, sort, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      );
      const c = CONCESSIONARIAS_DOC;
      ins.run(c.type, c.slug, c.title, JSON.stringify(c.data), JSON.stringify(c.data), JSON.stringify(c.seo), JSON.stringify(c.seo), c.sort ?? 0, t, t, t);
      // Seletor MICCA: acrescenta a aba Concessionárias se não existir.
      patchDoc(db, 'micca', 'metodologia-micca', (d) => {
        const apps = Array.isArray(d.applications) ? (d.applications as { sector?: string }[]) : [];
        if (apps.some((a) => a.sector === 'concessionarias')) return false;
        d.applications = [...apps, MICCA_AUTO_APPLICATION];
        return true;
      });
      // Roteamento de leads: regra vazia para o novo segmento (e-mails definidos no painel).
      patchDoc(db, 'settings', 'global', (d) => {
        const rules = Array.isArray(d.leadRouting) ? (d.leadRouting as { segment?: string }[]) : [];
        if (rules.some((r) => r.segment === 'concessionarias')) return false;
        const i = rules.findIndex((r) => r.segment === 'outros');
        const next = [...rules];
        next.splice(i < 0 ? next.length : i, 0, { segment: 'concessionarias', emails: '' } as never);
        d.leadRouting = next;
        return true;
      });
    },
  },
  {
    id: '2027-studio-legacy-redirects',
    run(db) {
      const t = Date.now();
      const exists = db.prepare("SELECT 1 FROM documents WHERE type = 'redirect' AND lower(json_extract(COALESCE(published, draft), '$.from')) = lower(?)");
      const ins = db.prepare(
        `INSERT OR IGNORE INTO documents (type, slug, title, draft, published, draft_seo, published_seo, placeholder, sort, created_at, updated_at, published_at)
         VALUES ('redirect', ?, ?, ?, ?, '{}', '{}', 0, 0, ?, ?, ?)`,
      );
      for (const [from, to] of LEGACY_REDIRECTS) {
        if (exists.get(from)) continue; // não sobrescreve regras já cadastradas no painel
        const data = JSON.stringify({ from, to });
        ins.run(redirectSlug(from), from, data, data, t, t, t);
      }
    },
  },
  {
    // Revisão de SEO (títulos ≤ 60 caracteres e descrições completas com a palavra-chave de cada página).
    // Só substitui o que ainda é o valor original do seed: nada editado no painel é sobrescrito.
    id: '2026-11-seo-review',
    run(db) {
      const get = db.prepare('SELECT published_seo, draft_seo FROM documents WHERE type = ? AND slug = ?');
      const upd = db.prepare('UPDATE documents SET published_seo = ?, draft_seo = ? WHERE type = ? AND slug = ?');
      for (const r of SEO_REVIEW) {
        const row = get.get(r.type, r.slug) as { published_seo: string | null; draft_seo: string | null } | undefined;
        if (!row) continue;
        const pub = JSON.parse(row.published_seo || '{}') as Record<string, unknown>;
        const dr = JSON.parse(row.draft_seo || '{}') as Record<string, unknown>;
        const untouched = (x: Record<string, unknown>) => !x.title || r.from.includes(String(x.title));
        if (!untouched(pub) || !untouched(dr)) continue;
        upd.run(JSON.stringify({ ...pub, title: r.title, description: r.description }), JSON.stringify({ ...dr, title: r.title, description: r.description }), r.type, r.slug);
      }
    },
  },
  {
    // Insights · edição 2026-11 (A): três artigos como RASCUNHO (não publicados) para aprovação da gerência.
    id: '2026-11-insights-a-drafts',
    run(db) {
      const t = Date.now();
      const ins = db.prepare(
        `INSERT OR IGNORE INTO documents (type, slug, title, draft, published, draft_seo, published_seo, placeholder, sort, created_at, updated_at, published_at)
         VALUES ('article', ?, ?, ?, NULL, ?, NULL, 0, 0, ?, ?, NULL)`,
      );
      for (const a of EDITION_2026_11_A) {
        const data = { title: a.title, excerpt: a.excerpt, category: a.category, tags: a.tags, author: 'equipe-grifo', date: a.date, cover: a.cover, body: a.body };
        ins.run(a.slug, a.title, JSON.stringify(data), JSON.stringify({ title: a.seoTitle, description: a.seoDescription }), t, t);
      }
    },
  },
  {
    // Capas fotográficas (Unsplash, licença livre para uso comercial, hospedadas no próprio site em /acervo/insights)
    // e crédito da imagem nos artigos da edição 2026-11 (A). Só preenche capa vazia, a ilustração 3D provisória
    // (mesmo caminho) ou um link externo do Unsplash; nada editado no painel é sobrescrito.
    id: '2026-11-insights-a-photo-covers',
    run(db) {
      for (const a of EDITION_2026_11_A) {
        patchDoc(db, 'article', a.slug, (d) => {
          const c = d.cover as { src?: string } | undefined;
          let changed = false;
          if (!c?.src || c.src.startsWith('/acervo/insights/') || c.src.startsWith('https://images.unsplash.com/')) { d.cover = a.cover; changed = true; }
          const credit = a.body.slice(a.body.lastIndexOf('*Imagem:'));
          if (typeof d.body === 'string' && !d.body.includes('*Imagem:') && credit.startsWith('*Imagem:')) { d.body = d.body.trimEnd() + '\n\n' + credit; changed = true; }
          return changed;
        });
      }
    },
  },
  {
    // Edição 2026-11 (A) aprovada pela gerência em 13/11/2026: sai do rascunho e é publicada.
    // Só publica artigos ainda não publicados (não sobrescreve versões publicadas pelo painel).
    id: '2026-11-insights-a-publish',
    run(db) {
      const t = Date.now();
      const get = db.prepare("SELECT id, draft, draft_seo, published FROM documents WHERE type = 'article' AND slug = ?");
      const pub = db.prepare('UPDATE documents SET published = draft, published_seo = draft_seo, placeholder = 0, published_at = ?, updated_at = ? WHERE id = ?');
      const rev = db.prepare('INSERT INTO revisions (document_id, action, data, seo, user_id, created_at) VALUES (?, ?, ?, ?, NULL, ?)');
      for (const a of EDITION_2026_11_A) {
        const r = get.get(a.slug) as { id: number; draft: string; draft_seo: string | null; published: string | null } | undefined;
        if (!r || r.published) continue;
        pub.run(t, t, r.id);
        rev.run(r.id, 'publicação aprovada (gerência, 13/11/2026)', r.draft, r.draft_seo || '{}', t);
      }
    },
  },
  {
    // Indicadores confirmados pela gerência em 13/11/2026 (11 anos, 100+ lançamentos, 21 lançamentos imobiliários em 2026):
    // deixam de ser pendentes e passam a aparecer também em produção.
    id: '2026-11-metrics-validated',
    run(db) {
      const ok = { anos: '11', lancamentos: '100+', 'lancamentos-2026': '21' } as Record<string, string>;
      for (const [slug, value] of Object.entries(ok)) {
        patchDoc(db, 'metric', slug, (d) => {
          if (slug === 'lancamentos-2026' && d.value === '18') d.value = value;
          d.validated = true;
          d.criteria = 'Validado pela gerência da Grifo em 13/11/2026.';
          return true;
        });
        db.prepare("UPDATE documents SET placeholder = 0 WHERE type = 'metric' AND slug = ?").run(slug);
      }
    },
  },
  {
    // Breve explicação de cada serviço das frentes (aparece ao passar o mouse nos cartões de "O que fazemos").
    // Só preenche serviços sem texto: nada escrito no painel é sobrescrito.
    id: '2026-11-services-text',
    run(db) {
      const rows = db.prepare("SELECT slug FROM documents WHERE type = 'solution'").all() as { slug: string }[];
      for (const { slug } of rows) {
        patchDoc(db, 'solution', slug, (d) => {
          const items = (d.services as { items?: { title: string; text?: string }[] } | undefined)?.items;
          if (!items) return false;
          let changed = false;
          for (const it of items) {
            if (!it.text && SERVICE_TEXT[it.title]) { it.text = SERVICE_TEXT[it.title]; changed = true; }
          }
          return changed;
        });
      }
    },
  },
  {
    // a gerência pediu os 21 lançamentos imobiliários também na página Sobre (13/11/2026)
    id: '2026-11-sobre-lancamentos-2026',
    run(db) {
      patchDoc(db, 'metric', 'lancamentos-2026', (d) => {
        const ctx = Array.isArray(d.contexts) ? (d.contexts as string[]) : [];
        if (ctx.includes('sobre')) return false;
        d.contexts = [...ctx, 'sobre'];
        return true;
      });
    },
  },
  {
    // fotos de capa (Unsplash License, com crédito no fim do texto) para os três artigos anteriores, pedido da gerência (13/11/2026)
    id: '2026-11-insights-legacy-photo-covers',
    run(db) {
      const covers: { slug: string; alt: string; credit: string }[] = [
        { slug: 'captacao-de-alunos-jornada', alt: 'Estudantes caminhando pelo campus de uma universidade, com um arco de pedra ao fundo', credit: '*Imagem: Brelyn Bashrum / [Unsplash](https://unsplash.com/photos/students-walking-through-a-university-campus-archway-MUiv880yORo).*' },
        { slug: 'lancamento-imobiliario-mais-que-campanha', alt: 'Maquete de um empreendimento residencial com edifícios e áreas verdes vista de cima', credit: '*Imagem: CHUTTERSNAP / [Unsplash](https://unsplash.com/photos/building-scale-model-nXJyZLBnyUQ).*' },
        { slug: 'micca-decisoes-antes-da-campanha', alt: 'Reunião de planejamento: um profissional apresenta a estratégia em um quadro para colegas sentados à mesa', credit: '*Imagem: Vitaly Gariev / [Unsplash](https://unsplash.com/photos/team-collaborating-around-a-whiteboard-during-a-meeting-rgKX4o2xSqI).*' },
      ];
      for (const c of covers) {
        patchDoc(db, 'article', c.slug, (d) => {
          const cur = d.cover as { src?: string } | undefined;
          let changed = false;
          if (!cur?.src) { d.cover = { src: `/acervo/insights/${c.slug}-foto.webp`, alt: c.alt }; changed = true; }
          if (typeof d.body === 'string' && !d.body.includes('*Imagem:')) { d.body = d.body.trimEnd() + '\n\n' + c.credit; changed = true; }
          return changed;
        });
      }
    },
  },
  {
    // contatos oficiais informados pela gerência (13/11/2026); só preenche campos vazios, sem sobrescrever o painel
    id: '2026-11-contatos-oficiais',
    run(db) {
      const official: Record<string, string> = { email: 'bruno@grifo.agency', phone: '(62) 3432-1938', whatsapp: '556234321938' };
      patchDoc(db, 'settings', 'global', (d) => {
        const c = { ...((d.contact as Record<string, string> | undefined) ?? {}) };
        let changed = false;
        for (const [k, v] of Object.entries(official)) {
          if (!c[k]) { c[k] = v; changed = true; }
        }
        if (changed) d.contact = c;
        return changed;
      });
    },
  },
  {
    // artigos anteriores aprovados pela gerência em 13/11/2026: sai a nota de rascunho, sai o selo e o texto é publicado
    id: '2026-11-insights-legacy-approved',
    run(db) {
      publishApprovedArticles(db, ['lancamento-imobiliario-mais-que-campanha', 'captacao-de-alunos-jornada']);
    },
  },
  {
    // "As cinco decisões que vêm antes de qualquer campanha" aprovada pela gerência em 13/11/2026
    id: '2026-11-insights-micca-approved',
    run(db) {
      publishApprovedArticles(db, ['micca-decisoes-antes-da-campanha']);
    },
  },
];

export function applyContentMigrations(db: DatabaseSync) {
  const row = db.prepare("SELECT value FROM meta WHERE key = 'content_migrations'").get() as { value: string } | undefined;
  const done = new Set<string>(row ? (JSON.parse(row.value) as string[]) : []);
  const pending = CONTENT_MIGRATIONS.filter((m) => !done.has(m.id));
  if (!pending.length) return [];
  db.exec('BEGIN');
  try {
    for (const m of pending) {
      m.run(db);
      done.add(m.id);
    }
    db.prepare("INSERT INTO meta (key, value) VALUES ('content_migrations', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(JSON.stringify([...done]));
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return pending.map((m) => m.id);
}

export function ensureSeed(db: DatabaseSync) {
  const seeded = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get();
  if (seeded) return;
  const t = Date.now();
  const ins = db.prepare(
    `INSERT OR IGNORE INTO documents (type, slug, title, draft, published, draft_seo, published_seo, placeholder, sort, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  db.exec('BEGIN');
  try {
    for (const d of docs()) {
      const data = JSON.stringify(d.data);
      const seo = JSON.stringify(d.seo ?? {});
      ins.run(d.type, d.slug, d.title, data, data, seo, seo, d.placeholder ? 1 : 0, d.sort ?? 0, t, t, t);
    }
    db.prepare("INSERT INTO meta (key, value) VALUES ('seeded', ?)").run(String(t));
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
