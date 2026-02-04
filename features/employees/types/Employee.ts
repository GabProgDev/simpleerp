export type EmployeeRole = 'ADMIN' | 'VENDEDOR' | 'FINANCEIRO' | 'ESTOQUE';

export interface Employee {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  password?: string; // Opcional na interface de listagem para segurança visual, mas presente no storage
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;