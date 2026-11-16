# Manual do painel — Site Grifo

Endereço: **`/admin`** (ex.: `https://grifo.agency/admin`).

## 1. Acesso
- Entre com e-mail e senha. Após 8 tentativas erradas a conta fica bloqueada por 15 minutos.
- **Ative a verificação em duas etapas (2FA)** em *Minha conta* — leva 1 minuto com Google Authenticator, Microsoft Authenticator ou 1Password.
- A sessão expira após 2 horas sem uso (ou 12 horas no total).

### Perfis
| Ação | Editor | Administrador |
|---|:-:|:-:|
| Editar páginas, soluções, especialidades, cases, artigos, equipe, indicadores | ✓ | ✓ |
| Enviar e organizar mídia | ✓ | ✓ |
| Ver e atender leads | ✓ | ✓ |
| Excluir conteúdo já publicado | | ✓ |
| Configurações, redirecionamentos, usuários, auditoria | | ✓ |
| Exportar leads (CSV) e excluir dados de leads (LGPD) | | ✓ |

## 2. O ciclo de publicação
1. **Editar** — os campos aparecem agrupados na mesma ordem das seções da página.
2. **Salvar rascunho** (ou `Ctrl/Cmd + S`) — nada muda no site.
3. **Visualizar** — abre o site em modo de pré-visualização, mostrando seus rascunhos (faixa amarela no rodapé). Clique em *Sair da pré-visualização* para voltar.
4. **Publicar** — o conteúdo entra no ar imediatamente.

O status aparece ao lado do título: *publicado*, *rascunho* ou *alterações não publicadas*.
Em **Histórico** você restaura qualquer uma das últimas 30 versões (a versão volta como rascunho).

## 3. Dicas de edição
- **Títulos em dois pesos:** em títulos, pressione *Enter* para quebrar a linha. A primeira linha sai em negrito e a segunda em peso leve — a assinatura tipográfica da marca.
  Ex.: `Seis frentes.` ⏎ `Uma operação.`
- **Botões:** todo botão tem *texto* e *destino*. O destino pode ser uma página (`/contato`), uma âncora (`#formulario`) ou um link externo (`https://…`). Botão sem destino não é exibido.
- **Imagens:** escolha da *Biblioteca* (seus envios) ou do *Acervo da marca*. Preencha sempre o **texto alternativo** — descreva o que a imagem mostra.
- **Texto longo (artigos, cases):** use a barra de formatação. *Prévia* mostra o resultado final.
- **Listas** (serviços, etapas, valores…): *+ Adicionar*, setas ↑ ↓ para reordenar, ✕ para remover.
- **Seções vazias não aparecem no site.** Para esconder uma seção, deixe o título vazio.

## 4. Conteúdo pendente de validação
O briefing proíbe publicar métricas, cases ou depoimentos sem validação. Por isso:
- Itens marcados como **Pendente de validação** aparecem só na pré-visualização, com uma etiqueta listrada, e **não vão para produção**.
- **Indicadores** só aparecem em produção quando *Validado para publicação* está marcado. Registre o critério de contagem no campo interno.
- Os cases do seed estão como *Aguardando aprovação*. Ao receber autorização do cliente, preencha o case, desmarque *Pendente de validação* e publique.

## 5. Criando conteúdo
- **Novo artigo:** *Artigos (Insights)* › *Novo artigo* › título › preencha resumo, categoria, tags, autor, data, capa e texto › *Publicar*.
- **Novo case:** *Projetos (cases)* › *Novo projeto* › preencha setor, competências, contexto, desafio, estratégia, execução e (somente se autorizado) resultados.
- **Destaques da Home:** em *Home › Projetos*, escolha e ordene os cases.

## 6. Leads
- Todo envio de formulário vira um lead com: dados de contato, segmento, demanda, mensagem, consentimento (data e versão da política) e origem (UTMs, página de entrada, referência).
- Atualize o **status** (novo → em atendimento → qualificado → convertido/descartado) e use **anotações internas**.
- *Reenviar ao CRM* tenta de novo quando a integração falhou.
- **Pedido de exclusão (LGPD):** administradores podem excluir os dados de um lead; a ação fica na auditoria.

## 7. Configurações (administradores)
- **Contatos oficiais**, redes sociais, dados jurídicos e e-mail do encarregado (DPO).
- **Roteamento de leads:** e-mails que recebem aviso por segmento (requer SMTP no servidor).
- **Google Tag Manager:** informe o ID `GTM-XXXXXXX`. Ele só carrega para quem aceitar cookies.
- **Retenção de leads** em meses e **versão da política de privacidade** (registrada com cada consentimento — atualize quando a política mudar).

## 8. Redirecionamentos
Cadastre cada URL antiga do site atual (`/servicos`) e o novo destino (`/solucoes/marketing`). Ao mudar o *slug* de uma página, crie também um redirecionamento.
