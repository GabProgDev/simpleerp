# SimpleERP Server

Backend Node.js + Express + Prisma para o SimpleERP.

## Pré-requisitos

- Node.js instalado
- NPM ou Yarn

## Instalação e Execução

Siga os passos abaixo na ordem para configurar o ambiente de desenvolvimento local:

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar Banco de Dados (SQLite)**
   Isso criará o arquivo `dev.db` e aplicará as tabelas definidas no schema.
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Popular o Banco (Seed)**
   Cria o usuário administrador padrão se não existir.
   *Usuário*: `admin`
   *Senha*: `admin123`
   ```bash
   npm run seed
   ```

4. **Rodar o Servidor**
   O servidor rodará na porta definida no .env (padrão: 3333).
   ```bash
   npm run dev
   ```

## Endpoints Principais

- `POST /auth/login`
- `GET /customers`
