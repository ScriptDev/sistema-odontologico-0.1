import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Home, 
  FileText, 
  BadgeCheck, 
  Clock, 
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import authService from '../services/AuthService';

const FormularioFuncionario = ({ funcionario, modoEdicao, onSalvar, onCancelar }) => {
  // Estado para dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    tipo: 'dentista',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    endereco: '',
    senha: '',
    confirmarSenha: '',
    registro: '',
    especialidade: '',
    cargaHoraria: 40
  });
  
  // Estados para validação e feedback
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  
  // Carregar dados do funcionário se estiver em modo de edição
  useEffect(() => {
    if (modoEdicao && funcionario) {
      setFormData({
        nome: funcionario.nome || '',
        email: funcionario.email || '',
        tipo: funcionario.tipo || 'dentista',
        cpf: funcionario.cpf || '',
        dataNascimento: funcionario.dataNascimento || '',
        telefone: funcionario.telefone || '',
        endereco: funcionario.endereco || '',
        senha: '', // Não preenchemos a senha por segurança
        confirmarSenha: '',
        registro: funcionario.registro || '',
        especialidade: funcionario.especialidade || '',
        cargaHoraria: funcionario.cargaHoraria || 40
      });
    } else {
      // Resetar formulário para modo de criação
      setFormData({
        nome: '',
        email: '',
        tipo: 'dentista',
        cpf: '',
        dataNascimento: '',
        telefone: '',
        endereco: '',
        senha: '',
        confirmarSenha: '',
        registro: '',
        especialidade: '',
        cargaHoraria: 40
      });
    }
    
    // Limpar mensagens e erros
    setErros({});
    setMensagemSucesso('');
  }, [funcionario, modoEdicao]);
  
  // Função para lidar com mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação especial para alguns campos
    let valorFormatado = value;
    
    if (name === 'cpf') {
      // Formatar CPF: xxx.xxx.xxx-xx
      valorFormatado = value
        .replace(/\D/g, '') // Remove caracteres não numéricos
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
    
    if (name === 'telefone') {
      // Formatar telefone: (xx) xxxxx-xxxx
      valorFormatado = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: valorFormatado
    }));
    
    // Limpar erro específico quando o campo é alterado
    if (erros[name]) {
      setErros(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validar formulário antes de enviar
  const validarFormulario = () => {
    const novosErros = {};
    
    // Validar campos obrigatórios
    if (!formData.nome) novosErros.nome = 'Nome é obrigatório';
    if (!formData.email) novosErros.email = 'Email é obrigatório';
    if (!formData.cpf) novosErros.cpf = 'CPF é obrigatório';
    if (!formData.dataNascimento) novosErros.dataNascimento = 'Data de nascimento é obrigatória';
    if (!formData.telefone) novosErros.telefone = 'Telefone é obrigatório';
    if (!formData.endereco) novosErros.endereco = 'Endereço é obrigatório';
    
    // Validar senha apenas para novos funcionários ou ao alterar senha
    if (!modoEdicao || formData.senha) {
      if (!modoEdicao && !formData.senha) novosErros.senha = 'Senha é obrigatória';
      if (formData.senha && formData.senha.length < 6) novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
      if (formData.senha !== formData.confirmarSenha) novosErros.confirmarSenha = 'As senhas não conferem';
    }
    
    // Validar campos específicos por tipo de funcionário
    if (formData.tipo === 'dentista' && !formData.registro) {
      novosErros.registro = 'CRO é obrigatório';
    }
    
    if (formData.tipo === 'dentista' && !formData.especialidade) {
      novosErros.especialidade = 'Especialidade é obrigatória';
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      novosErros.email = 'Formato de email inválido';
    }
    
    // Validar formato de CPF (considerando apenas os dígitos)
    const cpfSemFormatacao = formData.cpf.replace(/\D/g, '');
    if (cpfSemFormatacao && cpfSemFormatacao.length !== 11) {
      novosErros.cpf = 'CPF deve conter 11 dígitos';
    }
    
    // Validar idade mínima (18 anos)
    if (formData.dataNascimento) {
      const hoje = new Date();
      const dataNasc = new Date(formData.dataNascimento);
      const idade = hoje.getFullYear() - dataNasc.getFullYear();
      const mesAtual = hoje.getMonth();
      const mesNasc = dataNasc.getMonth();
      
      if (idade < 18 || (idade === 18 && mesAtual < mesNasc)) {
        novosErros.dataNascimento = 'Funcionário deve ter pelo menos 18 anos';
      }
    }
    
    // Verificar se email já existe (apenas para novos funcionários)
    if (!modoEdicao && formData.email) {
      if (authService.emailExiste(formData.email)) {
        novosErros.email = 'Este email já está cadastrado';
      }
    }
    
    // Verificar se CPF já existe (apenas para novos funcionários)
    if (!modoEdicao && formData.cpf) {
      if (authService.cpfExiste(formData.cpf)) {
        novosErros.cpf = 'Este CPF já está cadastrado';
      }
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemSucesso('');
    
    // Validar formulário
    if (!validarFormulario()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setCarregando(true);
    
    try {
      // Preparar dados para envio
      const dadosParaEnviar = {
        ...formData
      };
      
      // Remover campos desnecessários
      delete dadosParaEnviar.confirmarSenha;
      
      // Se não houver senha nova, remover do objeto
      if (modoEdicao && !dadosParaEnviar.senha) {
        delete dadosParaEnviar.senha;
      }
      
      let resultado;
      
      if (modoEdicao) {
        // Atualizar funcionário existente
        resultado = authService.atualizarUsuario(funcionario.id, dadosParaEnviar);
        
        if (resultado) {
          setMensagemSucesso('Funcionário atualizado com sucesso!');
          
          // Esperar um pouco para mostrar a mensagem de sucesso
          setTimeout(() => {
            if (onSalvar) onSalvar();
          }, 1500);
        } else {
          setErros({ geral: 'Erro ao atualizar funcionário. Tente novamente.' });
        }
      } else {
        // Criar novo funcionário
        resultado = authService.adicionarUsuario(dadosParaEnviar);
        
        if (resultado) {
          setMensagemSucesso('Funcionário cadastrado com sucesso!');
          
          // Limpar formulário após criação bem-sucedida
          setFormData({
            nome: '',
            email: '',
            tipo: 'dentista',
            cpf: '',
            dataNascimento: '',
            telefone: '',
            endereco: '',
            senha: '',
            confirmarSenha: '',
            registro: '',
            especialidade: '',
            cargaHoraria: 40
          });
          
          // Esperar um pouco para mostrar a mensagem de sucesso
          setTimeout(() => {
            if (onSalvar) onSalvar();
          }, 1500);
        } else {
          setErros({ geral: 'Erro ao cadastrar funcionário. Tente novamente.' });
        }
      }
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      setErros({ geral: 'Ocorreu um erro ao processar a solicitação. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };
  
  return (
    <div className="formulario-container">
      <div className="formulario-header">
        <h2>{modoEdicao ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}</h2>
      </div>
      
      {mensagemSucesso && (
        <div className="mensagem-sucesso">
          {mensagemSucesso}
        </div>
      )}
      
      {erros.geral && (
        <div className="mensagem-erro">
          <AlertTriangle size={18} />
          <span>{erros.geral}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Informações Pessoais</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">
                <User size={18} />
                <span>Nome Completo*</span>
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome completo"
              />
              {erros.nome && <span className="erro-campo">{erros.nome}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="tipo">
                <BadgeCheck size={18} />
                <span>Tipo de Funcionário*</span>
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="dentista">Dentista</option>
                <option value="tsb">TSB</option>
                <option value="asb">ASB</option>
                <option value="rh">RH</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cpf">
                <FileText size={18} />
                <span>CPF*</span>
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {erros.cpf && <span className="erro-campo">{erros.cpf}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="dataNascimento">
                <Calendar size={18} />
                <span>Data de Nascimento*</span>
              </label>
              <input
                type="date"
                id="dataNascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
              />
              {erros.dataNascimento && <span className="erro-campo">{erros.dataNascimento}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Contato</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                <span>Email*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
              {erros.email && <span className="erro-campo">{erros.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="telefone">
                <Phone size={18} />
                <span>Telefone*</span>
              </label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              {erros.telefone && <span className="erro-campo">{erros.telefone}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="endereco">
                <Home size={18} />
                <span>Endereço*</span>
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Endereço completo"
              />
              {erros.endereco && <span className="erro-campo">{erros.endereco}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Acesso ao Sistema</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">
                <KeyRound size={18} />
                <span>{modoEdicao ? 'Nova Senha' : 'Senha*'}</span>
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder={modoEdicao ? "Deixe em branco para manter a atual" : "Mínimo de 6 caracteres"}
              />
              {erros.senha && <span className="erro-campo">{erros.senha}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmarSenha">
                <KeyRound size={18} />
                <span>Confirmar Senha</span>
              </label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="Repita a senha"
              />
              {erros.confirmarSenha && <span className="erro-campo">{erros.confirmarSenha}</span>}
            </div>
          </div>
        </div>
        
        {(formData.tipo === 'dentista' || formData.tipo === 'tsb' || formData.tipo === 'asb') && (
          <div className="form-section">
            <h3>Informações Profissionais</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registro">
                  <FileText size={18} />
                  <span>{formData.tipo === 'dentista' ? 'CRO*' : 'Registro Profissional'}</span>
                </label>
                <input
                  type="text"
                  id="registro"
                  name="registro"
                  value={formData.registro}
                  onChange={handleChange}
                  placeholder="Número de registro"
                />
                {erros.registro && <span className="erro-campo">{erros.registro}</span>}
              </div>
              
              {formData.tipo === 'dentista' && (
                <div className="form-group">
                  <label htmlFor="especialidade">
                    <BadgeCheck size={18} />
                    <span>Especialidade*</span>
                  </label>
                  <input
                    type="text"
                    id="especialidade"
                    name="especialidade"
                    value={formData.especialidade}
                    onChange={handleChange}
                    placeholder="Especialidade"
                  />
                  {erros.especialidade && <span className="erro-campo">{erros.especialidade}</span>}
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cargaHoraria">
                  <Clock size={18} />
                  <span>Carga Horária Semanal (horas)</span>
                </label>
                <input
                  type="number"
                  id="cargaHoraria"
                  name="cargaHoraria"
                  value={formData.cargaHoraria}
                  onChange={handleChange}
                  min="10"
                  max="60"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancelar"
            onClick={onCancelar}
            disabled={carregando}
          >
            <X size={18} />
            <span>Cancelar</span>
          </button>
          
          <button 
            type="submit" 
            className="btn-salvar"
            disabled={carregando}
          >
            <Save size={18} />
            <span>{carregando ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </form>
      
      <style jsx>{`
        .formulario-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          padding: 24px;
        }
        
        .formulario-header {
          margin-bottom: 24px;
        }
        
        .formulario-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }
        
        .mensagem-sucesso {
          background-color: #dcfce7;
          color: #166534;
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }
        
        .mensagem-erro {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .form-section {
          margin-bottom: 32px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 24px;
        }
        
        .form-section:last-of-type {
          border-bottom: none;
        }
        
        .form-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
          margin: 0 0 16px 0;
        }
        
        .form-row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        .form-group {
          flex: 1;
          min-width: 250px;
        }
        
        .full-width {
          width: 100%;
          flex-basis: 100%;
        }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: #334155;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .erro-campo {
          display: block;
          color: #dc2626;
          font-size: 0.8rem;
          margin-top: 4px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
        }
        
        .btn-cancelar {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: white;
          border: 1px solid #cbd5e1;
          color: #64748b;
          padding: 10px 16px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-cancelar:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
          color: #334155;
        }
        
        .btn-salvar {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .btn-salvar:hover {
          background-color: #1d4ed8;
        }
        
        .btn-salvar:disabled, .btn-cancelar:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default FormularioFuncionario; 