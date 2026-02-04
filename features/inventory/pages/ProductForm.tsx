import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Image as ImageIcon, Upload } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductFormData } from '../types/Product';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';

export const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados locais como string para evitar "0 persistente"
  const [costPriceStr, setCostPriceStr] = useState('0');
  const [salePriceStr, setSalePriceStr] = useState('0');
  const [quantityStr, setQuantityStr] = useState('0');
  const [minStockStr, setMinStockStr] = useState('0');

  const [formData, setFormData] = useState<Omit<ProductFormData, 'costPrice' | 'salePrice' | 'quantity' | 'minStock'>>({
    name: '',
    sku: '',
    category: '',
    unit: 'un',
    supplier: '',
    notes: '',
    active: true,
    imageDataUrl: '',
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      productService.getById(id)
        .then((product) => {
          if (product) {
            const { id, createdAt, updatedAt, costPrice, salePrice, quantity, minStock, ...data } = product;
            setFormData(data);
            // Converter números para string ao carregar
            setCostPriceStr(String(costPrice));
            setSalePriceStr(String(salePrice));
            setQuantityStr(String(quantity));
            setMinStockStr(String(minStock));
          } else {
            navigate('/inventory');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de tamanho (ex: máx 500KB para não lotar LocalStorage)
      if (file.size > 500 * 1024) {
        alert("A imagem deve ter no máximo 500KB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageDataUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageDataUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Converter strings para números
    const costPrice = parseFloat(costPriceStr) || 0;
    const salePrice = parseFloat(salePriceStr) || 0;
    const quantity = parseFloat(quantityStr) || 0;
    const minStock = parseFloat(minStockStr) || 0;

    // Validação frontend adicional
    if (costPrice < 0 || salePrice < 0 || quantity < 0) {
      setError('Valores numéricos não podem ser negativos.');
      setLoading(false);
      return;
    }

    const payload: ProductFormData = {
      ...formData,
      costPrice,
      salePrice,
      quantity,
      minStock,
    };

    try {
      if (isEditing) {
        await productService.update(id, payload);
      } else {
        await productService.create(payload);
      }
      navigate('/inventory');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/inventory')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Coluna da Imagem */}
          <div className="md:col-span-1 space-y-4">
            <label className="block text-sm font-medium text-gray-700">Foto do Produto</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] relative bg-gray-50">
              {formData.imageDataUrl ? (
                <>
                  <img src={formData.imageDataUrl} alt="Preview" className="max-h-48 object-contain rounded" />
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    title="Remover imagem"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhuma imagem selecionada</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                   <Upload size={16} /> Carregar
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-500 text-center">Máximo: 500KB (JPG/PNG)</p>
          </div>

          {/* Colunas de Dados */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 pb-2 border-b border-gray-100">
               <h3 className="text-lg font-medium text-gray-900">Identificação</h3>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Nome do Produto *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Teclado Mecânico RGB"
              />
            </div>
            
            <Input
              label="SKU (Código Interno) *"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              placeholder="TEC-001"
            />

            <Input
              label="Categoria"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Periféricos"
            />

            <div className="w-full">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="un">Unidade (un)</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="cx">Caixa (cx)</option>
                <option value="lt">Litro (l)</option>
                <option value="m">Metro (m)</option>
              </select>
            </div>

             <div className="flex items-end h-full pb-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Produto Ativo</span>
                </label>
             </div>
             
             <div className="md:col-span-2 pt-4 pb-2 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Valores e Estoque</h3>
             </div>

            <Input
              label="Preço de Custo (R$)"
              type="text" // Type text para permitir edição livre sem '0' preso
              inputMode="decimal"
              value={costPriceStr}
              onChange={e => setCostPriceStr(e.target.value)}
            />

            <Input
              label="Preço de Venda (R$)"
              type="text"
              inputMode="decimal"
              value={salePriceStr}
              onChange={e => setSalePriceStr(e.target.value)}
            />

            <Input
              label="Quantidade Atual"
              type="text"
              inputMode="numeric"
              value={quantityStr}
              onChange={e => setQuantityStr(e.target.value)}
            />

            <Input
              label="Estoque Mínimo (Alerta)"
              type="text"
              inputMode="numeric"
              value={minStockStr}
              onChange={e => setMinStockStr(e.target.value)}
            />

            <div className="md:col-span-2">
              <Input
                label="Fornecedor"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="md:col-span-3 pt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/inventory')}
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