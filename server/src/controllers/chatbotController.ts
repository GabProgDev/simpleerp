import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Retorna a configuração (Single Tenant - pega a primeira)
export const getConfig = async (req: Request, res: Response) => {
  try {
    const config = await prisma.chatbotConfig.findFirst();
    if (!config) {
      return res.status(404).json({ message: 'Configuração não encontrada' });
    }
    return res.json(config);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar configuração do bot' });
  }
};

// Atualiza a configuração
export const updateConfig = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Validação básica do adminNumber
    if (data.adminNumber && !data.adminNumber.endsWith('@c.us')) {
        // Se o usuário esqueceu o sufixo, adicionamos ou alertamos. Vamos ser permissivos.
        if (!data.adminNumber.includes('@')) {
            data.adminNumber = `${data.adminNumber}@c.us`;
        }
    }

    // Garante que é JSON string para arrays
    if (typeof data.triggerKeywords === 'object') data.triggerKeywords = JSON.stringify(data.triggerKeywords);
    if (typeof data.menuOptions === 'object') data.menuOptions = JSON.stringify(data.menuOptions);

    // Upsert (atualiza o primeiro ou cria)
    const firstConfig = await prisma.chatbotConfig.findFirst();

    let config;
    if (firstConfig) {
      config = await prisma.chatbotConfig.update({
        where: { id: firstConfig.id },
        data: {
            ...data,
            updatedAt: new Date()
        }
      });
    } else {
      config = await prisma.chatbotConfig.create({
        data
      });
    }

    return res.json(config);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar configuração' });
  }
};
