export interface DateRange {
  from: Date;
  to: Date;
}

export interface SalesReportData {
  summary: {
    totalSales: number; // Quantidade de vendas
    totalRevenue: number; // Faturamento bruto
    averageTicket: number; // Ticket médio
    totalItemsSold: number; // Itens vendidos
  };
  salesByDay: { date: string; count: number; revenue: number }[];
  topProducts: { name: string; sku?: string; quantity: number; revenue: number }[];
  salesByCustomer: { name: string; count: number; revenue: number }[];
}

export interface FinanceReportData {
  summary: {
    inflow: number;
    outflow: number;
    balance: number;
    pending: number;
  };
  byPaymentMethod: { method: string; total: number }[];
  byCategory: { category: string; total: number }[];
  recentTransactions: any[]; // Reutiliza tipo Transaction
}

export interface InventoryReportData {
  summary: {
    activeProducts: number;
    lowStockProducts: number;
    totalStockValue: number;
  };
  lowStockList: { name: string; sku: string; quantity: number; minStock: number; unit?: string }[];
  zeroStockList: { name: string; sku: string }[];
  bestSellers: { name: string; quantity: number; revenue: number }[]; // Baseado em vendas do período
}

export interface QuotesReportData {
  summary: {
    totalQuotes: number;
    totalValue: number;
    convertedValue: number;
    conversionRate: number;
  };
  byStatus: { status: string; count: number; value: number }[];
  recentQuotes: any[]; // Reutiliza tipo Quote
}