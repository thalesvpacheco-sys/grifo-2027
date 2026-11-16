# Grifo Agency — Site 2027

Site institucional da Grifo com painel administrativo próprio, desenvolvido a partir do **Briefing Mestre v1.0 (03/11/2026)**.

> O ecossistema para marcas que fazem história.

---

## Visão geral

| Item | Solução |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Estilo | Tailwind CSS com tokens da marca (Vinho `#8D2525`, Grafite `#202020`, Off-white `#F5F3EF`, Âmbar `#E5A12E`) |
| Tipografia | Outfit (títulos) + Manrope (texto), auto-hospedadas — validar com a fonte oficial do brandbook |
| CMS | Painel próprio em `/admin`, gerado a partir de um registro de schemas (`src/lib/cms/schema.ts`) |
| Banco | SQLite nativo do Node (`node:sqlite`) — sem dependências nativas, um arquivo em `DATA_DIR` |
| Mídia | Upload com verificação de conteúdo, conversão para WebP, remoção de metadados; entrega AVIF/WebP responsiva via `next/image` |
| Visual | Hero em WebGL (metal líquido autoral, ~3 KB, sem bibliotecas), arcos MICCA interativos, jornada de 12 etapas, Core Plan em camadas 3D (CSS), arco do ecossistema em SVG |
| Leads | API segura, CRM via webhook assinado (HMAC), aviso interno por SMTP com roteamento por segmento |
| Analytics | GTM/GA4 com Consent Mode v2 — carregado só após consentimento |

### Por que um CMS próprio (e não Sanity/Strapi)?
O briefing aceita "CMS headless editável ou equivalente". Optamos por um painel integrado porque:
- **zero custo e zero conta externa** — o conteúdo fica no servidor da Grifo;
- **um único deploy** (site + painel + API de leads);
- formulários do painel **gerados pelo schema**: para criar um campo novo basta declará-lo em `schema.ts`;
- rascunho, pré-visualização, publicação, histórico de versões e auditoria nativos.

Se no futuro a Grifo quiser migrar para um headless SaaS, os schemas já descrevem todo o modelo de conteúdo.

---

## Versão 2027 · Studio (branch `redesign/2027-studio`)

Redesign visual, motion e 3D. O copy, o CMS, o banco, a autenticação, a segurança, os leads e o SEO foram **preservados**. A única expansão editorial é a especialidade **Concessionárias**.

| Documento | Conteúdo |
|---|---|
| `CREATIVE_DIRECTION.md` | sistema visual "A marca em movimento", 3D/motion e matriz de benchmark |
| `CONTENT_LOCK_BASELINE.json` + `CONTENT_DIFF_REPORT.md` | prova de preservação do texto (CMS e texto renderizado, nó a nó) |
| `CONCESSIONARIAS_CONTENT.md` | copy autorizada e todos os pontos de integração |
| `CASE_STUDY_SYSTEM.md` | blocos de case editáveis no CMS, regras e exemplos |
| `QA_REPORT.md` | resultados reais de build, testes, Lighthouse e capturas (`qa/screens/`) |
| `SEO_MIGRATION.md` | URLs antigas → novas rotas (308) e checagens |
| `DEPLOYMENT_PLAN.md` | runtime, backup com prova de restauração, migração, homologação e rollback |

### Homologação local navegável

**Mac:** dê dois cliques em `HOMOLOGACAO.command`. Ele instala, faz o build, pede o usuário do painel no primeiro acesso e abre o navegador. Também dá para rodar pelo terminal:

```bash
npm ci
ADMIN_EMAIL=voce@grifo.agency ADMIN_PASSWORD="Senha-forte#2027" npm run homolog   # http://localhost:3000
```

Esse comando sobe o build de produção com `CONTENT_SHOW_PLACEHOLDERS=true` e um banco próprio em `./data-homolog`. Os cases e rascunhos pendentes aparecem com selo e `noindex`. Em produção, use `CONTENT_SHOW_PLACEHOLDERS=false`.

### Testes

