import { Sale, SaleFormData } from '../types/Sale';
import { apiClient } from '../../../shared/services/apiClient';

const USE_API = import.meta.env.VITE_USE_API === 'true';
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

// Converter formato da API para formato local
const mapApiOrder = (order: any): Sale => ({
  id: order.id,
  createdAt: order.createdAt,
  items: order.items?.map((item: any) => ({
    productId: item.productId,
    productName: item.product?.name || '',
    productSku: item.product?.sku || '',
    unitPrice: Number(item.unitPrice),
    quantity: item.quantity,
    subtotal: Number(item.total),
  })) || [],
  total: Number(order.total),
  customerId: order.customerId,
  customerName: order.customer?.name || '',
  notes: order.notes || '',
  status: order.status === 'ENTREGUE' ? 'COMPLETED' : 
          order.status === 'CANCELADO' ? 'CANCELED' : 'COMPLETED',
});

export const salesService = {
  getAll: async (): Promise<Sale[]> => {
    if (USE_API) {
      const orders = await apiClient.get<any[]>('/orders');
      return orders.map(mapApiOrder);
    }
    await sleep(DELAY_MS);
    return getStoredSales().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById: async (id: string): Promise<Sale | undefined> => {
    if (USE_API) {
      const order = await apiClient.get<any>(`/orders/${id}`);
      return mapApiOrder(order);
    }
    await sleep(DELAY_MS);
    return getStoredSales().find((s) => s.id === id);
  },

  create: async (data: SaleFormData, userId?: string): Promise<Sale> => {
    if (USE_API) {
      const payload = {
        customerId: data.customerId,
        userId: userId || '',
        notes: data.notes,
        discount: 0,
        items: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discount: 0,
        })),
      };
      const order = await apiClient.post<any>('/orders', payload);
      return mapApiOrder(order);
    }

    await sleep(DELAY_MS);
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

  finalize: async (id: string, method: string, userId?: string): Promise<void> => {
    if (USE_API) {
      await apiClient.patch(`/orders/${id}/finalize`, { method, userId });
      return;
    }
    await sleep(DELAY_MS);
    const sales = getStoredSales();
    const index = sales.findIndex(s => s.id === id);
    if (index !== -1) {
      sales[index].status = 'COMPLETED';
      setStoredSales(sales);
    }
  },

  cancel: async (id: string): Promise<void> => {
    if (USE_API) {
      await apiClient.patch(`/orders/${id}/cancel`, {});
      return;
    }
    await sleep(DELAY_MS);
    const sales = getStoredSales();
    const index = sales.findIndex(s => s.id === id);
    if (index !== -1) {
      sales[index].status = 'CANCELED';
      setStoredSales(sales);
    }
  },
};