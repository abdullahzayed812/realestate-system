#!/usr/bin/env bash
# Re-run seed data only (truncates and re-inserts, schema must already exist).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/../shared/database/src/migrations"

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_ROOT_USER="${DB_ROOT_USER:-abdo}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-password}"

MYSQL_CNF=$(mktemp)
chmod 600 "$MYSQL_CNF"
printf '[client]\npassword=%s\n' "$DB_ROOT_PASSWORD" > "$MYSQL_CNF"
trap 'rm -f "$MYSQL_CNF"' EXIT

MYSQL="mysql --defaults-extra-file=$MYSQL_CNF -h $DB_HOST -P $DB_PORT -u $DB_ROOT_USER"

echo "==> [seed] Running 002_seed_data.sql ..."
$MYSQL < "$MIGRATIONS_DIR/002_seed_data.sql"

echo "==> [seed] Done."
