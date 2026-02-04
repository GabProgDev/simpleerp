import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import { FinanceReportData, DateRange } from '../types/Reports';
import { ReportFilter } from '../components/ReportFilter';
import { KPICard } from '../components/KPICard';
import { Table } from '../../../shared/components/Table';
import { Transaction } from '../../finance/types/Transaction';

export const FinanceReport: React.FC = () => {
  const [data, setData] = useState<FinanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const [range, setRange] = useState<DateRange>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await reportsService.getFinanceReport(range);
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
      <h1 className="text-2xl font-bold text-gray-900">Relatório Financeiro</h1>
      
      <ReportFilter range={range} onFilter={setRange} onClear={handleClear} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Entradas" value={formatMoney(data.summary.inflow)} icon={<TrendingUp />} color="green" />
        <KPICard title="Total Saídas" value={formatMoney(data.summary.outflow)} icon={<TrendingDown />} color="red" />
        <KPICard title="Saldo do Período" value={formatMoney(data.summary.balance)} icon={<DollarSign />} color={data.summary.balance >= 0 ? 'blue' : 'red'} />
        <KPICard title="Pendente" value={formatMoney(data.summary.pending)} icon={<Clock />} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Por Forma de Pagamento (Pagos)</h3>
          <Table<{ method: string; total: number; id: string | number }>
            data={data.byPaymentMethod.map(item => ({ ...item, id: item.method }))}
            columns={[
              { header: 'Método', accessor: 'method' },
              { header: 'Total', accessor: (item) => formatMoney(item.total) },
            ]}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Por Categoria (Volume)</h3>
          <Table<{ category: string; total: number; id: string | number }>
            data={data.byCategory.map(item => ({ ...item, id: item.category }))}
            columns={[
              { header: 'Categoria', accessor: 'category' },
              { header: 'Total Movimentado', accessor: (item) => formatMoney(item.total) },
            ]}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Lançamentos no Período</h3>
          <Table<Transaction>
            data={data.recentTransactions}
            columns={[
              { header: 'Data', accessor: (t) => new Date(t.date).toLocaleDateString() },
              { header: 'Tipo', accessor: 'type' },
              { header: 'Descrição', accessor: 'description' },
              { header: 'Valor', accessor: (t) => <span className={t.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}>{formatMoney(t.amount)}</span> },
              { header: 'Status', accessor: 'status' },
            ]}
          />
      </div>
    </div>
  );
};