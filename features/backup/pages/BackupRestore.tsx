import React, { useState } from 'react';
import { Download, Upload, AlertTriangle, Database, CheckCircle } from 'lucide-react';
import { backupService } from '../services/backupService';
import { Button } from '../../../shared/components/Button';
import { useNavigate } from 'react-router-dom';

export const BackupRestore: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleExport = () => {
    try {
      const backup = backupService.createBackup();
      backupService.downloadBackup(backup);
      alert('Backup gerado com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar backup.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleRestore = async () => {
    if (!file) return;

    if (!window.confirm('ATENÇÃO: Esta ação irá APAGAR todos os dados atuais e substituí-los pelo backup. Deseja continuar?')) {
      return;
    }

    setLoading(true);
    try {
      await backupService.restoreBackup(file);
      alert('Restauração concluída com sucesso! Você será redirecionado para o login.');
      window.location.href = '/login'; // Força refresh completo
    } catch (error: any) {
      console.error(error);
      alert(`Erro na restauração: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="text-blue-600" /> Backup e Restauração
        </h1>
        <p className="text-gray-500 mt-1">Gerencie a segurança dos seus dados exportando ou importando informações do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card Exportação */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Download size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Exportar Dados</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Gera um arquivo <strong>.json</strong> contendo todos os clientes, produtos, vendas, transações financeiras, orçamentos e funcionários cadastrados.
            Salve este arquivo em um local seguro.
          </p>
          <Button onClick={handleExport} className="w-full" icon={<Download size={18} />}>
            Baixar Backup
          </Button>
        </div>

        {/* Card Importação */}
        <div className="bg-white p-6 rounded-lg shadow border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <Upload size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Restaurar Dados</h2>
          </div>
          
          <div className="bg-red-50 p-4 rounded-md mb-6 border border-red-100">
            <h4 className="flex items-center gap-2 text-red-800 font-bold text-sm mb-2">
              <AlertTriangle size={16} /> Zona de Perigo
            </h4>
            <p className="text-xs text-red-700">
              Ao importar um backup, <strong>TODOS</strong> os dados atuais serão substituídos permanentemente. 
              Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo de Backup (.json)</label>
              <input 
                type="file" 
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  border border-gray-300 rounded-md cursor-pointer
                "
              />
            </div>
            
            <Button 
              onClick={handleRestore} 
              disabled={!file || loading} 
              variant="danger" 
              className="w-full" 
              icon={loading ? undefined : <Upload size={18} />}
            >
              {loading ? 'Restaurando...' : 'Restaurar Backup'}
            </Button>
          </div>
        </div>

      </div>

      {/* Info Técnica */}
      <div className="bg-gray-50 p-6 rounded-lg text-sm text-gray-500">
        <h3 className="font-bold text-gray-700 mb-2">Informações Importantes</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>O backup inclui Clientes, Estoque, Vendas, Financeiro, Orçamentos e Funcionários.</li>
          <li>A sessão atual será encerrada após a restauração para garantir a integridade do login.</li>
          <li>O sistema utiliza o formato JSON e valida o campo <code>appName: "SimpleERP"</code> antes de restaurar.</li>
        </ul>
      </div>
    </div>
  );
};