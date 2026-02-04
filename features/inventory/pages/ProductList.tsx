import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, AlertTriangle, Search, Package, Image as ImageIcon } from 'lucide-react';
import { productService } from '../services/productService';
import { Product } from '../types/Product';
import { Table } from '../../../shared/components/Table';
import { Button } from '../../../shared/components/Button';

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productService.delete(id);
        fetchProducts();
      } catch (error) {
        alert('Erro ao excluir produto');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-sm text-gray-500">Gerencie seus produtos e inventário</p>
        </div>
        <Button onClick={() => navigate('/inventory/new')} icon={<Plus size={16} />}>
          Novo Produto
        </Button>
      </div>

      <div className="flex items-center bg-white p-2 rounded-md shadow-sm border border-gray-300 max-w-md">
        <Search className="text-gray-400 mr-2" size={20} />
        <input
          type="text"
          placeholder="Buscar por Nome ou SKU..."
          className="flex-1 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table<Product>
        data={filteredProducts}
        columns={[
          {
            header: '',
            accessor: (item) => (
              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {item.imageDataUrl ? (
                  <img src={item.imageDataUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={16} className="text-gray-400" />
                )}
              </div>
            ),
            className: "w-16"
          },
          {
            header: 'Produto',
            accessor: (item) => (
              <div>
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500">SKU: {item.sku}</div>
              </div>
            ),
          },
          { 
            header: 'Estoque', 
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <span className={`font-medium ${item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                  {item.quantity} {item.unit}
                </span>
                {item.quantity <= item.minStock && (
                  <span title="Estoque Baixo" className="text-red-500">
                    <AlertTriangle size={16} />
                  </span>
                )}
              </div>
            )
          },
          { 
            header: 'Preço Venda', 
            accessor: (item) => formatCurrency(item.salePrice) 
          },
          {
            header: 'Status',
            accessor: (item) => (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {item.active ? 'Ativo' : 'Inativo'}
              </span>
            )
          }
        ]}
        actions={(product) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/inventory/${product.id}`)}
              title="Visualizar"
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/inventory/${product.id}/edit`)}
              title="Editar"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
              onClick={() => handleDelete(product.id)}
              title="Excluir"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      />
    </div>
  );
};