
# AlertPay Backend

Este projeto é o backend da aplicação AlertPay, que utiliza Node.js, Express, Sequelize, PostgreSQL e Docker.

---

## Requisitos

- Docker e Docker Compose instalados
- Node.js instalado (para rodar localmente, opcional)
- Acesso ao terminal/console

---

## Configuração e execução com Docker

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd AlertPay-Backend
```

### 2. Configurar variáveis de ambiente no `docker-compose.yml`

As variáveis necessárias já estão definidas no `docker-compose.yml`, incluindo:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `AUTH_SECRET` (adicione a sua chave secreta aqui)

Exemplo:

```yaml
environment:
  PORT: 4000
  DB_HOST: alert-pay-db
  DB_PORT: 5432
  DB_USER: postgres
  DB_PASS: admin
  DB_NAME: alertpay
  AUTH_SECRET: sua_chave_secreta_aqui
```

> **Importante:** O segredo `AUTH_SECRET` é usado para assinar os tokens JWT. Use uma string forte e secreta.

### 3. Subir os containers

```bash
docker-compose up --build -d
```

### 4. Rodar as migrations dentro do container do backend

Para criar as tabelas no banco de dados, execute as migrations com o comando abaixo:

```bash
docker exec -it alert-pay npm run sequelize-cli db:migrate
```

Ou, caso o script esteja configurado no `package.json` como:

```json
"scripts": {
  "migrate": "sequelize-cli db:migrate",
  ...
}
```

Execute:

```bash
docker exec -it alert-pay npm run migrate
```

### 5. Acessar o backend

O backend estará disponível na porta 4000 (http://localhost:4000).

---

## Uso do token JWT

- Ao fazer login, você receberá um token JWT.
- Esse token deve ser enviado no header `Authorization` das requisições autenticadas.
- Exemplo do header:

```
Authorization: Bearer <seu_token_jwt_aqui>
```

---

## Rodando localmente (sem Docker)

Se preferir rodar localmente:

1. Instale as dependências:

```bash
npm install
```

2. Configure um arquivo `.env` com as variáveis necessárias (mesmas do `docker-compose.yml`).

3. Execute as migrations:

```bash
npx sequelize-cli db:migrate
```

4. Inicie o servidor:

```bash
npm start
```

---

## Comandos úteis

- Para parar os containers:

```bash
docker-compose down
```

- Para ver logs do backend:

```bash
docker logs -f alert-pay
```

---

## Estrutura do projeto

- `/src`: código-fonte do backend
- `/src/app/controllers`: controllers da aplicação
- `/src/app/middlewares`: middlewares (ex.: autenticação)
- `/src/app/models`: modelos Sequelize
- `/src/database/migrations`: migrations Sequelize

---

**Boa codificação!**
