import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, User, Mail, Phone, Shield, UserCheck } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { Employee } from '../types/Employee';
import { Button } from '../../../shared/components/Button';

export const EmployeeView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      employeeService.getById(id)
        .then(setEmployee)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!employee) return <div className="p-8 text-center">Funcionário não encontrado</div>;

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
          <Button variant="ghost" onClick={() => navigate('/employees')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-sm text-gray-500">
                {employee.isActive ? 'Ativo' : 'Inativo'} • {employee.role}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          icon={<Edit size={16} />}
          onClick={() => navigate(`/employees/${employee.id}/edit`)}
        >
          Editar
        </Button>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Detalhes da Conta</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem icon={User} label="Usuário (Login)" value={employee.username} />
          <DetailItem icon={Mail} label="Email" value={employee.email} />
          <DetailItem icon={Phone} label="Telefone" value={employee.phone || '-'} />
          <DetailItem icon={Shield} label="Cargo / Função" value={employee.role} />
          <DetailItem icon={UserCheck} label="Status" value={employee.isActive ? 'Ativo' : 'Desativado'} />
          <DetailItem icon={Calendar} label="Criado em" value={new Date(employee.createdAt).toLocaleDateString()} />
        </div>
      </div>
    </div>
  );
};