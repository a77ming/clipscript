#!/bin/bash

set -euo pipefail

SERVER_IP="${SERVER_IP:-}"
SERVER_USER="${SERVER_USER:-}"
APP_DIR="${APP_DIR:-/opt/clipscript}"
PORT="${PORT:-3000}"
SSH_KEY_PATH="${SSH_KEY_PATH:-}"
SSH_PASSWORD="${SSH_PASSWORD:-}"

if [[ -z "$SERVER_IP" || -z "$SERVER_USER" ]]; then
  echo "Missing required deployment settings."
  echo "Set SERVER_IP and SERVER_USER before running this script."
  exit 1
fi

if [[ -n "$SSH_KEY_PATH" && ! -f "$SSH_KEY_PATH" ]]; then
  echo "SSH_KEY_PATH does not point to an existing file."
  exit 1
fi

ssh_cmd=(ssh -o StrictHostKeyChecking=no)
scp_cmd=(scp -o StrictHostKeyChecking=no)

if [[ -n "$SSH_KEY_PATH" ]]; then
  ssh_cmd+=(-i "$SSH_KEY_PATH")
  scp_cmd+=(-i "$SSH_KEY_PATH")
elif [[ -n "$SSH_PASSWORD" ]]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "sshpass is required when using SSH_PASSWORD."
    exit 1
  fi

  ssh_cmd=(sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no)
  scp_cmd=(sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no)
else
  echo "Provide SSH_KEY_PATH for key-based auth or SSH_PASSWORD for password auth."
  exit 1
fi

echo "Building ClipScript..."
npm run build:standalone

echo "Packing deployment bundle..."
tar -czf deploy.tar.gz \
  .next \
  package.json \
  package-lock.json \
  next.config.js \
  public \
  app \
  components \
  lib \
  tsconfig.json \
  postcss.config.mjs \
  tailwind.config.ts

echo "Uploading bundle to ${SERVER_USER}@${SERVER_IP}..."
"${scp_cmd[@]}" deploy.tar.gz "${SERVER_USER}@${SERVER_IP}:/tmp/clipscript-deploy.tar.gz"

echo "Deploying on remote host..."
"${ssh_cmd[@]}" "${SERVER_USER}@${SERVER_IP}" \
  APP_DIR="$APP_DIR" PORT="$PORT" 'bash -s' <<'EOF'
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ is required on the remote host."
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

mkdir -p "$APP_DIR"
cd "$APP_DIR"
tar -xzf /tmp/clipscript-deploy.tar.gz
npm install --omit=dev
pm2 delete clipscript || true
PORT="$PORT" pm2 start npm --name clipscript -- start
pm2 save
EOF

rm -f deploy.tar.gz

echo "Deployment complete."
echo "App should be available at http://${SERVER_IP}:${PORT}"
