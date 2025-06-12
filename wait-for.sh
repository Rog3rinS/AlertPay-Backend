#!/bin/sh
# wait-for.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

echo "Aguardando $host:$port..."

while ! nc -z "$host" "$port"; do
  sleep 0.1
done

echo "$host:$port está disponível. Executando comando: $cmd"
exec $cmd
