import React, { useState } from 'react';
import authService from '../services/AuthService';
import { UserRound, KeyRound, LogIn } from 'lucide-react';

const Login = ({ onLogin, interfaceRequerida, mensagemBemVindo }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Validação básica
      if (!email || !senha) {
        setErro('Por favor, preencha todos os campos');
        setCarregando(false);
        return;
      }

      // Tentar fazer login
      const resultado = authService.login(email, senha);

      if (!resultado.success) {
        setErro(resultado.message);
        setCarregando(false);
        return;
      }

      // Verificar tipo de usuário se tiver restrição
      if (interfaceRequerida && resultado.user.tipo !== interfaceRequerida) {
        setErro(`Acesso negado. Esta interface é apenas para usuários do tipo "${interfaceRequerida}".`);
        authService.logout();
        setCarregando(false);
        return;
      }

      // Registrar ponto automaticamente
      if (resultado.user.tipo !== 'rh') {
        authService.registrarPontoEntrada(resultado.user.id);
      }

      // Tudo ok, chamar callback de login
      if (onLogin) {
        onLogin(resultado.user);
      }
    } catch (error) {
      setErro('Erro ao fazer login. Tente novamente.');
      console.error('Erro de login:', error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>{mensagemBemVindo || 'Bem-vindo ao Sistema Odontológico'}</h2>
          <p>Faça login para continuar</p>
        </div>

        {erro && <div className="error-message">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <UserRound size={18} />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email"
              disabled={carregando}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              <KeyRound size={18} />
              <span>Senha</span>
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              disabled={carregando}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : (
              <>
                <LogIn size={18} />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        {/* Credenciais de teste para facilitar o acesso */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-600">
          <p className="font-medium text-blue-700 mb-1">Credenciais para teste:</p>
          <ul className="space-y-1">
            <li><strong>Dentista:</strong> marcos@clinica.com / dentista123</li>
            <li><strong>TSB:</strong> juliana@clinica.com / tsb123</li>
            <li><strong>RH:</strong> admin@clinica.com / admin123</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f8fa;
          padding: 20px;
        }
        
        .login-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          padding: 30px;
        }
        
        .login-header {
          margin-bottom: 30px;
          text-align: center;
        }
        
        .login-header h2 {
          color: #2563eb;
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .login-header p {
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .error-message {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: #334155;
        }
        
        input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        input:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .login-button {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 10px;
        }
        
        .login-button:hover {
          background-color: #1d4ed8;
        }
        
        .login-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        .p-3 {
          padding: 0.75rem;
        }

        .bg-blue-50 {
          background-color: #eff6ff;
        }

        .rounded {
          border-radius: 0.25rem;
        }

        .text-sm {
          font-size: 0.875rem;
        }

        .text-gray-600 {
          color: #4b5563;
        }

        .font-medium {
          font-weight: 500;
        }

        .text-blue-700 {
          color: #1d4ed8;
        }

        .mb-1 {
          margin-bottom: 0.25rem;
        }

        .space-y-1 > * + * {
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default Login; 