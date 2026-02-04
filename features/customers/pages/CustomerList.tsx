import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { customerService } from '../services/customerService';
import { Customer } from '../types/Customer';
import { Table } from '../../../shared/components/Table';
import { Button } from '../../../shared/components/Button';

export const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await customerService.delete(id);
        fetchCustomers();
      } catch (error) {
        alert('Erro ao excluir cliente');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">Gerencie sua base de clientes</p>
        </div>
        <Button onClick={() => navigate('/customers/new')} icon={<Plus size={16} />}>
          Novo Cliente
        </Button>
      </div>

      <Table<Customer>
        data={customers}
        columns={[
          { header: 'Nome', accessor: 'name', className: 'font-medium' },
          { header: 'Email', accessor: 'email' },
          { header: 'Telefone', accessor: 'phone' },
          { header: 'CPF/CNPJ', accessor: 'document' },
        ]}
        actions={(customer) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/customers/${customer.id}`)}
              title="Visualizar"
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/customers/${customer.id}/edit`)}
              title="Editar"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
              onClick={() => handleDelete(customer.id)}
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