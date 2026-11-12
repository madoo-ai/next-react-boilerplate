#!/usr/bin/env bash
set -euo pipefail

# Local development Postgres. Data lives under .manus/ so it survives
# container recreation without making the checkout dirty.
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGDATA=${PGDATA:-"$PWD/.manus/postgres"}

if ! command -v initdb >/dev/null 2>&1; then
  if pg_isready -q -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER"; then
    echo "Using the existing Postgres on 127.0.0.1:$PGPORT"
    exit 0
  fi

  echo "PostgreSQL server binaries were not found and no server is reachable on 127.0.0.1:$PGPORT." >&2
  echo "Install PostgreSQL, start a server, or use 'docker compose up --build'." >&2
  exit 1
fi

PGBIN=${PGBIN:-$(dirname "$(command -v initdb)")}

mkdir -p "$PGDATA"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  "$PGBIN/initdb" \
    -D "$PGDATA" \
    -U "$PGUSER" \
    --auth=trust \
    --encoding=UTF8 \
    --locale=C
fi

grep -q "^listen_addresses" "$PGDATA/postgresql.conf" ||
  echo "listen_addresses = '127.0.0.1'" >>"$PGDATA/postgresql.conf"
grep -q "^port = $PGPORT" "$PGDATA/postgresql.conf" ||
  echo "port = $PGPORT" >>"$PGDATA/postgresql.conf"
grep -q "^unix_socket_directories" "$PGDATA/postgresql.conf" ||
  echo "unix_socket_directories = '$PGDATA'" >>"$PGDATA/postgresql.conf"

if [ -f "$PGDATA/postmaster.pid" ]; then
  pid=$(head -n 1 "$PGDATA/postmaster.pid" 2>/dev/null || true)
  if [ -n "$pid" ] && ! kill -0 "$pid" 2>/dev/null; then
    rm -f "$PGDATA/postmaster.pid"
  fi
fi

if ! "$PGBIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
  "$PGBIN/pg_ctl" -D "$PGDATA" -l "$PGDATA/server.log" \
    -o "-p $PGPORT -h 127.0.0.1" start
fi

for _ in $(seq 1 40); do
  if "$PGBIN/pg_isready" -q -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER"; then
    break
  fi
  sleep 0.25
done

"$PGBIN/pg_isready" -q -h 127.0.0.1 -p "$PGPORT" -U "$PGUSER"
echo "postgres ready on 127.0.0.1:$PGPORT"
