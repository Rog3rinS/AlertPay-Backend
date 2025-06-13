
AlertPay Backend
================

Este projeto é o backend da aplicação AlertPay, focado em agendamento e disparo de notificações de faturas. Construído com Node.js, Express, Sequelize e PostgreSQL, o ambiente é totalmente orquestrado com Docker.

O grande diferencial deste setup é a **automação**: ao iniciar os contêineres, os serviços aguardarão o banco de dados ficar pronto e, em seguida, executarão as *migrations* automaticamente antes de iniciar a aplicação.

## 🏛️ Arquitetura

O ambiente é composto pelo serviço de backend principal e uma instância de banco de dados, cada um rodando em um contêiner Docker isolado. Eles se comunicam através de uma rede Docker.

| Serviço | Porta Exposta (Local) | Porta Interna (Contêiner) | Descrição |
| :--- | :--- | :--- | :--- |
| `alert-pay-db` | 5434 | 5432 | Instância do banco de dados PostgreSQL que armazena os dados da aplicação. |
| `alert-pay` | 4000 | 4000 | A API backend principal, responsável por toda a lógica de negócio. |

## ⚙️ Automação da Inicialização
-----------------------------

O serviço de API (`alert-pay`) utiliza um script de inicialização (`start.sh`) que automatiza as seguintes etapas:

1.  Usa o script `wait-for.sh` para garantir que o contêiner do banco de dados (`alert-pay-db:5432`) esteja totalmente operacional antes de prosseguir.
2.  Executa o comando `npx sequelize-cli db:migrate` para criar e aplicar a estrutura de tabelas mais recente no banco de dados.
3.  Inicia o servidor da aplicação com `npm start`.

Isso **elimina a necessidade de executar as migrations manualmente** após a inicialização.

✨ Recursos Adicionais
---------------------

### Tarefas Agendadas (Cron Jobs)

O sistema executa tarefas automatizadas em segundo plano a cada 2 minutos para:

-   **Importar Faturas (`ImportInvoicesJob`):** Busca novas faturas de instituições financeiras conectadas via Open Finance.
-   **Atualizar Status de Faturas (`UpdateInvoiceStatusJob`):** Sincroniza o status (Ex: 'Paga', 'Vencida') de faturas importadas com as informações dos bancos.
-   **Disparar Notificações (`NotificationDispatcherService`):** Envia notificações pendentes (e-mail, SMS, push) sobre as faturas.

🚀 Como Executar o Projeto
--------------------------

Siga os passos abaixo para rodar todo o ecossistema com um único comando.

### Pré-requisitos

Garanta que você tenha as seguintes ferramentas instaladas em sua máquina:

-   **Git**: para clonar o repositório.
-   **Docker e Docker Compose**: para orquestrar e executar os contêineres.

### 1\. Clone o Repositório

```bash
git clone https://github.com/Rog3rinS/AlertPay-Backend.git
cd AlertPay-Backend
```

### 2\. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou edite o `docker-compose.yml`) com as variáveis de ambiente necessárias. As configurações do banco de dados já possuem valores padrão no `docker-compose.yml`.

**Exemplo de `.env`:**

Fragmento do código


# Configurações do servidor
```
PORT=4000

# Configurações do Banco de Dados (opcional, já definido no docker-compose)
DB_HOST=alert-pay-db
DB_PORT=5432
DB_USER=postgres
DB_PASS=admin
DB_NAME=alertpay

# Segredo para JWT
AUTH_SECRET=seu_segredo_super_secreto_aqui
AUTH_EXPIRES=7d

# Credenciais para Disparo de Notificações
MAIL_HOST=smtp.exemplo.com
MAIL_PORT=587
MAIL_USER=seu_email@exemplo.com
MAIL_PASS=sua_senha_de_email
```

> **Importante:** O segredo `AUTH_SECRET` é usado para assinar os tokens JWT. Use uma string forte e secreta.

### 3\. Inicie o Ambiente

Com o Docker em execução, utilize o Docker Compose para construir as imagens e iniciar todos os contêineres:

```bash
docker compose up --build -d
```

Obs: Talvez seja necessario dar permissao para os scripts rodarem, para isso rode:

```bash
sudo chmod +x wait-for.sh start.sh
```

O Docker irá:

-   Construir a imagem do serviço `alert-pay`.
-   Iniciar os contêineres em modo `detached` (`-d`).
-   Conectar o serviço a uma rede externa `openfinance-net`.
-   Executar o script de inicialização que automaticamente aplicará as migrations.

