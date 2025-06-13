#!/bin/sh
# start.sh

set -e

# Espera o banco de dados ficar disponível. O nome do host 'alert-pay-db' deve
# corresponder ao `container_name` ou nome do serviço do banco de dados no docker-compose.yml.
/app/wait-for.sh alert-pay-db 5432

echo "Rodando migrations..."
# CORREÇÃO: Usar npx para executar o sequelize-cli
npx sequelize-cli db:migrate

echo "Iniciando aplicação..."
npm start
