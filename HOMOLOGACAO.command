#!/bin/bash
# Homologação navegável do site Grifo 2027 (macOS: dê dois cliques; Linux: bash HOMOLOGACAO.command)
# Sobe o build de produção em http://localhost:3000 com banco PRÓPRIO em ./data-homolog.
# Cases e rascunhos pendentes aparecem com selo e noindex. Nada é publicado na internet.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js não encontrado. Instale o Node 22.13 ou mais recente (https://nodejs.org) e rode de novo."; read -r -p "Enter para sair"; exit 1
fi
NODE_OK=$(node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.stdout.write(String(a>22||(a===22&&b>=13)))')
if [ "$NODE_OK" != "true" ]; then
  echo "É preciso Node 22.13+ (encontrado: $(node -v))."; read -r -p "Enter para sair"; exit 1
fi

if [ ! -d node_modules ]; then echo "Instalando dependências (uma vez)…"; npm ci || exit 1; fi
if [ ! -f .next/BUILD_ID ]; then echo "Gerando o build de produção (uma vez)…"; NEXT_TELEMETRY_DISABLED=1 npx next build || exit 1; fi

if [ ! -f data-homolog/grifo.db ]; then
  echo "Primeiro acesso: crie o usuário do painel de homologação (/admin)."
  read -r -p "E-mail: " ADMIN_EMAIL
  read -r -s -p "Senha (12+ caracteres, maiúsculas e minúsculas, número e símbolo; sem o e-mail): " ADMIN_PASSWORD; echo
  export ADMIN_EMAIL ADMIN_PASSWORD
fi

[ "$(uname)" = "Darwin" ] && ( sleep 4; open "http://localhost:${PORT:-3000}" ) &
echo "Homologação em http://localhost:${PORT:-3000}   ·   painel: /admin   ·   Ctrl+C encerra"
node scripts/homolog.mjs
