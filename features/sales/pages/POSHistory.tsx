import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, TrendingUp, DollarSign, Package } from 'lucide-react';
import { salesService } from '../services/salesService';
import { Sale } from '../types/Sale';
import { Button } from '../../../shared/components/Button';
import { Table } from '../../../shared/components/Table';

export const POSHistory: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    count: 0,
    total: 0,
    recent: [] as Sale[]
  });

  const updateDailyStats = async () => {
    setLoading(true);
    try {
        const allSales = await salesService.getAll();
        const today = new Date().toDateString();
        const todaysSales = allSales.filter(s => new Date(s.createdAt).toDateString() === today && s.status === 'COMPLETED');
        
        setTodayStats({
            count: todaysSales.length,
            total: todaysSales.reduce((acc, s) => acc + s.total, 0),
            recent: todaysSales // Mostra todas as de hoje
        });
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    updateDailyStats();
  }, []);

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/sales/new')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Resumo do PDV</h1>
           <p className="text-sm text-gray-500">Movimentação de hoje ({new Date().toLocaleDateString()})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex items-center justify-between">
           <div>
               <p className="text-sm font-medium text-blue-800">Faturamento Hoje</p>
               <p className="text-3xl font-bold text-blue-900 mt-2">{formatMoney(todayStats.total)}</p>
           </div>
           <div className="bg-blue-200 p-3 rounded-full text-blue-700">
               <DollarSign size={24} />
           </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-100 flex items-center justify-between">
           <div>
               <p className="text-sm font-medium text-green-800">Vendas Realizadas</p>
               <p className="text-3xl font-bold text-green-900 mt-2">{todayStats.count}</p>
           </div>
           <div className="bg-green-200 p-3 rounded-full text-green-700">
               <Package size={24} />
           </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
           <TrendingUp size={20} className="text-gray-500"/>
           <h3 className="text-lg font-medium text-gray-900">Histórico de Vendas (Hoje)</h3>
        </div>
        
        {loading ? (
             <div className="p-8 text-center">Carregando...</div>
        ) : (
             <Table<Sale>
                data={todayStats.recent}
                columns={[
                    { header: 'Hora', accessor: (s) => new Date(s.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
                    { header: 'ID', accessor: (s) => `#${s.id.slice(0,8)}` },
                    { header: 'Cliente', accessor: (s) => s.customerName || 'Consumidor Final' },
                    { header: 'Total', accessor: (s) => <span className="font-bold">{formatMoney(s.total)}</span> }
                ]}
                actions={(sale) => (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open(`#/sales/${sale.id}`, '_blank')}
                    >
                        Ver Detalhes
                    </Button>
                )}
             />
        )}
      </div>
    </div>
  );
};