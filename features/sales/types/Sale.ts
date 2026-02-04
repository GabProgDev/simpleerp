export interface SaleItem {
  productId?: string; // Opcional para itens manuais (serviços)
  productName: string;
  productSku?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  createdAt: string;
  items: SaleItem[];
  total: number;
  customerId?: string;
  customerName?: string;
  notes?: string;
  status: 'COMPLETED' | 'CANCELED';
}

export interface CartItem extends SaleItem {
  productId: string; // No POS (Carrinho), productId continua obrigatório pois vem do estoque
  maxStock: number;
}

export type SaleFormData = Omit<Sale, 'id' | 'createdAt'>;