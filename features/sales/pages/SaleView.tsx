import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Calendar, User, FileText } from 'lucide-react';
import { salesService } from '../services/salesService';
import { printService } from '../../print';
import { customerService } from '../../customers/services/customerService';
import { Sale, SaleItem } from '../types/Sale';
import { Button } from '../../../shared/components/Button';
import { Table } from '../../../shared/components/Table';

export const SaleView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Print Settings
  const printSettings = printService.getSettings();

  useEffect(() => {
    if (id) {
      salesService.getById(id)
        .then(async (s) => {
            setSale(s);
            if (s?.customerId) {
                const customer = await customerService.getById(s.customerId);
                if (customer) setCustomerAddress(customer.address);
            }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!sale) return <div className="p-8 text-center">Venda não encontrada</div>;

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/sales')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Venda #{sale.id.slice(0, 8)}</h1>
            <p className="text-sm text-gray-500">Detalhes da transação</p>
          </div>
        </div>
        <Button
          variant="secondary"
          icon={<Printer size={16} />}
          onClick={() => window.print()}
        >
          Imprimir
        </Button>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200 print:shadow-none print:border-none">
        
         {/* Cabeçalho de Impressão */}
         <div className="hidden print:flex justify-between items-start px-8 pt-8 pb-4 border-b border-gray-300">
             <div className="flex items-center gap-4">
                 {printSettings.showLogo && printSettings.logoUrl && (
                     <img src={printSettings.logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
                 )}
                 {printSettings.showCompanyInfo && (
                     <div>
                         <h2 className="font-bold text-xl">{printSettings.companyName}</h2>
                         <p className="whitespace-pre-line text-sm text-gray-600">{printSettings.headerText}</p>
                     </div>
                 )}
             </div>
             <div className="text-right">
                 <h2 className="font-bold text-2xl text-gray-800">CUPOM DE VENDA</h2>
                 <p className="text-gray-500">#{sale.id.slice(0, 8)}</p>
             </div>
        </div>

        {/* Cabeçalho */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 print:bg-white print:px-8 flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} className="print:hidden"/>
              <span className="print:font-bold text-gray-900">{new Date(sale.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} className="print:hidden"/>
              <span className="font-medium text-gray-900">{sale.customerName || 'Consumidor Final'}</span>
            </div>
            {printSettings.showCustomerAddress && customerAddress && (
                 <p className="text-xs text-gray-500 hidden print:block">{customerAddress}</p>
            )}
          </div>
          <div className="text-right print:hidden">
             <div className="text-sm text-gray-500">Status</div>
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                CONCLUÍDA
             </span>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="p-0 print:px-4">
          <Table<SaleItem & { id: string | number }>
            data={sale.items.map((item, idx) => ({ ...item, id: item.productId || `item-${idx}` }))}
            columns={[
              { header: 'Produto / SKU', accessor: (item) => (
                <div>
                   <div className="font-medium">{item.productName}</div>
                   <div className="text-xs text-gray-500">{item.productSku}</div>
                </div>
              )},
              { header: 'Preço Un.', accessor: (item) => formatMoney(item.unitPrice) },
              { header: 'Qtd.', accessor: 'quantity' },
              { header: 'Subtotal', accessor: (item) => <span className="font-medium">{formatMoney(item.subtotal)}</span> },
            ]}
          />
        </div>

        {/* Rodapé Totais */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 print:bg-white print:px-8 print:border-none">
          {sale.notes && (
             <div className="mb-4 text-sm text-gray-600 italic border-l-4 border-gray-300 pl-3 print:border-none print:pl-0 print:not-italic">
               <span className="font-bold not-italic mr-2">Observações:</span>
               {sale.notes}
             </div>
          )}
          <div className="flex justify-end items-center gap-4 text-lg">
             <span className="text-gray-600">Total Geral:</span>
             <span className="font-bold text-gray-900 text-xl">{formatMoney(sale.total)}</span>
          </div>

          {/* Rodapé Impressão */}
           <div className="hidden print:block mt-12">
                 {printSettings.showSignatureLine && (
                     <div className="pt-8 border-t border-gray-400 w-1/2 mx-auto text-center">
                         <p className="text-xs text-gray-500">Assinatura do Cliente</p>
                     </div>
                 )}
                 <div className="mt-8 text-center text-xs text-gray-400 pt-4">
                     <p className="whitespace-pre-line">{printSettings.footerText}</p>
                 </div>
           </div>
        </div>
      </div>
    </div>
  );
};