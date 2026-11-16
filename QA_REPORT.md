# QA REPORT — Grifo Agency 2027 · branch `redesign/2027-studio`

Executado em 03/11/2026, num contêiner Linux, com Node 22.23 e Chromium (Playwright 1.63), sobre o build de produção (`next build`) deste branch.

Todos os números abaixo vêm de execuções reais. Os arquivos brutos estão em `qa/`.


## 0. Atualização 05/11/2026 (tarde) — layout boutique em todo o site, SEO e Insights

- **Layout aprovado na Home levado a todas as páginas** (Sobre, Soluções + 4 frentes, Especialidades + 4 mercados, MICCA, Grifo Core, Projetos, cases, Insights, artigo, Contato, páginas legais), com o sistema `src/components/home/boutique.tsx`. Cabeçalho flutuante e rodapé em painel em todo o site.
- **Rodapé no celular:** grade 2×2 compacta (≈ 800 px de altura, antes ≈ 2.000 px).
- **3D:** oito ícones renderizados offline (`tools/render-3d/icons.html`): frentes e especialidades. O WebGL do Grifo Core (LiquidMetal) foi substituído por imagem renderizada.
- **Preservação editorial:** diff de textos renderizados contra a baseline sem nenhum texto aprovado removido (as únicas diferenças são separadores visuais: competências agora em etiquetas, "/" da trilha virou ponto).
- **SEO:** títulos ≤ 60 caracteres e descrições completas com palavra-chave por página (migração `2026-11-seo-review`, que não sobrescreve SEO editado no painel); schema `Service` nas frentes e especialidades, `WebSite`, `Organization` enriquecida, `Article` com seção, palavras-chave, idioma e contagem de palavras; imagem no Twitter card. Lighthouse mobile (produção local): SEO 100 em Sobre, Imobiliário e Contato; Performance 95–97; Acessibilidade 100 (Contato corrigido após a medição).
- **Insights:** novas categorias *Mundo da Publicidade*, *Marketing Imobiliário* e *Marketing de Estratégia*. Três artigos da edição 2026-11 entram como **rascunho** (migração `2026-11-insights-a-drafts`): não aparecem no site nem no sitemap até serem aprovados e publicados no painel. Tarefa agendada quinzenal (dias 1 e 15) gera a próxima edição e envia para aprovação em gerencia@grifo.agency.
- **Testes:** `npm run lint` ok · unitários 24/24 · E2E 79/79 (axe WCAG 2.1 AA incluído).

## 0.1 Atualização 05/11/2026 — novo layout da Home (boutique)

Ver `HOME_2027_BOUTIQUE.md`.

| Verificação | Resultado |
|---|---|
| Tipos | ✅ 0 erros |
| Build | ✅ concluído |
| Unitários | ✅ 22/22 |
| E2E | ✅ **79/79** (o teste de WebGL virou dois testes da escultura renderizada: imagem imediata, vídeo só no desktop; nada de vídeo no celular nem com movimento reduzido) |
| axe WCAG 2.1 AA na Home (390 e 1440) | ✅ sem violações sérias (tons de cinza ajustados para AA) |

Lighthouse da Home em modo produção:

| Perfil | Performance | Acess. | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Mobile | 95 | 100 | 100 | 100 | 2,8 s | 0 | 90 ms |
| Desktop | 100 | 100 | 100 | 100 | 0,7 s | 0 | 0 ms |

O LCP mobile, de laboratório, fica acima da meta de 2,5 s: o elemento é a imagem da escultura, já pré-carregada com prioridade alta.

Capturas em `qa/home-2027/` e percursos gravados em `qa/home-2027/video/`.

## 1. Resultado geral (rodada de 03/11/2026)

| Verificação | Comando | Resultado | Evidência |
|---|---|---|---|
| Tipos (TypeScript) | `npm run lint` | ✅ 0 erros | `qa/lint.txt` |
| Unitários + content lock + migração | `npm test` | ✅ **22/22** | `qa/unit-tests.txt` |
| Build de produção | `npx next build` | ✅ concluído | `qa/build.txt` |
| Auditoria de dependências | `npm audit` | ✅ 0 vulnerabilidades | `qa/audit.txt` |
| E2E (Playwright) | `node scripts/qa/e2e-servers.mjs` + `npx playwright test` | ✅ **78/78** | `qa/e2e-output.txt`, `qa/e2e-results.json` |
| Texto renderizado × ZIP original | `snapshot-leaves` + `leaves-diff` | ✅ **0 textos removidos** em 31 rotas | `qa/leaves-diff.json`, `CONTENT_DIFF_REPORT.md` |
| Lighthouse 12.6 | 6 páginas × mobile/desktop | ver §4 | `qa/lighthouse/`, `qa/lighthouse-summary.json` |
| Capturas | `scripts/qa/screens.mjs` | 17 rotas × desktop 1440 / mobile 390, dobra e página inteira, mais o fixture | `qa/screens/` |

## 2. Como reproduzir

```bash
npm ci
npm run lint && npm test
npx next build
node scripts/qa/e2e-servers.mjs      # sobe 3300 (homologação), 3400 (produção) e 3500 (fixture)
npx playwright test                  # noutro terminal
```

