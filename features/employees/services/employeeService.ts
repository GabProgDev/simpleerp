import { Employee, EmployeeFormData } from '../types/Employee';

const STORAGE_KEY = 'simpleerp_employees';
const DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredEmployees = (): Employee[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  let employees: Employee[] = stored ? JSON.parse(stored) : [];

  // BOOTSTRAP: Se não houver nenhum funcionário, cria o ADMIN padrão
  if (employees.length === 0) {
    const admin: Employee = {
      id: crypto.randomUUID(),
      name: 'Administrador',
      username: 'admin',
      email: 'admin@local',
      role: 'ADMIN',
      password: 'admin123', // Texto simples conforme solicitado
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    employees.push(admin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }
  return employees;
};

const setStoredEmployees = (employees: Employee[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
};

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    await sleep(DELAY_MS);
    return getStoredEmployees().sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: async (id: string): Promise<Employee | undefined> => {
    await sleep(DELAY_MS);
    const employees = getStoredEmployees();
    return employees.find((e) => e.id === id);
  },

  getByUsername: async (username: string): Promise<Employee | undefined> => {
    await sleep(DELAY_MS); // Pequeno delay para simular async na validação
    const employees = getStoredEmployees();
    return employees.find(e => e.username === username);
  },

  create: async (data: EmployeeFormData): Promise<Employee> => {
    await sleep(DELAY_MS);
    const employees = getStoredEmployees();

    // Validações de unicidade
    if (employees.some(e => e.username === data.username)) {
      throw new Error('Nome de usuário já existe.');
    }
    if (employees.some(e => e.email === data.email)) {
      throw new Error('E-mail já cadastrado.');
    }

    const newEmployee: Employee = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    employees.push(newEmployee);
    setStoredEmployees(employees);
    return newEmployee;
  },

  update: async (id: string, data: EmployeeFormData): Promise<Employee> => {
    await sleep(DELAY_MS);
    const employees = getStoredEmployees();
    const index = employees.findIndex((e) => e.id === id);

    if (index === -1) throw new Error('Funcionário não encontrado');

    // Validações de unicidade (ignorando o próprio ID)
    if (employees.some(e => e.username === data.username && e.id !== id)) {
      throw new Error('Nome de usuário já existe.');
    }
    if (employees.some(e => e.email === data.email && e.id !== id)) {
      throw new Error('E-mail já cadastrado.');
    }

    // Se estiver tentando inativar um ADMIN, verificar se é o último
    if (employees[index].role === 'ADMIN' && !data.isActive) {
       const activeAdmins = employees.filter(e => e.role === 'ADMIN' && e.isActive && e.id !== id);
       if (activeAdmins.length === 0) {
         throw new Error('Não é possível desativar o último administrador ativo.');
       }
    }

    const updatedEmployee: Employee = {
      ...employees[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    employees[index] = updatedEmployee;
    setStoredEmployees(employees);
    return updatedEmployee;
  },

  delete: async (id: string): Promise<void> => {
    await sleep(DELAY_MS);
    const employees = getStoredEmployees();
    const toDelete = employees.find(e => e.id === id);

    if (!toDelete) return;

    // Regra de segurança: não apagar o último ADMIN
    if (toDelete.role === 'ADMIN') {
        const otherAdmins = employees.filter(e => e.role === 'ADMIN' && e.id !== id);
        if (otherAdmins.length === 0) {
            throw new Error('Não é possível excluir o único administrador do sistema.');
        }
    }

    const filtered = employees.filter((e) => e.id !== id);
    setStoredEmployees(filtered);
  },
};