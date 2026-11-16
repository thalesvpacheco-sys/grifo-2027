# CONCESSIONÁRIAS — copy autorizada e implementação

Esta é a única expansão editorial autorizada (Prompt Mestre 2027, §09). O texto foi inserido **literalmente**. A única microformatação foi a quebra de linha (`\n`) que separa a frase forte da frase leve nos títulos (padrão `Duo` do site).

## 1. Copy no CMS (`src/lib/cms/seed.ts → CONCESSIONARIAS_DOC`)

| Campo do CMS | Texto |
|---|---|
| `name` | Concessionárias |
| `hero.eyebrow` (rótulo editorial) | CONCESSIONÁRIAS / MERCADO AUTOMOTIVO |
| `tagline` | Estratégia, campanhas e experiências para marcas que movimentam o mercado automotivo. |
| `hero.title` | Sua concessionária precisa de mais que campanhas.⏎Precisa de uma estratégia que conecta marca e vendas. |
| `hero.text` | Integramos inteligência de mercado, planejamento de mídia, criação, produção audiovisual, tecnologia e atendimento para concessionárias e grupos automotivos. Da força da marca à jornada comercial, cada ponto de contato precisa trabalhar na mesma direção. |
| `hero.cta` | Vamos construir sua próxima campanha. → `#formulario` |
| `challenge.title` | O mercado muda rápido.⏎Sua comunicação precisa acompanhar cada movimento. |
| `challenge.text` | Lançamentos, campanhas de varejo, seminovos, pós-venda e relacionamento exigem equilíbrio entre posicionamento institucional, condições comerciais, mídia regional e atendimento. Uma campanha só gera oportunidades quando a operação está preparada para recebê-las e acompanhá-las. |
| `fronts.items` (6) | Estratégia e calendário comercial · Branding, conceito e campanhas · Lançamentos e eventos · Performance e mídia regional · Audiovisual e conteúdo automotivo · CRM, atendimento e inteligência comercial |
| `micca.title` | MICCA aplicado. |
| `micca.items` | **Meta:** Objetivos comerciais e indicadores por unidade/modelo.<br>**Investimento:** Orçamento e alocação por canal/período.<br>**Conteúdo:** Mensagem, oferta, KV e produção fiel às marcas.<br>**Canais:** Mídia digital, regional, offline e PDV.<br>**Atendimento:** Origem, qualificação, follow-up, visita, test-drive e negociação. |
| `segments.items` (6) | Concessionárias e redes multimarcas · Lançamentos de bandeiras e novas unidades · Campanhas táticas e varejo · Seminovos · Pós-venda · Relacionamento com públicos regionais |
| `final.title` | Sua próxima campanha começa com uma estratégia à altura da sua operação. |
| `final.cta` | Converse com a Grifo. (também é o rótulo do botão do formulário) |
| `formDemand` | campanha |
| SEO `title` | Grifo Concessionárias — Estratégia, campanhas e experiências para o mercado automotivo |
| SEO `description` | Estratégia, campanhas e experiências para marcas que movimentam o mercado automotivo. (a tagline) |

**Pendente de revisão humana.** As seções Frentes e Segmentos aparecem sem título, porque a copy autorizada não traz um. Sugestões para aprovar no painel, que **não** foram inseridas:
- Frentes: "Seis frentes. Uma operação."
- Segmentos: "Para quem."

Não há nada de marcas de montadoras, preços, taxas, financiamento, ofertas ou garantias. O teste `tests/content-lock.test.ts` verifica a ausência de `%`, `R$` e "garant".

## 2. Integração (todos os pontos)

| Ponto | Arquivo | O que mudou |
|---|---|---|
| Setor/segmento | `src/lib/cms/schema.ts → SECTORS`, `SPECIALTY_SECTORS` | `concessionarias` antes de "Outros"; seletor MICCA deixa de usar `slice(0,3)` |
| Leads | `src/lib/leads/schema.ts → SEGMENTS`, `leadSchema.segment` | novo valor aceito e validado |
| Roteamento de leads | `settings.leadRouting` (seed + migração) | regra vazia para `concessionarias` (e-mails definidos no painel) |
| Seletor MICCA (`/metodologia-micca`) | `micca.applications` (seed + migração) | nova aba "Concessionárias" com a aplicação autorizada |
| Rotas | `/especialidades/concessionarias` (rota dinâmica existente) | página completa: hero, desafio, frentes, MICCA aplicado, segmentos e formulário com segmento e demanda pré-selecionados |
| Navegação | megamenu, menu mobile, rodapé, Home (índice de 4 especialidades), `/especialidades` | gerados a partir do CMS |
| Portfólio | filtros de `/projetos` | o filtro aparece quando houver case publicado do setor. Nenhum case foi criado nem reclassificado |
| Case Study Studio | `layout` automático `automotivo` para cases do setor; CTA do case → `/especialidades/concessionarias#formulario` | |
| SEO | metadata de `/especialidades` passa a citar as quatro especialidades; sitemap inclui a nova rota | |

## 3. Migração de bancos existentes

`applyContentMigrations` (`src/lib/cms/seed.ts`) roda no boot, depois do seed. É **idempotente e não destrutiva**:
- `INSERT OR IGNORE` da especialidade;
- só **acrescenta** a aba MICCA e a regra de roteamento quando faltam;
- grava uma revisão "migração 2027-studio" no histórico do documento;
- registra o que foi aplicado em `meta.content_migrations`.

Não executa `seed:reset`, não recria tabelas e não sobrescreve edições.

Coberta por `tests/migration.test.ts`:
- banco "legado" com edição feita no painel;
- reexecução sem efeito;
- regra de redirecionamento manual preservada.

> Para publicar a especialidade em produção, o banco operacional recebe a migração no primeiro boot da nova versão. Faça backup antes (ver `DEPLOYMENT_PLAN.md`).
