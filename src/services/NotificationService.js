class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    this.sound = new Audio('/notification.mp3'); // Som de notificação
  }
  
  // Adicionar um listener para notificações
  addListener(callback) {
    this.listeners.push(callback);
    return () => this.removeListener(callback); // Retorna função para remover o listener
  }
  
  // Remover um listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  // Adicionar uma nova notificação
  addNotification(notification) {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.saveNotifications();
    
    // Notificar todos os listeners
    this.notifyListeners();
    
    // Tocar som se a opção estiver ativada
    if (localStorage.getItem('notificationSound') !== 'disabled') {
      try {
        this.sound.play();
      } catch (error) {
        console.log('Não foi possível reproduzir o som de notificação');
      }
    }
    
    // Mostrar notificação do navegador se permitido
    this.showBrowserNotification(newNotification);
    
    return newNotification;
  }
  
  // Marcar notificação como lida
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }
  
  // Marcar todas as notificações como lidas
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveNotifications();
    this.notifyListeners();
  }
  
  // Obter todas as notificações
  getNotifications() {
    return [...this.notifications];
  }
  
  // Obter contagem de notificações não lidas
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }
  
  // Limpar notificações antigas (manter apenas as últimas 100)
  cleanupOldNotifications() {
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
      this.saveNotifications();
    }
  }
  
  // Salvar notificações no localStorage
  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }
  
  // Notificar todos os listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getNotifications());
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }
  
  // Mostrar notificação do navegador
  showBrowserNotification(notification) {
    if (!("Notification" in window)) {
      return; // Navegador não suporta notificações
    }
    
    if (Notification.permission === "granted" && document.visibilityState !== 'visible') {
      new Notification('Sistema Odontológico', {
        body: notification.message,
        icon: '/logo192.png'
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }
  
  // Adicionar notificação de novo paciente
  addNewPatientNotification(patient) {
    const urgencyLabels = {
      1: 'Baixa',
      2: 'Média-baixa',
      3: 'Média',
      4: 'Alta',
      5: 'Emergência'
    };
    
    return this.addNotification({
      type: 'new_patient',
      title: 'Novo Paciente',
      message: `${patient.nome} entrou na fila. Urgência: ${urgencyLabels[patient.urgencia] || patient.urgencia}`,
      patientId: patient.id,
      patientData: patient,
      importance: patient.urgencia >= 4 ? 'high' : (patient.urgencia >= 3 ? 'medium' : 'low')
    });
  }
  
  // Adicionar notificação de confirmação de atendimento
  addConfirmationNotification(patient, confirmedBy) {
    return this.addNotification({
      type: 'confirmation',
      title: 'Atendimento Confirmado',
      message: `Paciente ${patient.nome} foi confirmado por ${confirmedBy}`,
      patientId: patient.id,
      importance: 'medium'
    });
  }
  
  // Adicionar notificação de backup criado
  addBackupNotification(backupInfo) {
    return this.addNotification({
      type: 'backup',
      title: 'Backup Realizado',
      message: `Backup "${backupInfo.name}" foi criado com sucesso`,
      backupId: backupInfo.id,
      importance: 'low'
    });
  }
}

// Exporta uma instância única do serviço
const notificationService = new NotificationService();
export default notificationService; 