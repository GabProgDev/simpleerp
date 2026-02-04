export interface BackupData {
  customers: any[];
  inventory: any[]; // Products
  sales: any[];
  finance: any[];
  quotes: any[];
  employees: any[];
}

export interface BackupFile {
  appName: 'SimpleERP';
  version: string;
  createdAt: string;
  data: BackupData;
}