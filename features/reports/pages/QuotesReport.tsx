import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, PieChart, DollarSign } from 'lucide-react';
import { reportsService } from '../services/reportsService';
import { QuotesReportData, DateRange } from '../types/Reports';
import { ReportFilter } from '../components/ReportFilter';
import { KPICard } from '../components/KPICard';
import { Table } from '../../../shared/components/Table';
import { Quote } from '../../quotes/types/Quote';

export const QuotesReport: React.FC = () => {
  const [data, setData] = useState<QuotesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const [range, setRange] = useState<DateRange>({
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await reportsService.getQuotesReport(range);
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
      <h1 className="text-2xl font-bold text-gray-900">Relatório de Orçamentos</h1>
      
      <ReportFilter range={range} onFilter={setRange} onClear={handleClear} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Orçamentos" value={data.summary.totalQuotes} icon={<FileText />} color="blue" />
        <KPICard title="Taxa de Conversão" value={`${data.summary.conversionRate.toFixed(1)}%`} icon={<PieChart />} color="purple" />
        <KPICard title="Valor Total" value={formatMoney(data.summary.totalValue)} icon={<DollarSign />} color="gray" />
        <KPICard title="Valor Convertido" value={formatMoney(data.summary.convertedValue)} icon={<CheckCircle />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Por Status</h3>
          <Table<{ status: string; count: number; value: number; id: string | number }>
            data={data.byStatus.map(item => ({ ...item, id: item.status }))}
            columns={[
              { header: 'Status', accessor: 'status' },
              { header: 'Quantidade', accessor: 'count' },
              { header: 'Valor Total', accessor: (item) => formatMoney(item.value) },
            ]}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Orçamentos Recentes</h3>
          <Table<Quote>
            data={data.recentQuotes}
            columns={[
              { header: 'Data', accessor: (q) => new Date(q.createdAt).toLocaleDateString() },
              { header: 'Cliente', accessor: (q) => q.customerName || 'Consumidor Final' },
              { header: 'Status', accessor: 'status' },
              { header: 'Total', accessor: (q) => formatMoney(q.total) },
            ]}
          />
        </div>
      </div>
    </div>
  );
};