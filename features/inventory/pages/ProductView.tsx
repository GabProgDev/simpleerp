import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Package, Tag, DollarSign, AlertTriangle, Layers, Image as ImageIcon } from 'lucide-react';
import { productService } from '../services/productService';
import { Product } from '../types/Product';
import { Button } from '../../../shared/components/Button';

export const ProductView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      productService.getById(id)
        .then(setProduct)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!product) return <div className="p-8 text-center">Produto não encontrado</div>;

  const DetailItem = ({ icon: Icon, label, value, alert = false }: { icon: any, label: string, value: React.ReactNode, alert?: boolean }) => (
    <div className={`flex items-start p-4 rounded-lg ${alert ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
      <div className="flex-shrink-0">
        <Icon className={`h-6 w-6 ${alert ? 'text-red-500' : 'text-gray-400'}`} />
      </div>
      <div className="ml-4 w-full">
        <h3 className={`text-sm font-medium ${alert ? 'text-red-800' : 'text-gray-500'}`}>{label}</h3>
        <div className={`mt-1 text-sm font-semibold break-words ${alert ? 'text-red-900' : 'text-gray-900'}`}>
          {value}
        </div>
      </div>
    </div>
  );

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/inventory')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {product.name}
              {!product.active && (
                <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">Inativo</span>
              )}
            </h1>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          icon={<Edit size={16} />}
          onClick={() => navigate(`/inventory/${product.id}/edit`)}
        >
          Editar
        </Button>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Detalhes do Produto</h3>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Imagem */}
          <div className="md:col-span-1">
             <div className="aspect-square w-full rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden relative">
                {product.imageDataUrl ? (
                  <img src={product.imageDataUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                     <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                     <p className="text-xs">Sem Imagem</p>
                  </div>
                )}
             </div>
          </div>

          {/* Dados */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem icon={Tag} label="Categoria" value={product.category || '-'} />
            <DetailItem icon={Package} label="Fornecedor" value={product.supplier || '-'} />
            <DetailItem icon={Calendar} label="Atualizado em" value={new Date(product.updatedAt).toLocaleDateString()} />
            
            <div className="md:col-span-2 border-t border-gray-100 my-1"></div>
            
            <DetailItem icon={DollarSign} label="Preço de Custo" value={formatCurrency(product.costPrice)} />
            <DetailItem icon={DollarSign} label="Preço de Venda" value={formatCurrency(product.salePrice)} />
            <DetailItem 
               icon={DollarSign} 
               label="Margem Estimada" 
               value={formatCurrency(product.salePrice - product.costPrice)} 
            />

            <div className="md:col-span-2 border-t border-gray-100 my-1"></div>

            <DetailItem 
              icon={product.quantity <= product.minStock ? AlertTriangle : Layers} 
              label="Quantidade em Estoque" 
              value={`${product.quantity} ${product.unit}`}
              alert={product.quantity <= product.minStock}
            />
            <DetailItem icon={Layers} label="Estoque Mínimo" value={`${product.minStock} ${product.unit}`} />
          </div>
          
          {product.notes && (
            <div className="md:col-span-3 mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Observações</h4>
              <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md">{product.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};