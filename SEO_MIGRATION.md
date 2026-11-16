# SEO MIGRATION — grifo.agency (legado) → site 2027

## 1. Auditoria das URLs do site atual (03/11/2026)

**Método:**
- leitura de `https://grifo.agency/`, `/portfolio`, `/servicos`, `/blog` e `/portfolio/up-buriti`;
- links internos e itens de listagem.

O `sitemap.xml` do site atual não pôde ser lido daqui (a rede bloqueou), então as URLs indexadas foram levantadas pelos links das páginas. **Pendência:** conferir no Google Search Console (Páginas indexadas) antes da troca de DNS e cadastrar o que faltar.

| URL antiga | Conteúdo antigo | Destino 2027 | Motivo |
|---|---|---|---|
| `/` | Home | `/` | mesma função |
| `/quem-somos` | institucional | `/sobre` | equivalente direto (regra já existente no ZIP) |
| `/servicos` | lista de serviços | `/solucoes/marketing` | regra já existente no ZIP. *Sugestão:* `/solucoes` seria mais equivalente, mas a regra foi mantida como estava |
| `/blog` | lista de posts | `/insights` | equivalente (regra já existente) |
| `/contato` | contato | `/contato` | mesma rota (sem redirecionamento) |
| `/portfolio` | listagem | `/projetos` | equivalente direto |
| `/portfolio/up-buriti` | case de lançamento | `/projetos` | o case não faz parte do conteúdo 2027 aprovado |
| `/portfolio/mirage-sky-houses-sorrisomt` | case de lançamento | `/projetos` | idem |
| `/portfolio/primus-parque-novo-mundo-construtora` | case de lançamento | `/projetos` | idem |
| `/portfolio/campanha-nota-1000-fix-urbanismo` | case de campanha | `/projetos` | idem |
| `/portfolio/branding-pousada-flor-de-anis` | branding | `/projetos` | idem |
| `/portfolio/rebranding-pz-construtora` | rebranding | `/projetos` | idem |
| `/blog/comemore-as-olimpiadas-de-paris-2024` | post | `/insights` | o post não existe no conteúdo 2027 |
| `/blog/grifo-propaganda-e-destaque-no-premio-mais-influentes-da-comunicacao-em-goias` | post | `/insights` | idem |
| `/blog/dia-dos-namorados-no-brasil-uma-jornada-de-criatividade-e-comercio` | post | `/insights` | idem |
| `/blog/o-segredo-da-longevidade-nos-relacionamentos-uma-reflexao-a-partir-da-campanha-do-burger-king` | post | `/insights` | idem |
| `/blog/como-utilizar-o-marketing-digital-para-a-geracao-de-leads-qualificados` | post | `/insights` | idem |
| `/blog/celebrando-o-futuro-com-a-campanha-centenaria-do-itau-unibanco` | post | `/insights` | idem |

**Decisão:** nada vai para a Home. Cases e posts antigos vão para a listagem equivalente.

Se a Grifo decidir republicar algum desses cases ou posts na plataforma 2027, ajuste o destino individual em **Sistema › Redirecionamentos**. Os cases antigos (Up Buriti, Mirage, Primus, Fix Urbanismo, Flor de Anis, PZ) **não foram criados** no site novo, para não inventar projetos.

## 2. Implementação

- **Lista:** `LEGACY_REDIRECTS` em `src/lib/cms/seed.ts`.
- **Banco novo:** recebe as regras pelo seed.
- **Banco existente:** recebe pela migração idempotente `2027-studio-legacy-redirects`, que **não duplica nem sobrescreve** regras já cadastradas no painel (teste em `tests/migration.test.ts`).
- **Resposta:** `308 Permanent Redirect` pela rota coringa `[...slug]`.

## 3. Checagens executadas (`tests/e2e/prod-and-leads.spec.ts`, servidor em modo produção)

- [x] As 16 URLs antigas respondem 308 com `Location` igual ao destino da tabela.
- [x] `sitemap.xml`:
  - inclui `/especialidades/concessionarias`;
  - não inclui cases pendentes, rascunhos de insights nem `/admin`.
- [x] `robots.txt` com `Disallow: /admin` e `/api/`.
- [x] Canonical, Open Graph e título editorial em `/especialidades/concessionarias`.
- [x] Metadata de `/especialidades` cita as quatro especialidades. Os textos editoriais da página não mudaram.
- [x] Cases pendentes: 404 em produção. Em homologação aparecem com `robots: noindex, nofollow`.
- [x] `X-Robots-Tag: noindex` em `/admin` e `/api` (middleware preservado).
- [x] JSON-LD:
  - `Organization` (layout);
  - `BreadcrumbList` (páginas internas);
  - novo: `CreativeWork` apenas em cases **publicados**, nunca em pendentes.

## 4. Antes da troca de DNS

1. Exportar as páginas indexadas do Search Console e comparar com a tabela.
2. Garantir `SITE_URL=https://grifo.agency` (canonical e sitemap absolutos).
3. Enviar o novo sitemap no Search Console e monitorar erros 404 e de cobertura por 4 semanas.
