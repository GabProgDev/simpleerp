import { Sale, SaleFormData } from '../types/Sale';
import { productService } from '../../inventory/services/productService';

const STORAGE_KEY = 'simple_erp_sales';
const DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredSales = (): Sale[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredSales = (sales: Sale[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
};

export const salesService = {
  getAll: async (): Promise<Sale[]> => {
    await sleep(DELAY_MS);
    return getStoredSales().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById: async (id: string): Promise<Sale | undefined> => {
    await sleep(DELAY_MS);
    const sales = getStoredSales();
    return sales.find((s) => s.id === id);
  },

  create: async (data: SaleFormData): Promise<Sale> => {
    await sleep(DELAY_MS);
    
    // 1. Validação de Estoque (Apenas para itens com productId)
    for (const item of data.items) {
      if (item.productId) {
        const product = await productService.getById(item.productId);
        if (!product) {
          throw new Error(`Produto ${item.productName} não encontrado.`);
        }
        if (product.quantity < item.quantity) {
          throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${product.quantity}`);
        }
      }
    }

    // 2. Dar baixa no estoque (Apenas para itens com productId)
    for (const item of data.items) {
      if (item.productId) {
        const product = await productService.getById(item.productId);
        if (product) {
          const { id, createdAt, updatedAt, ...productData } = product;
          await productService.update(product.id, {
            ...productData,
            quantity: product.quantity - item.quantity,
          });
        }
      }
    }

    // 3. Salvar a venda
    const sales = getStoredSales();
    const newSale: Sale = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    sales.push(newSale);
    setStoredSales(sales);
    return newSale;
  },
};