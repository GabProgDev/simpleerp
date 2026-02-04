import { Product, ProductFormData } from '../types/Product';

const STORAGE_KEY = 'simple_erp_inventory';
const DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const productService = {
  getAll: async (): Promise<Product[]> => {
    await sleep(DELAY_MS);
    return getStoredProducts().sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: async (id: string): Promise<Product | undefined> => {
    await sleep(DELAY_MS);
    const products = getStoredProducts();
    return products.find((p) => p.id === id);
  },

  create: async (data: ProductFormData): Promise<Product> => {
    await sleep(DELAY_MS);
    const products = getStoredProducts();

    // Regra de Negócio: SKU Único
    if (products.some((p) => p.sku === data.sku)) {
      throw new Error(`O SKU "${data.sku}" já está em uso por outro produto.`);
    }
    
    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);
    setStoredProducts(products);
    return newProduct;
  },

  update: async (id: string, data: ProductFormData): Promise<Product> => {
    await sleep(DELAY_MS);
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) throw new Error('Produto não encontrado');

    // Regra de Negócio: SKU Único (excluindo o próprio produto da verificação)
    if (products.some((p) => p.sku === data.sku && p.id !== id)) {
      throw new Error(`O SKU "${data.sku}" já está em uso por outro produto.`);
    }

    const updatedProduct: Product = {
      ...products[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    setStoredProducts(products);
    return updatedProduct;
  },

  delete: async (id: string): Promise<void> => {
    await sleep(DELAY_MS);
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    setStoredProducts(filtered);
  },
};