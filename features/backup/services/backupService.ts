import { BackupFile, BackupData } from '../types/Backup';

// Mapeamento das chaves exatas usadas nos outros serviços
const KEYS = {
  customers: 'simple_erp_customers',
  inventory: 'simple_erp_inventory',
  sales: 'simple_erp_sales',
  finance: 'simple_erp_finance_transactions',
  quotes: 'simple_erp_quotes',
  employees: 'simpleerp_employees',
  session: 'simpleerp_session'
};

const APP_VERSION = '1.0.0';

export const backupService = {
  // Gera o objeto de backup lendo do LocalStorage
  createBackup: (): BackupFile => {
    const data: BackupData = {
      customers: JSON.parse(localStorage.getItem(KEYS.customers) || '[]'),
      inventory: JSON.parse(localStorage.getItem(KEYS.inventory) || '[]'),
      sales: JSON.parse(localStorage.getItem(KEYS.sales) || '[]'),
      finance: JSON.parse(localStorage.getItem(KEYS.finance) || '[]'),
      quotes: JSON.parse(localStorage.getItem(KEYS.quotes) || '[]'),
      employees: JSON.parse(localStorage.getItem(KEYS.employees) || '[]'),
    };

    return {
      appName: 'SimpleERP',
      version: APP_VERSION,
      createdAt: new Date().toISOString(),
      data
    };
  },

  // Dispara o download do arquivo no navegador
  downloadBackup: (backup: BackupFile) => {
    const fileName = `simpleerp-backup-${new Date().toISOString().split('T')[0]}.json`;
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Restaura os dados
  restoreBackup: async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const backup: BackupFile = JSON.parse(content);

          // Validação básica
          if (backup.appName !== 'SimpleERP' || !backup.data) {
            throw new Error('Arquivo de backup inválido ou incompatível.');
          }

          // Limpar dados atuais e sobrescrever
          localStorage.setItem(KEYS.customers, JSON.stringify(backup.data.customers));
          localStorage.setItem(KEYS.inventory, JSON.stringify(backup.data.inventory));
          localStorage.setItem(KEYS.sales, JSON.stringify(backup.data.sales));
          localStorage.setItem(KEYS.finance, JSON.stringify(backup.data.finance));
          localStorage.setItem(KEYS.quotes, JSON.stringify(backup.data.quotes));
          localStorage.setItem(KEYS.employees, JSON.stringify(backup.data.employees));

          // Limpar sessão para forçar re-login (segurança e consistência)
          localStorage.removeItem(KEYS.session);

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
      reader.readAsText(file);
    });
  }
};