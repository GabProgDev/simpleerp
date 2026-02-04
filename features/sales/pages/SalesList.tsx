import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Plus } from 'lucide-react';
import { salesService } from '../services/salesService';
import { Sale } from '../types/Sale';
import { Table } from '../../../shared/components/Table';
import { Button } from '../../../shared/components/Button';

export const SalesList: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const data = await salesService.getAll();
        setSales(data);
      } catch (error) {
        console.error('Failed to fetch sales', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('pt-BR');

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-sm text-gray-500">Histórico de transações</p>
        </div>
        <Button onClick={() => navigate('/sales/new')} icon={<Plus size={16} />}>
          Nova Venda (PDV)
        </Button>
      </div>

      <Table<Sale>
        data={sales}
        columns={[
          { 
            header: 'Data', 
            accessor: (item) => <span className="text-gray-600 text-sm">{formatDate(item.createdAt)}</span>
          },
          { 
            header: 'Cliente', 
            accessor: (item) => item.customerName || 'Consumidor Final' 
          },
          {
            header: 'Itens',
            accessor: (item) => item.items.length
          },
          { 
            header: 'Total', 
            accessor: (item) => <span className="font-medium text-gray-900">{formatMoney(item.total)}</span>
          },
          {
            header: 'Status',
            accessor: (item) => (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.status === 'COMPLETED' ? 'Concluída' : 'Cancelada'}
              </span>
            )
          }
        ]}
        actions={(sale) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/sales/${sale.id}`)}
              title="Visualizar Detalhes"
            >
              <Eye size={16} />
            </Button>
          </div>
        )}
      />
    </div>
  );
};