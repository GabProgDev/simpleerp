import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  Plus, 
  Database, 
  Activity, 
  Server, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { salesService } from '../../sales/services/salesService';
import { financeService } from '../../finance/services/financeService';
import { quoteService } from '../../quotes/services/quoteService';
import { productService } from '../../inventory/services/productService';
import { authService } from '../../auth/services/authService';
import { apiClient } from '../../../shared/services/apiClient';

interface DashboardStats {
  salesCountToday: number;
  salesTotalToday: number;
  financeBalanceToday: number;
  openQuotes: number;
  lowStockCount: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getSession();
  const isAdmin = session?.role === 'ADMIN';
  
  const [stats, setStats] = useState<DashboardStats>({
    salesCountToday: 0,
    salesTotalToday: 0,
    financeBalanceToday: 0,
    openQuotes: 0,
    lowStockCount: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'LOCAL' | 'ONLINE' | 'OFFLINE'>('LOCAL');

  const useApi = import.meta.env.VITE_USE_API === 'true';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Verificação de Status da API
        if (useApi) {
          try {
            // Tenta um endpoint leve para verificar saúde
            await apiClient.get('/health').catch(() => { throw new Error('API Offline') });
            setApiStatus('ONLINE');
          } catch (e) {
            setApiStatus('OFFLINE');
          }
        } else {
          setApiStatus('LOCAL');
        }

        // 2. Carregar Dados de Negócio
        const today = new Date();
        const todayStr = today.toDateString(); // "Day Mon DD YYYY" para comparação de data ignorando hora
        // Para financeiro que usa YYYY-MM-DD
        const todayIso = today.toISOString().split('T')[0];

        const [sales, transactions, quotes, products] = await Promise.all([
          salesService.getAll(),
          financeService.getAll(),
          quoteService.getAll(),
          productService.getAll()
        ]);

        // Processar Vendas Hoje
        const salesToday = sales.filter(s => new Date(s.createdAt).toDateString() === todayStr && s.status === 'COMPLETED');
        
        // Processar Financeiro Hoje (Entradas - Saídas PAGO)
        // Nota: A data da transação pode vir com ou sem hora dependendo de como foi salva, normalizamos para YYYY-MM-DD
        const financeToday = transactions.filter(t => {
            const tDate = t.date.includes('T') ? t.date.split('T')[0] : t.date;
            return tDate === todayIso && t.status === 'PAGO';
        });
        const balanceToday = financeToday.reduce((acc, t) => {
            return t.type === 'ENTRADA' ? acc + t.amount : acc - t.amount;
        }, 0);

        // Processar Orçamentos Abertos
        const openQuotesCount = quotes.filter(q => ['RASCUNHO', 'APROVADO'].includes(q.status)).length;

        // Processar Estoque Baixo
        const lowStock = products.filter(p => p.active && p.quantity <= p.minStock).length;

        setStats({
          salesCountToday: salesToday.length,
          salesTotalToday: salesToday.reduce((acc, s) => acc + s.total, 0),
          financeBalanceToday: balanceToday,
          openQuotes: openQuotesCount,
          lowStockCount: lowStock
        });

      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [useApi]);

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando visão geral...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho e Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-sm text-gray-500">Bem-vindo, {session?.name}. Aqui está o resumo de hoje.</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
          apiStatus === 'ONLINE' ? 'bg-green-50 text-green-700 border-green-200' :
          apiStatus === 'OFFLINE' ? 'bg-red-50 text-red-700 border-red-200' :
          'bg-gray-100 text-gray-700 border-gray-200'
        }`}>
          {apiStatus === 'ONLINE' && <Wifi size={16} />}
          {apiStatus === 'OFFLINE' && <WifiOff size={16} />}
          {apiStatus === 'LOCAL' && <Database size={16} />}
          
          <span>
            {apiStatus === 'ONLINE' && 'Sistema Online'}
            {apiStatus === 'OFFLINE' && 'Servidor Desconectado'}
            {apiStatus === 'LOCAL' && 'Modo Local (Offline)'}
          </span>
        </div>
      </div>

      {apiStatus === 'OFFLINE' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
          <div className="flex items-center">
             <AlertTriangle className="text-red-500 mr-3" size={24} />
             <div>
               <p className="font-bold text-red-700">Atenção: Conexão com o Servidor Falhou</p>
               <p className="text-sm text-red-600">
                 Verifique se o backend está rodando (`npm run dev` na pasta server). 
                 Algumas funcionalidades podem estar indisponíveis.
               </p>
             </div>
          </div>
        </div>
      )}

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Vendas Hoje */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Vendas Hoje</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(stats.salesTotalToday)}</h3>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">
              {stats.salesCountToday} pedidos
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <ShoppingCart size={24} />
          </div>
        </div>

        {/* Caixa do Dia */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Caixa do Dia (Pago)</p>
            <h3 className={`text-2xl font-bold mt-1 ${stats.financeBalanceToday >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney(stats.financeBalanceToday)}
            </h3>
            <span className="text-xs text-gray-400 mt-2 inline-block">Saldo Realizado</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Orçamentos Abertos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Orçamentos Abertos</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.openQuotes}</h3>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">
              Pendentes
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
            <FileText size={24} />
          </div>
        </div>

        {/* Estoque Baixo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Alertas de Estoque</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.lowStockCount}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${stats.lowStockCount > 0 ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100'}`}>
              {stats.lowStockCount > 0 ? 'Precisa Reposição' : 'Estoque Saudável'}
            </span>
          </div>
          <div className={`p-3 rounded-full ${stats.lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-gray-400" /> Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button 
            onClick={() => navigate('/sales/new')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <div className="mb-3 p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShoppingCart size={24} />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-blue-600">Nova Venda</span>
          </button>

          <button 
            onClick={() => navigate('/quotes/new')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all group"
          >
            <div className="mb-3 p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileText size={24} />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-purple-600">Novo Orçamento</span>
          </button>

          <button 
            onClick={() => navigate('/finance/transactions/new')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all group"
          >
            <div className="mb-3 p-3 bg-green-50 text-green-600 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
              <DollarSign size={24} />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-green-600">Lançar Despesa</span>
          </button>

          <button 
            onClick={() => navigate('/customers/new')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <div className="mb-3 p-3 bg-orange-50 text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-orange-600">Novo Cliente</span>
          </button>

          {isAdmin && (
            <button 
              onClick={() => navigate('/backup')}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-500 hover:shadow-md transition-all group"
            >
              <div className="mb-3 p-3 bg-gray-50 text-gray-600 rounded-full group-hover:bg-gray-600 group-hover:text-white transition-colors">
                <Database size={24} />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-gray-600">Backup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};