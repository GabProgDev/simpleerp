import React, { useEffect, useState } from 'react';
import { Save, MessageSquare, Plus, Trash2, Power, AlertCircle } from 'lucide-react';
import { chatbotService } from '../services/chatbotService';
import { ChatbotConfig, MenuOption } from '../types/ChatbotConfig';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

export const ChatbotConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);

  // Estados locais para inputs complexos (listas)
  const [triggerInput, setTriggerInput] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await chatbotService.getConfig();
      setConfig(data);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar configurações do Chatbot.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    try {
      await chatbotService.updateConfig(config);
      alert('Configurações salvas! O bot será atualizado automaticamente em instantes.');
    } catch (error) {
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ChatbotConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  // Gerenciamento de Palavras-Chave de Gatilho
  const addTrigger = () => {
    if (!config || !triggerInput.trim()) return;
    if (!config.triggerKeywords.includes(triggerInput.trim().toLowerCase())) {
      updateField('triggerKeywords', [...config.triggerKeywords, triggerInput.trim().toLowerCase()]);
    }
    setTriggerInput('');
  };

  const removeTrigger = (keyword: string) => {
    if (!config) return;
    updateField('triggerKeywords', config.triggerKeywords.filter(k => k !== keyword));
  };

  // Gerenciamento de Opções do Menu
  const addMenuOption = () => {
    if (!config) return;
    const newOption: MenuOption = {
      label: 'Nova Opção',
      triggers: [(config.menuOptions.length + 1).toString()],
      action: 'TEXT',
      customText: ''
    };
    updateField('menuOptions', [...config.menuOptions, newOption]);
  };

  const updateMenuOption = (index: number, field: keyof MenuOption, value: any) => {
    if (!config) return;
    const newOptions = [...config.menuOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateField('menuOptions', newOptions);
  };

  const removeMenuOption = (index: number) => {
    if (!config) return;
    const newOptions = config.menuOptions.filter((_, i) => i !== index);
    updateField('menuOptions', newOptions);
  };

  if (loading) return <div className="p-8 text-center">Carregando configurações...</div>;
  if (!config) return <div className="p-8 text-center">Erro ao carregar config.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-green-600" /> Chatbot WhatsApp
          </h1>
          <p className="text-sm text-gray-500">Configure o comportamento do seu assistente virtual</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={config.enabled ? 'danger' : 'primary'} 
            onClick={() => updateField('enabled', !config.enabled)}
            icon={<Power size={18} />}
          >
            {config.enabled ? 'Desativar Bot' : 'Ativar Bot'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Configurações Gerais */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Configurações Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Número do Admin (para encaminhamento)"
              value={config.adminNumber}
              onChange={e => updateField('adminNumber', e.target.value)}
              placeholder="5511999999999"
              required
            />
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave de Ativação (Início)</label>
              <div className="flex gap-2 mb-2">
                <input 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={triggerInput}
                  onChange={e => setTriggerInput(e.target.value)}
                  placeholder="ex: oi"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                />
                <Button type="button" size="sm" onClick={addTrigger} icon={<Plus size={16} />}>Adic.</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.triggerKeywords.map(k => (
                  <span key={k} className="bg-gray-100 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {k} <button type="button" onClick={() => removeTrigger(k)}><Trash2 size={12} className="text-red-500"/></button>
                  </span>
                ))}
              </div>
            </div>
            
            <Input 
              label="Palavra para Voltar ao Menu"
              value={config.backToMenuKeyword}
              onChange={e => updateField('backToMenuKeyword', e.target.value)}
              placeholder="menu"
            />
          </div>
        </div>

        {/* Textos de Fluxo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Textos e Mensagens</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Saudação Inicial</label>
               <p className="text-xs text-gray-500 mb-1">Use <code>{'{nome}'}</code> para inserir o nome do cliente.</p>
               <textarea 
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={config.greetingTemplate}
                  onChange={e => updateField('greetingTemplate', e.target.value)}
               />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Menu (Cabeçalho)</label>
               <textarea 
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={config.menuText}
                  onChange={e => updateField('menuText', e.target.value)}
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Resposta: Nossos Serviços</label>
               <textarea 
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={config.servicesText}
                  onChange={e => updateField('servicesText', e.target.value)}
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Resposta: Horário de Atendimento</label>
               <textarea 
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={config.hoursText}
                  onChange={e => updateField('hoursText', e.target.value)}
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Resposta: Opção Inválida</label>
               <textarea 
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={config.invalidOptionText}
                  onChange={e => updateField('invalidOptionText', e.target.value)}
               />
            </div>
          </div>
        </div>

        {/* Modo Atendente */}
        <div className="bg-white p-6 rounded-lg shadow">
           <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
               Modo Atendente (Encaminhamento)
           </h2>
           <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4 flex items-center gap-2">
               <AlertCircle size={16} />
               <span>Mensagens enviadas neste modo serão encaminhadas para o <strong>Número do Admin</strong> configurado acima.</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Introdução</label>
               <p className="text-xs text-gray-500 mb-1">Enviada ao cliente quando ele escolhe falar com atendente.</p>
               <textarea 
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={config.attendantIntroText}
                  onChange={e => updateField('attendantIntroText', e.target.value)}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Recebimento</label>
               <p className="text-xs text-gray-500 mb-1">Resposta automática quando o cliente manda msg no modo atendente.</p>
               <textarea 
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={config.attendantReceivedText}
                  onChange={e => updateField('attendantReceivedText', e.target.value)}
               />
             </div>
           </div>
        </div>

        {/* Botões do Menu */}
        <div className="bg-white p-6 rounded-lg shadow">
           <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-800">Opções do Menu</h2>
              <Button type="button" size="sm" onClick={addMenuOption} icon={<Plus size={16} />}>Adicionar Opção</Button>
           </div>
           
           <div className="space-y-4">
              {config.menuOptions.map((opt, idx) => (
                  <div key={idx} className="border border-gray-200 rounded p-4 bg-gray-50 relative">
                      <button 
                        type="button" 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => removeMenuOption(idx)}
                      >
                          <Trash2 size={16} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input 
                             label="Rótulo (Texto da Opção)" 
                             value={opt.label} 
                             onChange={e => updateMenuOption(idx, 'label', e.target.value)}
                             placeholder="Ex: Financeiro"
                          />
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Gatilhos (Separados por vírgula)</label>
                              <input 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                value={opt.triggers.join(', ')}
                                onChange={e => updateMenuOption(idx, 'triggers', e.target.value.split(',').map(s => s.trim()))}
                                placeholder="ex: 1, financeiro, fin"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ação / Resposta</label>
                              <select 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                value={opt.action}
                                onChange={e => updateMenuOption(idx, 'action', e.target.value)}
                              >
                                  <option value="SERVICES">Mostrar Texto de Serviços</option>
                                  <option value="HOURS">Mostrar Horários</option>
                                  <option value="ATTENDANT">Iniciar Modo Atendente</option>
                                  <option value="TEXT">Texto Personalizado</option>
                              </select>
                          </div>
                          
                          {opt.action === 'TEXT' && (
                              <div className="md:col-span-3">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto de Resposta Personalizado</label>
                                  <textarea 
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                    value={opt.customText || ''}
                                    onChange={e => updateMenuOption(idx, 'customText', e.target.value)}
                                    placeholder="Digite a resposta para esta opção..."
                                  />
                              </div>
                          )}
                      </div>
                  </div>
              ))}
           </div>
        </div>

        <div className="flex justify-end gap-3 sticky bottom-4 bg-white p-4 rounded shadow-lg border border-gray-100 z-10">
            <Button type="button" variant="secondary" onClick={loadConfig}>Restaurar</Button>
            <Button type="submit" disabled={saving} icon={<Save size={18} />}>
                {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
        </div>

      </form>
    </div>
  );
};
