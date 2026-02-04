import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, UserCheck, UserX } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { Employee } from '../types/Employee';
import { Table } from '../../../shared/components/Table';
import { Button } from '../../../shared/components/Button';
import { authService } from '../../auth/services/authService';

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getSession();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await employeeService.delete(id);
        fetchEmployees();
      } catch (error: any) {
        alert(error.message || 'Erro ao excluir funcionário');
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-sm text-gray-500">Gerencie o acesso e equipe</p>
        </div>
        <Button onClick={() => navigate('/employees/new')} icon={<Plus size={16} />}>
          Novo Funcionário
        </Button>
      </div>

      <Table<Employee>
        data={employees}
        columns={[
          { header: 'Nome', accessor: 'name' },
          { header: 'Usuário', accessor: (e) => <span className="font-mono text-xs">{e.username}</span> },
          { header: 'Email', accessor: 'email' },
          { 
            header: 'Cargo', 
            accessor: (e) => (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold
                ${e.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                  e.role === 'VENDEDOR' ? 'bg-blue-100 text-blue-800' :
                  e.role === 'FINANCEIRO' ? 'bg-green-100 text-green-800' :
                  'bg-orange-100 text-orange-800'
                }
              `}>
                {e.role}
              </span>
            )
          },
          {
            header: 'Status',
            accessor: (e) => (
                <div className="flex items-center gap-1">
                    {e.isActive ? <UserCheck size={14} className="text-green-600"/> : <UserX size={14} className="text-red-500"/>}
                    <span className={`text-sm ${e.isActive ? 'text-green-600' : 'text-red-500'}`}>
                        {e.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
            )
          }
        ]}
        actions={(emp) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/employees/${emp.id}`)}
              title="Visualizar"
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/employees/${emp.id}/edit`)}
              title="Editar"
            >
              <Edit size={16} />
            </Button>
            {/* Não permitir deletar a si mesmo para evitar acidentes simples */}
            {emp.id !== currentUser?.id && (
                <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => handleDelete(emp.id)}
                title="Excluir"
                >
                <Trash2 size={16} />
                </Button>
            )}
          </div>
        )}
      />
    </div>
  );
};