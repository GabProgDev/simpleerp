import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Edit, ShoppingCart, XCircle, Printer } from 'lucide-react';
import { quoteService } from '../services/quoteService';
import { salesService } from '../../sales/services/salesService';
import { financeService } from '../../finance/services/financeService';
import { printService } from '../../print'; // Importar serviço de impressão
import { Quote, QuoteItem } from '../types/Quote';
import { Button } from '../../../shared/components/Button';
import { Table } from '../../../shared/components/Table';
import { PaymentMethod } from '../../finance/types/Transaction';
import { customerService } from '../../customers/services/customerService'; // Para endereço do cliente

export const QuoteView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Print Settings
  const printSettings = printService.getSettings();

  // Conversion State
  const [converting, setConverting] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [generateFinance, setGenerateFinance] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DINHEIRO');

  useEffect(() => {
    if (id) {
      quoteService.getById(id)
        .then(async (q) => {
            setQuote(q);
            if (q?.customerId) {
                const customer = await customerService.getById(q.customerId);
                if (customer) setCustomerAddress(customer.address);
            }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Auto-print se vier da listagem
  useEffect(() => {
      if (!loading && quote && searchParams.get('print') === 'true') {
          setTimeout(() => window.print(), 500);
      }
  }, [loading, quote, searchParams]);

  const handleConvert = async () => {
    if (!quote) return;
    setConverting(true);
    try {
      const sale = await salesService.create({
        items: quote.items.map(item => ({
            productId: item.productId, 
            productName: item.name,
            productSku: item.sku,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.lineTotal
        })),
        total: quote.total,
        customerId: quote.customerId,
        customerName: quote.customerName,
        status: 'COMPLETED',
        notes: `Gerado a partir do Orçamento #${quote.id.slice(0, 8)}. ${quote.notes || ''}`
      });

      if (generateFinance) {
         await financeService.create({
             date: new Date().toISOString().split('T')[0],
             type: 'ENTRADA',
             category: 'Vendas',
             description: `Venda (Orç. #${quote.id.slice(0, 8)})`,
             amount: quote.total,
             paymentMethod: paymentMethod,
             status: 'PAGO',
             referenceType: 'SALE',
             referenceId: sale.id,
             customerName: quote.customerName,
             notes: 'Conversão automática de orçamento'
         });
      }

      await quoteService.update(quote.id, { 
          status: 'CONVERTIDO', 
          saleId: sale.id 
      });

      alert('Orçamento convertido em venda com sucesso!');
      navigate(`/sales/${sale.id}`);
    } catch (error: any) {
      alert(`Erro ao converter: ${error.message}`);
    } finally {
      setConverting(false);
      setShowConvertModal(false);
    }
  };

  const handleStatusChange = async (newStatus: 'CANCELADO') => {
      if(!window.confirm('Deseja realmente cancelar este orçamento?')) return;
      if (quote) {
          await quoteService.update(quote.id, { status: newStatus });
          setQuote(prev => prev ? ({ ...prev, status: newStatus }) : null);
      }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!quote) return <div className="p-8 text-center">Orçamento não encontrado</div>;

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/quotes')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Orçamento #{quote.id.slice(0, 8)}
              <span className={`text-sm px-3 py-1 rounded-full ${
                  quote.status === 'CONVERTIDO' ? 'bg-green-100 text-green-800' :
                  quote.status === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
              }`}>
                  {quote.status}
              </span>
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" icon={<Printer size={16} />} onClick={() => window.print()}>
                Imprimir
            </Button>
            {quote.status !== 'CONVERTIDO' && quote.status !== 'CANCELADO' && (
                <>
                    <Button variant="secondary" icon={<Edit size={16} />} onClick={() => navigate(`/quotes/${quote.id}/edit`)}>
                        Editar
                    </Button>
                    <Button onClick={() => setShowConvertModal(true)} icon={<ShoppingCart size={16} />}>
                        Converter em Venda
                    </Button>
                </>
            )}
        </div>
      </div>
      
      {quote.status !== 'CANCELADO' && quote.status !== 'CONVERTIDO' && (
           <div className="flex justify-end print:hidden">
                <button onClick={() => handleStatusChange('CANCELADO')} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                    <XCircle size={14}/> Cancelar Orçamento
                </button>
           </div>
      )}

      {/* DOCUMENTO (Visível na tela e na impressão) */}
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
                 <h2 className="font-bold text-2xl text-gray-800">ORÇAMENTO</h2>
                 <p className="text-gray-500">#{quote.id.slice(0, 8)}</p>
             </div>
        </div>

        {/* Info Padrão (Tela) / Info Cliente (Print) */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 print:bg-white print:px-8">
             <div className="flex justify-between">
                 <div>
                     <p className="text-sm text-gray-500 print:font-bold print:text-gray-700">Cliente</p>
                     <p className="font-medium text-gray-900">{quote.customerName || 'Consumidor Final'}</p>
                     {printSettings.showCustomerAddress && customerAddress && (
                        <p className="text-sm text-gray-500 mt-1 hidden print:block">{customerAddress}</p>
                     )}
                 </div>
                 <div className="text-right">
                     <p className="text-sm text-gray-500 print:font-bold print:text-gray-700">Data</p>
                     <p className="font-medium text-gray-900">{new Date(quote.createdAt).toLocaleDateString()}</p>
                 </div>
             </div>
        </div>
        
        <div className="print:px-4">
            <Table<QuoteItem & { id: number }>
                data={quote.items.map((i, idx) => ({ ...i, id: idx }))}
                columns={[
                { header: 'Item / Serviço', accessor: 'name' },
                { header: 'Qtd', accessor: 'quantity' },
                { header: 'Preço Un.', accessor: (i) => formatMoney(i.unitPrice) },
                { header: 'Total', accessor: (i) => formatMoney(i.lineTotal) },
                ]}
            />
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 print:bg-white print:px-8 print:border-none">
            <div className="flex flex-col items-end gap-1">
                <div className="flex justify-between w-48 text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatMoney(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between w-48 text-sm text-gray-600">
                    <span>Desconto:</span>
                    <span>- {formatMoney(quote.discount)}</span>
                </div>
                <div className="flex justify-between w-48 text-xl font-bold text-gray-900 mt-2 pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>{formatMoney(quote.total)}</span>
                </div>
            </div>
            
            {quote.notes && (
                <div className="mt-6 pt-4 border-t border-gray-200 print:border-t-2">
                    <p className="text-sm font-medium text-gray-500">Observações:</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{quote.notes}</p>
                </div>
            )}

            {/* Rodapé Impressão */}
            <div className="hidden print:block mt-12">
                 {printSettings.showSignatureLine && (
                     <div className="pt-8 border-t border-gray-400 w-1/2 mx-auto text-center">
                         <p className="text-xs text-gray-500">Assinatura do Responsável</p>
                     </div>
                 )}
                 <div className="mt-8 text-center text-xs text-gray-400 pt-4">
                     <p className="whitespace-pre-line">{printSettings.footerText}</p>
                 </div>
            </div>
        </div>
      </div>

      {/* Convert Modal */}
      {showConvertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  {/* ... Modal content ... */}
                   <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingCart size={20} className="text-blue-600" />
                      Converter em Venda
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input 
                              type="checkbox" 
                              checked={generateFinance}
                              onChange={e => setGenerateFinance(e.target.checked)}
                              className="rounded text-blue-600 w-4 h-4"
                          />
                          <span className="text-sm font-medium text-gray-900">Gerar Lançamento Financeiro</span>
                      </label>
                      
                      {generateFinance && (
                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Forma de Pagamento</label>
                              <select 
                                  className="w-full text-sm border-gray-300 rounded-md"
                                  value={paymentMethod}
                                  onChange={e => setPaymentMethod(e.target.value as any)}
                              >
                                  <option value="DINHEIRO">Dinheiro</option>
                                  <option value="PIX">Pix</option>
                                  <option value="CARTAO_DEBITO">Débito</option>
                                  <option value="CARTAO_CREDITO">Crédito</option>
                                  <option value="BOLETO">Boleto</option>
                              </select>
                          </div>
                      )}
                  </div>

                  <div className="flex justify-end gap-3">
                      <Button variant="secondary" onClick={() => setShowConvertModal(false)} disabled={converting}>
                          Cancelar
                      </Button>
                      <Button onClick={handleConvert} disabled={converting}>
                          {converting ? 'Convertendo...' : 'Confirmar Conversão'}
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};