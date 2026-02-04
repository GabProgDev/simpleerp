export type MenuAction = 'SERVICES' | 'HOURS' | 'ATTENDANT' | 'TEXT';

export interface MenuOption {
  label: string;
  triggers: string[]; // ex: ["1", "serviços"]
  action: MenuAction;
  customText?: string; // Se action for TEXT
}

export interface ChatbotConfig {
  id: string;
  enabled: boolean;
  adminNumber: string;
  
  triggerKeywords: string[]; // No front tratamos como array, no back vira JSON string
  backToMenuKeyword: string;
  
  greetingTemplate: string;
  menuText: string;
  invalidOptionText: string;
  
  servicesText: string;
  hoursText: string;
  
  attendantIntroText: string;
  attendantReceivedText: string;
  
  menuOptions: MenuOption[]; // No front array
  
  updatedAt: string;
}

// Interface auxiliar para o formulário (pode ser a mesma, já que lidamos com o parse no service)
export type ChatbotConfigFormData = Omit<ChatbotConfig, 'id' | 'updatedAt'>;
