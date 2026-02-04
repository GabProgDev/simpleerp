import { apiClient } from '../../../shared/services/apiClient';
import { ChatbotConfig, ChatbotConfigFormData } from '../types/ChatbotConfig';

const STORAGE_KEY = 'simple_erp_chatbot_config';
const DELAY_MS = 300;
const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredConfig = (): ChatbotConfig => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  
  // Default Local Config
  return {
    id: 'local-config',
    enabled: false,
    adminNumber: '',
    triggerKeywords: ['oi', 'ola', 'menu'],
    backToMenuKeyword: 'menu',
    greetingTemplate: 'Olá {nome}! Bem-vindo.',
    menuText: 'Escolha uma opção:',
    invalidOptionText: 'Opção inválida.',
    servicesText: 'Nossos serviços...',
    hoursText: 'Seg-Sex 08h-18h',
    attendantIntroText: 'Aguarde um momento.',
    attendantReceivedText: 'Recebido.',
    menuOptions: [],
    updatedAt: new Date().toISOString()
  };
};

const setStoredConfig = (config: ChatbotConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const chatbotService = {
  getConfig: async (): Promise<ChatbotConfig> => {
    if (USE_API) {
      const data: any = await apiClient.get('/chatbot/config');
      
      // Parsear JSON strings que vêm do banco
      return {
        ...data,
        triggerKeywords: typeof data.triggerKeywords === 'string' ? JSON.parse(data.triggerKeywords) : data.triggerKeywords,
        menuOptions: typeof data.menuOptions === 'string' ? JSON.parse(data.menuOptions) : data.menuOptions,
      };
    }
    
    await sleep(DELAY_MS);
    return getStoredConfig();
  },

  updateConfig: async (config: ChatbotConfigFormData): Promise<ChatbotConfig> => {
    if (USE_API) {
      // O backend espera objetos/arrays e faz o stringify internamente se configurado no controller
      const response: any = await apiClient.request('/chatbot/config', {
        method: 'PUT',
        body: JSON.stringify(config)
      });
      
      return {
        ...response,
        triggerKeywords: typeof response.triggerKeywords === 'string' ? JSON.parse(response.triggerKeywords) : response.triggerKeywords,
        menuOptions: typeof response.menuOptions === 'string' ? JSON.parse(response.menuOptions) : response.menuOptions,
      };
    }

    await sleep(DELAY_MS);
    const current = getStoredConfig();
    const updated: ChatbotConfig = {
        ...current,
        ...config,
        updatedAt: new Date().toISOString()
    };
    setStoredConfig(updated);
    return updated;
  }
};