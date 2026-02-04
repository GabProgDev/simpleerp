export type TransactionType = 'ENTRADA' | 'SAIDA';
export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'BOLETO' | 'OUTRO';
export type TransactionStatus = 'PAGO' | 'PENDENTE';

export interface Transaction {
  id: string;
  date: string; // ISO string
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  
  // Referências opcionais para integração
  referenceType?: 'SALE' | 'MANUAL';
  referenceId?: string;
  customerName?: string;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type TransactionFormData = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

export interface FinanceSummary {
  inflow: number;
  outflow: number;
  balance: number;
}