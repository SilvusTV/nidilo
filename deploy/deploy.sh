#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/nidilo}"
cd "$APP_DIR"

if [[ ! -f .env ]]; then
  echo "Erreur : fichier $APP_DIR/.env introuvable." >&2
  exit 1
fi

git pull --ff-only
npm install
npm run build

cp .env build/.env
(
  cd build
  npm install --omit=dev
  node ace migration:run --force
)

if [[ ! -f build/public/assets/.vite/manifest.json ]]; then
  echo "Erreur : manifeste Vite absent après le build." >&2
  exit 1
fi

# Adonis keeps the Vite manifest in memory. Reloading after the build prevents
# HTML responses from referencing hashed assets removed by the new build.
pm2 startOrReload ecosystem.config.cjs --update-env

echo "Mise en production terminée."
