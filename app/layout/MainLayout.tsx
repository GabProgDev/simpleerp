import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      <Sidebar />
      {/* min-w-0 é crucial em flex items para permitir truncate e scroll interno */}
      {/* Na impressão: removemos overflow, permitimos largura total e removemos paddings extras se necessário */}
      <main className="flex-1 overflow-auto min-w-0 print:overflow-visible print:w-full print:h-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 print:max-w-none print:px-0 print:py-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};