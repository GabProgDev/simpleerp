import { PrintSettings } from '../types/PrintSettings';

const STORAGE_KEY = 'simpleerp_print_settings';

const defaultSettings: PrintSettings = {
  companyName: 'Minha Empresa Ltda',
  headerText: 'CNPJ: 00.000.000/0000-00\nTel: (00) 0000-0000',
  footerText: 'Obrigado pela preferência!',
  showLogo: false,
  showCompanyInfo: true,
  showCustomerAddress: true,
  showSignatureLine: true,
};

export const printService = {
  getSettings: (): PrintSettings => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(stored) };
  },

  saveSettings: (settings: PrintSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },
};