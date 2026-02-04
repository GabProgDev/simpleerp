import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import chatbotRoutes from './routes/chatbotRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json({ limit: '10mb' })); // Limite aumentado para imagens base64

// Rotas
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/chatbot', chatbotRoutes);
// Futuras rotas: /products, /sales, /finance, /quotes

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
