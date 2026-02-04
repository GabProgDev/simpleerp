import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { financeService } from '../services/financeService';
import { Transaction } from '../types/Transaction';
import { Table } from '../../../shared/components/Table';
import { Button } from '../../../shared/components/Button';

export const TransactionsList: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterType, setFilterType] = useState<'ALL' | 'ENTRADA' | 'SAIDA'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await financeService.getAll();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let result = transactions;

    if (filterType !== 'ALL') {
      result = result.filter(t => t.type === filterType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      );
    }

    setFilteredTransactions(result);
  }, [transactions, filterType, searchTerm]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      try {
        await financeService.delete(id);
        fetchTransactions();
      } catch (error) {
        alert('Erro ao excluir lançamento');
      }
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="flex justify-center p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
          <p className="text-sm text-gray-500">Gerencie entradas e saídas financeiras</p>
        </div>
        <Button onClick={() => navigate('/finance/transactions/new')} icon={<Plus size={16} />}>
          Novo Lançamento
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Buscar descrição ou categoria..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="ALL">Todos os Tipos</option>
          <option value="ENTRADA">Entradas</option>
          <option value="SAIDA">Saídas</option>
        </select>
      </div>

      <Table<Transaction>
        data={filteredTransactions}
        columns={[
          { 
            header: 'Data', 
            accessor: (item) => <span className="text-gray-600 text-sm">{new Date(item.date).toLocaleDateString()}</span>
          },
          { 
            header: 'Tipo', 
            accessor: (item) => (
               <div className="flex items-center gap-2">
                 {item.type === 'ENTRADA' 
                    ? <ArrowUpCircle size={18} className="text-green-500" />
                    : <ArrowDownCircle size={18} className="text-red-500" />
                 }
                 <span className={`text-xs font-bold ${item.type === 'ENTRADA' ? 'text-green-700' : 'text-red-700'}`}>
                   {item.type}
                 </span>
               </div>
            )
          },
          { 
            header: 'Descrição', 
            accessor: (item) => (
              <div>
                <div className="font-medium text-gray-900">{item.description}</div>
                <div className="text-xs text-gray-500">{item.category}</div>
              </div>
            )
          },
          { 
            header: 'Valor', 
            accessor: (item) => (
              <span className={`font-medium ${item.type === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                {item.type === 'ENTRADA' ? '+' : '-'} {formatMoney(item.amount)}
              </span>
            )
          },
          {
            header: 'Status',
            accessor: (item) => (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                item.status === 'PAGO' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status}
              </span>
            )
          }
        ]}
        actions={(t) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/finance/transactions/${t.id}`)}
              title="Visualizar"
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/finance/transactions/${t.id}/edit`)}
              title="Editar"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
              onClick={() => handleDelete(t.id)}
              title="Excluir"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      />
    </div>
  );
};