#!/usr/bin/env bash
# Reset the database: drop and recreate all tables, then re-seed.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/../shared/database/src/migrations"

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_ROOT_USER="${DB_ROOT_USER:-abdo}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-password}"
DB_NAME="${DB_NAME:-realestate_db}"

MYSQL_CNF=$(mktemp)
chmod 600 "$MYSQL_CNF"
printf '[client]\npassword=%s\n' "$DB_ROOT_PASSWORD" > "$MYSQL_CNF"
trap 'rm -f "$MYSQL_CNF"' EXIT

MYSQL="mysql --defaults-extra-file=$MYSQL_CNF -h $DB_HOST -P $DB_PORT -u $DB_ROOT_USER"

echo "==> [reset] Dropping database '$DB_NAME' ..."
$MYSQL -e "DROP DATABASE IF EXISTS \`$DB_NAME\`;"

echo "==> [reset] Recreating database and user ..."
$MYSQL < "$MIGRATIONS_DIR/000_create_db_and_user.sql"

echo "==> [reset] Running schema migration ..."
$MYSQL < "$MIGRATIONS_DIR/001_initial_schema.sql"

echo "==> [reset] Seeding data ..."
$MYSQL < "$MIGRATIONS_DIR/002_seed_data.sql"

echo "==> [reset] Done. Database has been reset."
