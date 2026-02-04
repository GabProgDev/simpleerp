import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed Usuário Admin
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminExists) {
    console.log('Criando usuário Admin padrão...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        name: 'Administrador',
        username: 'admin',
        email: 'admin@local',
        role: 'ADMIN',
        passwordHash: hashedPassword,
        isActive: true,
      },
    });
    console.log('Admin criado: admin / admin123');
  } else {
    console.log('Admin já existe.');
  }

  // Seed Chatbot Config
  const botConfigExists = await prisma.chatbotConfig.findFirst();
  if (!botConfigExists) {
    console.log('Criando configuração padrão do Chatbot...');
    await prisma.chatbotConfig.create({
      data: {
        enabled: false,
        adminNumber: '5511999999999@c.us',
        triggerKeywords: JSON.stringify(['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'menu']),
        backToMenuKeyword: 'menu',
        greetingTemplate: 'Olá {nome}! Bem-vindo ao SimpleERP.',
        menuText: 'Como podemos te ajudar hoje? Digite o número da opção:',
        invalidOptionText: 'Desculpe, não entendi. Digite "menu" para ver as opções novamente.',
        servicesText: 'Nossos serviços incluem:\n- Consultoria\n- Vendas\n- Suporte Técnico',
        hoursText: 'Funcionamos de Segunda a Sexta, das 08h às 18h.',
        attendantIntroText: 'Um momento, estou transferindo para um atendente humano.',
        attendantReceivedText: 'Sua mensagem foi encaminhada. Em breve responderemos.',
        menuOptions: JSON.stringify([
            { label: 'Nossos Serviços', triggers: ['1', 'servicos', 'serviços'], action: 'SERVICES' },
            { label: 'Horário de Atendimento', triggers: ['2', 'horario', 'horário'], action: 'HOURS' },
            { label: 'Falar com Atendente', triggers: ['3', 'atendente', 'humano'], action: 'ATTENDANT' }
        ])
      }
    });
    console.log('Configuração do Chatbot criada.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
