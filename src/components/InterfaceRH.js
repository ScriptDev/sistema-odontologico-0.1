import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Clock, CalendarClock, LogOut, 
  Search, Filter, RefreshCw, Trash2, Edit, Eye,
  ChevronLeft, ChevronRight, UserCheck, UserX, 
  SlidersHorizontal, Download, Calendar, CheckCircle,
  X, CheckSquare, UserCog, Archive
} from 'lucide-react';
import AuthService from '../services/AuthService';
import Login from './Login';
import FormularioFuncionario from './FormularioFuncionario';
import NotificationCenter from './NotificationCenter';
import BackupManager from './BackupManager';

const InterfaceRH = ({ usuario, onLogout, onTrocarVisao }) => {
  // Estado de autenticação
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  
  // Estado para controle de abas
  const [abaAtiva, setAbaAtiva] = useState('funcionarios'); // 'funcionarios', 'cadastro', 'escalas', 'pontos'
  
  // Estado para listagem de funcionários
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'dentista', 'tsb', 'asb'
  const [filtroStatus, setFiltroStatus] = useState('ativos');
  
  // Estado para funcionário em edição
  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false); // false = novo, true = edição
  
  // Estado para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  
  // Estado para escalas
  const [funcionarioEscalas, setFuncionarioEscalas] = useState(null);
  
  // Estado para pontos
  const [funcionarioPontos, setFuncionarioPontos] = useState(null);
  const [dataFiltro, setDataFiltro] = useState(new Date());
  
  // Verificar autenticação ao carregar
  useEffect(() => {
    const verificarAutenticacao = () => {
      const logado = AuthService.isLoggedIn();
      const usuario = AuthService.getUsuarioLogado();
      
      // Verificar se é usuário do tipo RH
      if (logado && usuario && usuario.tipo === 'rh') {
        setAutenticado(true);
        setUsuarioAtual(usuario);
        carregarFuncionarios();
      } else {
        // Não está logado ou não é RH
        AuthService.logout();
        setAutenticado(false);
        setUsuarioAtual(null);
      }
    };
    
    verificarAutenticacao();
  }, []);
  
  // Carregar lista de funcionários
  const carregarFuncionarios = () => {
    const listaFuncionarios = AuthService.getUsuarios();
    setFuncionarios(listaFuncionarios);
    aplicarFiltros(listaFuncionarios, termoBusca, filtroTipo, filtroStatus);
  };
  
  // Aplicar filtros à lista de funcionários
  const aplicarFiltros = (lista, termo, tipo, status) => {
    let resultado = [...lista];
    
    // Filtrar por termo de pesquisa
    if (termo) {
      const termoLower = termo.toLowerCase();
      resultado = resultado.filter(f => 
        f.nome.toLowerCase().includes(termoLower) || 
        f.email.toLowerCase().includes(termoLower) ||
        f.cpf.includes(termo) ||
        f.registro.toLowerCase().includes(termoLower)
      );
    }
    
    // Filtrar por tipo
    if (tipo !== 'todos') {
      resultado = resultado.filter(f => f.tipo === tipo);
    }
    
    // Filtrar por status
    if (status === 'ativos') {
      resultado = resultado.filter(f => f.status === 'ativo');
    } else if (status === 'inativos') {
      resultado = resultado.filter(f => f.status === 'inativo');
    }
    
    setFuncionariosFiltrados(resultado);
  };
  
  // Manipular pesquisa
  const handlePesquisa = (e) => {
    const valor = e.target.value;
    setTermoBusca(valor);
    aplicarFiltros(funcionarios, valor, filtroTipo, filtroStatus);
  };
  
  // Manipular filtro por tipo
  const handleFiltroTipo = (tipo) => {
    setFiltroTipo(tipo);
    aplicarFiltros(funcionarios, termoBusca, tipo, filtroStatus);
  };
  
  // Manipular filtro por status
  const handleFiltroStatus = (status) => {
    setFiltroStatus(status);
    aplicarFiltros(funcionarios, termoBusca, filtroTipo, status);
  };
  
  // Abrir modal de cadastro de novo funcionário
  const handleNovoFuncionario = () => {
    setFuncionarioEmEdicao({
      nome: '',
      email: '',
      tipo: 'dentista',
      senha: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
      endereco: '',
      registro: '',
      especialidade: '',
      cargaHoraria: 40
    });
    setModoEdicao(false);
    setAbaAtiva('cadastro');
  };
  
  // Abrir modal de edição de funcionário
  const handleEditarFuncionario = (funcionario) => {
    setFuncionarioEmEdicao({...funcionario});
    setModoEdicao(true);
    setAbaAtiva('cadastro');
  };
  
  // Ver escalas de funcionário
  const handleVerEscalas = (funcionario) => {
    setFuncionarioEscalas(funcionario);
    setAbaAtiva('escalas');
  };
  
  // Ver pontos de funcionário
  const handleVerPontos = (funcionario) => {
    setFuncionarioPontos(funcionario);
    setAbaAtiva('pontos');
  };
  
  // Desativar funcionário
  const handleDesativarFuncionario = (id) => {
    if (window.confirm('Tem certeza que deseja desativar este funcionário?')) {
      const resultado = AuthService.desativarUsuario(id);
      
      if (resultado.sucesso) {
        carregarFuncionarios();
      } else {
        alert(resultado.mensagem || 'Erro ao desativar funcionário');
      }
    }
  };
  
  // Após salvar funcionário
  const handleSalvarFuncionario = (funcionario) => {
    carregarFuncionarios();
    setAbaAtiva('funcionarios');
    setFuncionarioEmEdicao(null);
  };
  
  // Cancelar edição/cadastro de funcionário
  const handleCancelarFuncionario = () => {
    setAbaAtiva('funcionarios');
    setFuncionarioEmEdicao(null);
  };
  
  // Calcular índices para paginação
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const totalPaginas = Math.ceil(funcionariosFiltrados.length / itensPorPagina);
  const funcionariosPaginados = funcionariosFiltrados.slice(indiceInicial, indiceFinal);
  
  // Páginas de paginação a exibir
  const getPaginasExibidas = () => {
    const paginas = [];
    const maxPaginas = 5;
    
    if (totalPaginas <= maxPaginas) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      let inicio = Math.max(1, paginaAtual - 2);
      let fim = Math.min(totalPaginas, inicio + maxPaginas - 1);
      
      if (fim - inicio < maxPaginas - 1) {
        inicio = Math.max(1, fim - maxPaginas + 1);
      }
      
      for (let i = inicio; i <= fim; i++) {
        paginas.push(i);
      }
    }
    
    return paginas;
  };
  
  // Manipular mudança de página
  const handlePaginacao = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
    }
  };
  
  // Manipular logout
  const handleLogout = () => {
    AuthService.logout();
    setAutenticado(false);
    setUsuarioAtual(null);
  };
  
  // Manipular login bem-sucedido
  const handleLoginSuccess = (usuario) => {
    if (usuario && usuario.tipo === 'rh') {
      setAutenticado(true);
      setUsuarioAtual(usuario);
      carregarFuncionarios();
    } else {
      alert('Acesso permitido apenas para RH');
      AuthService.logout();
    }
  };
  
  // Se não estiver autenticado, mostrar tela de login
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }
  
  // Renderizar conteúdo principal com base na aba ativa
  let conteudoPrincipal;
  
  switch (abaAtiva) {
    case 'funcionarios':
      conteudoPrincipal = (
        <div className="bg-white rounded-lg shadow-md">
          {/* Cabeçalho da listagem */}
          <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
              Gerenciamento de Funcionários
            </h2>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
              {/* Barra de pesquisa */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar funcionário..."
                  value={termoBusca}
                  onChange={handlePesquisa}
                  className="pl-10 py-2 px-4 bg-gray-100 border border-gray-300 rounded-lg w-full md:w-60"
                />
              </div>
              
              {/* Filtros */}
              <div className="flex space-x-2">
                <select
                  value={filtroTipo}
                  onChange={(e) => handleFiltroTipo(e.target.value)}
                  className="py-2 px-4 bg-gray-100 border border-gray-300 rounded-lg"
                >
                  <option value="todos">Todos</option>
                  <option value="dentista">Dentistas</option>
                  <option value="tsb">TSBs</option>
                  <option value="asb">ASBs</option>
                  <option value="rh">RH</option>
                </select>
                
                <select
                  value={filtroStatus}
                  onChange={(e) => handleFiltroStatus(e.target.value)}
                  className="py-2 px-4 bg-gray-100 border border-gray-300 rounded-lg"
                >
                  <option value="ativos">Ativos</option>
                  <option value="inativos">Inativos</option>
                </select>
                
                <button
                  onClick={carregarFuncionarios}
                  className="p-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
              
              {/* Botão novo funcionário */}
              <button
                onClick={handleNovoFuncionario}
                className="py-2 px-4 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Novo Funcionário</span>
              </button>
            </div>
          </div>
          
          {/* Tabela de funcionários */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome / Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {funcionariosPaginados.length > 0 ? (
                  funcionariosPaginados.map((funcionario) => (
                    <tr key={funcionario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {funcionario.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{funcionario.nome}</div>
                            <div className="text-sm text-gray-500">{funcionario.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          funcionario.tipo === 'dentista' ? 'bg-indigo-100 text-indigo-800' :
                          funcionario.tipo === 'tsb' ? 'bg-blue-100 text-blue-800' :
                          funcionario.tipo === 'asb' ? 'bg-cyan-100 text-cyan-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {funcionario.tipo === 'dentista' ? 'Dentista' :
                           funcionario.tipo === 'tsb' ? 'TSB' :
                           funcionario.tipo === 'asb' ? 'ASB' : 'RH'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {funcionario.registro || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          funcionario.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {funcionario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditarFuncionario(funcionario)}
                            className="p-1 text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleVerEscalas(funcionario)}
                            className="p-1 text-blue-600 hover:text-blue-900"
                            title="Escalas"
                          >
                            <Calendar className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleVerPontos(funcionario)}
                            className="p-1 text-green-600 hover:text-green-900"
                            title="Pontos"
                          >
                            <Clock className="h-5 w-5" />
                          </button>
                          {funcionario.status === 'ativo' && funcionario.tipo !== 'rh' && (
                            <button
                              onClick={() => handleDesativarFuncionario(funcionario.id)}
                              className="p-1 text-red-600 hover:text-red-900"
                              title="Desativar"
                            >
                              <UserX className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Nenhum funcionário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePaginacao(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    paginaAtual === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePaginacao(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    paginaAtual === totalPaginas ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Próxima
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{Math.min(indiceInicial + 1, funcionariosFiltrados.length)}</span> a <span className="font-medium">{Math.min(indiceFinal, funcionariosFiltrados.length)}</span> de <span className="font-medium">{funcionariosFiltrados.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePaginacao(paginaAtual - 1)}
                      disabled={paginaAtual === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        paginaAtual === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {getPaginasExibidas().map(pagina => (
                      <button
                        key={pagina}
                        onClick={() => handlePaginacao(pagina)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          pagina === paginaAtual ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pagina}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePaginacao(paginaAtual + 1)}
                      disabled={paginaAtual === totalPaginas}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        paginaAtual === totalPaginas ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Próxima</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      );
      break;
    
    case 'cadastro':
      conteudoPrincipal = (
        <FormularioFuncionario
          funcionario={funcionarioEmEdicao}
          modoEdicao={modoEdicao}
          onSalvar={handleSalvarFuncionario}
          onCancelar={handleCancelarFuncionario}
        />
      );
      break;
      
    case 'escalas':
      conteudoPrincipal = (
        <div className="p-4">
          {funcionarioEscalas && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
                  Escalas: {funcionarioEscalas.nome}
                </h2>
              </div>
              
              {/* Rest of the component */}
            </div>
          )}
        </div>
      );
      break;
      
    case 'pontos':
      conteudoPrincipal = (
        <div className="p-4">
          {funcionarioPontos && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
                  Pontos: {funcionarioPontos.nome}
                </h2>
              </div>
              
              {/* Rest of the component */}
            </div>
          )}
        </div>
      );
      break;
      
    case 'backup':
      conteudoPrincipal = (
        <div className="p-4">
          <BackupManager />
        </div>
      );
      break;
      
    default:
      conteudoPrincipal = <div>Carregando...</div>;
  }
  
  // Renderizar o cabeçalho com informações do usuário e opções
  const renderCabecalho = () => {
    if (!usuarioAtual) return null;

    return (
      <div className="cabecalho bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-purple-700 mr-4">Painel do RH</h1>
          {usuarioAtual && (
            <span className="text-gray-600">
              Bem-vindo, <strong>{usuarioAtual.nome}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Botões de acesso a outras interfaces */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Acessar:</span>
            
            <button 
              onClick={() => onTrocarVisao('paciente')}
              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded"
            >
              Paciente
            </button>
            
            {usuarioAtual.tipo === 'dentista' && (
              <button 
                onClick={() => onTrocarVisao('dentista')}
                className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded"
              >
                Dentista
              </button>
            )}
            
            {usuarioAtual.tipo === 'tsb' && (
              <button 
                onClick={() => onTrocarVisao('tsb')}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                TSB
              </button>
            )}
          </div>
          
          {/* Botão de logout */}
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 1 1 2 0v3a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3a1 1 0 1 1-2 0V4a1 1 0 0 0-1-1H3z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M13.293 8.293a1 1 0 0 1 1.414 0L17 10.586l-2.293 2.293a1 1 0 0 1-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 10a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1z" clipRule="evenodd" />
            </svg>
            Sair
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="interface-rh">
      {renderCabecalho()}
      <div className="conteudo-principal">
        <div className="min-h-screen bg-gray-100 flex flex-col">
          {/* Cabeçalho */}
          <header className="bg-white shadow">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de RH</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <NotificationCenter />
              </div>
            </div>
            
            {/* Navegação */}
            <nav className="px-4 sm:px-6 lg:px-8">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setAbaAtiva('funcionarios')}
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      abaAtiva === 'funcionarios'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users size={16} className="inline mr-2" />
                    Funcionários
                  </button>
                  
                  <button
                    onClick={() => setAbaAtiva('cadastro')}
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      abaAtiva === 'cadastro'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <UserPlus size={16} className="inline mr-2" />
                    Cadastro
                  </button>
                  
                  <button
                    onClick={() => setAbaAtiva('escalas')}
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      abaAtiva === 'escalas'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Clock size={16} className="inline mr-2" />
                    Escalas
                  </button>
                  
                  <button
                    onClick={() => setAbaAtiva('pontos')}
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      abaAtiva === 'pontos'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <CheckSquare size={16} className="inline mr-2" />
                    Pontos
                  </button>
                  
                  <button
                    onClick={() => setAbaAtiva('backup')}
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${
                      abaAtiva === 'backup'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Archive size={16} className="inline mr-2" />
                    Backup
                  </button>
                </nav>
              </div>
            </nav>
          </header>
          
          {/* Conteúdo Principal */}
          <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
            {conteudoPrincipal}
          </main>
          
          {/* Rodapé */}
          <footer className="bg-white border-t border-gray-200 py-4">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    © 2025 Sistema Odontológico - Todos os direitos reservados
                  </p>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-4">
                    Total de funcionários: <span className="font-medium">{funcionarios.length}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    Ativos: <span className="font-medium">
                      {funcionarios.filter(f => f.status === 'ativo').length}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default InterfaceRH; 