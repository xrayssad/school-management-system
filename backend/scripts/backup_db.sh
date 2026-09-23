#!/usr/bin/env bash
# Weekly/monthly extra backup (Supabase still keeps its own).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"
# load DATABASE_URL from .env
set -a
# shellcheck disable=SC1091
source .env 2>/dev/null || true
set +a
: "${DATABASE_URL:?DATABASE_URL missing}"
OUT_DIR="${ROOT}/backups"
mkdir -p "$OUT_DIR"
STAMP=$(date +%Y%m%d_%H%M)
FILE="${OUT_DIR}/madrasa_${STAMP}.sql.gz"
# Supabase pooler URL works with pg_dump if password embedded
pg_dump "$DATABASE_URL" --no-owner --no-acl | gzip > "$FILE"
# keep last 8 dumps
ls -1t "$OUT_DIR"/madrasa_*.sql.gz 2>/dev/null | tail -n +9 | xargs -r rm -f
echo "Backup OK: $FILE"
