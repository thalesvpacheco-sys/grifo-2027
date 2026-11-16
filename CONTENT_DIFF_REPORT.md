# CONTENT DIFF REPORT — prova de preservação editorial

O projeto foi comparado com a versão original do ZIP em **duas camadas independentes**.

## 1. CMS: seed atual × `CONTENT_LOCK_BASELINE.json`

`CONTENT_LOCK_BASELINE.json` foi gerado **antes** de qualquer alteração. São 40 documentos, com títulos, textos, CTAs, listas, SEO e metadados do seed. Ver `scripts/qa/export-content-lock.ts`, commit `330af03`.

A comparação é automática no teste `tests/content-lock.test.ts`, que roda em `npm test`. O teste falha se aparecer qualquer diferença fora da lista permitida:
- especialidade Concessionárias;
- aba MICCA Concessionárias;
- regra de roteamento `concessionarias`;
- redirecionamentos de URLs antigas.

| Documento | Caminho | Tipo | Conteúdo | Permitido |
|---|---|---|---|---|
| `settings/global` | `data.leadRouting[3]` | added | {"segment":"concessionarias","emails":""} | sim |
| `micca/metodologia-micca` | `data.applications[3]` | added | {"sector":"concessionarias","label":"Concessionárias","items":[{"pillar":"Meta","text":"Objetivos comerciai… | sim |
| `specialty/concessionarias` | `—` | added | Concessionárias | sim |
| `redirect/portfolio` | `—` | added | /portfolio | sim |
| `redirect/portfolio-up-buriti` | `—` | added | /portfolio/up-buriti | sim |
| `redirect/portfolio-mirage-sky-houses-sorrisomt` | `—` | added | /portfolio/mirage-sky-houses-sorrisomt | sim |
| `redirect/portfolio-primus-parque-novo-mundo-construtora` | `—` | added | /portfolio/primus-parque-novo-mundo-construtora | sim |
| `redirect/portfolio-campanha-nota-1000-fix-urbanismo` | `—` | added | /portfolio/campanha-nota-1000-fix-urbanismo | sim |
| `redirect/portfolio-branding-pousada-flor-de-anis` | `—` | added | /portfolio/branding-pousada-flor-de-anis | sim |
| `redirect/portfolio-rebranding-pz-construtora` | `—` | added | /portfolio/rebranding-pz-construtora | sim |
| `redirect/blog-comemore-as-olimpiadas-de-paris-2024` | `—` | added | /blog/comemore-as-olimpiadas-de-paris-2024 | sim |
| `redirect/blog-grifo-propaganda-e-destaque-no-premio-mais-influentes-da-comunicacao-em-goi` | `—` | added | /blog/grifo-propaganda-e-destaque-no-premio-mais-influentes-da-comunicacao-em-goias | sim |
| `redirect/blog-dia-dos-namorados-no-brasil-uma-jornada-de-criatividade-e-comercio` | `—` | added | /blog/dia-dos-namorados-no-brasil-uma-jornada-de-criatividade-e-comercio | sim |
| `redirect/blog-o-segredo-da-longevidade-nos-relacionamentos-uma-reflexao-a-partir-da-campa` | `—` | added | /blog/o-segredo-da-longevidade-nos-relacionamentos-uma-reflexao-a-partir-da-campanha-do-burger-king | sim |
| `redirect/blog-como-utilizar-o-marketing-digital-para-a-geracao-de-leads-qualificados` | `—` | added | /blog/como-utilizar-o-marketing-digital-para-a-geracao-de-leads-qualificados | sim |
| `redirect/blog-celebrando-o-futuro-com-a-campanha-centenaria-do-itau-unibanco` | `—` | added | /blog/celebrando-o-futuro-com-a-campanha-centenaria-do-itau-unibanco | sim |

Total: 16 diferença(s); não permitidas: 0.


**Resultado: 0 alterações não autorizadas.** Nenhum texto aprovado foi reescrito, resumido, removido ou reordenado.

## 2. Texto renderizado: todas as rotas, nó a nó

Os dois sites foram executados em modo produção (com conteúdo pendente visível, para cobrir também cases e rascunhos):
- o **original**, num worktree do commit `95ef677`;
- a **nova versão**.

Foram coletados **todos os nós de texto** e os `alt` de imagem do `<main>` de 31 rotas (`scripts/qa/snapshot-leaves.mjs` e `scripts/qa/leaves-diff.mjs`). Arquivos:
- `qa/baseline/leaves-baseline.json`;
- `qa/leaves-after.json`;
- `qa/leaves-diff.json`.

- **Textos do original ausentes na nova versão: 0.**
- **Metadados alterados:**

  | Rota | Antes | Depois | Base |
  |---|---|---|---|
  | `/especialidades` | Especialidades — Imobiliário, Educação e Tecnologia \| Grifo | Especialidades — Imobiliário, Educação, Tecnologia e Concessionárias \| Grifo | §16 do prompt mestre |
  | `/especialidades/concessionarias` | 404 | página nova | §09 |

- **Textos acrescentados:**

  | Tipo | Exemplos | Natureza |
  |---|---|---|
  | Especialidade Concessionárias | nome, tagline e página completa | copy autorizada (§09) |
  | Item "Concessionárias" | menus, rodapé, índice da Home, seletor MICCA, formulários | navegação e roteamento autorizados |
  | Numerais de capítulo e de índice | `01`, `02`… | visual, sem palavras |
  | Navegação entre cases | "Próximo projeto", título do anterior com `‹` | **microcopy funcional nova**, pedida no §11.11. Revisar |
  | Ficha do case | rótulo "Setor" (Cliente, Ano e Competências já existiam) | microcopy funcional nova. Revisar |
  | Indicadores verificados | prefixo "Fonte:" | microcopy funcional nova (só aparece com dado verificado). Revisar |
  | Selo de homologação | "Arquivo em baixa resolução — aguardando original" | **só aparece com conteúdo pendente visível** (homologação/preview), como os demais selos do ZIP |
  | Lightbox e galeria | "Ampliar imagem…", "Fechar", "Imagem anterior", "Próxima imagem", contador `1 / 3` | rótulos de acessibilidade (aria) |
  | Separador de competências | `Consulting · Marketing` (era `Consulting, Marketing`) | apresentação. Os rótulos não mudaram |

## 3. Textos editoriais em código (fora do CMS)

Os textos fixos que já existiam no código foram mantidos literalmente. Exemplos:
- hero de `/especialidades` e `/solucoes`;
- intros do megamenu;
- "Seu projeto pode ser o próximo." / "Conte seu desafio de negócio para a equipe Grifo." / "Vamos conversar" na página de case;
- "As outras frentes do ecossistema";
- "Conheça o método MICCA".

O link "Conhecer a especialidade" da Home virou texto para leitor de tela: a linha inteira da especialidade agora é o link.

## 4. Itens para revisão humana

1. Microcopy funcional nova: "Próximo projeto", "Setor", "Fonte:".
2. Títulos das seções Frentes e Segmentos de Concessionárias (sugestões em `CONCESSIONARIAS_CONTENT.md`, **não inseridas**).
3. A descrição padrão de SEO em Configurações ("Especialistas em Mercado Imobiliário, Educação e Empresas de Tecnologia.") **não foi alterada**, por ser texto aprovado. Avaliar se deve citar Concessionárias.
