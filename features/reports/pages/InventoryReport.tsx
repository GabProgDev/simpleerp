import React, { useEffect, useState } from 'react';
import { Box, AlertTriangle, XCircle, DollarSign } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import { InventoryReportData, DateRange } from '../types/Reports';
import { ReportFilter } from '../components/ReportFilter';
import { KPICard } from '../components/KPICard';
import { Table } from '../../../shared/components/Table';

export const InventoryReport: React.FC = () => {
  const [data, setData] = useState<InventoryReportData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Date range is used for "Best Sellers" calculation
  const now = new Date();
  const [range, setRange] = useState<DateRange>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await reportsService.getInventoryReport(range);
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
      <h1 className="text-2xl font-bold text-gray-900">Relatório de Estoque</h1>
      <p className="text-sm text-gray-500">Dados de estoque são em tempo real. Filtro de data afeta apenas "Mais Vendidos".</p>
      
      <ReportFilter range={range} onFilter={setRange} onClear={handleClear} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard title="Produtos Ativos" value={data.summary.activeProducts} icon={<Box />} color="blue" />
        <KPICard title="Estoque Baixo" value={data.summary.lowStockProducts} icon={<AlertTriangle />} color="red" />
        <KPICard title="Valor em Estoque (Custo)" value={formatMoney(data.summary.totalStockValue)} icon={<DollarSign />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} /> Estoque Baixo / Crítico
          </h3>
          <Table<{ name: string; sku: string; quantity: number; minStock: number; unit?: string; id: string | number }>
            data={data.lowStockList.map(p => ({ ...p, id: p.sku }))}
            columns={[
              { header: 'Produto', accessor: 'name' },
              { header: 'SKU', accessor: 'sku' },
              { header: 'Atual', accessor: (p) => <span className="font-bold text-red-600">{p.quantity} {p.unit}</span> },
              { header: 'Mínimo', accessor: 'minStock' },
            ]}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
             <Box size={20} /> Mais Vendidos (no período)
          </h3>
          <Table<{ name: string; quantity: number; revenue: number; id: string | number }>
            data={data.bestSellers.slice(0, 10).map((p, i) => ({ ...p, id: `bs-${i}` }))}
            columns={[
              { header: 'Produto', accessor: 'name' },
              { header: 'Qtd Vendida', accessor: 'quantity' },
              { header: 'Receita', accessor: (p) => formatMoney(p.revenue) },
            ]}
          />
        </div>
      </div>
      
      {data.zeroStockList.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-gray-500">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <XCircle size={20} /> Estoque Zerado
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {data.zeroStockList.map(p => (
                    <div key={p.sku} className="p-2 bg-gray-50 rounded text-sm">
                        <span className="font-bold">{p.sku}</span> - {p.name}
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};