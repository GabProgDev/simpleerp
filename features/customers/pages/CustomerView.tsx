import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { customerService } from '../services/customerService';
import { Customer } from '../types/Customer';
import { Button } from '../../../shared/components/Button';

export const CustomerView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      customerService.getById(id)
        .then(setCustomer)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!customer) return <div className="p-8 text-center">Cliente não encontrado</div>;

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/customers')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500">Cadastrado em {new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          icon={<Edit size={16} />}
          onClick={() => navigate(`/customers/${customer.id}/edit`)}
        >
          Editar
        </Button>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informações Pessoais</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem icon={FileText} label="CPF/CNPJ" value={customer.document} />
          <DetailItem icon={Mail} label="Email" value={customer.email} />
          <DetailItem icon={Phone} label="Telefone" value={customer.phone} />
          <DetailItem icon={Calendar} label="Atualizado em" value={new Date(customer.updatedAt).toLocaleString()} />
          <div className="md:col-span-2">
            <DetailItem icon={MapPin} label="Endereço" value={customer.address} />
          </div>
          {customer.notes && (
            <div className="md:col-span-2">
              <DetailItem icon={FileText} label="Observações" value={customer.notes} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};