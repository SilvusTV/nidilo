#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/nidilo
cd "$APP_DIR"

if [[ ! -f .env ]]; then
  cp .env.production.example .env
fi

set_env() {
  local key="$1"
  local value="$2"
  local escaped
  escaped="$(printf '%s' "$value" | sed 's/[&|\\]/\\&/g')"
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${escaped}|" .env
  else
    printf '%s=%s\n' "$key" "$value" >> .env
  fi
}

get_env() {
  sed -n "s/^${1}=//p" .env | tail -n 1
}

ensure_secret() {
  local key="$1"
  local bytes="$2"
  local current
  current="$(get_env "$key")"
  if [[ -z "$current" || "$current" == *GENERATE* || "$current" == *SET_ON* || "$current" == *change-me* || "$current" == *dev_password* ]]; then
    set_env "$key" "$(openssl rand -hex "$bytes")"
  fi
}

set_env TZ Europe/Paris
set_env NODE_ENV production
set_env HOST 127.0.0.1
set_env PORT 3337
set_env APP_DOMAIN nidilo.fr
set_env APP_URL https://nidilo.fr
set_env SESSION_DRIVER cookie
set_env DB_HOST 127.0.0.1
set_env DB_PORT 5437
set_env DB_USER nidilo
set_env DB_DATABASE nidilo
set_env REDIS_HOST 127.0.0.1
set_env REDIS_PORT 6380
set_env QUEUE_DRIVER redis
set_env S3_ENDPOINT http://127.0.0.1:9010
set_env S3_REGION eu-west-3
set_env S3_BUCKET nidilo-media
set_env HEALTH_DATA_ENABLED false

ensure_secret APP_KEY 16
ensure_secret DB_PASSWORD 32
ensure_secret REDIS_PASSWORD 32
ensure_secret S3_ACCESS_KEY 16
ensure_secret S3_SECRET_KEY 32
ensure_secret BREVO_WEBHOOK_TOKEN 32

if [[ -z "$(get_env LEGAL_HOST_NAME)" || "$(get_env LEGAL_HOST_NAME)" == *COMPLETE* ]]; then
  set_env LEGAL_HOST_NAME 'OVH SAS'
fi
if [[ -z "$(get_env LEGAL_HOST_ADDRESS)" || "$(get_env LEGAL_HOST_ADDRESS)" == *COMPLETE* ]]; then
  set_env LEGAL_HOST_ADDRESS '2 rue Kellermann, 59100 Roubaix, France'
fi

chmod 600 .env
docker compose -f compose.infrastructure.yml up -d