```bash
npm run lint        # tipos
npm test            # unitários + content lock + migração (22)
npm run build
node scripts/qa/e2e-servers.mjs   # sobe homologação (3300), produção (3400) e fixture (3500) com bancos temporários
npx playwright test # E2E (78), noutro terminal. Ver QA_REPORT.md
```

### Novidades técnicas

- `LiquidMetal sculpture`: escultura de arcos no shader do hero, com orçamento de quadro adaptativo e poster sem GPU.
- `EcosystemFlow`, trilha MICCA, `PortfolioShowcase`, `EditorialIndex`, `StudioFinal`.
- Case Study Studio: campos `layout`, `heroMedia` e `blocks` (14 tipos), além de `showWhen` no editor do painel.
- `lib/media-meta.ts`: imagem em baixa resolução nunca é ampliada (aparece no tamanho real, sobre uma atmosfera de cor desfocada da própria peça).
- Galerias e desdobramentos nunca cortam a peça: se a proporção pedida não combina com a arte, vale a do arquivo.
- Fontes via `next/font/local` (mesmos arquivos Outfit/Manrope) com fallback de métricas ajustadas: CLS 0.
- Aviso de cookies renderizado no servidor (aparece na primeira pintura).
- Migração de conteúdo idempotente (`applyContentMigrations`).
- Correções de bugs do ZIP:
  - menu mobile sem altura quando aberto (`backdrop-filter`);
  - abas MICCA sem nome acessível no celular;
  - contraste AA;
  - metadados fora do `<head>` para agentes não reconhecidos.

---

## Rodando localmente

Requisitos: **Node.js 22.13+** (usa `node:sqlite`).

```bash
npm install
cp .env.example .env.local      # preencha APP_SECRET, ADMIN_EMAIL e ADMIN_PASSWORD
npm run dev                      # http://localhost:3000  ·  painel: http://localhost:3000/admin
```

No primeiro acesso o banco é criado em `./data/grifo.db` com todo o conteúdo do briefing (seed) e o administrador definido em `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

> Senhas com `#` no `.env` precisam de aspas: `ADMIN_PASSWORD="Minha#Senha-2027"`.

Outros comandos:

```bash
npm run build && npm start       # produção local
npm test                         # testes automatizados (segurança, sanitização, validação de leads)
npm run lint                     # checagem de tipos (tsc)
npm run create-admin -- pessoa@grifo.agency "Nome" admin   # cria/redefine usuário pelo terminal
CONFIRM=sim npm run seed:reset   # recria o banco com o conteúdo inicial (destrutivo)
```

---

## Rotas

| Rota | Conteúdo | Editável em |
|---|---|---|
| `/` | Home (9 seções do briefing) | Páginas › Home |
| `/sobre` | História, visão, vídeo manifesto, linha do tempo, números, equipe, cultura | Páginas › Sobre |
| `/solucoes` · `/solucoes/[consulting\|marketing\|studios\|tech]` | Frentes do ecossistema | Estrutura › Soluções |
| `/especialidades` · `/especialidades/[imobiliario\|educacao\|tecnologia]` | Especialidades com formulário | Estrutura › Especialidades |
| `/metodologia-micca` | Pilares + seletor Imobiliário/Educação/Tecnologia | Páginas › MICCA |
| `/projetos` · `/projetos/[slug]` | Portfólio filtrável + estudo de caso | Conteúdo › Projetos |
| `/insights` · `/insights/[slug]` | Busca, categorias, tags, leitura estimada, compartilhamento | Conteúdo › Artigos |
| `/contato` | Formulário de qualificação (aceita `?segmento=` e `?demanda=`) | Páginas › Contato |
| `/grifo-core` | Landing de aquisição do Grifo Core Assessment | Páginas › Grifo Core |
| `/politica-de-privacidade`, `/politica-de-cookies`, `/termos-de-uso` | Páginas legais | Páginas › Políticas |
| `/sitemap.xml`, `/robots.txt` | Gerados dinamicamente | — |
| URLs antigas | Redirecionamento permanente | Sistema › Redirecionamentos |

---

## Variáveis de ambiente

Veja `.env.example` (comentado). As essenciais em produção:

