import { Quote, QuoteFormData } from '../types/Quote';

const STORAGE_KEY = 'simple_erp_quotes';
const DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredQuotes = (): Quote[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredQuotes = (quotes: Quote[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
};

export const quoteService = {
  getAll: async (): Promise<Quote[]> => {
    await sleep(DELAY_MS);
    return getStoredQuotes().sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getById: async (id: string): Promise<Quote | undefined> => {
    await sleep(DELAY_MS);
    const quotes = getStoredQuotes();
    return quotes.find((q) => q.id === id);
  },

  create: async (data: QuoteFormData): Promise<Quote> => {
    await sleep(DELAY_MS);
    const quotes = getStoredQuotes();
    
    const newQuote: Quote = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    quotes.push(newQuote);
    setStoredQuotes(quotes);
    return newQuote;
  },

  update: async (id: string, data: Partial<Quote>): Promise<Quote> => {
    await sleep(DELAY_MS);
    const quotes = getStoredQuotes();
    const index = quotes.findIndex((q) => q.id === id);

    if (index === -1) throw new Error('Orçamento não encontrado');

    const updatedQuote: Quote = {
      ...quotes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    quotes[index] = updatedQuote;
    setStoredQuotes(quotes);
    return updatedQuote;
  },

  delete: async (id: string): Promise<void> => {
    await sleep(DELAY_MS);
    const quotes = getStoredQuotes();
    const filtered = quotes.filter((q) => q.id !== id);
    setStoredQuotes(filtered);
  },
};