/*
 * Insights · Edição 2026-11 (A) — rascunhos para aprovação da gerência (gerencia@grifo.agency).
 * Entram no painel como RASCUNHO (não publicados): só aparecem no site depois de aprovados e publicados no painel.
 * Dados de terceiros com fonte e data; revisar números antes de publicar.
 */
export type EditorialArticle = { slug: string; cover: { src: string; alt: string }; title: string; excerpt: string; category: string; tags: string[]; date: string; seoTitle: string; seoDescription: string; body: string };

export const EDITION_2026_11_A: EditorialArticle[] = [
  {
    slug: 'midia-2026-copa-eleicoes-planejamento-2027',
    cover: { src: '/acervo/insights/midia-2026-copa-eleicoes-planejamento-2027-foto.webp', alt: 'Avenida à noite com grandes painéis digitais de publicidade iluminados nas fachadas dos prédios' },
    title: 'Copa, eleições e um empate histórico: o que a mídia de 2026 ensina para o planejamento de 2027',
    excerpt: 'O investimento das agências cresceu 15,8% no primeiro semestre, internet e TV dividem a liderança e o OOH ganhou espaço. O que esses números mudam no plano de mídia do próximo ano.',
    category: 'publicidade',
    tags: ['Mídia', 'Planejamento', 'Tendências'],
    date: '2026-11-05',
    seoTitle: 'Mercado publicitário 2026: o que muda no plano de 2027',
    seoDescription: 'Cenp-Meios mostra alta de 15,8% no 1º semestre, internet e TV empatadas e OOH em alta. Veja o que isso muda no planejamento de mídia para 2027.',
    body: `Todo ano com Copa do Mundo e eleição costuma ser lido como exceção. Em 2026, ele também funcionou como um raio-x de para onde o dinheiro de mídia está indo — e de quais apostas devem continuar valendo quando o calendário voltar ao normal.

## O que os números do primeiro semestre mostram

O painel Cenp-Meios, que reúne os investimentos em mídia comprados por agências no Brasil, registrou **R$ 13,8 bilhões no primeiro semestre de 2026**, alta de **15,8%** sobre o mesmo período de 2025. A Copa do Mundo aparece como o principal motor da movimentação, com efeito praticamente em todos os meios.

A divisão do bolo é o dado mais interessante:

- **Internet: 40,7%** do investimento;
- **Televisão (aberta e por assinatura): 40,6%**;
- **Out-of-home: 13,4%**, contra 11,9% um ano antes — o maior ganho de participação do período;
- Rádio, jornal, revista e cinema somam o restante.

Na prática, digital e TV chegaram a um empate técnico. Isso desmonta duas narrativas apressadas ao mesmo tempo: a de que a TV "acabou" e a de que basta estar nas plataformas digitais para ser lembrado.

## O cenário global ajuda a calibrar a expectativa

As projeções da dentsu apontavam o Brasil como o mercado de maior crescimento em investimento publicitário em 2026 (+9,1%), impulsionado justamente por Copa e eleições. Na revisão de meio de ano, a agência reduziu levemente a expectativa global para 2026 (+5,0%) e elevou a de 2027 (+5,5%), citando a incerteza econômica.

Dois movimentos destacados pela dentsu merecem atenção de quem planeja: o **retail media**, com projeção de crescimento de 14,1% e tendência de ultrapassar a busca paga até 2028, e a **TV conectada (CTV)**, com +9,5%, puxada pelo streaming com anúncios.

## Três leituras para o plano de 2027

### 1. Alcance e precisão deixaram de ser escolhas excludentes

O empate entre internet e TV mostra que os anunciantes estão combinando cobertura com segmentação. O plano que funciona em 2027 não pergunta "TV ou digital?", e sim **qual papel cada meio cumpre na jornada**: quem gera lembrança, quem gera consideração e quem converte.

### 2. O OOH voltou a ser estratégico

O crescimento de participação do out-of-home não é nostalgia. Painéis digitais, programática e a possibilidade de cruzar localização com dados de audiência tornaram o meio mensurável e regionalizável. Para lançamentos imobiliários, varejo e concessionárias — negócios com raio geográfico claro — ele tende a seguir relevante.

### 3. Dados próprios valem mais do que nunca

Retail media e CTV têm algo em comum: dependem de **dados first-party** para segmentar, medir e provar resultado. Marcas que organizam a própria base (CRM, histórico de leads, comportamento no site) negociam melhor, otimizam mais rápido e dependem menos de plataformas de terceiros.

## O erro mais caro: planejar 2027 com a régua de 2026

Um ano com Copa e eleição infla custos de mídia, disputa espaço comercial e altera o comportamento da audiência. Copiar o volume e a distribuição de 2026 para o próximo ano pode significar pagar caro por alcance que não será necessário — ou subinvestir nos meios que ganharam eficiência.

Por isso, antes de definir verba por canal, vale responder às cinco decisões que usamos no **MICCA**:

- **Meta:** o que precisa acontecer no negócio, e em quanto tempo?
- **Investimento:** qual custo por resultado é aceitável para essa meta?
- **Conteúdo:** que mensagem faz o público escolher a marca?
- **Canais:** onde esse público está e qual o papel de cada meio?
- **Atendimento:** o que acontece depois do contato — e quem garante que a oportunidade não se perde?

Os números de 2026 deixam uma lição simples: o mercado premia quem usa cada meio pelo papel que ele cumpre, e não por hábito. O planejamento de 2027 começa por aí.

---

**Fontes:** [Meio & Mensagem — Cenp-Meios: mercado cresce 15,8% no primeiro semestre (16/09/2026)](https://www.meioemensagem.com.br/midia/cenp-meios-mercado-cresce-158-no-primeiro-semestre) · [Cenp — Cenp-Meios registra R$ 13,8 bilhões no primeiro semestre de 2026](https://www.cenp.com.br/post/cenp-meios-registra-r-13-8-bilh%C3%B5es-em-investimentos-em-m%C3%ADdia-das-ag%C3%AAncias-do-painel-no-primeiro-sem) · [ABC da Comunicação — Brasil é o mercado de maior crescimento em investimentos publicitários para 2026 (dentsu)](https://www.abcdacomunicacao.com.br/o-brasil-se-consolida-como-o-mercado-de-maior-crescimento-em-investimentos-publicitarios-para-2026/) · [MediaPost — Dentsu revises downward at mid-year](https://mediapost.com/publications/article/415315/dentsu-revises-downward-at-mid-year.html)

*Imagem: Aria Pessianzadeh / [Unsplash](https://unsplash.com/photos/vibrant-cityscape-with-bright-digital-billboards-at-night-U9v2zo9Berk).*`,
  },
  {
    slug: 'lancamentos-imobiliarios-2027-juros-estoque-mcmv',
    cover: { src: '/acervo/insights/lancamentos-imobiliarios-2027-juros-estoque-mcmv-foto.webp', alt: 'Vista aérea de edifícios residenciais em construção ao lado de uma avenida' },
    title: 'Juros em queda, estoque alto e MCMV no centro: como planejar o marketing de lançamentos para 2027',
    excerpt: 'Vendas recordes puxadas pelo Minha Casa, Minha Vida convivem com estoque elevado, descontos e distratos no médio e alto padrão. O que isso exige do marketing imobiliário.',
    category: 'imobiliario',
    tags: ['Lançamentos', 'Grifo Core', 'Mercado imobiliário'],
    date: '2026-11-05',
    seoTitle: 'Marketing imobiliário 2027: juros, estoque e lançamentos',
    seoDescription: 'Selic em queda, MCMV com metade das vendas e estoque recorde em SP: o que o cenário de 2026 exige do marketing de lançamentos imobiliários em 2027.',
    body: `O mercado imobiliário chega ao fim de 2026 com dois retratos diferentes no mesmo álbum. De um lado, vendas em ritmo recorde e crédito em expansão. Do outro, estoque elevado, descontos maiores e distratos em alta no médio e alto padrão. Para quem vai lançar em 2027, entender essa divisão é o ponto de partida do plano de marketing — não um detalhe de contexto.

## O cenário em números

Levantamento do Portas, com dados de Abrainc, FipeZap, Abecip e Banco Central, ajuda a organizar o quadro:

- **Vendas de imóveis novos cresceram 5,4% no primeiro semestre**, para cerca de 226,5 mil unidades — recorde da série.
- O **Minha Casa, Minha Vida respondeu por 50,3% das vendas**, com alta de 15,5%. Já o **médio e alto padrão recuou 3,2%**.
- No médio e alto padrão, os **distratos chegaram a 21% das vendas brutas**, o maior patamar desde 2020 (Abrainc), e o **desconto médio** ficou em torno de **14%** no segundo trimestre (FipeZap).
- Em São Paulo, o **estoque residencial atingiu recorde de 90,6 mil unidades** em julho.
- A **Selic chegou a 13,75%** após o quinto corte consecutivo, e a Abecip elevou para **R$ 411 bilhões** a projeção de crédito imobiliário em 2026. O repasse da queda de juros às taxas de financiamento, porém, pode levar meses.

## O que muda para quem vai lançar

### 1. A disputa não é só por atenção, é por confiança

Com mais estoque disponível e descontos circulando, o comprador compara mais, negocia mais e desiste mais. Distrato alto é sinal de que parte das vendas foi feita sem a convicção necessária. O marketing precisa construir **razões sólidas de escolha** — localização, produto, diferenciais, credibilidade da incorporadora — e não apenas gerar volume de contatos.

### 2. Cada faixa de renda pede uma operação diferente

O MCMV concentra metade das vendas e boa parte dos lançamentos, com uma jornada muito ligada a aprovação de crédito, subsídio e simulação. O médio e alto padrão depende de experiência, percepção de valor e relacionamento. Usar a mesma campanha, o mesmo funil e o mesmo atendimento para públicos tão diferentes é um dos caminhos mais curtos para desperdiçar verba.

### 3. O lançamento começa antes da campanha

Em um mercado mais competitivo, decisões de **produto, preço, cronograma e posicionamento** pesam tanto quanto a criação. Pesquisa de mercado, leitura da concorrência direta e definição de metas de velocidade de vendas precisam acontecer antes do primeiro anúncio — e orientar o investimento em mídia por fase (pré-lançamento, lançamento e sustentação).

### 4. O atendimento virou parte do marketing

Lead que demora a ser atendido esfria; lead mal qualificado vira visita perdida e, às vezes, distrato. Integrar campanha, CRM, corretores e indicadores — com regras claras de distribuição e tempo de resposta — é o que transforma interesse em venda sustentável.

## Um roteiro prático para 2027

Antes de aprovar a verba do próximo lançamento, vale ter respostas objetivas para:

- **Meta:** quantas unidades vender, em quanto tempo e com qual VSO esperada?
- **Investimento:** qual custo por venda é compatível com o VGV e com a margem do empreendimento?
- **Conteúdo:** qual é o argumento central que diferencia este produto dos concorrentes do raio?
- **Canais:** qual combinação de mídia digital, OOH, PDV e eventos sustenta cada fase?
- **Atendimento:** quem atende, em quanto tempo, com qual roteiro e como o resultado volta para o planejamento?

É exatamente esse encadeamento — do estudo inicial à otimização das vendas — que organizamos no **Grifo Core**. Em um ano de juros ainda altos, mas em queda, quem chega ao lançamento com estratégia definida tende a capturar a demanda que volta ao mercado; quem chega só com campanha disputa preço.

---

**Fontes:** [Portas — Mercado imobiliário 2026: como está hoje e o que esperar (atualizado em 30/10/2026)](https://portas.com.br/dados-inteligencia/mercado-imobiliario-2026/), com dados de Abrainc, FipeZap, Abecip e Banco Central.

*Imagem: Subhash Chand / [Unsplash](https://unsplash.com/photos/apartment-buildings-under-construction-next-to-a-road-IP8_6jKC8c4).*`,
  },
  {
    slug: 'visibilidade-em-respostas-de-ia-estrategia-2027',
    cover: { src: '/acervo/insights/visibilidade-em-respostas-de-ia-estrategia-2027-foto.webp', alt: 'Notebook com a tela de um assistente de inteligência artificial perguntando como pode ajudar' },
    title: 'Ser citado pela IA: a nova disputa por visibilidade e o que muda na estratégia de marketing em 2027',
    excerpt: 'Buscas resolvidas sem cliques, agentes que comparam e compram e a pressão por medir impacto real. Como ajustar a estratégia de marketing para a era das respostas geradas por IA.',
    category: 'estrategia',
    tags: ['Estratégia', 'IA', 'Planejamento'],
    date: '2026-11-05',
    seoTitle: 'IA e busca: como ajustar a estratégia de marketing em 2027',
    seoDescription: 'Respostas de IA, busca sem clique e agentes de compra mudam a visibilidade das marcas. Veja como adaptar a estratégia de marketing e a mensuração em 2027.',
    body: `Durante duas décadas, ser encontrado significava aparecer bem posicionado no Google. Em 2027, isso continua importante — mas já não é suficiente. Uma parte crescente das pesquisas termina numa resposta escrita por inteligência artificial, sem que a pessoa visite nenhum site. A pergunta estratégica deixou de ser apenas "como ranquear?" e passou a ser **"como ser a marca citada na resposta?"**.

## O que os estudos estão apontando

O relatório *Tomorrow's World: The 2027 Marketing Outlook*, da Incubeta, organiza as principais mudanças para o próximo ano. Alguns pontos se destacam:

- **Visibilidade em mecanismos de resposta (AEO/GEO):** consumidores usam ferramentas como ChatGPT e Gemini para pesquisar e escolher produtos. O relatório afirma que mais de 60% das buscas informativas já são resolvidas dentro da própria interface de pesquisa, sem visita ao site da marca. A Gartner projetou queda de ao menos 25% no volume de busca tradicional até o fim de 2026.
- **Comércio agêntico:** agentes de IA passam a pesquisar, comparar e até comprar em nome do consumidor — e só recomendam o que conseguem entender, com dados estruturados e atualizados.
- **Mensuração de impacto real:** em estudo anterior da Incubeta, 92% dos líderes de marketing disseram confiar na precisão das próprias métricas, mas 41,6% admitiram que as limitações dessa medição contribuem para desperdício de verba.
- **Dados próprios e alinhamento de liderança:** controlar dados first-party e aproximar marketing, tecnologia e finanças aparece como condição para a IA gerar valor de negócio.

A dentsu reforça o mesmo diagnóstico ao tratar a otimização para mecanismos generativos como nova prioridade estratégica para manter a visibilidade das marcas em buscas e recomendações feitas por IA.

## O que muda na prática

### 1. Autoridade volta a ser o ativo principal

Modelos de IA tendem a citar fontes claras, consistentes e confiáveis. Isso favorece marcas que publicam **conteúdo especialista, com dados, contexto e posicionamento próprio** — e penaliza quem produz volume genérico. Conteúdo raso, escrito apenas para algoritmo, perde valor rapidamente.

### 2. Informação estruturada é marketing

Site com páginas bem organizadas, dados de produtos e serviços atualizados, perguntas respondidas com objetividade e marcação técnica correta (como dados estruturados) facilita que buscadores e assistentes entendam o que a empresa faz. Tecnologia e conteúdo deixam de ser áreas separadas.

### 3. A marca precisa existir além do próprio site

Respostas de IA se apoiam em múltiplas fontes: imprensa, avaliações, perfis, menções de parceiros. Relações públicas, presença em veículos do setor e reputação digital passam a influenciar diretamente a descoberta.

### 4. Medir o que importa, não o que é fácil

Se parte da jornada acontece sem cliques, métricas de último clique contam uma história incompleta. Modelos de marketing mix, testes de incrementalidade e indicadores de negócio — leads qualificados, vendas, custo por resultado — dão uma leitura mais honesta do que está funcionando.

## Por onde começar

Antes de investir em novas ferramentas, a estratégia de 2027 pede respostas simples e bem fundamentadas:

- **Meta:** qual resultado de negócio a marca precisa gerar, e como ele será medido?
- **Investimento:** quanto da verba vai para construir autoridade, e quanto para captar demanda?
- **Conteúdo:** sobre quais temas a marca pode — e deve — ser referência?
- **Canais:** onde o público pesquisa hoje, incluindo assistentes de IA, buscadores, redes e imprensa?
- **Atendimento:** o que acontece quando o contato finalmente chega?

A tecnologia muda rápido; o princípio não. Marcas que sabem o que querem dizer, para quem e com qual prova continuam sendo as mais fáceis de encontrar — por pessoas ou por máquinas.

---

**Fontes:** [ECO — As sete tendências que vão transformar o marketing em 2027 (14/10/2026), sobre o relatório da Incubeta](https://eco.sapo.pt/2026/10/14/as-sete-tendencias-que-vao-transformar-o-marketing-em-2027/) · [ABC da Comunicação — análise sobre IA, dados first-party e GEO (dentsu)](https://www.abcdacomunicacao.com.br/o-brasil-se-consolida-como-o-mercado-de-maior-crescimento-em-investimentos-publicitarios-para-2026/)

*Imagem: Aerps.com / [Unsplash](https://unsplash.com/photos/a-laptop-displays-a-search-bar-asking-how-it-can-help-0Jk1QCGMz5o).*`,
  },
];
