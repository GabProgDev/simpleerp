import { Transaction, TransactionFormData, FinanceSummary } from '../types/Transaction';

const STORAGE_KEY = 'simple_erp_finance_transactions';
const DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const financeService = {
  getAll: async (): Promise<Transaction[]> => {
    await sleep(DELAY_MS);
    return getStoredTransactions().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  getById: async (id: string): Promise<Transaction | undefined> => {
    await sleep(DELAY_MS);
    const transactions = getStoredTransactions();
    return transactions.find((t) => t.id === id);
  },

  create: async (data: TransactionFormData): Promise<Transaction> => {
    await sleep(DELAY_MS);
    const transactions = getStoredTransactions();
    
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transactions.push(newTransaction);
    setStoredTransactions(transactions);
    return newTransaction;
  },

  update: async (id: string, data: TransactionFormData): Promise<Transaction> => {
    await sleep(DELAY_MS);
    const transactions = getStoredTransactions();
    const index = transactions.findIndex((t) => t.id === id);

    if (index === -1) throw new Error('Transação não encontrada');

    const updatedTransaction: Transaction = {
      ...transactions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    transactions[index] = updatedTransaction;
    setStoredTransactions(transactions);
    return updatedTransaction;
  },

  delete: async (id: string): Promise<void> => {
    await sleep(DELAY_MS);
    const transactions = getStoredTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    setStoredTransactions(filtered);
  },

  getSummary: async (from?: Date, to?: Date): Promise<FinanceSummary> => {
    await sleep(DELAY_MS);
    const transactions = getStoredTransactions();
    
    let filtered = transactions;
    if (from && to) {
      filtered = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= from && d <= to;
      });
    }

    const summary = filtered.reduce((acc, curr) => {
      // Considerar apenas status PAGO para o saldo real, ou todos para projeção?
      // Neste MVP simples, vamos somar tudo para simplificar, ou filtrar por 'PAGO' se desejar fluxo de caixa realizado.
      // Vamos assumir fluxo de caixa realizado (apenas PAGO).
      if (curr.status !== 'PAGO') return acc;

      if (curr.type === 'ENTRADA') {
        acc.inflow += curr.amount;
        acc.balance += curr.amount;
      } else {
        acc.outflow += curr.amount;
        acc.balance -= curr.amount;
      }
      return acc;
    }, { inflow: 0, outflow: 0, balance: 0 });

    return summary;
  }
};