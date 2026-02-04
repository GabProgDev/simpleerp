import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { RequireAuth } from './guards/RequireAuth';
import { RequireRole } from './guards/RequireRole';
import { Login } from '../features/auth';

// Features
import { Dashboard } from '../features/dashboard';
import { CustomerList, CustomerForm, CustomerView } from '../features/customers';
import { ProductList, ProductForm, ProductView } from '../features/inventory';
import { SalesList, POS, SaleView, POSHistory } from '../features/sales';
import { FinanceDashboard, TransactionsList, TransactionForm, TransactionView } from '../features/finance';
import { QuoteList, QuoteForm, QuoteView } from '../features/quotes';
import { EmployeeList, EmployeeForm, EmployeeView } from '../features/employees';
import { ReportsHome, SalesReport, FinanceReport, InventoryReport, QuotesReport } from '../features/reports';
import { BackupRestore } from '../features/backup';
import { PrintSettings } from '../features/print';
import { ChatbotConfigPage } from '../features/chatbot';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Chatbot: Apenas ADMIN */}
          <Route element={<RequireRole roles={['ADMIN']} />}>
            <Route path="chatbot" element={<ChatbotConfigPage />} />
          </Route>

          {/* Customers: ADMIN, VENDEDOR, FINANCEIRO */}
          <Route element={<RequireRole roles={['ADMIN', 'VENDEDOR', 'FINANCEIRO']} />}>
            <Route path="customers">
                <Route index element={<CustomerList />} />
                <Route path="new" element={<CustomerForm />} />
                <Route path=":id" element={<CustomerView />} />
                <Route path=":id/edit" element={<CustomerForm />} />
            </Route>
          </Route>

          {/* Inventory: ADMIN, ESTOQUE */}
          <Route element={<RequireRole roles={['ADMIN', 'ESTOQUE']} />}>
            <Route path="inventory">
                <Route index element={<ProductList />} />
                <Route path="new" element={<ProductForm />} />
                <Route path=":id" element={<ProductView />} />
                <Route path=":id/edit" element={<ProductForm />} />
            </Route>
          </Route>

          {/* Sales: ADMIN, VENDEDOR, ESTOQUE (Ver), FINANCEIRO (Ver) */}
          <Route element={<RequireRole roles={['ADMIN', 'VENDEDOR', 'ESTOQUE', 'FINANCEIRO']} />}>
            <Route path="sales">
                <Route index element={<Navigate to="new" replace />} />
                <Route path="new" element={<POS />} />
                <Route path="history" element={<SalesList />} />
                <Route path="pos-history" element={<POSHistory />} />
                <Route path=":id" element={<SaleView />} />
            </Route>
          </Route>

          {/* Quotes: ADMIN, VENDEDOR, ESTOQUE, FINANCEIRO */}
          <Route element={<RequireRole roles={['ADMIN', 'VENDEDOR', 'ESTOQUE', 'FINANCEIRO']} />}>
            <Route path="quotes">
                <Route index element={<QuoteList />} />
                <Route path="new" element={<QuoteForm />} />
                <Route path=":id" element={<QuoteView />} />
                <Route path=":id/edit" element={<QuoteForm />} />
            </Route>
          </Route>

          {/* Finance: ADMIN, FINANCEIRO */}
          <Route element={<RequireRole roles={['ADMIN', 'FINANCEIRO']} />}>
            <Route path="finance">
                <Route index element={<FinanceDashboard />} />
                <Route path="transactions" element={<TransactionsList />} />
                <Route path="transactions/new" element={<TransactionForm />} />
                <Route path="transactions/:id" element={<TransactionView />} />
                <Route path="transactions/:id/edit" element={<TransactionForm />} />
            </Route>
          </Route>

           {/* Employees: ADMIN apenas */}
           <Route element={<RequireRole roles={['ADMIN']} />}>
            <Route path="employees">
                <Route index element={<EmployeeList />} />
                <Route path="new" element={<EmployeeForm />} />
                <Route path=":id" element={<EmployeeView />} />
                <Route path=":id/edit" element={<EmployeeForm />} />
            </Route>
          </Route>

          {/* Reports */}
           <Route element={<RequireRole roles={['ADMIN', 'VENDEDOR', 'FINANCEIRO', 'ESTOQUE']} />}>
            <Route path="reports">
                <Route index element={<ReportsHome />} />
                <Route path="sales" element={<RequireRole roles={['ADMIN', 'VENDEDOR', 'FINANCEIRO', 'ESTOQUE']} />}>
                    <Route index element={<SalesReport />} />
                </Route>
                <Route path="finance" element={<RequireRole roles={['ADMIN', 'FINANCEIRO']} />}>
                     <Route index element={<FinanceReport />} />
                </Route>
                <Route path="inventory" element={<RequireRole roles={['ADMIN', 'ESTOQUE']} />}>
                     <Route index element={<InventoryReport />} />
                </Route>
                <Route path="quotes" element={<RequireRole roles={['ADMIN', 'VENDEDOR', 'FINANCEIRO', 'ESTOQUE']} />}>
                     <Route index element={<QuotesReport />} />
                </Route>
            </Route>
          </Route>

          {/* Backup: ADMIN apenas */}
          <Route element={<RequireRole roles={['ADMIN']} />}>
            <Route path="backup" element={<BackupRestore />} />
          </Route>

          {/* Print Settings: ADMIN e FINANCEIRO */}
          <Route element={<RequireRole roles={['ADMIN', 'FINANCEIRO']} />}>
            <Route path="print-settings" element={<PrintSettings />} />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
