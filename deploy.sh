#!/usr/bin/env bash

set -Eeuo pipefail

readonly APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly ENV_FILE="${APP_ROOT}/.env"

fail() {
  printf 'Deployment failed: %s\n' "$*" >&2
  exit 1
}

note() {
  printf '==> %s\n' "$*"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "required command '$1' was not found"
}

read_env_value() {
  local name="$1"
  local value

  value="$(sed -n "s/^${name}=//p" "${ENV_FILE}" | tail -n 1)"
  value="${value%$'\r'}"

  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
    value="${value:1:${#value}-2}"
  fi

  printf '%s' "$value"
}

validate_tls() {
  local tls_dir cert_file key_file cert_key_hash private_key_hash cert_count

  tls_dir="$(read_env_value TLS_DIR)"
  tls_dir="${tls_dir:-/opt/hut/secrets/tls}"
  [[ "$tls_dir" == /* ]] || fail "TLS_DIR must be an absolute path"

  cert_file="${tls_dir}/fullchain.pem"
  key_file="${tls_dir}/privkey.pem"
  [[ -r "$cert_file" ]] || fail "cannot read TLS certificate chain at ${cert_file}"
  [[ -r "$key_file" ]] || fail "cannot read TLS private key at ${key_file}"

  cert_count="$(grep -c -- 'BEGIN CERTIFICATE' "$cert_file" || true)"
  (( cert_count >= 2 )) || fail "fullchain.pem must contain the leaf certificate followed by its intermediate CA"

  openssl x509 -in "$cert_file" -noout -checkend 0 >/dev/null || fail "TLS certificate is expired or invalid"
  openssl x509 -in "$cert_file" -noout -ext subjectAltName | grep -Eq 'DNS:(\*\.hut\.ac\.ir|new\.hut\.ac\.ir)(,|$)' \
    || fail "TLS certificate does not cover new.hut.ac.ir"

  cert_key_hash="$(openssl x509 -in "$cert_file" -pubkey -noout | openssl pkey -pubin -outform DER 2>/dev/null | sha256sum | cut -d ' ' -f 1)"
  private_key_hash="$(openssl pkey -in "$key_file" -pubout -outform DER 2>/dev/null | sha256sum | cut -d ' ' -f 1)"
  [[ -n "$cert_key_hash" && "$cert_key_hash" == "$private_key_hash" ]] || fail "TLS certificate and private key do not match"

  if [[ "$(stat -c '%a' "$key_file")" != "600" ]]; then
    fail "TLS private key must have mode 0600"
  fi

  if ! openssl x509 -in "$cert_file" -noout -checkend 2592000 >/dev/null; then
    printf 'Warning: the TLS certificate expires in less than 30 days.\n' >&2
  fi
}

cd "$APP_ROOT"

require_command git
require_command docker
require_command openssl
require_command sha256sum
require_command flock
docker compose version >/dev/null 2>&1 || fail "the Docker Compose plugin is not available"

exec 9>"${APP_ROOT}/.deploy.lock"
flock -n 9 || fail "another deployment is already running"

[[ -f "$ENV_FILE" ]] || fail "copy .env.example to .env and replace every placeholder first"
if [[ -n "$(find "$ENV_FILE" -perm /077 -print -quit)" ]]; then
  fail ".env must not be readable or writable by group/other users; run chmod 600 .env"
fi

if ! git diff --quiet --ignore-submodules -- || ! git diff --cached --quiet --ignore-submodules --; then
  fail "tracked files have local changes; commit, discard, or move them before deploying"
fi

note "Updating the checkout from origin/main"
git fetch origin main
git merge --ff-only origin/main
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || fail "the checkout is not exactly at origin/main"

for required_name in POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD ALTCHA_HMAC_SECRET; do
  required_value="$(read_env_value "$required_name")"
  [[ -n "$required_value" ]] || fail "${required_name} is missing from .env"
  [[ ! "$required_value" =~ replace-with-|change-me|example-password ]] \
    || fail "${required_name} still contains a placeholder value"
done
unset required_name required_value

postgres_db="$(read_env_value POSTGRES_DB)"
postgres_user="$(read_env_value POSTGRES_USER)"
[[ "$postgres_db" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || fail "POSTGRES_DB contains unsupported characters"
[[ "$postgres_user" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || fail "POSTGRES_USER contains unsupported characters"
unset postgres_db postgres_user

postgres_password="$(read_env_value POSTGRES_PASSWORD)"
[[ "$postgres_password" =~ ^[A-Za-z0-9._~-]+$ ]] \
  || fail "POSTGRES_PASSWORD must use URL-safe characters; a hexadecimal secret is recommended"
unset postgres_password

validate_tls

note "Validating the Compose configuration"
docker compose config --quiet

note "Pulling service images and rebuilding the application"
docker compose pull db nginx
docker compose build --pull app db-push

note "Starting PostgreSQL"
docker compose up -d --wait db

note "Applying the Drizzle schema"
docker compose run --rm --no-deps db-push

note "Starting the new application build"
docker compose up -d --no-deps --wait app

note "Reloading the HTTPS edge"
docker compose up -d --force-recreate --no-deps --remove-orphans --wait nginx

note "Deployment complete at commit $(git rev-parse --short HEAD)"
