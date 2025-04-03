import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Sistema Odontológico</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a 
            href="http://localhost:3001" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-6 bg-indigo-100 hover:bg-indigo-200 rounded-lg text-center transition-all transform hover:scale-105"
          >
            <div className="text-5xl font-bold text-indigo-700 mb-4">👨‍⚕️</div>
            <h2 className="text-xl font-semibold text-indigo-800 mb-2">Interface do Dentista</h2>
            <p className="text-indigo-700">Acesse o painel do cirurgião-dentista</p>
            <div className="mt-4 text-xs text-indigo-500">Porta 3001</div>
          </a>
          
          <a 
            href="http://localhost:3002" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-6 bg-blue-100 hover:bg-blue-200 rounded-lg text-center transition-all transform hover:scale-105"
          >
            <div className="text-5xl font-bold text-blue-700 mb-4">👩‍⚕️</div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Interface do TSB</h2>
            <p className="text-blue-700">Acesse o painel do técnico em saúde bucal</p>
            <div className="mt-4 text-xs text-blue-500">Porta 3002</div>
          </a>
          
          <a 
            href="http://localhost:3003" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-6 bg-green-100 hover:bg-green-200 rounded-lg text-center transition-all transform hover:scale-105"
          >
            <div className="text-5xl font-bold text-green-700 mb-4">👨‍👩‍👧</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Interface do Paciente</h2>
            <p className="text-green-700">Acesse o painel do paciente</p>
            <div className="mt-4 text-xs text-green-500">Porta 3003</div>
          </a>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p>Para iniciar todos os serviços simultaneamente, execute no terminal: <code className="bg-gray-200 px-2 py-1 rounded">npm run start-all</code></p>
          <p className="mt-2">Para iniciar apenas um serviço, execute:</p>
          <ul className="list-disc ml-6 mt-1">
            <li><code className="bg-gray-200 px-2 py-1 rounded">npm run start-dentista</code> - Interface do dentista (porta 3001)</li>
            <li><code className="bg-gray-200 px-2 py-1 rounded">npm run start-tsb</code> - Interface do TSB (porta 3002)</li>
            <li><code className="bg-gray-200 px-2 py-1 rounded">npm run start-paciente</code> - Interface do paciente (porta 3003)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
