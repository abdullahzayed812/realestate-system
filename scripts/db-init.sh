#!/usr/bin/env bash
# Initialize the database: create DB/user, run schema, and seed data.
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

echo "==> [init] Running 000_create_db_and_user.sql ..."
$MYSQL < "$MIGRATIONS_DIR/000_create_db_and_user.sql"

echo "==> [init] Running 001_initial_schema.sql ..."
$MYSQL < "$MIGRATIONS_DIR/001_initial_schema.sql"

echo "==> [init] Running 002_seed_data.sql ..."
$MYSQL < "$MIGRATIONS_DIR/002_seed_data.sql"

echo "==> [init] Done. Database is ready."
