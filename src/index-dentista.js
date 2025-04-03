import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import InterfaceDentista from './components/InterfaceDentista';
import reportWebVitals from './reportWebVitals';

console.log('Carregando Interface do Dentista na porta 3001');
document.title = 'Sistema Odontológico - Dentista';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <InterfaceDentista />
  </React.StrictMode>
);

reportWebVitals(); 