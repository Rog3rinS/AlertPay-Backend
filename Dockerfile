# Usa a imagem oficial do Node.js versão 22 como base
FROM node:22

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos package.json e package-lock.json primeiro para otimizar o cache do Docker
COPY package*.json ./

# Instala as dependências do Node.js
RUN npm install

# Copia o restante dos arquivos da aplicação para o diretório de trabalho
COPY . .

# Instala netcat-openbsd e remove os arquivos de lista do apt para manter a imagem menor
# netcat é necessário para o script wait-for.sh verificar a disponibilidade do banco de dados
RUN apt-get update && apt-get install -y netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Garante permissão de execução para os scripts shell no diretório de trabalho
RUN chmod +x /app/wait-for.sh /app/start.sh

# Define o comando que será executado quando o container iniciar
# Este comando executa o script start.sh, que cuida das migrations e inicia a aplicação
CMD ["sh", "/app/start.sh"]
