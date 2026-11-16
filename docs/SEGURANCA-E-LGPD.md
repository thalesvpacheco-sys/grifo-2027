# Segurança e LGPD — camadas implementadas

## 1. Navegador e transporte
| Camada | Implementação |
|---|---|
| Content-Security-Policy | Nonce aleatório por requisição + `strict-dynamic`; sem `unsafe-inline` em scripts; `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` (`src/middleware.ts`) |
| HTTPS | HSTS de 2 anos com `preload` e `upgrade-insecure-requests` em produção |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` |
| MIME sniffing | `X-Content-Type-Options: nosniff` (também em arquivos enviados) |
| Isolamento | `Cross-Origin-Opener-Policy: same-origin`; `Permissions-Policy` bloqueia câmera, microfone, geolocalização, pagamento |
| Indexação | `/admin` e `/api` com `X-Robots-Tag: noindex` e `Cache-Control: no-store`; bloqueados no `robots.txt` |
| Fingerprint | Cabeçalho `X-Powered-By` removido |

## 2. Painel administrativo
| Camada | Implementação |
|---|---|
| Senhas | scrypt (N=2¹⁵) com salt único; política: 12+ caracteres, maiúsculas, minúsculas, número, símbolo, sem o e-mail |
| Força bruta | Rate limit por IP (20/15 min) e por conta (8/15 min) + bloqueio temporário de 15 min |
| Enumeração | Mesma mensagem e mesmo tempo de resposta para e-mail inexistente ou senha errada |
| 2FA | TOTP (RFC 6238) com QR code; redefinível por administrador |
| Sessões | Token aleatório de 256 bits; só o hash SHA-256 é guardado; cookie `__Host-`, `HttpOnly`, `Secure`, `SameSite=Strict`; expiração ociosa (2 h) e absoluta (12 h); troca de senha encerra outras sessões |
| CSRF | Server Actions com verificação de origem do Next.js + `SameSite=Strict`; rotas de API checam `Origin` |
| Autorização | Toda página e toda ação chama `requireUser()` no servidor; perfis *editor* e *administrador* |
| Auditoria | Login, falhas, edições, publicações, exportações, exclusões e alterações de usuários, com IP pseudonimizado |
| Primeiro acesso | Admin inicial só é criado se o banco não tiver usuários; senha fraca é recusada |

## 3. Conteúdo e mídia
| Risco | Proteção |
|---|---|
| XSS por texto rico | Markdown convertido e sanitizado por lista branca (sem `script`, `iframe`, atributos `on*`, `javascript:`) |
| XSS por link de botão | Links aceitos: relativos, âncoras, `https`, `mailto`, `tel`. `javascript:`/`data:` são descartados no servidor |
| Campos forjados | Dados do editor são reconstruídos a partir do schema: campos desconhecidos são descartados, tipos e tamanhos validados |
| Upload malicioso | Verificação pelo conteúdo real (não pela extensão); SVG/HTML recusados; imagens re-encodadas em WebP pelo sharp (remove EXIF/GPS e payloads embutidos); limite de pixels contra "image bombs"; nomes aleatórios |
| Path traversal | Rota `/media` aceita só nomes simples e confere o caminho final; resposta com CSP `sandbox` |
| JSON-LD | Serializado com escape de `<` |
| CSV injection | Exportação neutraliza células iniciadas com `= + - @` |
| Open redirect | Pré-visualização só aceita caminhos internos |

## 4. Formulários de lead
1. Origem obrigatoriamente do próprio site.
2. Rate limit por IP pseudonimizado: 5 envios/10 min e 20/dia (persistido no banco).
3. Corpo limitado a 16 KB.
4. Validação server-side com Zod (a mesma regra do cliente, mas o servidor é a fonte de verdade).
5. **Honeypot** invisível + **token de tempo assinado** (HMAC): rejeita envios em menos de 2,5 s ou com página aberta há mais de 6 h.
6. Sucesso só é exibido quando o servidor confirma a gravação.
7. Integração com CRM assinada com `X-Grifo-Signature: sha256=…` (HMAC do corpo com `CRM_WEBHOOK_SECRET`). Falhas ficam registradas para reenvio.

## 5. LGPD
| Requisito | Como foi atendido |
|---|---|
| Consentimento | Checkbox obrigatório com link para a política; data e versão da política gravadas com o lead |
| Minimização | Só os campos do briefing; IP guardado apenas como hash com segredo |
| Retenção | Prazo configurável no painel; expurgo diário automático |
| Direitos do titular | Exclusão definitiva de lead pelo painel, registrada em auditoria |
| Cookies | Banner com *Aceitar todos*, *Somente necessários* e *Personalizar*; preferências reabríveis pelo rodapé |
| Analytics | Consent Mode v2 com tudo negado por padrão; GTM só é carregado após consentimento de análise ou marketing |
| Transparência | Políticas de privacidade, cookies e termos editáveis (minutas — **exigem revisão jurídica**) |

## 6. Recomendações operacionais
- Defina `APP_SECRET` longo e exclusivo; nunca o versione.
- Após o primeiro login, **remova `ADMIN_PASSWORD`** do ambiente.
- Exija 2FA de todos os usuários.
- Faça **backup diário** do volume `DATA_DIR` (banco + uploads) e teste a restauração.
- Mantenha dependências atualizadas (`npm audit` — entregue com 0 vulnerabilidades conhecidas).
- Coloque o site atrás de CDN/WAF (ex.: Cloudflare) para mitigação de DDoS.
