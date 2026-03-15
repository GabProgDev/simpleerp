import { Product, ProductFormData } from '../types/Product';
import { apiClient } from '../../../shared/services/apiClient';

const USE_API = import.meta.env.VITE_USE_API === 'true';
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

const mapApiProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  sku: p.sku,
  category: p.category?.name || p.categoryId || '',
  unit: p.unit || 'UN',
  costPrice: Number(p.costPrice),
  salePrice: Number(p.price),
  quantity: p.stock,
  minStock: p.minStock,
  supplier: p.supplier?.name || p.supplierId || '',
  notes: p.description || '',
  active: p.isActive,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

export const productService = {
  getAll: async (): Promise<Product[]> => {
    if (USE_API) {
      const products = await apiClient.get<any[]>('/products');
      return products.map(mapApiProduct).sort((a, b) => a.name.localeCompare(b.name));
    }
    await sleep(DELAY_MS);
    return getStoredProducts().sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: async (id: string): Promise<Product | undefined> => {
    if (USE_API) {
      const product = await apiClient.get<any>(`/products/${id}`);
      return mapApiProduct(product);
    }
    await sleep(DELAY_MS);
    return getStoredProducts().find((p) => p.id === id);
  },

  create: async (data: ProductFormData): Promise<Product> => {
    if (USE_API) {
      const payload = {
        name: data.name,
        sku: data.sku,
        description: data.notes,
        price: data.salePrice,
        costPrice: data.costPrice,
        stock: data.quantity,
        minStock: data.minStock,
        unit: data.unit || 'UN',
        isActive: data.active,
      };
      const product = await apiClient.post<any>('/products', payload);
      return mapApiProduct(product);
    }
    await sleep(DELAY_MS);
    const products = getStoredProducts();
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
    if (USE_API) {
      const payload = {
        name: data.name,
        sku: data.sku,
        description: data.notes,
        price: data.salePrice,
        costPrice: data.costPrice,
        stock: data.quantity,
        minStock: data.minStock,
        unit: data.unit || 'UN',
        isActive: data.active,
      };
      const product = await apiClient.put<any>(`/products/${id}`, payload);
      return mapApiProduct(product);
    }
    await sleep(DELAY_MS);
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
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
    if (USE_API) {
      await apiClient.delete(`/products/${id}`);
      return;
    }
    await sleep(DELAY_MS);
    const products = getStoredProducts();
    setStoredProducts(products.filter((p) => p.id !== id));
  },
};