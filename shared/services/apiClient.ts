const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3333';
const TOKEN_KEY = 'simpleerp_token';

interface FetchOptions extends RequestInit {
  token?: string;
}

export const apiClient = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  request: async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    const token = apiClient.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (response.status === 401) {
      // Token expirado ou inválido
      apiClient.removeToken();
      // Opcional: Redirecionar para login ou emitir evento
      // window.location.href = '/#/login'; 
      throw new Error('Sessão expirada');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro API: ${response.statusText}`);
    }

    // Para respostas 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  },

  get: <T>(endpoint: string) => apiClient.request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: any) => 
    apiClient.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body: any) => 
    apiClient.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) => apiClient.request<T>(endpoint, { method: 'DELETE' }),
};