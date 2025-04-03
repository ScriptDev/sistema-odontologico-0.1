import notificationService from './NotificationService';

class BackupService {
  constructor() {
    this.backupList = JSON.parse(localStorage.getItem('backups') || '[]');
    this.storageKeys = [
      'usuarios',
      'pontos',
      'escalas',
      'pacientes',
      'atendimentos',
      'notifications'
    ];
  }
  
  // Obter lista de backups
  getBackups() {
    return [...this.backupList];
  }
  
  // Criar um novo backup
  createBackup(name, description = '') {
    try {
      // Coletar dados de todos os storageKeys
      const data = {};
      this.storageKeys.forEach(key => {
        data[key] = localStorage.getItem(key) || null;
      });
      
      // Criar metadados do backup
      const backup = {
        id: Date.now().toString(),
        name: name || `Backup ${new Date().toLocaleDateString('pt-BR')}`,
        description: description,
        createdAt: new Date().toISOString(),
        size: JSON.stringify(data).length,
        data
      };
      
      // Adicionar à lista de backups
      this.backupList.unshift(backup);
      
      // Limitar número de backups para 10
      if (this.backupList.length > 10) {
        this.backupList = this.backupList.slice(0, 10);
      }
      
      // Salvar lista de backups
      this._saveBackupList();
      
      // Notificar sobre o backup criado
      notificationService.addBackupNotification({
        id: backup.id,
        name: backup.name
      });
      
      return { success: true, backupId: backup.id };
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Restaurar dados de um backup
  restoreBackup(backupId) {
    try {
      // Encontrar backup pelo ID
      const backup = this.backupList.find(b => b.id === backupId);
      
      if (!backup) {
        return { success: false, error: 'Backup não encontrado' };
      }
      
      // Confirmar antes de restaurar (isto seria feito pela UI)
      
      // Restaurar cada item do storage
      Object.entries(backup.data).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        }
      });
      
      return { 
        success: true, 
        message: `Backup "${backup.name}" restaurado com sucesso` 
      };
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Excluir um backup
  deleteBackup(backupId) {
    try {
      const initialLength = this.backupList.length;
      this.backupList = this.backupList.filter(b => b.id !== backupId);
      
      if (this.backupList.length === initialLength) {
        return { success: false, error: 'Backup não encontrado' };
      }
      
      this._saveBackupList();
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir backup:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Exportar um backup para download
  exportBackup(backupId) {
    try {
      const backup = this.backupList.find(b => b.id === backupId);
      
      if (!backup) {
        return { success: false, error: 'Backup não encontrado' };
      }
      
      // Preparar os dados para download
      const exportData = {
        metadata: {
          name: backup.name,
          description: backup.description,
          createdAt: backup.createdAt,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        },
        data: backup.data
      };
      
      // Converter para JSON
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Criar blob e URL para download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Criar link de download e clicar automaticamente
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${backup.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Importar um backup de arquivo
  async importBackupFromFile(file) {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const jsonData = JSON.parse(event.target.result);
            
            // Validar estrutura básica do arquivo
            if (!jsonData.metadata || !jsonData.data) {
              reject({ success: false, error: 'Formato de arquivo inválido' });
              return;
            }
            
            // Criar backup a partir dos dados importados
            const backup = {
              id: Date.now().toString(),
              name: jsonData.metadata.name || `Backup importado ${new Date().toLocaleDateString('pt-BR')}`,
              description: jsonData.metadata.description || 'Importado de arquivo',
              createdAt: jsonData.metadata.createdAt || new Date().toISOString(),
              importedAt: new Date().toISOString(),
              size: event.target.result.length,
              data: jsonData.data
            };
            
            // Adicionar à lista de backups
            this.backupList.unshift(backup);
            
            // Limitar número de backups para 10
            if (this.backupList.length > 10) {
              this.backupList = this.backupList.slice(0, 10);
            }
            
            // Salvar lista de backups
            this._saveBackupList();
            
            // Notificar sobre o backup importado
            notificationService.addBackupNotification({
              id: backup.id,
              name: backup.name
            });
            
            resolve({ success: true, backupId: backup.id });
          } catch (error) {
            reject({ success: false, error: 'Erro ao processar arquivo: ' + error.message });
          }
        };
        
        reader.onerror = () => {
          reject({ success: false, error: 'Erro ao ler arquivo' });
        };
        
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Salvar lista de backups no localStorage
  _saveBackupList() {
    // Criar uma versão simplificada para armazenar (sem os dados completos)
    const simplifiedList = this.backupList.map(backup => ({
      id: backup.id,
      name: backup.name,
      description: backup.description,
      createdAt: backup.createdAt,
      size: backup.size,
      data: backup.data
    }));
    
    localStorage.setItem('backups', JSON.stringify(simplifiedList));
  }
}

// Exporta uma instância única do serviço
const backupService = new BackupService();
export default backupService; 