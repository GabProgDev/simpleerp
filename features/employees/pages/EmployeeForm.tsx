import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import { EmployeeFormData } from '../types/Employee';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';

export const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'VENDEDOR',
    password: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      employeeService.getById(id)
        .then((emp) => {
          if (emp) {
            const { id, createdAt, updatedAt, ...data } = emp;
            setFormData(data);
          } else {
            navigate('/employees');
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
        await employeeService.update(id, formData);
      } else {
        if (!formData.password) {
            alert('Senha é obrigatória para novos usuários.');
            setLoading(false);
            return;
        }
        await employeeService.create(formData);
      }
      navigate('/employees');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao salvar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/employees')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
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
          />
          <Input
            label="Email *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Nome de Usuário (Login) *"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="ex: joao.silva"
          />
          <Input
            label={isEditing ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
            type="password"
            name="password"
            value={formData.password || ''}
            onChange={handleChange}
            required={!isEditing}
          />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Perfil *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="VENDEDOR">Vendedor</option>
              <option value="ESTOQUE">Estoque</option>
              <option value="FINANCEIRO">Financeiro</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <Input
            label="Telefone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />

          <div className="md:col-span-2 pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Usuário Ativo (Pode fazer login)</span>
              </label>
           </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/employees')}
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