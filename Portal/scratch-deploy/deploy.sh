#!/bin/bash
set -e

LIVE="/home/pauldigi/apps/vireon-portal"
STAMP=$(date +%Y%m%d_%H%M%S)
STAGE="/home/pauldigi/apps/vireon-portal-build-$STAMP"
LOG="$LIVE/deploy-$STAMP.log"

cd "$LIVE"
source /home/pauldigi/nodevenv/apps/vireon-portal/22/bin/activate

{
  echo "=== $(date) : starting isolated build in $STAGE ==="

  chmod -R u+rwX,go+rX app lib public 2>/dev/null || true
  find app lib public -type d -exec chmod u+x,go+rx {} + 2>/dev/null || true

  mkdir -p "$STAGE"
  cp -a app "$STAGE/app"
  cp -a lib "$STAGE/lib"
  cp -a public "$STAGE/public"
  cp next.config.ts "$STAGE/next.config.ts"
  [ -f tsconfig.json ] && cp tsconfig.json "$STAGE/tsconfig.json"
  cp package.json "$STAGE/package.json"
  ln -s "$LIVE/node_modules" "$STAGE/node_modules"

  cd "$STAGE"
  echo "=== $(date) : running next build (webpack mode) ==="
  npx next build --webpack

  if [ ! -f "$STAGE/.next/standalone/server.js" ]; then
    echo "=== BUILD FAILED: no standalone server.js produced, live site untouched ==="
    exit 1
  fi

  echo "=== $(date) : build OK, applying to live (with backup) ==="
  cd "$LIVE"
  cp -f server.js "server.js.bak-$STAMP"
  mv .next ".next.bak-$STAMP"
  mkdir .next
  cp -f "$STAGE/.next/standalone/server.js" ./server.js
  cp -a "$STAGE/.next/standalone/.next/." .next/
  cp -a "$STAGE/.next/static" .next/static
  cp -a "$STAGE/public/." public/

  echo "=== $(date) : apply complete. backups: server.js.bak-$STAMP , .next.bak-$STAMP ==="
  echo "=== DEPLOY SUCCESS ==="
} > "$LOG" 2>&1

echo "See $LOG"
