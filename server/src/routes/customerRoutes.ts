import { Router } from 'express';
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Leitura: Todos os roles autenticados
router.get('/', listCustomers);
router.get('/:id', getCustomer);

// Escrita: Apenas ADMIN e VENDEDOR
router.post('/', roleMiddleware(['VENDEDOR']), createCustomer);
router.put('/:id', roleMiddleware(['VENDEDOR']), updateCustomer);
router.delete('/:id', roleMiddleware(['VENDEDOR']), deleteCustomer);

export default router;