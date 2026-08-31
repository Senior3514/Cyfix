#!/usr/bin/env bash
# Cyfix VPS deploy script.
# Usage: ./deploy.sh
# Pulls latest code, installs deps, builds, and (re)starts the app under PM2.
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Pulling latest changes"
git pull --ff-only

echo "==> Installing dependencies"
npm ci

echo "==> Building production bundle"
npm run build

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> PM2 not found, installing globally"
  npm install -g pm2
fi

if pm2 describe cyfix >/dev/null 2>&1; then
  echo "==> Restarting existing PM2 process"
  pm2 restart cyfix
else
  echo "==> Starting new PM2 process"
  pm2 start ecosystem.config.js
fi

pm2 save

echo "==> Deploy complete. Check status with: pm2 status cyfix"
