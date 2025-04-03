import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AppBasic from './AppBasic';
import InterfaceDentista from './components/InterfaceDentista';
import InterfaceTSB from './components/InterfaceTSB';
import InterfacePaciente from './components/InterfacePaciente';
import InterfaceRH from './components/InterfaceRH';
import reportWebVitals from './reportWebVitals';
import './services/NotificationService';
import './services/BackupService';

// Capturar a porta atual do servidor e converter para número
const currentPort = window.location.port || '3000';
const portNumber = parseInt(currentPort, 10);

console.log('INICIANDO APLICAÇÃO NA PORTA:', portNumber);
console.log('URL completa:', window.location.href);

// Determinar qual interface renderizar com base na porta atual
let ComponentToRender;
let interfaceName;

switch(portNumber) {
  case 3001:
    ComponentToRender = InterfaceDentista;
    interfaceName = 'Interface do Dentista';
    document.title = 'Sistema Odontológico - Dentista';
    break;
  case 3002:
    ComponentToRender = InterfaceTSB;
    interfaceName = 'Interface do TSB';
    document.title = 'Sistema Odontológico - TSB';
    break;
  case 3003:
    ComponentToRender = InterfacePaciente;
    interfaceName = 'Interface do Paciente';
    document.title = 'Sistema Odontológico - Paciente';
    break;
  case 3004:
    ComponentToRender = InterfaceRH;
    interfaceName = 'Interface do RH';
    document.title = 'Sistema Odontológico - RH';
    break;
  default:
    ComponentToRender = AppBasic; // Usando AppBasic em vez de App
    interfaceName = 'Menu Principal';
    document.title = 'Sistema Odontológico - Menu';
}

console.log(`Carregando: ${interfaceName} (Porta ${currentPort})`);

// Verificar se os componentes estão disponíveis e seus tipos
console.log('Componente escolhido:', {
  tipo: typeof ComponentToRender,
  nome: ComponentToRender?.name || 'Sem nome',
  éFunção: typeof ComponentToRender === 'function'
});

const rootElement = document.getElementById('root');
console.log('Elemento root encontrado:', !!rootElement);

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('Root criado com sucesso');
    
    root.render(
      <React.StrictMode>
        <ComponentToRender />
      </React.StrictMode>
    );
    console.log('Renderização iniciada');
  } catch (error) {
    console.error('Erro na renderização:', error);
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
