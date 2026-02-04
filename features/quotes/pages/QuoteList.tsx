import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Printer } from 'lucide-react';
import { quoteService } from '../services/quoteService';
import { Quote } from '../types/Quote';
import { Table } from '../../../shared/components/Table';
import { Button } from '../../../shared/components/Button';

export const QuoteList: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const data = await quoteService.getAll();
      setQuotes(data);
    } catch (error) {
      console.error('Failed to fetch quotes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await quoteService.delete(id);
        fetchQuotes();
      } catch (error) {
        alert('Erro ao excluir orçamento');
      }
    }
  };

  const handlePrint = (id: string) => {
      // Abre em nova aba já com parâmetro de print para disparar window.print()
      window.open(`#/quotes/${id}?print=true`, '_blank');
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RASCUNHO': return 'bg-gray-100 text-gray-800';
      case 'APROVADO': return 'bg-blue-100 text-blue-800';
      case 'CONVERTIDO': return 'bg-green-100 text-green-800';
      case 'CANCELADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-sm text-gray-500">Gerencie propostas comerciais</p>
        </div>
        <Button onClick={() => navigate('/quotes/new')} icon={<Plus size={16} />}>
          Novo Orçamento
        </Button>
      </div>

      <Table<Quote>
        data={quotes}
        columns={[
          { header: 'Data', accessor: (q) => <span className="text-gray-600">{formatDate(q.createdAt)}</span> },
          { header: 'Cliente', accessor: (q) => q.customerName || 'Consumidor Final' },
          { header: 'Total', accessor: (q) => <span className="font-medium">{formatMoney(q.total)}</span> },
          { 
            header: 'Status', 
            accessor: (q) => (
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(q.status)}`}>
                {q.status}
              </span>
            ) 
          },
        ]}
        actions={(quote) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePrint(quote.id)}
              title="Imprimir"
            >
              <Printer size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/quotes/${quote.id}`)}
              title="Visualizar"
            >
              <Eye size={16} />
            </Button>
            {quote.status !== 'CONVERTIDO' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/quotes/${quote.id}/edit`)}
                title="Editar"
              >
                <Edit size={16} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
              onClick={() => handleDelete(quote.id)}
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