# CASE STUDY STUDIO — arquitetura e uso

Página: `src/app/(site)/projetos/[slug]/page.tsx`. Os blocos são editados em **Conteúdo › Projetos (cases)**.

## 1. Princípios

1. **Retrocompatível.** Os campos existentes foram mantidos: `context`, `challenge`, `strategy`, `execution`, `results`, `gallery` e `credits`. Um case sem blocos fica completo: os campos viram capítulos, na ordem definida pela linguagem do projeto.
2. **Só dado real.** Todo bloco sem conteúdo some. Também ficam ocultos:
   - citação sem fonte;
   - indicador sem `verificado` e sem fonte;
   - vídeo com origem não permitida;
   - bloco marcado como oculto;
   - tipo de bloco desconhecido.
3. **Variabilidade visual, não de conteúdo.** A linguagem (`layout`) muda superfícies, ordem padrão e tratamento da galeria. Nunca cria texto.
4. **Segurança igual à do painel.** Tudo passa por `sanitizeFields`:
   - selects validados contra as opções;
   - URLs e mídia via `safeHref` e `safeMediaSrc`;
   - markdown renderizado com `sanitize-html`.

## 2. Campos novos no tipo `case` (`src/lib/cms/schema.ts`)

| Campo | Tipo | Uso |
|---|---|---|
| `layout` | select | Automático (pelo setor) · Imobiliário · Educação · Automotivo · Branding · Editorial |
| `heroMedia` | grupo | vídeo de abertura mudo em loop + quadro de capa (opcional) |
| `blocks` | lista ordenável (máx. 40) | narrativa do case |

Cada bloco tem `type`, um `hidden` opcional e só os campos do seu tipo. O painel mostra apenas os campos relevantes, por meio do novo atributo `showWhen` em `Field`, que é aplicado em `components/admin/fields.tsx`. A lista exibe "Tipo — título" para facilitar a ordenação.

| `type` | Campos | Renderização |
|---|---|---|
| `chapter` | `chapter` (context / challenge / strategy / execution / results / gallery), `title` opcional | posiciona um campo existente do case onde o editor quiser |
| `textChapter` | `eyebrow`, `title`, `text` (markdown) | capítulo editorial |
| `editorialSplit` | `eyebrow`, `title`, `text`, `image`, `ratio`, `imageSide` | texto + imagem, lado configurável |
| `fullBleedMedia` | `title`, `image` ou `video`, `ratio` | tela cheia, borda a borda (arquivo pequeno fica no quadro, sem ampliação) |
| `imageGallery` | `gallery` (mosaico / grade / sequência / coluna), `items[]` | galeria com lightbox acessível |
| `campaignRollout` | `title`, `text`, `items[]` com `channel` | peças agrupadas por formato ou canal, cada uma na proporção nativa (4:5, 9:16, 1:1, 16:9, 21:9) |
| `video` | `title`, `video`, `poster`, `ratio` | vídeo com som, **carregado apenas ao clicar** |
| `motionAsset` | `title`, `video`, `poster`, `ratio` | vídeo curto mudo em loop, que só toca visível. Reduced motion ou Save-Data: poster + botão |
| `strategyDiagram` | `title`, `text`, `steps[]` (rótulo + conteúdo) | cadeia problema → insight → … (máx. 8) |
| `quote` | `quote`, `source` (obrigatória) | citação. Sem fonte não aparece |
| `metrics` | `metrics[]` (valor, rótulo, fonte, verificado) | só os verificados e com fonte. Mostra "Fonte: …" |
| `credits` | `credits[]` | substitui os créditos do case |
| `relatedProjects` | `cases[]` | relacionados manuais (vazio = mesmo setor) |
| `nextProject` | `next` | próximo case manual (vazio = próximo publicado) |

## 3. Ordem final da página

1. **Abertura:**
   - trilha de navegação, setor, título, resumo;
   - ficha: Cliente, Setor, Ano, Competências;
   - mídia: vídeo de abertura ou capa. **O texto nunca fica sobre o KV do cliente.**
