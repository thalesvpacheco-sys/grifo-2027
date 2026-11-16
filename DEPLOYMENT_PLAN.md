# DEPLOYMENT PLAN — homologação → produção

> **Não publicar em `grifo.agency` nem alterar DNS sem autorização expressa.** Este plano descreve a homologação e a virada controlada.

## 1. Runtime

| Item | Requisito |
|---|---|
| Node | ≥ 22.13 (usa `node:sqlite`). Testado com 22.23 |
| Build | `npm ci && npm run build` (saída `standalone`) |
| Execução | `node .next/standalone/server.js`, copiando também `public/` e `.next/static` (ou `docker compose up -d --build`) |
| Disco persistente | `DATA_DIR`: banco `grifo.db` (WAL) e `uploads/`. Volume `grifo-data` no Docker |
| Proxy | Nginx/Cloudflare com HTTPS. `TRUST_PROXY=true`. `client_max_body_size 90m` (vídeos) |

**Serverless/Vercel:** sem disco persistente. Exigiria trocar `src/lib/db.ts` (Postgres) e `src/lib/media.ts` (S3/R2), que não foi feito.

## 2. Variáveis

| Variável | Homologação | Produção |
|---|---|---|
| `SITE_URL` | URL de homologação | `https://grifo.agency` |
| `APP_SECRET` | ≥ 32 caracteres, **diferente** do de produção | ≥ 32 caracteres |
| `DATA_DIR` | volume próprio (cópia restaurada do backup de produção, ou banco novo) | volume de produção |
| `CONTENT_SHOW_PLACEHOLDERS` | `true` (mostra cases e rascunhos pendentes, com selo e noindex) | **`false`** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | só no primeiro boot. Remover depois | idem |
| `CRM_WEBHOOK_*`, `SMTP_*`, `CRON_SECRET`, `NEXT_PUBLIC_GTM_ID` | apontar para sandbox | valores oficiais |

Proteja a homologação com autenticação no proxy (Basic Auth ou IP allowlist): ela mostra conteúdo ainda não aprovado. Mantenha também `noindex` (por exemplo, `X-Robots-Tag: noindex` no proxy).

## 3. Banco e migração

O redesign **não troca o banco nem recria tabelas**. O primeiro boot da nova versão executa `applyContentMigrations`, que é **acrescentar-apenas** e idempotente:
- especialidade Concessionárias;
- aba MICCA;
- regra de roteamento;
- redirecionamentos legados;
- ajustes aprovados pela gerência em 13/11/2026: revisão de SEO; edição de Insights 2026-11 publicada com fotos de capa; matérias anteriores aprovadas e publicadas; indicadores validados (11 anos, 100+ lançamentos, 21 lançamentos imobiliários em 2026, também no Sobre); textos dos serviços; contatos oficiais (só preenche campos vazios em Configurações).

Cada migração roda uma única vez e fica registrada em `meta.content_migrations`; nada que tenha sido editado no painel é sobrescrito.

A estrutura SQL é a mesma do ZIP (as migrações de schema em `db.ts` não mudaram).

1. **Backup com prova de restauração**, antes de qualquer coisa:

   ```bash
   sqlite3 "$DATA_DIR/grifo.db" ".backup '/backup/grifo-$(date +%F).db'"
   tar czf /backup/uploads-$(date +%F).tgz -C "$DATA_DIR" uploads
   # prova: restaurar numa pasta temporária e abrir
   sqlite3 /tmp/restore.db ".restore '/backup/grifo-$(date +%F).db'" && sqlite3 /tmp/restore.db "PRAGMA integrity_check; SELECT COUNT(*) FROM documents; SELECT COUNT(*) FROM leads;"
   ```

2. Homologar com uma **cópia** do banco de produção (`DATA_DIR` próprio).
3. Conferir no painel:
   - Estrutura › Especialidades: **Concessionárias**;
   - MICCA › Aplicações: 4 abas;
   - Configurações › Roteamento: regra `concessionarias` (preencher e-mails);
   - Sistema › Redirecionamentos.
4. **Nunca** usar `npm run seed:reset`, `rm -rf` no volume ou recriar o banco em produção.

## 4. Homologação (checklist)

- [ ] `npm run lint && npm test && npm run build`
- [ ] Servidores de homologação e produção iniciados e `npx playwright test` executado (ver `QA_REPORT.md`)
- [ ] Lighthouse mobile no ambiente HTTPS de homologação, já com compressão e CDN
- [ ] Revisão visual pela Grifo das capturas em `qa/screens/` e navegação real
- [ ] Envio de lead de teste em cada formulário, com recebimento no CRM e SMTP de sandbox
- [ ] Revisão humana das pendências de conteúdo (`QA_REPORT.md` §6)

## 5. Virada para produção (somente com autorização)

1. Janela combinada. Backup (passo 3.1) com prova de restauração.
2. Deploy da nova imagem com o **mesmo** volume. O boot aplica as migrações de conteúdo e as registra em `meta.content_migrations`.
3. Smoke test:
   - `/`;
   - `/especialidades/concessionarias`;
   - `/projetos`, que deve mostrar "Os projetos estão em fase de aprovação…" enquanto não houver case aprovado;
   - `/admin`;
   - lead de teste;
   - `/sitemap.xml`;
   - uma URL antiga (deve responder 308).
4. DNS ou proxy apontando para o novo serviço, **somente após aprovação**. Monitorar logs e Search Console.

## 6. Rollback

- **Código:** voltar a imagem ou commit anterior (branch `main` = ZIP original; `redesign/2027-studio` = nova versão). As mudanças são de apresentação e retrocompatíveis.
- **Dados:** a versão antiga lê o banco migrado normalmente:
  - o documento extra de especialidade aparece no índice antigo;
  - a aba MICCA extra continua funcionando;
  - campos novos de case são ignorados.

  Se for preciso voltar **exatamente** ao estado anterior, restaure o backup do passo 3.1 (perde os leads recebidos depois dele; exporte-os antes pelo painel em CSV).
- **Revisões:** cada documento alterado pela migração tem uma revisão "migração 2027-studio" no histórico do painel, que pode ser restaurada individualmente.

## 7. Segurança preservada

O middleware não foi alterado. Continuam valendo:
- CSP com nonce e `strict-dynamic` (o 3D roda em shader próprio, sem scripts externos);
- HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy e COOP;
- autenticação com 2FA, papéis, auditoria;
- sanitização de upload e de markdown;
- rate limit, honeypot, token de formulário e checagem de origem.

Nenhuma biblioteca de terceiros nem analytics foi adicionada. `npm audit --omit=dev`: 0 vulnerabilidades.
