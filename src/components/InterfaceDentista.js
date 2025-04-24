import React, { useState, useEffect } from 'react';
import { 
  Clock, User, LogOut, Activity, FileText, Check, Plus, 
  ChevronRight, Calendar, AlertCircle, Clipboard, Pill, 
  File, Edit, Send, PenTool, CheckCircle, Eye, Download
} from 'lucide-react';
import Login from './Login';
import authService from '../services/AuthService';
import NotificationCenter from './NotificationCenter';

const InterfaceDentista = ({ usuario, onLogout, onTrocarVisao }) => {
  // Estados para autenticação
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  // Estados para gerenciamento de dados
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dentista, setDentista] = useState({
    nome: 'Dr. Marcos Pereira',
    foto: 'https://via.placeholder.com/150',
    especialidade: 'Endodontista',
    registro: 'CRO-SP 12345',
    turnoAtual: 'Noturno (19:00 - 07:00)',
    tecnicoAtual: 'Juliana Oliveira',
    proximoDentista: 'Dra. Carla Mendes',
    horarioProximoDentista: '07:00'
  });
  
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [proximoPaciente, setProximoPaciente] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('historico');
  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [novaReceita, setNovaReceita] = useState({
    medicamento: '',
    posologia: '',
    duracao: '',
    observacoes: ''
  });
  const [novoProcedimento, setNovoProcedimento] = useState({
    tipo: '',
    descricao: '',
    regiao: '',
    observacoes: ''
  });
  const [confirmacaoEnviada, setConfirmacaoEnviada] = useState(false);
  const [carregando, setCarregando] = useState(true);
  
  // Verificar autenticação ao iniciar
  useEffect(() => {
    const verificarAutenticacao = () => {
      try {
        const usuarioLogado = authService.getUsuarioLogado();
        console.log("Verificando autenticação:", usuarioLogado);
        
        if (usuarioLogado) {
          setAutenticado(true);
          setUsuarioAtual(usuarioLogado);
          setCarregando(false);
        } else {
          setAutenticado(false);
          setUsuarioAtual(null);
          setCarregando(false);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setAutenticado(false);
        setCarregando(false);
      }
    };

    verificarAutenticacao();
    
    // Atualizar hora atual a cada minuto
    const timerID = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timerID);
    };
  }, []);

  // Handler para login bem-sucedido
  const handleLoginSuccess = (usuario) => {
    console.log("Login bem-sucedido:", usuario);
    setAutenticado(true);
    setUsuarioAtual(usuario);
    carregarDadosSimulados();
  };

  // Handler para logout
  const handleLogout = () => {
    console.log("Realizando logout");
    authService.logout();
    setAutenticado(false);
    setUsuarioAtual(null);
    setPacienteAtual(null);
    setProximoPaciente(null);
  };

  // Carregar dados simulados
  const carregarDadosSimulados = () => {
    // Paciente atual simulado
    const pacienteAtualSimulado = {
      id: 'PAC3005',
      nome: 'Pedro Almeida',
      cpf: '789.012.345-67',
      dataNascimento: '1978-06-15',
      idade: 46,
      sexo: 'M',
      telefone: '(11) 99876-5432',
      email: 'pedro.almeida@email.com',
      endereco: 'Rua das Flores, 123 - Jardim Primavera',
      convenio: 'Odonto Premium - Plano Superior',
      horarioChegada: new Date(new Date().getTime() - 95 * 60000), // 95 minutos atrás
      codigoAtendimento: '3005010425',
      queixa: 'Dor ao mastigar no lado esquerdo inferior, principalmente com alimentos duros',
      urgencia: 3,
      tempoEspera: 95,
      alergias: ['Penicilina', 'Látex'],
      historicoMedico: [
        {
          data: '2024-12-10',
          tipo: 'Condição',
          descricao: 'Hipertensão controlada com medicação',
          registradoPor: 'Dr. André Santos'
        },
        {
          data: '2023-05-20',
          tipo: 'Cirurgia',
          descricao: 'Extração de terceiros molares superiores',
          registradoPor: 'Dra. Camila Ferreira'
        }
      ],
      historicoOdontologico: [
        {
          data: '2025-01-15',
          procedimento: 'Restauração em resina',
          dente: '36',
          observacoes: 'Restauração MOD em resina composta devido a cárie profunda',
          registradoPor: 'Dr. Marcos Pereira'
        },
        {
          data: '2024-09-22',
          procedimento: 'Tratamento de canal',
          dente: '25',
          observacoes: 'Pulpectomia concluída em sessão única',
          registradoPor: 'Dr. Roberto Oliveira'
        },
        {
          data: '2024-07-05',
          procedimento: 'Profilaxia',
          dente: 'Arcada completa',
          observacoes: 'Remoção de tártaro e biofilme. Orientações de higiene bucal reforçadas',
          registradoPor: 'Dra. Juliana Costa'
        }
      ],
      anotacoes: [
        {
          data: '2025-01-15',
          texto: 'Paciente relatou sensibilidade ao frio no dente 27. Avaliar na próxima consulta.',
          visibilidadePaciente: false,
          registradoPor: 'Dr. Marcos Pereira'
        },
        {
          data: '2024-09-22',
          texto: 'Paciente mostrou resistência ao tratamento endodôntico. Considerar sedação leve em procedimentos futuros.',
          visibilidadePaciente: false,
          registradoPor: 'Dr. Roberto Oliveira'
        }
      ],
      receitas: [
        {
          data: '2025-01-15',
          medicamento: 'Ibuprofeno 600mg',
          posologia: '1 comprimido a cada 8 horas',
          duracao: '3 dias',
          observacoes: 'Tomar após as refeições',
          registradoPor: 'Dr. Marcos Pereira'
        },
        {
          data: '2024-09-22',
          medicamento: 'Amoxicilina 500mg',
          posologia: '1 cápsula a cada 8 horas',
          duracao: '7 dias',
          observacoes: 'Completar todo o tratamento mesmo com melhora dos sintomas',
          registradoPor: 'Dr. Roberto Oliveira'
        }
      ],
      imagensRadiograficas: [
        {
          data: '2025-01-15',
          tipo: 'Panorâmica',
          descricao: 'Avaliação geral para planejamento de tratamento',
          url: 'https://via.placeholder.com/300x200'
        },
        {
          data: '2024-09-22',
          tipo: 'Periapical',
          descricao: 'Avaliação do dente 25 para tratamento endodôntico',
          url: 'https://via.placeholder.com/300x200'
        }
      ]
    };
    
    // Próximo paciente simulado
    const proximoPacienteSimulado = {
      id: 'PAC4003',
      nome: 'Carlos Santos',
      cpf: '567.890.123-45',
      dataNascimento: '1992-11-30',
      idade: 32,
      sexo: 'M',
      horarioChegada: new Date(new Date().getTime() - 65 * 60000), // 65 minutos atrás
      codigoAtendimento: '4003010425',
      queixa: 'Dor pulsante no dente canino superior direito, intensificada nas últimas 48 horas',
      urgencia: 4,
      tempoEspera: 65,
      alergias: ['Sulfas'],
      historicoMedico: [
        {
          data: '2024-08-12',
          tipo: 'Condição',
          descricao: 'Diabetes Tipo 2 compensada',
          registradoPor: 'Dra. Patrícia Mello'
        }
      ],
      historicoOdontologico: [
        {
          data: '2024-11-10',
          procedimento: 'Avaliação endodôntica',
          dente: '13',
          observacoes: 'Teste de sensibilidade positivo com resposta exacerbada. Radiografia sem alterações evidentes.',
          registradoPor: 'Dr. Marcos Pereira'
        }
      ]
    };
    
    setPacienteAtual(pacienteAtualSimulado);
    setProximoPaciente(proximoPacienteSimulado);
  };
  
  // Formatar data
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Formatar tempo de espera
  const formatarTempoEspera = (minutos) => {
    if (minutos < 60) {
      return `${minutos} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const minutosRestantes = minutos % 60;
      return `${horas}h ${minutosRestantes}min`;
    }
  };
  
  // Adicionar nova anotação
  const adicionarAnotacao = () => {
    if (!novaAnotacao.trim()) return;
    
    const anotacaoAtual = {
      data: new Date().toISOString().split('T')[0],
      texto: novaAnotacao,
      visibilidadePaciente: true, // Visível para o paciente por padrão (por 3 dias)
      registradoPor: dentista.nome
    };
    
    setPacienteAtual({
      ...pacienteAtual,
      anotacoes: [anotacaoAtual, ...pacienteAtual.anotacoes]
    });
    
    setNovaAnotacao('');
  };
  
  // Adicionar nova receita
  const adicionarReceita = () => {
    if (!novaReceita.medicamento || !novaReceita.posologia) return;
    
    const receitaAtual = {
      data: new Date().toISOString().split('T')[0],
      ...novaReceita,
      registradoPor: dentista.nome
    };
    
    setPacienteAtual({
      ...pacienteAtual,
      receitas: [receitaAtual, ...pacienteAtual.receitas]
    });
    
    setNovaReceita({
      medicamento: '',
      posologia: '',
      duracao: '',
      observacoes: ''
    });
  };
  
  // Adicionar novo procedimento
  const adicionarProcedimento = () => {
    if (!novoProcedimento.tipo || !novoProcedimento.descricao) return;
    
    const procedimentoAtual = {
      data: new Date().toISOString().split('T')[0],
      procedimento: novoProcedimento.tipo,
      dente: novoProcedimento.regiao,
      observacoes: novoProcedimento.descricao + (novoProcedimento.observacoes ? `. ${novoProcedimento.observacoes}` : ''),
      registradoPor: dentista.nome
    };
    
    setPacienteAtual({
      ...pacienteAtual,
      historicoOdontologico: [procedimentoAtual, ...pacienteAtual.historicoOdontologico]
    });
    
    setNovoProcedimento({
      tipo: '',
      descricao: '',
      regiao: '',
      observacoes: ''
    });
  };
  
  // Confirmar atendimento
  const confirmarAtendimento = () => {
    // Em um sistema real, enviaríamos uma requisição ao backend
    console.log(`Atendimento do paciente ${pacienteAtual.nome} confirmado pelo dentista`);
    
    // Notificar a interface do atendente para reduzir o tempo de confirmação
    // Em um sistema real, isso seria feito via websocket ou outra forma de comunicação em tempo real
    console.log(`Reduzindo tempo de confirmação do atendente para 1min40s`);
    
    setConfirmacaoEnviada(true);
    
    // Após 2 segundos, simular a chamada do próximo paciente
    setTimeout(() => {
      // Em um sistema real, atualizaríamos os dados com o backend
      setPacienteAtual(proximoPaciente);
      setProximoPaciente(null); // Em um sistema real, buscaríamos o próximo da fila
      setConfirmacaoEnviada(false);
    }, 2000);
  };

  // Renderizar o cabeçalho com informações do usuário e opções
  const renderCabecalho = () => {
    if (!usuario) return null;

    return (
      <div className="cabecalho bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-indigo-700 mr-4">Painel do Dentista</h1>
          {usuario && (
            <span className="text-gray-600">
              Bem-vindo, <strong>{usuario.nome}</strong>
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
            
            {usuario.tipo === 'tsb' && (
              <button 
                onClick={() => onTrocarVisao('tsb')}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                TSB
              </button>
            )}
            
            {usuario.tipo === 'rh' && (
              <button 
                onClick={() => onTrocarVisao('rh')}
                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded"
              >
                RH
              </button>
            )}
          </div>
          
          {/* Botão de logout */}
          <button 
            onClick={onLogout}
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

  // Enquanto estiver carregando, mostrar tela de loading
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Carregando interface do dentista...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar tela de login com orientações
  if (!autenticado) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        {/* Área de informações */}
        <div className="w-full md:w-2/3 p-6 md:p-12">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">Interface do Dentista</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Bem-vindo ao Sistema Odontológico</h2>
            <p className="text-gray-600 mb-4">
              Esta é a interface exclusiva para dentistas. Para acessar, faça login com suas credenciais.
            </p>
            <div className="p-4 bg-blue-50 rounded-md text-blue-700">
              <h3 className="font-medium mb-2">Credenciais de teste:</h3>
              <p>Email: marcos@clinica.com</p>
              <p>Senha: dentista123</p>
            </div>
          </div>
          
          {/* Informações sobre a interface */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Funcionalidades</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Visualização de ficha do paciente</li>
                <li>Registro de procedimentos</li>
                <li>Prescrição de medicamentos</li>
                <li>Anotações clínicas</li>
                <li>Confirmação de atendimentos</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Acesso ao sistema</h3>
              <p className="text-gray-700 mb-2">
                Use suas credenciais para acessar todas as funcionalidades do sistema.
              </p>
              <p className="text-gray-700">
                O registro de ponto é automático ao fazer login e logout.
              </p>
            </div>
          </div>
        </div>
        
        {/* Área de login */}
        <div className="w-full md:w-1/3 p-6 md:p-8 bg-gray-100 md:border-l border-gray-200">
          <Login 
            onLogin={handleLoginSuccess} 
            interfaceRequerida="dentista"
            mensagemBemVindo="Acesso do Dentista"
          />
        </div>
      </div>
    );
  }

  // Verificar se paciente está disponível para renderização
  if (!pacienteAtual) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-gray-600 mb-4">Não há pacientes aguardando atendimento.</p>
          <p className="text-gray-500">Aguarde a chegada de novos pacientes.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="interface-dentista">
      {renderCabecalho()}
      <div className="conteudo-principal">
        <div className="min-h-screen flex flex-col bg-gray-100">
          {/* Conteúdo principal */}
          <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
            {pacienteAtual ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Dados do paciente atual */}
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        Paciente: {pacienteAtual.nome} • {pacienteAtual.idade} anos
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Queixa principal: {pacienteAtual.queixa}
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        <Activity size={16} className="mr-1" />
                        Tempo de espera: {pacienteAtual.tempoEspera} min
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Abas de navegação */}
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      className={`py-4 px-6 text-center text-sm font-medium ${
                        abaAtiva === 'historico'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setAbaAtiva('historico')}
                    >
                      Histórico
                    </button>
                    <button
                      className={`py-4 px-6 text-center text-sm font-medium ${
                        abaAtiva === 'anotacoes'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setAbaAtiva('anotacoes')}
                    >
                      Anotações
                    </button>
                    <button
                      className={`py-4 px-6 text-center text-sm font-medium ${
                        abaAtiva === 'receitas'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setAbaAtiva('receitas')}
                    >
                      Receitas
                    </button>
                    <button
                      className={`py-4 px-6 text-center text-sm font-medium ${
                        abaAtiva === 'procedimentos'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setAbaAtiva('procedimentos')}
                    >
                      Procedimentos
                    </button>
                  </nav>
                </div>
                
                {/* Conteúdo da aba selecionada */}
                <div className="p-4">
                  {abaAtiva === 'historico' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Histórico do Paciente</h3>
                      <p className="text-gray-600">
                        Exibindo histórico para {pacienteAtual.nome}.
                      </p>
                    </div>
                  )}
                  
                  {abaAtiva === 'anotacoes' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Anotações Clínicas</h3>
                      <p className="text-gray-600">
                        Espaço para anotações sobre o atendimento de {pacienteAtual.nome}.
                      </p>
                    </div>
                  )}
                  
                  {abaAtiva === 'receitas' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Receituário</h3>
                      <p className="text-gray-600">
                        Criar receitas para {pacienteAtual.nome}.
                      </p>
                    </div>
                  )}
                  
                  {abaAtiva === 'procedimentos' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Procedimentos</h3>
                      <p className="text-gray-600">
                        Registro de procedimentos para {pacienteAtual.nome}.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Rodapé da ficha */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <PenTool size={18} className="mr-2" />
                    <span>Finalizar Atendimento</span>
                  </button>
                  
                  {proximoPaciente && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Próximo:</span> {proximoPaciente.nome} • 
                      <span className={`ml-1 ${
                        proximoPaciente.urgencia >= 4 ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        Espera: {proximoPaciente.tempoEspera} min
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h2 className="text-xl font-medium text-gray-800 mb-4">Nenhum paciente em atendimento</h2>
                <p className="text-gray-600 mb-6">
                  Aguardando a chegada de um novo paciente ou a seleção pela recepção.
                </p>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                  onClick={carregarDadosSimulados}
                >
                  <Plus size={18} className="mr-2" />
                  <span>Carregar Dados de Teste</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default InterfaceDentista;