2. **Capítulos existentes não posicionados**, na ordem padrão da linguagem (abaixo).
3. **Blocos**, na ordem do painel.
4. **Galeria e Resultados legados**, quando não foram posicionados.
5. **Créditos**, somente os confirmados.
6. **Próximo projeto**, com o anterior ao lado. Navegação real entre cases visíveis.
7. **Outros projetos do setor.**
8. **CTA contextual** para o formulário da especialidade do setor.

Ordem padrão de cada linguagem:

| Linguagem | Ordem dos capítulos | Galeria | Superfície |
|---|---|---|---|
| Imobiliário | contexto, desafio, estratégia, execução, galeria, resultados | mosaico | off-white |
| Educação | contexto, desafio, estratégia, **galeria**, execução, resultados | grade (peças por curso) | branco; abertura vinho |
| Automotivo | contexto, desafio, **galeria (KV/peças em coluna)**, estratégia, execução, resultados | coluna única | grafite |
| Branding | contexto, **galeria**, estratégia, execução, desafio, resultados | mosaico | off-white |
| Editorial | contexto, desafio, estratégia, execução, galeria, resultados | mosaico | off-white |

## 4. Publicação e bloqueios

- Cases com `placeholder` (aprovação pendente) **não aparecem em produção**:
  - `/projetos/<slug>` → 404;
  - fora da listagem, do sitemap e da Home.
- Em homologação, os cases pendentes aparecem com `noindex` e selo "Case aguardando aprovação do cliente".
- Rascunho, pré-visualização, publicação, histórico (30 revisões) e auditoria do painel continuam iguais.
- **Os 8 cases do ZIP continuam pendentes.** Nenhum foi publicado, completado ou reclassificado.

## 5. Exemplo de uso com material real (proposta para aprovação, não aplicada)

O case UNICEUG já tem textos aprovados e três imagens no acervo:
- `case-uniceug-hero.webp`, 1345×480;
- `case-uniceug-pecas.webp`, 655×256;
- `uniceug-campanha.webp`, 1345×756, que ainda não está ligada ao case.

Uma configuração possível, **depois da aprovação do cliente e com os originais em alta resolução**:

```json
{
  "layout": "educacao",
  "blocks": [
    { "type": "chapter", "chapter": "context" },
    { "type": "chapter", "chapter": "challenge" },
    { "type": "chapter", "chapter": "strategy" },
    { "type": "fullBleedMedia", "image": { "src": "/acervo/uniceug-campanha.webp", "alt": "Campanha Vestibular 2025/1 UNICEUG" }, "ratio": "16:9" },
    { "type": "campaignRollout", "gallery": "grid", "items": [
      { "image": { "src": "<feed Psicologia em alta>", "alt": "Peça de Psicologia" }, "channel": "Feed", "ratio": "4:5" },
      { "image": { "src": "<story Engenharia Civil>", "alt": "Peça de Engenharia Civil" }, "channel": "Stories", "ratio": "9:16" }
    ] },
    { "type": "chapter", "chapter": "execution" }
  ]
}
```

Os canais Feed, Stories, Banners e Mídia de performance aparecem no texto de execução já aprovado. Os arquivos de cada peça ainda precisam ser enviados.

## 6. Testes

`tests/e2e/case-studio.spec.ts`, rodando contra o fixture `scripts/qa/seed-fixture.ts`. O fixture é um case **de teste**, gravado pela mesma sanitização do painel e nunca seedado em produção. O teste verifica:
- todos os tipos de bloco;
- itens ocultos (citação sem fonte, indicador não verificado, bloco oculto, tipo inválido, vídeo `javascript:`);
- XSS (`<script>` e `javascript:` no markdown);
- vídeo com som só ao clicar;
- motion mudo em loop;
- arquivo pequeno nunca ampliado;
- proporções 9:16 e 4:5 preservadas;
- capítulos legados sem duplicação;
- axe.
