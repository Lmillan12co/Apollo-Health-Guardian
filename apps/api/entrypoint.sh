#!/bin/sh
# Apollo API entrypoint (Cloud Run).
# Applies pending Prisma migrations, then starts the API.
# Cloud Run injects $PORT; the API listens on it (3001 is the local default).
set -e
cd "$(dirname "$0")"

echo "Apollo API: applying database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Apollo API: starting on port ${PORT:-3001}..."
exec node dist/index.js
