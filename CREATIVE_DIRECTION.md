# CREATIVE DIRECTION — Grifo Agency 2027 · "A marca em movimento"

## 1. Território

Boutique estratégica, creative technology e agência brasileira premium, conduzida por pessoas.

O redesign muda a **experiência visual**. Ficaram intactos:
- o texto aprovado;
- a estratégia;
- o método MICCA;
- a arquitetura Consulting / Marketing / Studios / Tech;
- o GRIFO CORE.

Ver `CONTENT_DIFF_REPORT.md`.

## 2. Marca: o que foi usado e de onde veio

| Elemento | Fonte | Uso |
|---|---|---|
| Vinho `#8D2525`, Grafite `#202020`, Off-white `#F5F3EF`, Âmbar `#E5A12E` (+ âmbar do logo `#F09702`) | tokens do ZIP (`tailwind.config.ts`) | sem cores novas. Sem roxo, ciano ou neon |
| Logotipo e asa | `src/components/brand/*` (vetorizado do PNG, como já registrado no ZIP) | inalterados. A asa (três faixas) é usada como **elemento gráfico próprio**, nunca deformando o logo |
| Arcos | apresentação comercial (MICCA e capa do Grifo Core em `public/acervo/core-*.webp`) | base da escultura 3D do hero e do sistema MICCA |
| Outfit + Manrope | ZIP (provisórias) | mantidas. Trocar quando o brandbook chegar (`globals.css` / `tailwind.config.ts`) |

> **Pendência real:** o brandbook oficial não estava no ZIP. Cores e fontes seguem os tokens existentes até a comparação com o brandbook.

## 3. Sistema visual

- **Superfícies:** cada página alterna entre quatro superfícies para dar ritmo de capítulos, sem virar um "site escuro" pesado:
  - `surface-paper`: off-white;
  - `surface-white`: branco quente;
  - `surface-ink`: grafite com luz radial sutil;
  - `surface-vinho`.
- **Escala tipográfica de estúdio:**
  - `text-giga`, `text-mega`, `text-h1` e `text-h2` para títulos;
  - leitura em Manrope (`text-lead` e prosa a 1,075 rem);
  - numerais vazados (`outline-num`) em sequências reais: processo, capítulos de case e linha do tempo;
  - rótulos pequenos com numeração (`ChapterLabel`), que **não introduzem texto novo**.
- **Grade:** 12 colunas com assimetria intencional. O título ocupa 9 colunas e o texto entra deslocado nas colunas 8 a 12 (`EditorialHead`).
- **Famílias de seção:**

  | Família | Onde | Componente |
  |---|---|---|
  | Hero Cinemático | Home | `LiquidMetal sculpture` |
  | Manifesto Editorial | Prova de experiência, Desafios | `EditorialHead size="mega"` |
  | Content-driven Diagram | Ecossistema, MICCA, Processo, Jornada | `EcosystemFlow`, `Micca`, `ProcessLine`, `Journey` |
  | Portfolio Showcase | Home, Projetos, provas por especialidade | `PortfolioShowcase` |
  | Índice editorial | Especialidades, Soluções | `EditorialIndex` (linhas tipográficas; não são cards) |
  | Human Evidence | Sobre (filme, linha do tempo, cultura) | `VideoOnDemand`, `Gallery` |
  | Conversão / Final Brand Moment | final de cada página | `StudioFinal` (superfície clara ou vinho, faixas da asa entrando pela direita: é distinto do hero) |

- **Mídia:** a regra é nunca ampliar arquivo pequeno.
  - `lib/media-meta.ts` lê as dimensões reais.
  - Imagens com menos de 900 px aparecem em tamanho real, num quadro neutro (`lowres-frame`).
  - Em homologação, essas imagens recebem o selo "Arquivo em baixa resolução — aguardando original".
  - Se o quadro pedido cortaria mais de 45% de uma peça (um KV horizontal num quadro vertical, por exemplo), vale a proporção do arquivo.

## 4. 3D e motion: função de cada cena

