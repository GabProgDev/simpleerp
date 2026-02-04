import { salesService } from '../../sales/services/salesService';
import { financeService } from '../../finance/services/financeService';
import { productService } from '../../inventory/services/productService';
import { quoteService } from '../../quotes/services/quoteService';
import { 
  DateRange, 
  SalesReportData, 
  FinanceReportData, 
  InventoryReportData, 
  QuotesReportData 
} from '../types/Reports';

const isInRange = (dateStr: string, { from, to }: DateRange) => {
  const d = new Date(dateStr);
  // Ajustar para comparar datas ignorando horas se necessário, 
  // mas aqui assumimos que from/to já vêm com horas ajustadas (00:00 e 23:59)
  return d >= from && d <= to;
};

export const reportsService = {
  getSalesReport: async (range: DateRange): Promise<SalesReportData> => {
    const allSales = await salesService.getAll();
    const filteredSales = allSales.filter(s => isInRange(s.createdAt, range) && s.status === 'COMPLETED');

    const summary = {
      totalSales: filteredSales.length,
      totalRevenue: filteredSales.reduce((acc, s) => acc + s.total, 0),
      totalItemsSold: filteredSales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0),
      averageTicket: 0
    };
    summary.averageTicket = summary.totalSales > 0 ? summary.totalRevenue / summary.totalSales : 0;

    // Sales by Day
    const salesByDayMap = new Map<string, { count: number; revenue: number }>();
    filteredSales.forEach(s => {
      const dateKey = new Date(s.createdAt).toLocaleDateString();
      const current = salesByDayMap.get(dateKey) || { count: 0, revenue: 0 };
      salesByDayMap.set(dateKey, {
        count: current.count + 1,
        revenue: current.revenue + s.total
      });
    });
    const salesByDay = Array.from(salesByDayMap.entries()).map(([date, data]) => ({ date, ...data }));

    // Top Products
    const productsMap = new Map<string, { name: string; sku?: string; quantity: number; revenue: number }>();
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        const key = item.productId || item.productName; // Fallback para item manual
        const current = productsMap.get(key) || { name: item.productName, sku: item.productSku, quantity: 0, revenue: 0 };
        productsMap.set(key, {
          ...current,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.subtotal
        });
      });
    });
    const topProducts = Array.from(productsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Sales by Customer
    const customerMap = new Map<string, { count: number; revenue: number }>();
    filteredSales.forEach(s => {
      const key = s.customerName || 'Consumidor Final';
      const current = customerMap.get(key) || { count: 0, revenue: 0 };
      customerMap.set(key, {
        count: current.count + 1,
        revenue: current.revenue + s.total
      });
    });
    const salesByCustomer = Array.from(customerMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    return { summary, salesByDay, topProducts, salesByCustomer };
  },

  getFinanceReport: async (range: DateRange): Promise<FinanceReportData> => {
    const allTransactions = await financeService.getAll();
    const filtered = allTransactions.filter(t => isInRange(t.date, range));

    const summary = {
      inflow: filtered.filter(t => t.type === 'ENTRADA' && t.status === 'PAGO').reduce((acc, t) => acc + t.amount, 0),
      outflow: filtered.filter(t => t.type === 'SAIDA' && t.status === 'PAGO').reduce((acc, t) => acc + t.amount, 0),
      pending: filtered.filter(t => t.status === 'PENDENTE').reduce((acc, t) => acc + t.amount, 0),
      balance: 0
    };
    summary.balance = summary.inflow - summary.outflow;

    // By Payment Method (Considera apenas pagos para fluxo de caixa real)
    const methodMap = new Map<string, number>();
    filtered.filter(t => t.status === 'PAGO').forEach(t => {
      const current = methodMap.get(t.paymentMethod) || 0;
      methodMap.set(t.paymentMethod, current + t.amount);
    });
    const byPaymentMethod = Array.from(methodMap.entries()).map(([method, total]) => ({ method, total }));

    // By Category
    const categoryMap = new Map<string, number>();
    filtered.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      // Para categorias, somamos o valor absoluto, independente se é entrada ou saída, para ver volume
      categoryMap.set(t.category, current + t.amount);
    });
    const byCategory = Array.from(categoryMap.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    return { summary, byPaymentMethod, byCategory, recentTransactions: filtered.slice(0, 20) };
  },

  getInventoryReport: async (range: DateRange): Promise<InventoryReportData> => {
    // Estoque é snapshot (estado atual), mas "Best Sellers" depende do período de vendas
    const products = await productService.getAll();
    const activeProducts = products.filter(p => p.active);
    
    // Calcular Best Sellers baseados nas vendas do período
    const salesData = await reportsService.getSalesReport(range); // Reusa lógica
    const bestSellers = salesData.topProducts.map(p => ({
        name: p.name,
        quantity: p.quantity,
        revenue: p.revenue
    }));

    const summary = {
      activeProducts: activeProducts.length,
      lowStockProducts: activeProducts.filter(p => p.quantity <= p.minStock).length,
      totalStockValue: activeProducts.reduce((acc, p) => acc + (p.quantity * (p.costPrice > 0 ? p.costPrice : p.salePrice)), 0)
    };

    const lowStockList = activeProducts
      .filter(p => p.quantity <= p.minStock && p.quantity > 0)
      .map(p => ({ name: p.name, sku: p.sku, quantity: p.quantity, minStock: p.minStock, unit: p.unit }));

    const zeroStockList = activeProducts
      .filter(p => p.quantity === 0)
      .map(p => ({ name: p.name, sku: p.sku }));

    return { summary, lowStockList, zeroStockList, bestSellers };
  },

  getQuotesReport: async (range: DateRange): Promise<QuotesReportData> => {
    const allQuotes = await quoteService.getAll();
    const filtered = allQuotes.filter(q => isInRange(q.createdAt, range));

    const summary = {
      totalQuotes: filtered.length,
      totalValue: filtered.reduce((acc, q) => acc + q.total, 0),
      convertedValue: filtered.filter(q => q.status === 'CONVERTIDO').reduce((acc, q) => acc + q.total, 0),
      conversionRate: 0
    };
    
    const convertedCount = filtered.filter(q => q.status === 'CONVERTIDO').length;
    summary.conversionRate = summary.totalQuotes > 0 ? (convertedCount / summary.totalQuotes) * 100 : 0;

    const statusMap = new Map<string, { count: number; value: number }>();
    filtered.forEach(q => {
      const current = statusMap.get(q.status) || { count: 0, value: 0 };
      statusMap.set(q.status, {
        count: current.count + 1,
        value: current.value + q.total
      });
    });
    const byStatus = Array.from(statusMap.entries()).map(([status, data]) => ({ status, ...data }));

    return { summary, byStatus, recentQuotes: filtered.slice(0, 20) };
  }
};