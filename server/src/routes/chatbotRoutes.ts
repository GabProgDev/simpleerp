import { Router } from 'express';
import { getConfig, updateConfig } from '../controllers/chatbotController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota pública (ou protegida por API Key customizada) para o BOT Node ler a config
// O Bot vai mandar um header 'x-bot-api-key'. Se bater com o banco, ok.
// Para simplificar neste MVP, deixaremos aberto ou validaremos apenas se vier do IP local se fosse produção.
// Mas para segurança mínima, vamos deixar GET público (leitura) mas idealmente o bot usaria a chave.
router.get('/config', getConfig);

// Rotas protegidas para o FRONTEND (apenas ADMIN)
router.put('/config', authMiddleware, roleMiddleware(['ADMIN']), updateConfig);

export default router;
