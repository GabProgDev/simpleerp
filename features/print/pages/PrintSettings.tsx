import React, { useEffect, useState } from 'react';
import { Save, Printer, Image as ImageIcon, Trash2 } from 'lucide-react';
import { printService } from '../services/printService';
import { PrintSettings as IPrintSettings } from '../types/PrintSettings';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

export const PrintSettings: React.FC = () => {
  const [settings, setSettings] = useState<IPrintSettings>(printService.getSettings());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSettings(printService.getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    printService.saveSettings(settings);
    setTimeout(() => {
        setLoading(false);
        alert('Configurações de impressão salvas com sucesso!');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
         const checked = (e.target as HTMLInputElement).checked;
         setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
         setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 500 * 1024) {
              alert('O logo deve ter no máximo 500KB.');
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
           <Printer className="text-blue-600" /> Configuração de Impressão
        </h1>
        <p className="text-gray-500 mt-1">Personalize o layout de orçamentos e vendas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white p-6 shadow rounded-lg space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informações da Empresa</h3>
                
                <Input 
                   label="Nome da Empresa"
                   name="companyName"
                   value={settings.companyName}
                   onChange={handleChange}
                />

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Cabeçalho (Endereço, CNPJ, Contato)</label>
                   <textarea 
                      name="headerText"
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      value={settings.headerText}
                      onChange={handleChange}
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Rodapé (Agradecimentos, Políticas)</label>
                   <textarea 
                      name="footerText"
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      value={settings.footerText}
                      onChange={handleChange}
                   />
                </div>
            </div>

            <div className="bg-white p-6 shadow rounded-lg space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Opções de Exibição</h3>
                
                <div className="space-y-3">
                   <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" name="showLogo" checked={settings.showLogo} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />
                      <span className="text-gray-700">Mostrar Logo</span>
                   </label>
                   <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" name="showCompanyInfo" checked={settings.showCompanyInfo} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />
                      <span className="text-gray-700">Mostrar Dados da Empresa (Cabeçalho)</span>
                   </label>
                   <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" name="showCustomerAddress" checked={settings.showCustomerAddress} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />
                      <span className="text-gray-700">Mostrar Endereço do Cliente</span>
                   </label>
                   <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" name="showSignatureLine" checked={settings.showSignatureLine} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />
                      <span className="text-gray-700">Mostrar Linha de Assinatura</span>
                   </label>
                </div>
            </div>

            <div className="bg-white p-6 shadow rounded-lg space-y-4">
                 <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Logotipo</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 border rounded flex items-center justify-center overflow-hidden relative">
                        {settings.logoUrl ? (
                            <>
                                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                <button 
                                    type="button"
                                    onClick={() => setSettings(p => ({...p, logoUrl: ''}))}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </>
                        ) : (
                            <ImageIcon className="text-gray-400" />
                        )}
                    </div>
                    <div>
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm text-gray-500" />
                        <p className="text-xs text-gray-400 mt-1">Recomendado: 200x200px (Máx 500KB)</p>
                    </div>
                 </div>
            </div>

            <div className="flex justify-end">
                 <Button type="submit" disabled={loading} icon={<Save size={18} />}>
                     {loading ? 'Salvando...' : 'Salvar Configurações'}
                 </Button>
            </div>
         </form>

         {/* Preview Visual */}
         <div className="bg-white p-8 shadow-lg rounded-lg border border-gray-200 h-fit" style={{ minHeight: '600px' }}>
             <h3 className="text-center text-gray-400 text-sm mb-4 uppercase tracking-widest border-b pb-2">Pré-visualização do Documento</h3>
             
             <div className="border border-gray-100 p-8 text-sm">
                 <div className="flex justify-between mb-6">
                     <div className="flex items-start gap-4">
                         {settings.showLogo && settings.logoUrl && (
                             <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                         )}
                         {settings.showCompanyInfo && (
                             <div>
                                 <h2 className="font-bold text-lg">{settings.companyName}</h2>
                                 <p className="whitespace-pre-line text-gray-600 text-xs">{settings.headerText}</p>
                             </div>
                         )}
                     </div>
                     <div className="text-right">
                         <h2 className="font-bold text-xl text-gray-800">ORÇAMENTO</h2>
                         <p className="text-gray-500">#0001</p>
                     </div>
                 </div>

                 <div className="border-t border-b border-gray-200 py-4 mb-6">
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <p className="font-bold text-gray-700">Cliente:</p>
                             <p>João da Silva</p>
                             {settings.showCustomerAddress && (
                                <p className="text-gray-500 text-xs mt-1">Rua Exemplo, 123 - Centro, Cidade - UF</p>
                             )}
                         </div>
                         <div className="text-right">
                             <p className="font-bold text-gray-700">Data:</p>
                             <p>{new Date().toLocaleDateString()}</p>
                         </div>
                     </div>
                 </div>

                 <table className="w-full mb-6">
                     <thead>
                         <tr className="border-b border-gray-300">
                             <th className="text-left py-2">Item</th>
                             <th className="text-center py-2">Qtd</th>
                             <th className="text-right py-2">Preço</th>
                             <th className="text-right py-2">Total</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr className="border-b border-gray-100">
                             <td className="py-2">Produto Exemplo A</td>
                             <td className="text-center">2</td>
                             <td className="text-right">R$ 50,00</td>
                             <td className="text-right">R$ 100,00</td>
                         </tr>
                         <tr className="border-b border-gray-100">
                             <td className="py-2">Serviço Exemplo B</td>
                             <td className="text-center">1</td>
                             <td className="text-right">R$ 150,00</td>
                             <td className="text-right">R$ 150,00</td>
                         </tr>
                     </tbody>
                 </table>

                 <div className="flex justify-end mb-8">
                     <div className="text-right">
                         <p className="text-xl font-bold">Total: R$ 250,00</p>
                     </div>
                 </div>

                 <div className="mb-8">
                     <p className="font-bold text-xs text-gray-700">Observações:</p>
                     <p className="text-xs text-gray-500 italic">Validade da proposta: 15 dias.</p>
                 </div>

                 {settings.showSignatureLine && (
                     <div className="mt-12 pt-8 border-t border-gray-300 w-1/2 mx-auto text-center">
                         <p className="text-xs text-gray-500">Assinatura do Responsável</p>
                     </div>
                 )}

                 <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
                     <p className="whitespace-pre-line">{settings.footerText}</p>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};