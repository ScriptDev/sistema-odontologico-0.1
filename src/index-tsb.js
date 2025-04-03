import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import InterfaceTSB from './components/InterfaceTSB';
import reportWebVitals from './reportWebVitals';

console.log('Carregando Interface do TSB na porta 3002');
document.title = 'Sistema Odontológico - TSB';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <InterfaceTSB />
  </React.StrictMode>
);

reportWebVitals(); 