export interface Product {
  id: string;
  name: string;
  sku: string; // Código único
  category?: string;
  unit?: string; // un, kg, etc.
  costPrice: number;
  salePrice: number;
  quantity: number;
  minStock: number;
  supplier?: string;
  notes?: string;
  active: boolean;
  imageDataUrl?: string; // Nova propriedade para imagem em Base64
  createdAt: string;
  updatedAt: string;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;