| Variável | Obrigatória | Para quê |
|---|---|---|
| `SITE_URL` | sim | canonical, sitemap, Open Graph, checagem de origem |
| `APP_SECRET` | sim (≥ 32 caracteres) | assina tokens de formulário e pseudonimiza IPs |
| `DATA_DIR` | sim | pasta persistente do banco e uploads |
| `TRUST_PROXY` | sim atrás de proxy | IP real para rate limiting |
| `CONTENT_SHOW_PLACEHOLDERS` | `false` em produção | oculta conteúdos pendentes de validação |
| `CRM_WEBHOOK_URL` / `CRM_WEBHOOK_SECRET` | opcional | envio de leads ao CRM |
| `SMTP_*` | opcional | aviso interno por e-mail |
| `CRON_SECRET` | recomendado | rota de manutenção diária |

---

## Deploy

O site precisa de **disco persistente** (SQLite + uploads). Opções testadas pelo desenho:

### Docker (VPS, Railway, Render, Fly.io, Coolify…)
```bash
cp .env.example .env.production   # preencha
docker compose up -d --build
```
O volume `grifo-data` guarda banco e uploads. **Faça backup diário desse volume.**

### Node direto (PM2 / systemd atrás de Nginx)
```bash
npm ci && npm run build
node .next/standalone/server.js   # copie também public/ e .next/static para .next/standalone/
```

### Nginx (exemplo)
```nginx
server {
  server_name grifo.agency;
  client_max_body_size 90m;               # uploads de vídeo
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Manutenção diária (LGPD)
Agende uma chamada diária (cron do servidor, GitHub Actions ou similar):
```bash
curl -X POST https://grifo.agency/api/cron/retention -H "Authorization: Bearer $CRON_SECRET"
```
Ela remove leads além do prazo de retenção configurado no painel, sessões expiradas e contadores antigos. O painel também executa o expurgo automaticamente uma vez por dia.

> **Vercel/serverless:** não há disco persistente. Para usar Vercel, troque a camada `src/lib/db.ts` por Postgres (Neon/Supabase) e o armazenamento de `src/lib/media.ts` por S3/R2/Blob. Os pontos de troca estão isolados nesses dois arquivos.

---

## Estrutura

```
src/
  app/(site)/            páginas públicas (layout com header, rodapé, consentimento)
  app/admin/(auth)/      login e 2FA
  app/admin/(panel)/     painel: dashboard, conteúdo, mídia, leads, usuários, conta, auditoria
  app/admin/actions.ts   server actions do painel (todas verificam sessão e perfil)
  app/api/               leads, upload de mídia, exportação CSV, preview, manutenção
  components/site/       blocos do site (hero, cards, formulários, header, footer…)
  components/visual/     WebGL, MICCA, jornada, Core Plan, ecossistema, vídeo sob demanda
  components/admin/      editor gerado por schema, seletor de mídia, markdown…
  lib/cms/               schema, seed (conteúdo do briefing), leitura, repositório, validação
  lib/security/          criptografia, TOTP, rate limiting, origem
  lib/leads/             validação, persistência, CRM, e-mail, retenção
  middleware.ts          CSP com nonce e cabeçalhos de segurança
docs/                    manual do painel, segurança/LGPD, QA e pendências
tests/                   testes automatizados (node:test)
```

Documentação complementar:
- [`docs/MANUAL-DO-PAINEL.md`](docs/MANUAL-DO-PAINEL.md) — guia de edição para a equipe
- [`docs/SEGURANCA-E-LGPD.md`](docs/SEGURANCA-E-LGPD.md) — camadas de proteção implementadas
- [`docs/QA-E-PENDENCIAS.md`](docs/QA-E-PENDENCIAS.md) — evidências de teste, checklist e insumos a solicitar

---

## Pendências reais (2027)

Inventário completo e verificável em `QA_REPORT.md` §8 e §9:
- cases ainda aguardando aprovação;
- capas em baixa resolução;
- indicadores a confirmar;
- fontes e logo oficiais;
- divergência da data de fundação;
- contatos oficiais;
- CRM e SMTP reais;
- staging público.
