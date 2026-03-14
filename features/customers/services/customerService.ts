import { Customer, CustomerFormData } from '../types/Customer';
import { apiClient } from '../../../shared/services/apiClient';

const STORAGE_KEY = 'simple_erp_customers';
const DELAY_MS = 300;
const USE_API = import.meta.env.VITE_USE_API === 'true';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredCustomers = (): Customer[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredCustomers = (customers: Customer[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
};

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    if (USE_API) {
      return apiClient.get<Customer[]>('/customers');
    }
    await sleep(DELAY_MS);
    return getStoredCustomers().sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getById: async (id: string): Promise<Customer | undefined> => {
    if (USE_API) {
      try {
        return await apiClient.get<Customer>(`/customers/${id}`);
      } catch (e) {
        return undefined;
      }
    }
    await sleep(DELAY_MS);
    const customers = getStoredCustomers();
    return customers.find((c) => c.id === id);
  },

  create: async (data: CustomerFormData): Promise<Customer> => {
    if (USE_API) {
      return apiClient.post<Customer>('/customers', data);
    }
    await sleep(DELAY_MS);
    const customers = getStoredCustomers();
    
    const newCustomer: Customer = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    setStoredCustomers(customers);
    return newCustomer;
  },

  update: async (id: string, data: CustomerFormData): Promise<Customer> => {
    if (USE_API) {
      return apiClient.put<Customer>(`/customers/${id}`, data);
    }
    await sleep(DELAY_MS);
    const customers = getStoredCustomers();
    const index = customers.findIndex((c) => c.id === id);

    if (index === -1) throw new Error('Cliente não encontrado');

    const updatedCustomer: Customer = {
      ...customers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    customers[index] = updatedCustomer;
    setStoredCustomers(customers);
    return updatedCustomer;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_API) {
      return apiClient.delete<void>(`/customers/${id}`);
    }
    await sleep(DELAY_MS);
    const customers = getStoredCustomers();
    const filtered = customers.filter((c) => c.id !== id);
    setStoredCustomers(filtered);
  },
};