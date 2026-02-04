import React, { useEffect, useState } from 'react';
import { ShoppingCart, TrendingUp, Package, Tag } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import { SalesReportData, DateRange } from '../types/Reports';
import { ReportFilter } from '../components/ReportFilter';
import { KPICard } from '../components/KPICard';
import { Table } from '../../../shared/components/Table';

export const SalesReport: React.FC = () => {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Default: current month
  const now = new Date();
  const [range, setRange] = useState<DateRange>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await reportsService.getSalesReport(range);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [range]);

  const handleClear = () => {
    const now = new Date();
    setRange({
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    });
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading || !data) return <div className="p-8 text-center">Carregando relatório...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatório de Vendas</h1>
      
      <ReportFilter range={range} onFilter={setRange} onClear={handleClear} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Vendas Totais" value={data.summary.totalSales} icon={<ShoppingCart />} color="blue" />
        <KPICard title="Faturamento Bruto" value={formatMoney(data.summary.totalRevenue)} icon={<TrendingUp />} color="green" />
        <KPICard title="Ticket Médio" value={formatMoney(data.summary.averageTicket)} icon={<Tag />} color="purple" />
        <KPICard title="Itens Vendidos" value={data.summary.totalItemsSold} icon={<Package />} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Top 10 Produtos</h3>
          <Table<{ name: string; sku?: string; quantity: number; revenue: number; id: string | number }>
            data={data.topProducts.map((p, i) => ({ ...p, id: p.sku || `prod-${i}` }))}
            columns={[
              { header: 'Produto', accessor: 'name' },
              { header: 'Qtd', accessor: 'quantity' },
              { header: 'Receita', accessor: (p) => formatMoney(p.revenue) },
            ]}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Vendas por Dia</h3>
          <div className="max-h-80 overflow-y-auto">
             <Table<{ date: string; count: number; revenue: number; id: string | number }>
                data={data.salesByDay.map(d => ({ ...d, id: d.date }))}
                columns={[
                { header: 'Data', accessor: 'date' },
                { header: 'Vendas', accessor: 'count' },
                { header: 'Faturamento', accessor: (d) => formatMoney(d.revenue) },
                ]}
            />
          </div>
        </div>
      </div>
      
      {/* Sales By Customer */}
      <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Vendas por Cliente</h3>
          <Table<{ name: string; count: number; revenue: number; id: string | number }>
            data={data.salesByCustomer.slice(0, 10).map((c, i) => ({ ...c, id: `cust-${i}` }))}
            columns={[
              { header: 'Cliente', accessor: 'name' },
              { header: 'Qtd Vendas', accessor: 'count' },
              { header: 'Total Comprado', accessor: (c) => formatMoney(c.revenue) },
            ]}
          />
      </div>
    </div>
  );
};