import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, DollarSign, Box, FileText, BarChart3 } from 'lucide-react';
import { authService } from '../../auth/services/authService';

export const ReportsHome: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getSession();
  const role = session?.role || '';

  const canAccess = (allowedRoles: string[]) => {
      if (role === 'ADMIN') return true;
      return allowedRoles.includes(role);
  };

  const ReportCard = ({ title, desc, icon: Icon, path, roles }: any) => {
    if (!canAccess(roles)) return null;
    return (
      <div 
        onClick={() => navigate(path)}
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200 flex flex-col items-center text-center group"
      >
        <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
          <Icon size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{desc}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-500">Selecione uma categoria para visualizar métricas detalhadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title="Vendas" 
          desc="Faturamento, ticket médio e top produtos" 
          icon={ShoppingCart} 
          path="/reports/sales"
          roles={['VENDEDOR', 'FINANCEIRO', 'ESTOQUE']}
        />
        <ReportCard 
          title="Financeiro" 
          desc="Fluxo de caixa, entradas e saídas" 
          icon={DollarSign} 
          path="/reports/finance"
          roles={['FINANCEIRO']}
        />
        <ReportCard 
          title="Estoque" 
          desc="Níveis de estoque, giro e valores" 
          icon={Box} 
          path="/reports/inventory"
          roles={['ESTOQUE']}
        />
        <ReportCard 
          title="Orçamentos" 
          desc="Taxa de conversão e status" 
          icon={FileText} 
          path="/reports/quotes"
          roles={['VENDEDOR', 'FINANCEIRO', 'ESTOQUE']}
        />
      </div>
    </div>
  );
};