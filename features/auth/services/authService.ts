import { employeeService } from '../../employees/services/employeeService';
import { UserSession } from '../types/Auth';
import { EmployeeRole } from '../../employees/types/Employee';
import { apiClient } from '../../../shared/services/apiClient';

const SESSION_KEY = 'simpleerp_session';
const USE_API = import.meta.env.VITE_USE_API === 'true';

export const authService = {
  login: async (username: string, password: string): Promise<UserSession> => {
    
    if (USE_API) {
      try {
        const response = await apiClient.post<{ user: UserSession, token: string }>('/auth/login', { username, password });
        
        apiClient.setToken(response.token);
        
        // Mantemos a sessão no localStorage também para compatibilidade com o resto do front
        const session: UserSession = response.user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        
        return session;
      } catch (error: any) {
        throw new Error(error.message || 'Falha no login via API');
      }
    } else {
      // --- LÓGICA LEGADO (LocalStorage) ---
      // Garante que o usuário admin padrão exista se for o primeiro acesso
      await employeeService.getAll(); 

      const user = await employeeService.getByUsername(username);

      if (!user) {
        throw new Error('Usuário ou senha inválidos.');
      }

      if (!user.isActive) {
        throw new Error('Usuário inativo. Contate o administrador.');
      }

      if (user.password !== password) {
        throw new Error('Usuário ou senha inválidos.');
      }

      const session: UserSession = {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    if (USE_API) {
      apiClient.removeToken();
    }
    window.location.reload(); 
  },

  getSession: (): UserSession | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  hasPermission: (userRole: EmployeeRole, allowedRoles: EmployeeRole[]): boolean => {
    if (userRole === 'ADMIN') return true;
    return allowedRoles.includes(userRole);
  }
};