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

echo "Mise en production terminée."