Pronto! 🎉 Após alguns instantes, o backend estará no ar e pronto para uso na porta `4000`.

Você pode verificar os logs do contêiner com:

```bash
docker logs -f alert-pay

```

🔧 Gerenciamento do Ambiente
----------------------------

### Parar os Contêineres

Para parar e remover todos os contêineres, redes e volumes criados pelo ambiente:

```bash
docker-compose down

```

↔️ Endpoints da API
-------------------

🔓 Rotas Públicas (Não requerem autenticação)
---------------------------------------------

### ➕ Criar Usuário

**POST** `/users`

**JSON Exemplo:**

```json
{
  "cpf": "12345678910",
  "name": "Seu Nome",
  "email": "seu-nome@gmail.com",
  "password": "senha123",
  "phone": "5551999998888"
}

```

* * * * *

### 🔐 Login

**POST** `/login`

**JSON Exemplo:**

```json
{
  "email": "seu-nome@gmail.com",
  "password": "senha123"
}

```

* * * * *

🔒 Rotas Protegidas (Requerem token JWT)
----------------------------------------

* * * * *

### ✏️ Atualizar Usuário

**PUT** `/users`

**Atualizar dados cadastrais:**

```json
{
  "name": "Seu Nome",
  "email": "seu-nome@gmail.com",
  "phone": "5551999997777"
}

```

**Alterar senha:**

```json
{
  "oldPassword": "senha123",
  "password": "novaSenha123",
  "confirmPassword": "novaSenha123"
}

```

* * * * *

### 👤 Buscar Usuário

**GET** `/users`

**Resposta:** Dados do usuário autenticado.

* * * * *

### ❌ Deletar Usuário

**DELETE** `/users`

* * * * *

### 🏦 Conexão com Bancos (Open Finance)

#### Conectar a um banco

**POST** `/bank-login`

**JSON Exemplo:**

```json
{
    "email": "seu_email_no_banco@exemplo.com",
    "password": "sua_senha_no_banco",
    "bankId": "api-mini-bc"
}

```

-   `bankId` pode ser: `api-mini-bc`, `banco-central`, `bank-account-api`, `mini-banco-central`.

#### Listar bancos conectados

**GET** `/bank-logins`

**Resposta:**

```json
[
    { "bank_id": "api-mini-bc" },
    { "bank_id": "banco-central" }
]

```

#### Desconectar de um banco

**DELETE** `/bank-rm-login/:bankId`

* * * * *

### 🧾 Faturas

#### ➕ Criar Fatura Manual

**POST** `/invoices`

**JSON Exemplo:**

```json
{
 "description": "Conta de luz",
 "amount": 320.50,
 "due_date": "2025-07-10",
 "origin": "Manual"
}

```

*Obs: O agendamento de notificações é gerado automaticamente com base nas regras do usuário.*

#### 📄 Listar Faturas de um Banco

**GET** `/invoices?bankId=<bankId>`

-   É necessário fornecer o `bankId` como query parameter.

#### 📄 Listar Faturas Manuais

**GET** `/invoices/manual`

#### ✏️ Atualizar Fatura Manual

**PUT** `/invoices/:id`

**JSON Exemplo:**

```json
{
 "description": "Conta de luz ajustada",
 "amount": 305.00,
 "status": "Paga"
}

```

*Obs: Só é permitido para faturas com origem "Manual".*

#### ❌ Deletar Fatura

**DELETE** `/invoices/:id`

* * * * *

### ⚙️ Regras de Notificação

#### ➕ Criar Regra de Notificação

**POST** `/user-rules`

**JSON Exemplo:**

```json
{
 "days_before": 3,
 "min_amount": 300,
 "type": "email"
}

```

-   `type` pode ser: `email`, `sms`, `push`.

#### 📄 Listar Regras do Usuário

**GET** `/user-rules`

#### ❌ Deletar Regra

**DELETE** `/user-rules/:id`

* * * * *

### 🗓️ Agendamentos de Notificação

#### 📄 Listar Agendamentos

**GET** `/schedules`

#### ❌ Deletar Agendamento

**DELETE** `/schedules/:id`

* * * * *

📌 Observações
--------------

-   Todas as rotas protegidas requerem um token JWT no cabeçalho de autorização.

    ```
    Authorization: Bearer <seu_token_aqui>

    ```

-   Dados do usuário como o CPF são extraídos do token JWT no backend e não precisam ser enviados nas requisições.

* * * * *

📄 Licença
----------

Este projeto está licenciado sob os termos da Licença MIT.
