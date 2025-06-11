# AlertPay Backend

Backend da aplicação AlertPay, utilizando Node.js, Express, Sequelize, PostgreSQL e Docker.

---

## Requisitos

- Docker e Docker Compose instalados  
- Node.js instalado (opcional, para rodar localmente)  
- Acesso ao terminal/console

---

## Configuração e Execução com Docker

### 1. Clonar o repositório
git clone https://github.com/Rog3rinS/AlertPay-Backend.git
cd AlertPay-Backend


2. Ajustar o arquivo de conexão com o banco para evitar erros iniciais
No arquivo src/database/index.js, comente temporariamente as linhas que inicializam o Sequelize e os models para evitar erros na primeira execução das migrations, pois o banco ainda não existe.

// this.connection = new Sequelize(databaseConfig);
// models.forEach(model => model.init(this.connection));
// models.forEach(model => {
//   if (model.associate) {
//     model.associate(this.connection.models);
//   }
// });

3. Configurar variáveis de ambiente no docker-compose.yml
No docker-compose.yml já estão definidas as variáveis principais. Ajuste o valor de AUTH_SECRET para uma string secreta forte.

environment:
  PORT: 4000
  DB_HOST: alert-pay-db
  DB_PORT: 5432
  DB_USER: postgres
  DB_PASS: admin
  DB_NAME: alertpay
  AUTH_SECRET: sua_chave_secreta_aqui

4. Modificar o package.json
Para evitar warnings relacionados a ES Modules, adicione a propriedade "type": "module":

{
  ...
  "type": "module",
  ...
}

5. Subir os containers com Docker Compose

docker-compose up -d --build
Isso vai construir as imagens e subir os containers do banco e do backend.

6. Rodar as migrations
Execute as migrations dentro do container do backend para criar as tabelas no banco:

docker-compose run --rm alert-pay npm run migrate

ou

docker exec -it alert-pay npm run migrate
(dependendo da sua configuração)

7. Descomentar as linhas no arquivo src/database/index.js
Depois que as migrations rodarem e o banco estiver criado, descomente as linhas comentadas no passo 2 para que o Sequelize inicialize normalmente:

this.connection = new Sequelize(databaseConfig);
models.forEach(model => model.init(this.connection));
models.forEach(model => {
  if (model.associate) {
    model.associate(this.connection.models);
  }
});
8. Iniciar a aplicação
Se não estiver rodando ainda, inicie o backend:

docker-compose up -d

9. Acessar o backend
O backend estará disponível em:

http://localhost:4000
Uso do token JWT
Ao fazer login, você receberá um token JWT.

Esse token deve ser enviado no header Authorization das requisições autenticadas.

Exemplo do header:

makefile

Authorization: Bearer <seu_token_jwt_aqui>
Rodando localmente (sem Docker)
Se preferir rodar localmente:

Instale as dependências:

npm install
Configure um arquivo .env com as variáveis necessárias (mesmas do docker-compose.yml).

Execute as migrations:

npx sequelize-cli db:migrate
Inicie o servidor:

npm start
Comandos úteis Docker
Para entrar no container backend:

docker-compose exec alert-pay bash
Para parar os containers:

docker-compose down
Para ver logs do backend:

docker logs -f alert-pay
Notas importantes
Remova a linha version: do arquivo docker-compose.yml para evitar warnings.

Warnings sobre networks.default: external.name is deprecated podem ser ignorados ou ajustados conforme a documentação Docker Compose.

Certifique-se que a pasta alertpay-data/db tem permissão correta para o Docker acessar no seu sistema.

Estrutura do projeto
/src: código-fonte do backend

/src/app/controllers: controllers da aplicação

/src/app/middlewares: middlewares (ex.: autenticação)

/src/app/models: modelos Sequelize

/src/database/migrations: migrations Sequelize

# Boa codificação!
