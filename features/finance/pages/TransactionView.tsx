import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, DollarSign, Tag, CheckCircle, Clock } from 'lucide-react';
import { financeService } from '../services/financeService';
import { Transaction } from '../types/Transaction';
import { Button } from '../../../shared/components/Button';

export const TransactionView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      financeService.getById(id)
        .then(setTransaction)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!transaction) return <div className="p-8 text-center">Transação não encontrada</div>;

  const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <div className="ml-4 w-full">
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <p className="mt-1 text-sm text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/finance/transactions')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Detalhes da Transação
              <span className={`px-2 py-1 text-xs rounded-full border ${transaction.type === 'ENTRADA' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                {transaction.type}
              </span>
            </h1>
            <p className="text-sm text-gray-500">ID: {transaction.id.slice(0, 8)}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          icon={<Edit size={16} />}
          onClick={() => navigate(`/finance/transactions/${transaction.id}/edit`)}
        >
          Editar
        </Button>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
           <h2 className="text-lg font-medium text-gray-900">{transaction.description}</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem icon={DollarSign} label="Valor" value={formatMoney(transaction.amount)} />
          <DetailItem icon={Calendar} label="Data" value={new Date(transaction.date).toLocaleDateString()} />
          <DetailItem icon={Tag} label="Categoria" value={transaction.category} />
          <DetailItem 
             icon={transaction.status === 'PAGO' ? CheckCircle : Clock} 
             label="Status" 
             value={transaction.status} 
          />
          <DetailItem icon={Tag} label="Método de Pagamento" value={transaction.paymentMethod} />
          
          {transaction.referenceType === 'SALE' && (
            <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-lg">
               <p className="text-sm text-blue-800">
                 Esta transação foi gerada automaticamente pela <strong>Venda {transaction.referenceId?.slice(0, 8)}</strong>
                 {transaction.customerName && ` (Cliente: ${transaction.customerName})`}.
               </p>
            </div>
          )}

          {transaction.notes && (
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Observações</h4>
              <p className="p-3 bg-gray-50 rounded-md text-sm text-gray-800">{transaction.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};