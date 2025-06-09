#!/bin/sh
# docker-entrypoint.sh

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h alert-pay-db -p 5432 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing command"

# Run migrations
npm run migrate

# Start the Node.js application
npm start
