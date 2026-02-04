import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { customerService } from '../services/customerService';
import { CustomerFormData } from '../types/Customer';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';

export const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      customerService.getById(id)
        .then((customer) => {
          if (customer) {
            const { id, createdAt, updatedAt, ...data } = customer;
            setFormData(data);
          } else {
            navigate('/customers');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await customerService.update(id, formData);
      } else {
        await customerService.create(formData);
      }
      navigate('/customers');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nome Completo *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ex: João da Silva"
          />
          <Input
            label="CPF/CNPJ *"
            name="document"
            value={formData.document}
            onChange={handleChange}
            required
            placeholder="000.000.000-00"
          />
          <Input
            label="Email *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="joao@email.com"
          />
          <Input
            label="Telefone *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="(00) 00000-0000"
          />
          <div className="md:col-span-2">
            <Input
              label="Endereço *"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Rua, Número, Bairro, Cidade - UF"
            />
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
            onClick={() => navigate('/customers')}
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