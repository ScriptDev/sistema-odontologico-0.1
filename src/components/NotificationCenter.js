import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, CheckCircle, Users, AlertTriangle, X, Settings, Volume2, VolumeX } from 'lucide-react';
import notificationService from '../services/NotificationService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('notificationSound') !== 'disabled'
  );
  
  const notificationRef = useRef(null);
  
  // Atualizar notificações quando o componente for montado
  useEffect(() => {
    const updateNotifications = (newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    };
    
    // Obter notificações iniciais
    updateNotifications(notificationService.getNotifications());
    
    // Adicionar listener para atualizações
    const removeListener = notificationService.addListener(updateNotifications);
    
    // Efeito de limpeza - remover listener quando o componente for desmontado
    return () => {
      removeListener();
    };
  }, []);
  
  // Detectar cliques fora do centro de notificações para fechá-lo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Manipular toggle do centro de notificações
  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
    
    // Se estiver abrindo, marcar todas as notificações como lidas
    if (!isOpen && unreadCount > 0) {
      notificationService.markAllAsRead();
    }
  };
  
  // Alternar som de notificação
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('notificationSound', newValue ? 'enabled' : 'disabled');
  };
  
  // Solicitar permissão para notificações do navegador
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Este navegador não suporta notificações.");
      return;
    }
    
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      alert(permission === "granted" 
        ? "Notificações habilitadas!" 
        : "Notificações negadas. Você pode mudar isso nas configurações do navegador.");
    } else {
      alert("Notificações já estão habilitadas!");
    }
  };
  
  // Formatar horário da notificação
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Obter cor baseada na importância
  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  // Obter ícone baseado no tipo
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_patient':
        return <Users size={18} className="mr-2 flex-shrink-0" />;
      case 'backup':
        return <CheckCircle size={18} className="mr-2 flex-shrink-0" />;
      case 'confirmation':
        return <CheckCircle size={18} className="mr-2 flex-shrink-0" />;
      default:
        return <AlertTriangle size={18} className="mr-2 flex-shrink-0" />;
    }
  };
  
  return (
    <div className="relative" ref={notificationRef}>
      {/* Botão de notificações */}
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
        onClick={toggleNotificationCenter}
      >
        <Bell size={24} className="text-gray-600" />
        
        {/* Contador de notificações não lidas */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Painel de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center px-4 py-3 bg-blue-600 text-white">
            <h3 className="text-lg font-medium">Notificações</h3>
            <div className="flex space-x-2">
              <button 
                onClick={toggleSound} 
                className="p-1 rounded-full hover:bg-blue-500 focus:outline-none" 
                title={soundEnabled ? "Desativar som" : "Ativar som"}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button 
                onClick={requestNotificationPermission} 
                className="p-1 rounded-full hover:bg-blue-500 focus:outline-none"
                title="Configurar notificações"
              >
                <Settings size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 rounded-full hover:bg-blue-500 focus:outline-none"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 ${notification.read ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full ${getImportanceColor(notification.importance)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <BellOff className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p>Nenhuma notificação</p>
              </div>
            )}
          </div>
          
          {/* Rodapé */}
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
            {notifications.length > 0 ? (
              <button 
                onClick={() => {
                  notificationService.cleanupOldNotifications();
                }} 
                className="hover:text-blue-600"
              >
                Limpar notificações antigas
              </button>
            ) : (
              <span>Sistema de notificações ativo</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 