| Cena | Implementação | Função narrativa | Custo / acessibilidade |
|---|---|---|---|
| **Hero Signature** | o shader `LiquidMetal` original foi preservado e evoluído: escultura de **arcos** vinho com filete âmbar, por raymarching, no mesmo fragment shader, sobre o metal líquido | os arcos são a forma do MICCA e do Grifo Core: "método" como objeto | sem Three.js. Resolução interna de 0,5×, DPR ≤ 1,5 (1,25 no celular), 56 passos no celular. Pausa fora da tela e com a aba oculta. Libera programa, buffer e contexto ao desmontar. Reduced motion: um quadro. Sem WebGL ou com Save-Data: poster estático `public/brand/hero-signature.webp` (36 KB) |
| **Ecosystem Flow** | SVG do arco existente + lista; estado compartilhado (hover e foco) | mostra que Consulting envolve as outras três frentes; o traço âmbar contínuo percorre o arco | links reais no SVG e na lista. Funciona sem JS |
| **MICCA Motion System** | arcos ascendentes (já no ZIP) + trilha de progressão de 5 segmentos | a progressão Meta → Atendimento fica explícita | abas WAI-ARIA com setas, Home e End. Nome acessível nos arcos (antes faltava no celular) |
| **Portfolio Transition** | máscara de revelação (`data-reveal="mask"`), entrada escalonada, zoom contido no hover e foco | a obra é a protagonista | sem scroll hijacking. Conteúdo visível sem JS |
| **Case Layers** | `MotionLoop` (vídeo curto mudo, toca só quando está visível), `VideoOnDemand`, lightbox | o material real em movimento, quando existir | sem autoplay de áudio. Reduced motion e Save-Data: poster com botão |
| **Final Brand Moment** | três faixas da asa entram pela direita (`sweep`) | assinatura de fechamento, diferente do hero | uma única animação, desligada no reduced motion |

Bibliotecas: **nenhuma** foi adicionada para motion ou 3D (nem GSAP, nem Three.js).

A CSP com nonce e `strict-dynamic` continua intacta. O JS de primeira carga da Home passou de 116 kB para 118 kB.

## 5. Benchmark → princípios (matriz)

**Limite registrado:** a rede deste ambiente bloqueou o acesso direto a studiofreight.com, locomotive.ca, wearecollins.com e aparelho.studio. Foram lidos ao vivo:
- `portorocha.com/about`;
- `basicagency.com`;
- uma entrevista com a COLLINS (Working Not Working).

Para Studio Freight, Locomotive e Aparelho, os princípios vêm de conhecimento prévio e precisam ser conferidos visualmente pela equipe. Nenhum layout, cursor, animação, cor ou código foi copiado, e nenhuma credencial dessas empresas é atribuída à Grifo.

| Referência | Princípio | Aplicação original Grifo | Risco | Teste de qualidade |
|---|---|---|---|---|
| Studio Freight *(não verificado ao vivo)* | o trabalho é o protagonista; a hierarquia de cases vem por escala | `PortfolioShowcase` com ritmo de 6 escalas e proporções; título e setor sempre no mesmo lugar | parecer "galeria aleatória" | filtros mudam para grade regular (comparação); ordem de leitura constante; teste de filtros |
| Locomotive *(não verificado ao vivo)* | narrativa progressiva; 3D explicativo | arcos do hero = MICCA; trilha de progressão MICCA; jornada de 12 etapas preservada | 3D decorativo competindo com o título | um único elemento 3D; título e CTA legíveis em reduced motion e sem WebGL; teste de CTA não coberto em 10 larguras |
| PORTO ROCHA *(lido: /about)* | marca como **sistema**; motion derivado da marca; projetos citados com nome + frase de resultado | faixas da asa e arcos como sistema de movimento; cards de projeto com título + resumo aprovado | inventar "frases de resultado" | só `summary` do CMS; content lock |
| COLLINS *(entrevista)* | grandes mensagens de valor; o trabalho como prova | `EditorialHead size="mega"` para as frases aprovadas; métricas apenas validadas | prometer resultado | indicadores pendentes ocultos em produção (teste E2E) |
| BASIC/DEPT *(lido: home)* | profundidade por relação de cliente; clareza comercial (cliente + escopo) | ficha do case: Cliente, Setor, Competências, Ano; CTA contextual para a especialidade | links para cases sem conteúdo | case sem dado mostra só o que existe; prev/next reais |
| Aparelho *(não verificado ao vivo)* | refinamento brasileiro contemporâneo; experimentação controlada | escultura em shader autoral e numerais vazados, com respiro amplo | experimento prejudicar leitura | axe AA sem violações sérias; Lighthouse |

## 6. Styleframes renderizados (FASE 04)

Capturas do navegador em `qa/screens/`:

| Arquivo | O que mostra |
|---|---|
| `desktop-home-fold.jpg` | Hero desktop |
| `mobile-home-fold.jpg` | Hero mobile |
| `desktop-projetos-full.jpg` | Portfólio |
| `desktop-projetos_uniceug-vestibular-2025-1-fold.jpg` | Abertura de case |

Antes e depois: `qa/baseline/screens/` × `qa/screens/`.
