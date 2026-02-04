# SimpleERP + WhatsApp Chatbot

Um sistema ERP simples e modular com integração WhatsApp via `whatsapp-web.js`.

## Estrutura

- `/`: Frontend React
- `/server`: Backend Node/Express/Prisma
- `/chatbot-whatsapp`: Microserviço do Bot

## Instalação e Execução

### 1. Backend (Server)
```bash
cd server
npm install
npx prisma migrate dev --name init_chatbot  # Aplica o novo schema
npm run seed                                # Cria admin e config padrão do bot
npm run dev
```

### 2. Frontend (App)
```bash
# Na raiz
npm install
npm run dev
```
Acesse `http://localhost:5173`. Login padrão: `admin` / `admin123`.

### 3. Chatbot (WhatsApp)
```bash
cd chatbot-whatsapp
npm install
npm start
```
1. O terminal exibirá um **QR Code**. Escaneie com seu WhatsApp (Dispositivo Vinculado).
2. O bot começará a ler as configurações do backend.
3. No SimpleERP, vá em "Chatbot WhatsApp" no menu lateral para ativar e configurar as mensagens.

## Como usar o Chatbot

1. **Ativação:** Por padrão, o bot vem desativado (`enabled: false`). Acesse o painel e ative-o.
2. **Teste:** Mande "Oi" ou "Menu" para o número conectado.
3. **Modo Atendente:** Se escolher a opção de atendente, o bot encaminha as mensagens para o número Admin configurado (ex: `5511999999999@c.us`) e pausa as respostas automáticas para aquele usuário até que ele digite "menu".

## Desenvolvimento

- As configurações do bot são salvas no banco SQLite `server/prisma/dev.db`.
- O bot faz polling na API a cada 30 segundos para atualizar suas configurações sem precisar reiniciar.
