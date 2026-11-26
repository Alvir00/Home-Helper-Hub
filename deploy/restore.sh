#!/bin/sh
# Restore a Meraki database backup.
#
#   ./deploy/restore.sh backups/meraki-20261124T030000Z.sql.gz
#
# This REPLACES the current contents of the database. Stop the app first so no
# new rows are written during the restore:
#
#   docker compose stop app
#   ./deploy/restore.sh backups/<file>.sql.gz
#   docker compose start app

set -eu

FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: $0 backups/meraki-YYYYMMDDTHHMMSSZ.sql.gz" >&2
  exit 1
fi

printf 'This will replace the database with %s.\nType "restore" to continue: ' "$FILE"
read -r CONFIRM
if [ "$CONFIRM" != "restore" ]; then
  echo "Cancelled."
  exit 1
fi

# The dump contains CREATE TABLE statements without DROP, so clear the public
# schema first. Without this, a restore into a non-empty database fails halfway.
SCHEMA_RESET="DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

if [ -n "${DATABASE_URL:-}" ]; then
  if ! command -v psql >/dev/null 2>&1; then
    echo "psql not found. Install postgresql-client first." >&2
    exit 1
  fi
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "$SCHEMA_RESET"
  gunzip -c "$FILE" | psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction
else
  docker compose exec -T db psql -U meraki -d meraki -v ON_ERROR_STOP=1 -c "$SCHEMA_RESET"
  gunzip -c "$FILE" | docker compose exec -T db \
    psql -U meraki -d meraki -v ON_ERROR_STOP=1 --single-transaction
fi

echo "Restore complete. Verify with: curl -fsS http://localhost:8080/api/readyz"
