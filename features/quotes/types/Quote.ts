export type QuoteStatus = 'RASCUNHO' | 'APROVADO' | 'CONVERTIDO' | 'CANCELADO';

export interface QuoteItem {
  productId?: string; // Opcional (item manual)
  name: string;
  sku?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Quote {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: QuoteStatus;
  
  customerId?: string;
  customerName?: string;
  
  items: QuoteItem[];
  
  subtotal: number;
  discount: number;
  total: number;
  
  notes?: string;
  saleId?: string; // ID da venda se convertido
}

export type QuoteFormData = Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'saleId'>;