import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import InterfacePaciente from './components/InterfacePaciente';
import InterfaceDentista from './components/InterfaceDentista';
import InterfaceTSB from './components/InterfaceTSB';
import InterfaceRH from './components/InterfaceRH';
import authService from './services/AuthService';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [visao, setVisao] = useState('paciente'); // Painel de paciente como padrão
  
  // Verificar se já existe um usuário logado ao carregar
  useEffect(() => {
    const usuarioLogado = authService.getUsuarioLogado();
    if (usuarioLogado) {
      setUsuario(usuarioLogado);
      // Se for RH, TSB ou dentista, mostrar interface específica
      if (usuarioLogado.tipo === 'rh' || usuarioLogado.tipo === 'tsb' || usuarioLogado.tipo === 'dentista') {
        setVisao(usuarioLogado.tipo);
      }
    }
  }, []);

  // Função para processar o login
  const handleLogin = (usuarioLogado) => {
    setUsuario(usuarioLogado);
    
    // Definir a visão com base no tipo de usuário
    if (usuarioLogado.tipo === 'rh' || usuarioLogado.tipo === 'tsb' || usuarioLogado.tipo === 'dentista') {
      setVisao(usuarioLogado.tipo);
    } else {
      setVisao('paciente'); // Padrão para pacientes ou outros tipos
    }
  };

  // Função para processar o logout
  const handleLogout = () => {
    authService.logout();
    setUsuario(null);
    setVisao('paciente');
  };

  // Função para trocar a visão (para usuários que têm acesso a múltiplas interfaces)
  const trocarVisao = (novaVisao) => {
    setVisao(novaVisao);
  };

  // Renderizar a interface apropriada com base no estado de login e visão
  const renderInterface = () => {
    // Se não estiver logado, mostrar tela de login
    if (!usuario) {
      return <Login onLogin={handleLogin} />;
    }

    // Mostrar interface com base na visão selecionada
    switch (visao) {
      case 'dentista':
        return <InterfaceDentista usuario={usuario} onLogout={handleLogout} onTrocarVisao={trocarVisao} />;
      case 'tsb':
        return <InterfaceTSB usuario={usuario} onLogout={handleLogout} onTrocarVisao={trocarVisao} />;
      case 'rh':
        return <InterfaceRH usuario={usuario} onLogout={handleLogout} onTrocarVisao={trocarVisao} />;
      case 'paciente':
      default:
        return <InterfacePaciente usuario={usuario} onLogout={handleLogout} onTrocarVisao={trocarVisao} />;
    }
  };

  return (
    <div className="App">
      {renderInterface()}
    </div>
  );
}

export default App;
