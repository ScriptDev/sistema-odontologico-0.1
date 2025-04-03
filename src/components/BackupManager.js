import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Download, Upload, Trash2, RefreshCw, Archive, CheckCircle, 
  AlertTriangle, X, FileText, Calendar, Info
} from 'lucide-react';
import backupService from '../services/BackupService';
import notificationService from '../services/NotificationService';

const BackupManager = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [newBackupName, setNewBackupName] = useState('');
  const [newBackupDescription, setNewBackupDescription] = useState('');
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);
  
  // Carregar backups ao iniciar
  useEffect(() => {
    loadBackups();
  }, []);
  
  const loadBackups = () => {
    try {
      const backupList = backupService.getBackups();
      setBackups(backupList);
    } catch (error) {
      showMessage('error', 'Erro ao carregar backups: ' + error.message);
    }
  };
  
  // Exibir mensagem temporária
  const showMessage = (type, text, duration = 5000) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, duration);
  };
  
  // Formatar tamanho do backup
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Criar um novo backup
  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      
      const result = await backupService.createBackup(
        newBackupName || undefined, 
        newBackupDescription || undefined
      );
      
      if (result.success) {
        showMessage('success', 'Backup criado com sucesso');
        setNewBackupName('');
        setNewBackupDescription('');
        loadBackups();
      } else {
        showMessage('error', 'Erro ao criar backup: ' + result.error);
      }
    } catch (error) {
      showMessage('error', 'Erro ao criar backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Exportar backup para arquivo
  const handleExportBackup = async (backupId) => {
    try {
      setLoading(true);
      const result = await backupService.exportBackup(backupId);
      
      if (!result.success) {
        showMessage('error', 'Erro ao exportar backup: ' + result.error);
      }
    } catch (error) {
      showMessage('error', 'Erro ao exportar backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Importar backup de arquivo
  const handleImportBackup = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setLoading(true);
      const result = await backupService.importBackupFromFile(file);
      
      if (result.success) {
        showMessage('success', 'Backup importado com sucesso');
        loadBackups();
      } else {
        showMessage('error', 'Erro ao importar backup: ' + result.error);
      }
    } catch (error) {
      showMessage('error', 'Erro ao importar backup: ' + error.message);
    } finally {
      setLoading(false);
      e.target.value = ''; // Limpar input para permitir selecionar o mesmo arquivo
    }
  };
  
  // Confirmar exclusão de backup
  const confirmDeleteBackup = (backup) => {
    setConfirmAction({
      type: 'delete',
      backup,
      title: 'Excluir Backup',
      message: `Tem certeza que deseja excluir o backup "${backup.name}"?`,
      confirmButtonText: 'Excluir',
      confirmButtonColor: 'bg-red-600 hover:bg-red-700'
    });
  };
  
  // Confirmar restauração de backup
  const confirmRestoreBackup = (backup) => {
    setConfirmAction({
      type: 'restore',
      backup,
      title: 'Restaurar Backup',
      message: `Tem certeza que deseja restaurar o backup "${backup.name}"? Esta ação substituirá todos os dados atuais do sistema.`,
      confirmButtonText: 'Restaurar',
      confirmButtonColor: 'bg-amber-600 hover:bg-amber-700'
    });
  };
  
  // Executar ação confirmada
  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    
    const { type, backup } = confirmAction;
    
    try {
      setLoading(true);
      
      if (type === 'delete') {
        const result = await backupService.deleteBackup(backup.id);
        
        if (result.success) {
          showMessage('success', `Backup "${backup.name}" excluído com sucesso`);
          loadBackups();
        } else {
          showMessage('error', 'Erro ao excluir backup: ' + result.error);
        }
      } else if (type === 'restore') {
        const result = await backupService.restoreBackup(backup.id);
        
        if (result.success) {
          showMessage('success', `Backup "${backup.name}" restaurado com sucesso. Recarregue a página para ver as alterações.`);
          notificationService.addNotification({
            type: 'restore',
            title: 'Sistema Restaurado',
            message: `O sistema foi restaurado para o backup "${backup.name}". Algumas áreas podem precisar ser recarregadas.`,
            importance: 'high'
          });
        } else {
          showMessage('error', 'Erro ao restaurar backup: ' + result.error);
        }
      }
    } catch (error) {
      showMessage('error', `Erro ao ${type === 'delete' ? 'excluir' : 'restaurar'} backup: ` + error.message);
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Archive className="mr-2 text-blue-600" size={24} />
          Gerenciador de Backup
        </h2>
      </div>
      
      {/* Mensagens de feedback */}
      {message && (
        <div className={`m-4 p-3 rounded-md flex items-start ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={18} className="mt-0.5 mr-2 flex-shrink-0" />
          ) : (
            <AlertTriangle size={18} className="mt-0.5 mr-2 flex-shrink-0" />
          )}
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto p-1 rounded-full hover:bg-gray-200 focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Criar novo backup */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Criar Novo Backup</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Backup</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome do backup"
              value={newBackupName}
              onChange={(e) => setNewBackupName(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descrição do backup"
              value={newBackupDescription}
              onChange={(e) => setNewBackupDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            onClick={handleCreateBackup}
            disabled={loading}
          >
            <Save size={18} className="mr-2" />
            {loading ? 'Criando...' : 'Criar Backup'}
          </button>
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
            onClick={handleImportBackup}
            disabled={loading}
          >
            <Upload size={18} className="mr-2" />
            Importar
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      {/* Lista de backups */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Backups Disponíveis</h3>
        
        {backups.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md">
            <Archive className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">Nenhum backup encontrado</p>
            <p className="text-sm text-gray-500 mt-1">Crie um novo backup para proteger seus dados</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText size={20} className="text-blue-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                          {backup.description && (
                            <div className="text-sm text-gray-500">{backup.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={16} className="mr-1 text-gray-400" />
                        {formatDate(backup.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSize(backup.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="p-1.5 text-blue-600 rounded hover:bg-blue-100"
                          onClick={() => handleExportBackup(backup.id)}
                          title="Exportar backup"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          className="p-1.5 text-amber-600 rounded hover:bg-amber-100"
                          onClick={() => confirmRestoreBackup(backup)}
                          title="Restaurar backup"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button
                          className="p-1.5 text-red-600 rounded hover:bg-red-100"
                          onClick={() => confirmDeleteBackup(backup)}
                          title="Excluir backup"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Nota informativa */}
      <div className="p-4 border-t border-gray-100 bg-blue-50">
        <div className="flex items-start">
          <Info size={18} className="mt-0.5 mr-2 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p>Os backups são armazenados localmente no seu navegador. Recomendamos exportar regularmente os backups para seu computador para maior segurança.</p>
            <p className="mt-1">O sistema mantém no máximo 10 backups. Os mais antigos serão removidos automaticamente quando esse limite for atingido.</p>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmação */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{confirmAction.title}</h3>
            <p className="text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
                onClick={() => setConfirmAction(null)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 text-white rounded-md focus:outline-none ${confirmAction.confirmButtonColor}`}
                onClick={executeConfirmedAction}
                disabled={loading}
              >
                {loading ? 'Processando...' : confirmAction.confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManager; 