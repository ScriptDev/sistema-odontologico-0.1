import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import InterfacePaciente from './components/InterfacePaciente';
import reportWebVitals from './reportWebVitals';

console.log('Carregando Interface do Paciente na porta 3003');
document.title = 'Sistema Odontológico - Paciente';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <InterfacePaciente />
  </React.StrictMode>
);

reportWebVitals(); 