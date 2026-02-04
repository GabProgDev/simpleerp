import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, LayoutDashboard, Box, ShoppingCart, DollarSign, FileText, LogOut, Shield, BarChart3, Database, Printer, MessageSquare } from 'lucide-react';
import { authService } from '../../features/auth';

export const Sidebar: React.FC = () => {
  const session = authService.getSession();
  const role = session?.role;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium whitespace-nowrap overflow-hidden ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const canAccess = (allowedRoles: string[]) => {
      if (!role) return false;
      if (role === 'ADMIN') return true;
      return allowedRoles.includes(role);
  };

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex-shrink-0 flex flex-col overflow-hidden print:hidden">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-xl font-bold text-white tracking-wider truncate">SimpleERP</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
        <NavLink to="/" className={linkClass} end>
          <LayoutDashboard size={20} className="flex-shrink-0" />
          <span className="truncate">Visão Geral</span>
        </NavLink>
        
        {canAccess(['VENDEDOR', 'FINANCEIRO']) && (
            <NavLink to="/customers" className={linkClass}>
            <Users size={20} className="flex-shrink-0" />
            <span className="truncate">Clientes</span>
            </NavLink>
        )}

        {canAccess(['ESTOQUE']) && (
            <NavLink to="/inventory" className={linkClass}>
            <Box size={20} className="flex-shrink-0" />
            <span className="truncate">Estoque</span>
            </NavLink>
        )}

        {canAccess(['VENDEDOR', 'ESTOQUE', 'FINANCEIRO']) && (
            <NavLink to="/quotes" className={linkClass}>
            <FileText size={20} className="flex-shrink-0" />
            <span className="truncate">Orçamentos</span>
            </NavLink>
        )}

        {canAccess(['VENDEDOR', 'ESTOQUE', 'FINANCEIRO']) && (
            <NavLink to="/sales/new" className={linkClass}>
            <ShoppingCart size={20} className="flex-shrink-0" />
            <span className="truncate">Vendas / PDV</span>
            </NavLink>
        )}

        {canAccess(['FINANCEIRO']) && (
            <NavLink to="/finance" className={linkClass}>
            <DollarSign size={20} className="flex-shrink-0" />
            <span className="truncate">Finanças</span>
            </NavLink>
        )}

        {canAccess(['VENDEDOR', 'FINANCEIRO', 'ESTOQUE']) && (
           <NavLink to="/reports" className={linkClass}>
             <BarChart3 size={20} className="flex-shrink-0" />
             <span className="truncate">Relatórios</span>
           </NavLink>
        )}

        {/* Admin e Configurações */}
        {(canAccess(['FINANCEIRO']) || role === 'ADMIN') && (
             <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
                    Administração
                </p>
                
                {role === 'ADMIN' && (
                  <NavLink to="/chatbot" className={linkClass}>
                      <MessageSquare size={20} className="flex-shrink-0" />
                      <span className="truncate">Chatbot WhatsApp</span>
                  </NavLink>
                )}

                {canAccess([]) && (
                    <NavLink to="/employees" className={linkClass}>
                        <Shield size={20} className="flex-shrink-0" />
                        <span className="truncate">Funcionários</span>
                    </NavLink>
                )}
                {canAccess([]) && (
                    <NavLink to="/backup" className={linkClass}>
                        <Database size={20} className="flex-shrink-0" />
                        <span className="truncate">Backup & Restaurar</span>
                    </NavLink>
                )}
                <NavLink to="/print-settings" className={linkClass}>
                    <Printer size={20} className="flex-shrink-0" />
                    <span className="truncate">Config. Impressão</span>
                </NavLink>
             </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {session?.name.substring(0,2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-sm font-medium text-white truncate" title={session?.name}>
                {session?.name}
            </span>
            <span className="text-xs text-gray-500 truncate capitalize">
                {session?.role.toLowerCase()}
            </span>
          </div>
        </div>
        <button 
            onClick={authService.logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gray-800 text-gray-300 hover:bg-red-900 hover:text-white transition-colors text-sm whitespace-nowrap"
        >
            <LogOut size={16} className="flex-shrink-0" />
            Sair
        </button>
      </div>
    </aside>
  );
};
