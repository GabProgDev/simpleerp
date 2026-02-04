import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Trash2, Plus, Minus, User, Save, PackageOpen, Image as ImageIcon, History } from 'lucide-react';
import { productService } from '../../inventory/services/productService';
import { customerService } from '../../customers/services/customerService';
import { salesService } from '../services/salesService';
import { financeService } from '../../finance/services/financeService';
import { Product } from '../../inventory/types/Product';
import { Customer } from '../../customers/types/Customer';
import { CartItem } from '../types/Sale';
import { Button } from '../../../shared/components/Button';
import { PaymentMethod } from '../../finance/types/Transaction';

export const POS: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Estados do PDV
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [productSearch, setProductSearch] = useState('');
  const [notes, setNotes] = useState('');

  // Integração Financeira
  const [generateTransaction, setGenerateTransaction] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DINHEIRO');

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodData, custData] = await Promise.all([
          productService.getAll(),
          customerService.getAll()
        ]);
        setProducts(prodData.filter(p => p.active)); 
        setCustomers(custData);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    };
    loadData();
  }, []);

  // Filtro de produtos
  const filteredProducts = useMemo(() => {
    const term = productSearch.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.sku.toLowerCase().includes(term)
    );
  }, [products, productSearch]);

  // Totais
  const totalAmount = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Ações do Carrinho
  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      
      if (existing) {
        if (existing.quantity >= existing.maxStock) {
          alert(`Estoque máximo atingido para ${product.name}`);
          return prev;
        }
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }

      return [...prev, {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unitPrice: product.salePrice,
        quantity: 1,
        subtotal: product.salePrice,
        maxStock: product.quantity
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item; 
        if (newQty > item.maxStock) {
          alert(`Quantidade solicitada maior que o estoque (${item.maxStock})`);
          return item;
        }
        return { ...item, quantity: newQty, subtotal: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleFinishSale = async () => {
    if (cart.length === 0) return;
    if (!window.confirm('Confirmar finalização da venda?')) return;

    setLoading(true);
    try {
      const customer = customers.find(c => c.id === selectedCustomerId);
      
      const sale = await salesService.create({
        items: cart.map(({ maxStock, ...item }) => item), 
        total: totalAmount,
        status: 'COMPLETED',
        customerId: customer?.id,
        customerName: customer?.name,
        notes: notes
      });

      if (generateTransaction) {
        try {
          await financeService.create({
            date: new Date().toISOString().split('T')[0],
            type: 'ENTRADA',
            category: 'Vendas',
            description: `Venda #${sale.id.slice(0, 8)}`,
            amount: totalAmount,
            paymentMethod: paymentMethod,
            status: 'PAGO',
            referenceType: 'SALE',
            referenceId: sale.id,
            customerName: customer?.name,
            notes: `Gerado automaticamente via PDV. ${notes}`
          });
        } catch (finError) {
          console.error('Erro ao gerar lançamento financeiro', finError);
        }
      }

      setCart([]);
      setNotes('');
      setProductSearch('');
      alert('Venda realizada com sucesso!');
      
    } catch (error: any) {
      alert(error.message || 'Erro ao processar venda');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex flex-col h-full gap-4">
       <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
           <h1 className="text-xl font-bold text-gray-900">Nova Venda (PDV)</h1>
           <Button variant="secondary" size="sm" onClick={() => navigate('/sales/history')} icon={<History size={16} />}>
               Ver Histórico
           </Button>
       </div>

    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-theme(spacing.40))]">
      
      {/* COLUNA 1: CATÁLOGO DE PRODUTOS (65%) */}
      <div className="lg:w-2/3 flex flex-col bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produtos (Nome ou SKU)..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <PackageOpen size={48} className="mb-2 opacity-50" />
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className={`bg-white border rounded-lg p-3 transition-all flex flex-col justify-between h-full ${product.quantity > 0 ? 'hover:border-blue-500 cursor-pointer hover:shadow-md' : 'opacity-60 cursor-not-allowed'}`}
                  onClick={() => addToCart(product)}
                >
                  <div>
                      <div className="aspect-video w-full rounded bg-gray-100 mb-2 overflow-hidden flex items-center justify-center">
                          {product.imageDataUrl ? (
                              <img src={product.imageDataUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                              <ImageIcon size={24} className="text-gray-300" />
                          )}
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1 rounded">{product.sku}</span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div className="text-xs text-gray-500">
                       {product.quantity} {product.unit}
                    </div>
                    <p className="font-bold text-blue-600">{formatMoney(product.salePrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COLUNA 2: CARRINHO (35%) */}
      <div className="lg:w-1/3 flex flex-col bg-white rounded-lg shadow border border-gray-200">
        <div className="p-3 border-b border-gray-200 bg-gray-800 text-white rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <h2 className="font-bold text-sm">Carrinho de Compras</h2>
          </div>
          <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full">{totalItems} itens</span>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">
              Seu carrinho está vazio
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
               {cart.map(item => (
                <div key={item.productId} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-gray-800 line-clamp-1">{item.productName}</span>
                        <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-600 ml-2">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2 bg-white border rounded px-1 shadow-sm">
                            <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-blue-600" disabled={item.quantity <= 1}><Minus size={12}/></button>
                            <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-blue-600" disabled={item.quantity >= item.maxStock}><Plus size={12}/></button>
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                            {formatMoney(item.subtotal)}
                        </div>
                    </div>
                </div>
               ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
           <div>
             <select 
                 className="w-full py-1.5 text-sm border-gray-300 rounded focus:ring-blue-500 bg-white"
                 value={selectedCustomerId}
                 onChange={(e) => setSelectedCustomerId(e.target.value)}
               >
                 <option value="">Consumidor Final (Sem cadastro)</option>
                 {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
           </div>
           
           <div className="flex justify-between items-end border-t border-gray-200 pt-2">
              <div className="text-sm text-gray-500">Total a Pagar</div>
              <div className="text-2xl font-bold text-gray-900">{formatMoney(totalAmount)}</div>
           </div>

           <Button 
            className="w-full py-3 text-lg shadow-md" 
            onClick={handleFinishSale} 
            disabled={cart.length === 0 || loading}
            icon={<Save size={20} />}
          >
            FINALIZAR VENDA
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
};