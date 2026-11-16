# QA, evidências de teste e pendências

## 1. Evidências (03/11/2026)

### Build e testes
- `npm run build` — concluído sem erros (Next.js 15.5, 36 rotas).
- `npm run lint` (tsc) — sem erros de tipo.
- `npm test` — **15/15** testes passando (hash de senha, política de senha, TOTP, pseudonimização de IP, bloqueio de `javascript:`, sanitização de markdown, sanitização por schema, validação de leads, máscara de WhatsApp).
- `npm audit` — 0 vulnerabilidades.

### Testes ponta a ponta (Playwright)
| Cenário | Resultado |
|---|---|
| `/admin` sem sessão | redireciona para `/admin/login` |
| Senha errada | mensagem genérica, e-mail preservado no campo |
| Login correto | painel carregado |
| Editar Home → Salvar rascunho → Publicar | "Rascunho salvo." / "Publicado." |
| Upload de imagem | convertida e listada na biblioteca |
| Upload de SVG com `<script>` | recusado: "Formato não permitido" |
| Formulário vazio | 7 erros exibidos, foco no primeiro campo |
| Máscara WhatsApp | `62999998888` → `(62) 99999-8888` |
| Envio válido com UTMs | lead gravado com origem; tela de sucesso; eventos `form_start` e `generate_lead` |
| API sem origem / origem externa | 403 |
| Honeypot preenchido | rejeitado sem gravar |
| Token inválido | rejeitado |
| 6º envio em 10 min | 429 com `Retry-After` |

### Produção (`next start`, `CONTENT_SHOW_PLACEHOLDERS=false`)
| Verificação | Resultado |
|---|---|
| Cabeçalhos CSP/HSTS/XFO/nosniff/Referrer/Permissions/COOP | presentes |
| `/quem-somos` (URL legada) | redirecionamento permanente para `/sobre` |
| `/media/..%2F..%2F.env.local` | 404 |
| Cases pendentes | ocultos na listagem; `/projetos/pinauto` → 404 |
| `sitemap.xml` / `robots.txt` | gerados, sem `/admin` e `/api` |

### Responsividade
Capturas revisadas em **360, 768, 1024 e 1440 px**: header com megamenu (desktop) e menu em dois níveis (mobile), hero, arcos MICCA (rótulos ocultos no mobile — o painel ao lado mostra o nome), jornada com rolagem horizontal, formulários em coluna única.

## 2. Checklist antes de publicar
- [ ] `SITE_URL`, `APP_SECRET`, `DATA_DIR`, `TRUST_PROXY=true`, `CONTENT_SHOW_PLACEHOLDERS=false`
- [ ] Contatos oficiais, WhatsApp, redes, razão social, CNPJ e DPO em *Configurações*
- [ ] Indicadores confirmados e marcados como *Validado para publicação*
- [ ] Cases aprovados pelos clientes (arquivos em alta resolução + dados autorizados)
- [ ] Artigos revisados (os 3 do seed são rascunhos editoriais)
- [ ] Equipe com fotos e nomes reais
- [ ] Políticas de privacidade, cookies e termos revisadas pelo jurídico
- [ ] `CRM_WEBHOOK_URL` e `SMTP_*` configurados; envio de teste recebido
- [ ] GTM configurado; eventos testados no modo de visualização do GTM
- [ ] Redirecionamentos de todas as URLs do site atual cadastrados
- [ ] 2FA ativado para todos os usuários; `ADMIN_PASSWORD` removida do ambiente
- [ ] Rotina diária `/api/cron/retention` agendada e backup do volume configurado
- [ ] Lighthouse em produção (meta: Performance ≥ 90 mobile, Acessibilidade ≥ 95, SEO 100)

## 3. Decisões e observações
- **Redirecionamentos:** retornam **308** (permanente). Para buscadores, 308 equivale a 301; o método HTTP é preservado.
- **Fontes:** Outfit + Manrope foram escolhidas pela proximidade com o logotipo geométrico. Trocar pela fonte oficial quando o brandbook for enviado (`src/app/globals.css` e `tailwind.config.ts`).
- **Logotipo:** vetorizado a partir do PNG enviado (`public/brand/grifo-logo.svg`). Substituir pelo SVG original do brandbook.
- **Âmbar:** o briefing propõe `#E5A12E` para a interface; o logotipo usa `#F09702`. Mantivemos ambos: o logo preserva sua cor original.
- **Imagens do acervo:** extraídas da apresentação comercial e do material de marca enviados, apenas como referência/acervo. As miniaturas de cases são de baixa resolução e estão marcadas como pendentes.
- **WingsBr:** não é citada no site, conforme a regra de mantê-la como produto independente.
- **Vídeos:** o filme "A nova Grifo" (Sobre) e a animação de logo (Studios) foram comprimidos de 44 MB para ~1 MB e só carregam quando o visitante clica.

## 4. Insumos a solicitar (briefing §14)
1. Logo vetorial, brandbook e fontes oficiais.
2. Fotos de equipe e instalações; vídeos de bastidores e showreel.
3. Arquivos originais dos cases com direitos de uso e dados de resultado autorizados.
4. Números institucionais atualizados e critérios de contagem.
5. Contatos comerciais, links sociais e dados jurídicos.
6. Acesso a domínio, hospedagem, DNS, analytics e GTM.
7. CRM/endpoint de leads e responsáveis pelo atendimento de cada segmento.
8. Política de privacidade, cookies e textos legais revisados.