`e2e-servers.mjs` cria bancos **temporários e descartáveis**. As credenciais são de teste local (`qa@grifo.local`) e o banco operacional nunca é tocado.

## 3. Cobertura dos 78 testes E2E

| Arquivo | Testes | O que prova |
|---|---|---|
| `routes.spec.ts` | 28 | 21 rotas com HTTP 200, um único H1, nenhum erro de console e nenhuma imagem quebrada. Menu mobile (Escape fecha e devolve o foco). Megamenu com as 4 especialidades. Home com as 9 seções aprovadas. Filtros do portfólio com anúncio do resultado. Seletor MICCA com Concessionárias. Lightbox navegável por teclado. Case UNICEUG com capítulos existentes, prev/next real e CTA para a especialidade. |
| `a11y-responsive.spec.ts` | 38 | axe-core WCAG 2.1 AA nas rotas e no fixture de blocos. Sem rolagem horizontal e CTAs acessíveis em **320, 360, 375, 390, 430, 768, 1024, 1366, 1440 e 1920 px**. `prefers-reduced-motion`. Conteúdo legível **sem JavaScript**. A escultura WebGL inicia e libera o contexto ao navegar. |
| `prod-and-leads.spec.ts` | 7 | Em modo produção, nenhum case, indicador ou rascunho pendente aparece. Concessionárias está publicada, no sitemap e com metadados próprios. Redirecionamentos 308 do site antigo. Cabeçalhos de segurança (CSP com nonce, HSTS etc.). API de leads recusa origem externa e honeypot. **Lead real gravado no banco de homologação** pelo formulário de Concessionárias, com UTMs, e visível no painel filtrado por segmento. Painel com a especialidade e os blocos de case. |
| `case-studio.spec.ts` | 5 | Os blocos válidos aparecem. XSS, links `javascript:`, tipos inválidos e métricas não verificadas ficam ocultos. Arquivo em baixa resolução nunca é ampliado. Proporção declarada respeitada sem cortar a peça. Layout automotivo. Vídeo com som só sob demanda e motion mudo em loop. |

## 4. Lighthouse (laboratório, 4G simulado no mobile)

| Página | Perf. mobile | LCP mobile | CLS | Perf. desktop | Acess. | Boas práticas | SEO |
|---|---|---|---|---|---|---|---|
| Home | 96 | 2,6 s | 0 | 100 | 100 | 100 | 100 |
| Projetos | 98 | 2,3 s | 0 | 100 | 100 | 100 | 100 |
| Concessionárias | 96 | 2,6 s | 0 | 100 | 100 | 100 | 100 |
| Sobre | 97 | 1,9 s | 0 | 100 | 100 | 100 | 100 |
| MICCA | 98 | 2,1 s | 0 | 100 | 100 | 100 | 100 |
| Case UNICEUG (homologação) | 95 | 2,9 s | 0 | 100 | 100 | 100 | 69 ¹ |

¹ Esperado: o case está **pendente de aprovação** e por isso sai com `noindex`. Só aparece em homologação.

Leituras:
- Todas as metas de laboratório do prompt foram atingidas: Performance ≥ 90, Acessibilidade ≥ 95, Boas práticas ≥ 95 e CLS ≤ 0,1.
- O LCP mobile fica entre 1,9 e 2,9 s.
  - No modo de laboratório sem cookie, o maior elemento é o aviso de cookies. Ele agora vem renderizado no servidor (ver §6).
  - Nas páginas com mais de 2,5 s (home e Concessionárias com 2,6 s, case com 2,9 s), o limite está no trajeto de CSS e fontes da conexão simulada.
- **LCP, INP e CLS no percentil 75 de usuários reais não foram medidos.** Exigem dados de campo (CrUX ou RUM) após a publicação. Não declaramos esses alvos como atingidos.

## 5. Preservação editorial

- `tests/content-lock.test.ts` compara o seed atual com o `CONTENT_LOCK_BASELINE.json` (gerado antes de qualquer alteração). Resultado: **0 diferenças não autorizadas**. As 16 permitidas são:
  - a especialidade Concessionárias;
  - a aba MICCA de Concessionárias;
  - o roteamento de lead `concessionarias`;
  - os redirecionamentos de URLs antigas.
- Texto renderizado em 31 rotas, original (commit `95ef677`) × versão nova: **nenhum texto do original sumiu**. Os acréscimos são:
  - Concessionárias e seus pontos de navegação;
  - numerais de capítulo;
  - rótulos funcionais "Setor", "Próximo projeto" e "Fonte:";
  - rótulos de acessibilidade.

  Todos estão listados em `CONTENT_DIFF_REPORT.md` para revisão humana.

## 6. Correções e ajustes desta rodada de QA

