import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Search, User, PackageOpen } from 'lucide-react';
import { quoteService } from '../services/quoteService';
import { customerService } from '../../customers/services/customerService';
import { productService } from '../../inventory/services/productService';
import { QuoteFormData, QuoteItem } from '../types/Quote';
import { Customer } from '../../customers/types/Customer';
import { Product } from '../../inventory/types/Product';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';

export const QuoteForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Form State
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<'RASCUNHO' | 'APROVADO'>('RASCUNHO');

  // Search State
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [custList, prodList] = await Promise.all([
          customerService.getAll(),
          productService.getAll()
        ]);
        setCustomers(custList);
        setProducts(prodList.filter(p => p.active));

        if (isEditing) {
          const quote = await quoteService.getById(id!);
          if (quote) {
            setItems(quote.items);
            setSelectedCustomer(quote.customerId || '');
            setNotes(quote.notes || '');
            setDiscount(quote.discount);
            setStatus(quote.status as any);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    };
    loadData();
  }, [id, isEditing]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    const term = productSearch.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
  }, [products, productSearch]);

  const handleAddProduct = (product: Product) => {
    setItems(prev => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.salePrice,
        quantity: 1,
        lineTotal: product.salePrice
      }
    ]);
    setProductSearch('');
    setShowProductSearch(false);
  };

  const handleAddManualItem = () => {
    setItems(prev => [
      ...prev,
      {
        name: 'Novo Item / Serviço',
        unitPrice: 0,
        quantity: 1,
        lineTotal: 0
      }
    ]);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
         updated.lineTotal = Number(updated.quantity) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const total = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customer = customers.find(c => c.id === selectedCustomer);
      const data: QuoteFormData = {
        customerId: customer?.id,
        customerName: customer?.name,
        items,
        subtotal,
        discount,
        total,
        notes,
        status: status as any
      };

      if (isEditing) {
        await quoteService.update(id!, data);
      } else {
        await quoteService.create(data);
      }
      navigate('/quotes');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/quotes')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Cabeçalho */}
        <div className="bg-white p-6 shadow sm:rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Consumidor Final / Não Selecionado</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Inicial</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="RASCUNHO">Rascunho</option>
              <option value="APROVADO">Aprovado</option>
            </select>
          </div>
        </div>

        {/* Itens */}
        <div className="bg-white p-6 shadow sm:rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-lg font-medium text-gray-900">Itens do Orçamento</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Button type="button" variant="secondary" onClick={() => setShowProductSearch(!showProductSearch)} icon={<Search size={16}/>}>
                  Buscar Produto
                </Button>
                {showProductSearch && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white shadow-xl rounded-md border border-gray-200 z-10 p-2">
                    <input 
                      autoFocus
                      placeholder="Digite nome ou SKU..."
                      className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                    />
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredProducts.map(p => (
                        <div 
                          key={p.id} 
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm rounded flex justify-between"
                          onClick={() => handleAddProduct(p)}
                        >
                          <span className="font-medium">{p.name}</span>
                          <span className="text-blue-600">{formatMoney(p.salePrice)}</span>
                        </div>
                      ))}
                      {productSearch && filteredProducts.length === 0 && (
                        <div className="text-center text-gray-400 text-xs py-2">Nenhum produto encontrado</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button type="button" onClick={handleAddManualItem} icon={<Plus size={16}/>}>
                Item Manual
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Qtd</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Preço Un.</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-500 text-sm">
                      Nenhum item adicionado.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        {item.productId ? (
                          <div>
                            <div className="font-medium text-sm text-gray-900">{item.name}</div>
                            {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                          </div>
                        ) : (
                          <input 
                            className="w-full p-1 border border-gray-300 rounded text-sm"
                            value={item.name}
                            onChange={(e) => updateItem(idx, 'name', e.target.value)}
                            placeholder="Descrição do serviço/item"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input 
                          type="number"
                          min="1"
                          className="w-full p-1 border border-gray-300 rounded text-sm text-center"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full p-1 border border-gray-300 rounded text-sm text-right"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                        {formatMoney(item.lineTotal)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totais e Observações */}
        <div className="bg-white p-6 shadow sm:rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 text-sm"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Condições de pagamento, validade, etc."
            />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Desconto:</span>
              <input 
                type="number"
                min="0"
                step="0.01"
                className="w-24 p-1 border border-gray-300 rounded text-right"
                value={discount}
                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between text-xl font-bold text-gray-900">
              <span>Total:</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/quotes')} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} icon={<Save size={16} />}>
            Salvar Orçamento
          </Button>
        </div>
      </form>
    </div>
  );
};