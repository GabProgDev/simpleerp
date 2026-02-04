import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { financeService } from '../services/financeService';
import { TransactionFormData, PaymentMethod, TransactionType, TransactionStatus } from '../types/Transaction';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';

export const TransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    date: new Date().toISOString().split('T')[0],
    type: 'SAIDA',
    category: '',
    description: '',
    amount: 0,
    paymentMethod: 'OUTRO',
    status: 'PAGO',
    notes: ''
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      financeService.getById(id)
        .then((t) => {
          if (t) {
            const { id, createdAt, updatedAt, ...data } = t;
            // Garantir formato de data para input date
            const dateStr = data.date.includes('T') ? data.date.split('T')[0] : data.date;
            setFormData({ ...data, date: dateStr });
          } else {
            navigate('/finance/transactions');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.amount <= 0) {
        alert("O valor deve ser maior que zero.");
        setLoading(false);
        return;
      }

      if (isEditing) {
        await financeService.update(id, formData);
      } else {
        await financeService.create(formData);
      }
      navigate('/finance/transactions');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar lançamento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/finance/transactions')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        {/* Tipo de Transação */}
        <div className="flex gap-4 justify-center pb-4 border-b border-gray-100">
          <label className={`cursor-pointer px-4 py-2 rounded-full border ${formData.type === 'ENTRADA' ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300 text-gray-500'}`}>
            <input 
              type="radio" 
              name="type" 
              value="ENTRADA" 
              checked={formData.type === 'ENTRADA'} 
              onChange={handleChange} 
              className="hidden" 
            />
            Entrada (Receita)
          </label>
          <label className={`cursor-pointer px-4 py-2 rounded-full border ${formData.type === 'SAIDA' ? 'bg-red-100 border-red-500 text-red-700' : 'border-gray-300 text-gray-500'}`}>
            <input 
              type="radio" 
              name="type" 
              value="SAIDA" 
              checked={formData.type === 'SAIDA'} 
              onChange={handleChange} 
              className="hidden" 
            />
            Saída (Despesa)
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Descrição *"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Ex: Pagamento de Fornecedor"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
            <input 
              list="categories" 
              name="category"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Digite ou selecione..."
            />
            <datalist id="categories">
              <option value="Vendas" />
              <option value="Suprimentos" />
              <option value="Salário" />
              <option value="Internet" />
              <option value="Aluguel" />
              <option value="Impostos" />
              <option value="Outros" />
            </datalist>
          </div>
          
          <Input
            label="Valor (R$) *"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            step="0.01"
            min="0.01"
          />

          <Input
            label="Data *"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento *</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="DINHEIRO">Dinheiro</option>
              <option value="PIX">Pix</option>
              <option value="CARTAO_DEBITO">Cartão de Débito</option>
              <option value="CARTAO_CREDITO">Cartão de Crédito</option>
              <option value="BOLETO">Boleto</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="PAGO">Pago / Recebido</option>
              <option value="PENDENTE">Pendente</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/finance/transactions')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            icon={<Save size={16} />}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
};