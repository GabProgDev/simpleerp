import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { financeService } from '../services/financeService';
import { FinanceSummary, Transaction } from '../types/Transaction';
import { Button } from '../../../shared/components/Button';

export const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FinanceSummary>({ inflow: 0, outflow: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtro básico: Mês atual
  const [currentDate] = useState(new Date());
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Calcular intervalo do mês atual
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const dataSummary = await financeService.getSummary(firstDay, lastDay);
        const allTransactions = await financeService.getAll();
        
        setSummary(dataSummary);
        setRecentTransactions(allTransactions.slice(0, 5)); // Pega as 5 mais recentes
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentDate]);

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="p-8 text-center">Carregando dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p className="text-sm text-gray-500">Resumo de {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/finance/transactions')}>
            Ver Lançamentos
          </Button>
          <Button onClick={() => navigate('/finance/transactions/new')} icon={<Plus size={16} />}>
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Entradas */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Entradas</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{formatMoney(summary.inflow)}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-full text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Saídas */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Saídas</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{formatMoney(summary.outflow)}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-full text-red-600">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        {/* Saldo */}
        <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${summary.balance >= 0 ? 'border-blue-500' : 'border-yellow-500'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Saldo (Realizado)</p>
              <h3 className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                {formatMoney(summary.balance)}
              </h3>
            </div>
            <div className={`p-2 rounded-full ${summary.balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Transações */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Transações Recentes</h3>
          <button 
            onClick={() => navigate('/finance/transactions')}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Ver todas <ArrowRight size={14} />
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Nenhuma transação registrada.</div>
          ) : (
            recentTransactions.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${t.type === 'ENTRADA' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.date).toLocaleDateString()} • {t.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'ENTRADA' ? '+' : '-'} {formatMoney(t.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{t.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};