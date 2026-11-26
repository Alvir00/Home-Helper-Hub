#!/bin/sh
# Back up the Meraki database to a compressed SQL file.
#
# Local stack:      ./deploy/backup.sh
# Managed Postgres: DATABASE_URL=postgres://... ./deploy/backup.sh
#
# Schedule it daily with cron (see docs/DEPLOYMENT.md) and copy the files off
# the server — a backup that only exists on the same disk is not a backup.

set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="$BACKUP_DIR/meraki-$STAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

if [ -n "${DATABASE_URL:-}" ]; then
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "pg_dump not found. Install postgresql-client, or run this script on the Docker host." >&2
    exit 1
  fi
  pg_dump --no-owner --no-privileges "$DATABASE_URL" | gzip > "$FILE"
else
  docker compose exec -T db pg_dump --no-owner --no-privileges -U meraki -d meraki | gzip > "$FILE"
fi

# Fail loudly on an empty/corrupt archive rather than keeping a useless file.
if [ ! -s "$FILE" ]; then
  echo "Backup failed: $FILE is empty" >&2
  rm -f "$FILE"
  exit 1
fi

find "$BACKUP_DIR" -name 'meraki-*.sql.gz' -type f -mtime +"$RETENTION_DAYS" -delete

echo "Backup written: $FILE ($(du -h "$FILE" | cut -f1))"