| Problema encontrado | Correção |
|---|---|
| O aviso de cookies só aparecia depois da hidratação e era o elemento de LCP no celular | O estado inicial é lido do cookie no servidor e o aviso já vem no HTML. LCP da home mobile: 3,0 s → 2,6 s. |
| CLS de 0,069 na home mobile: o título do hero mudava de quebra quando a fonte chegava | Fontes servidas por `next/font/local`, com os mesmos arquivos Outfit/Manrope e fallback de métricas ajustadas. CLS: 0,069 → 0. |
| Título do hero invisível até a animação começar | O título agora só desloca na entrada, sem esmaecer, e fica legível desde a primeira pintura. |
| Galeria/desdobramento cortava artes horizontais em quadros 4:5 e 9:16 (`object-cover`) | Mesma regra do `Frame`: se o quadro pedido cortaria a peça, vale a proporção do arquivo. O teste foi reescrito para provar as duas situações. |
| Quadros de arte em baixa resolução eram cinza e chapados | Atmosfera de cor gerada pela própria peça, desfocada e decorativa (`aria-hidden`). A peça continua em tamanho real, sem ampliação. |
| Vitrine reservava o maior quadro a projetos sem imagem e o menor à única arte em alta resolução | A escala acompanha a qualidade do material, sem mudar a ordem dos projetos. |
| Capturas de QA: a primeira página saía em branco e a dobra saía no meio da rolagem (scroll suave) | Aquecimento antes da captura e rolagem instantânea durante ela. |
| E2E dependia de servidores montados à mão | Criado `scripts/qa/e2e-servers.mjs`, reproduzível, com bancos temporários. |

## 7. Revisão visual

As capturas de todas as rotas-chave estão em `qa/screens/`, em desktop 1440 e mobile 390 (primeira dobra e página inteira). O fixture com todos os blocos do Case Study Studio está em `qa/screens/fixture/`. O "antes" está em `qa/baseline/screens/`.

Foram revisadas uma a uma:
- Home (9 seções);
- Projetos;
- Case UNICEUG;
- Concessionárias;
- fixture de blocos;
- versões mobile do hero, do case, de Concessionárias e de Projetos.

Os styleframes da FASE 04 estão em `CREATIVE_DIRECTION.md` §6.

Percurso gravado do site rodando de verdade, com WebGL, motion, MICCA, vitrine com filtro, lightbox do case, menu e formulário preenchido sem envio:
- `qa/walkthrough/grifo-2027-percurso-desktop.mp4`;
- `qa/walkthrough/grifo-2027-percurso-mobile.mp4`.

O roteiro está em `scripts/qa/walkthrough.mjs`. O vídeo foi acelerado cerca de 1,6× e gravado com renderização por software (sem GPU), então a fluidez real em máquina com GPU é maior.

## 8. O que NÃO foi validado (e por quê)

| Item | Situação |
|---|---|
| Envio real a CRM (webhook) e SMTP | Não configurados neste ambiente. O lead foi gravado e roteado no banco de homologação, mas nenhuma integração externa foi acionada. |
| Deploy em staging público | Não realizado: exige servidor com disco persistente e autorização. Ver `DEPLOYMENT_PLAN.md`. A homologação navegável roda localmente (`npm run homolog`) ou em Docker. |
| Métricas de campo (p75) | Dependem de tráfego real após a publicação. |
| Leitor de tela real (NVDA/VoiceOver) | Coberto só por axe, testes de teclado e nomes acessíveis. Falta um teste manual. |
| Celulares físicos e Safari | Testado só em Chromium emulado. |

## 9. Pendências reais de conteúdo e marca (não resolvidas por decisão — dependem da Grifo)

1. **Cases pendentes:** os 8 cases do seed continuam com aprovação pendente, então em produção **nenhum** aparece. A vitrine de produção mostra o estado vazio aprovado até haver aprovação no painel.
2. **Capas dos cases imobiliários em 222×162 px:** são exibidas no tamanho real, com selo em homologação. Para a vitrine em grande escala, é preciso receber os originais.
3. **Pinauto e Esfiharia Brasil:** sem imagens e sem descrição. Nada foi inventado.
4. **Indicadores** (11 anos, 100+ lançamentos, 18 lançamentos em 2026): marcados "Confirmar antes de publicar" e ocultos em produção.
5. **Fontes Outfit/Manrope:** provisórias, a validar com o brandbook. **Logo SVG:** vetorizado a partir de PNG no ZIP original, a trocar quando houver o original oficial.
6. **Filtro "Concessionárias" no portfólio:** aparece automaticamente quando existir um case publicado com esse setor. Hoje nenhum case tem esse setor, e mudar o setor do case Pinauto seria alteração de conteúdo, por isso não foi feito.
7. **Divergência de data de fundação:** conferida em https://grifo.agency/ em 03/11/2026, **não corrigida** (o copy aprovado prevalece até decisão da Grifo).
   - O ZIP aprovado diz "Desde 2016", tem "2016 · Fundação" na linha do tempo do Sobre e `foundingDate: 2016` no JSON-LD.
   - O site atual mostra "2015 · Criação da Grifo" e "2016 · Primeiro contrato anual".
   - O indicador pendente "11 anos" é coerente com 2015.
8. **Contatos oficiais** (e-mail, telefone, WhatsApp): vazios no seed. O rodapé indica o cadastro em Configurações no painel.
