const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3333/chatbot/config';

// Estado em memória
let config = null;
const userStates = {}; // { number: { mode: 'BOT' | 'ATTENDANT', lastInteraction: timestamp } }

console.log('Iniciando Chatbot Service...');

// Função para buscar configuração
const fetchConfig = async () => {
    try {
        const response = await axios.get(API_URL);
        const newConfig = response.data;
        
        // Parse JSON strings se necessário (dependendo de como o axios retorna, geralmente já vem obj se content-type json)
        if (typeof newConfig.triggerKeywords === 'string') newConfig.triggerKeywords = JSON.parse(newConfig.triggerKeywords);
        if (typeof newConfig.menuOptions === 'string') newConfig.menuOptions = JSON.parse(newConfig.menuOptions);
        
        config = newConfig;
        // console.log('Configuração sincronizada:', new Date().toLocaleTimeString());
    } catch (error) {
        console.error('Erro ao buscar configuração:', error.message);
        // Se falhar e não tiver config, tenta de novo em 5s
        if (!config) setTimeout(fetchConfig, 5000);
    }
};

// Polling de configuração a cada 30 segundos
setInterval(fetchConfig, 30000);
fetchConfig(); // Primeira busca

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

client.on('message', async msg => {
    // 1. Verificações básicas
    if (!config || !config.enabled) return; // Bot desligado ou sem config
    if (msg.fromMe) return; // Ignora msg própria
    if (msg.isStatus) return; // Ignora status
    
    // Ignora mensagens de grupo (opcional, geralmente ERP atende clientes individuais)
    if (msg.from.includes('@g.us')) return;

    // Normaliza
    const contact = await msg.getContact();
    const name = contact.pushname || contact.name || 'Cliente';
    const from = msg.from;
    const body = msg.body.trim();
    const bodyLower = body.toLowerCase();
    
    // Anti-loop de mensagens antigas (mais de 5 min)
    const messageTimestamp = msg.timestamp * 1000;
    if (Date.now() - messageTimestamp > 5 * 60 * 1000) return;

    // Estado do Usuário
    if (!userStates[from]) {
        userStates[from] = { mode: 'BOT', lastInteraction: Date.now() };
    }
    const userState = userStates[from];

    // 2. Lógica de Modo Atendente
    if (userState.mode === 'ATTENDANT') {
        // Verifica comando de saída
        if (bodyLower === config.backToMenuKeyword.toLowerCase()) {
            userState.mode = 'BOT';
            await client.sendMessage(from, config.menuText);
            return;
        }

        // Encaminha para o Admin
        if (config.adminNumber) {
            try {
                // Formata mensagem para o admin saber quem é
                const forwardHeader = `[De: ${name} (${from.split('@')[0]})]:\n`;
                await client.sendMessage(config.adminNumber, forwardHeader + msg.body);
            } catch (err) {
                console.error('Erro ao encaminhar para admin:', err.message);
            }
        }

        // Resposta automática de recebimento (opcional, para não flodar, podemos verificar tempo da última resposta)
        // Aqui mandaremos sempre para confirmar.
        await client.sendMessage(from, config.attendantReceivedText);
        return;
    }

    // 3. Lógica do Bot

    // Verifica Trigger Inicial
    const isTrigger = config.triggerKeywords.some(k => bodyLower === k || bodyLower.startsWith(k + ' '));
    
    if (isTrigger) {
        // Envia Saudação + Menu
        const greeting = config.greetingTemplate.replace('{nome}', name);
        let menu = `${greeting}\n\n${config.menuText}\n`;
        
        config.menuOptions.forEach((opt) => {
           // Assume que triggers[0] é o número/identificador principal
           menu += `\n*${opt.triggers[0]}* - ${opt.label}`; 
        });

        await client.sendMessage(from, menu);
        return;
    }

    // Verifica Opções do Menu
    let matchedOption = null;
    
    // Itera opções para achar trigger
    for (const option of config.menuOptions) {
        if (option.triggers.some(t => t.toLowerCase() === bodyLower)) {
            matchedOption = option;
            break;
        }
    }

    if (matchedOption) {
        switch (matchedOption.action) {
            case 'SERVICES':
                await client.sendMessage(from, config.servicesText);
                break;
            case 'HOURS':
                await client.sendMessage(from, config.hoursText);
                break;
            case 'TEXT':
                await client.sendMessage(from, matchedOption.customText || 'Opção selecionada.');
                break;
            case 'ATTENDANT':
                userState.mode = 'ATTENDANT';
                await client.sendMessage(from, config.attendantIntroText);
                // Opcional: Avisar admin que alguém entrou na fila
                if (config.adminNumber) {
                     await client.sendMessage(config.adminNumber, `🔔 Novo cliente solicitando atendimento: ${name} (${from.split('@')[0]})`);
                }
                break;
        }
        return;
    }

    // Se chegou aqui, não é trigger e não é opção válida, E o usuário já interagiu recentemente (sessão ativa)
    // Se for msg aleatória de quem nunca falou, ignoramos (para não responder spam)
    // Se o usuário já estava falando com o bot (menos de 10 min), mandamos opção inválida.
    if (Date.now() - userState.lastInteraction < 10 * 60 * 1000) {
        await client.sendMessage(from, config.invalidOptionText);
    }
    
    // Atualiza timestamp
    userState.lastInteraction = Date.now();
});

client.initialize();
