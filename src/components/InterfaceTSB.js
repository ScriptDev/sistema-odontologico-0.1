import React, { useState, useEffect } from 'react';
import { Clock, User, LogOut, Coffee, ChevronRight, Check, AlertTriangle, Bell, Users, Activity, Search, MoreVertical, CheckCircle, X, UserPlus, Menu } from 'lucide-react';
import Login from './Login';
import authService from '../services/AuthService';
import NotificationCenter from './NotificationCenter';

const InterfaceAtendente = ({ usuario, onLogout, onTrocarVisao }) => {
  // Estados para autenticação
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  // Estados para gerenciamento de dados
  const [currentTime, setCurrentTime] = useState(new Date(2025, 3, 1, 20, 26)); // Fixando às 20:26 para demonstração
  const [atendente, setAtendente] = useState({
    nome: 'Juliana Oliveira',
    foto: 'https://via.placeholder.com/150',
    cargo: 'Técnico em Saúde Bucal',
    registro: 'CTSB-SP 5678',
    status: 'Ativo'
  });
  
  const [filaAtendimento, setFilaAtendimento] = useState([]);
  const [pacienteEmAtendimento, setPacienteEmAtendimento] = useState(null);
  const [tempoDesdeChamada, setTempoDesdeChamada] = useState(0);
  const [confirmacaoLiberada, setConfirmacaoLiberada] = useState(false);
  const [tempoParaLiberacao, setTempoParaLiberacao] = useState(0);
  const [modoEmergencia, setModoEmergencia] = useState(false);
  const [contadorEmergencia, setContadorEmergencia] = useState(0);
  
  // Verificar autenticação ao iniciar
  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioLogado = authService.getUsuarioLogado();
      if (usuarioLogado && usuarioLogado.tipo === 'tsb') {
        setAutenticado(true);
        setUsuarioAtual(usuarioLogado);
        // Atualizar dados do atendente com informações do usuário logado
      } else {
        setAutenticado(false);
        setUsuarioAtual(null);
      }
    };

    verificarAutenticacao();
  }, []);

  // Handler para login bem-sucedido
  const handleLoginSuccess = (usuario) => {
    setAutenticado(true);
    setUsuarioAtual(usuario);
    // Aqui poderíamos carregar os dados específicos do TSB
  };

  // Handler para logout
  const handleLogout = () => {
    authService.logout();
    setAutenticado(false);
    setUsuarioAtual(null);
  };

  // Simulação inicial de dados
  useEffect(() => {
    // Dados simulados para fila de atendimento
    const filaSimulada = [
      {
        id: 'PAC5001',
        nome: 'Roberto Cardoso',
        cpf: '345.678.901-23',
        horarioChegada: new Date(new Date().getTime() - 45 * 60000), // 45 minutos atrás
        codigoAtendimento: '5001010425',
        queixa: 'Dor intensa no molar inferior',
        urgencia: 5,
        tempoEspera: 45,
        confirmado: false
      },
      {
        id: 'PAC4002',
        nome: 'Maria Oliveira',
        cpf: '456.789.012-34',
        horarioChegada: new Date(new Date().getTime() - 50 * 60000), // 50 minutos atrás
        codigoAtendimento: '4002010425',
        queixa: 'Trauma no incisivo central',
        urgencia: 4,
        tempoEspera: 50,
        confirmado: false
      },
      {
        id: 'PAC4003',
        nome: 'Carlos Santos',
        cpf: '567.890.123-45',
        horarioChegada: new Date(new Date().getTime() - 65 * 60000), // 65 minutos atrás
        codigoAtendimento: '4003010425',
        queixa: 'Dor pulsante no dente',
        urgencia: 4,
        tempoEspera: 65,
        confirmado: false
      },
      {
        id: 'PAC3004',
        nome: 'Juliana Lima',
        cpf: '678.901.234-56',
        horarioChegada: new Date(new Date().getTime() - 80 * 60000), // 80 minutos atrás
        codigoAtendimento: '3004010425',
        queixa: 'Inflamação gengival com sangramento',
        urgencia: 3,
        tempoEspera: 80,
        confirmado: false
      },
      {
        id: 'PAC3005',
        nome: 'Pedro Almeida',
        cpf: '789.012.345-67',
        horarioChegada: new Date(new Date().getTime() - 95 * 60000), // 95 minutos atrás
        codigoAtendimento: '3005010425',
        queixa: 'Dor ao mastigar',
        urgencia: 3,
        tempoEspera: 95,
        confirmado: false
      }
    ];
    
    // Ordenar fila por tempo de espera (ordem de chegada)
    const filaOrdenada = [...filaSimulada].sort((a, b) => {
      return b.tempoEspera - a.tempoEspera; // Maior tempo de espera primeiro (ordem de chegada)
    });
    
    setFilaAtendimento(filaOrdenada);
    
    // Definir o primeiro paciente como em atendimento
    if (filaOrdenada.length > 0) {
      setPacienteEmAtendimento(filaOrdenada[0]);
      // Remover o primeiro paciente da fila
      setFilaAtendimento(filaOrdenada.slice(1));
    }
  }, []);
  
  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Se há paciente em atendimento, incrementar o tempo desde a chamada
      if (pacienteEmAtendimento) {
        setTempoDesdeChamada(prev => prev + 1);
        
        // Verificar se já passaram 3 minutos (180 segundos) para liberar confirmação
        // ou se passou 30 minutos (1800 segundos) para confirmar automaticamente
        if (tempoDesdeChamada >= 1800) {
          // 30 minutos - confirmação automática
          confirmarAtendimento(true);
        } else if (tempoDesdeChamada >= 180 && !confirmacaoLiberada) {
          // 3 minutos - liberar botão de confirmação
          setConfirmacaoLiberada(true);
        }
        
        // Atualizar tempo restante para liberação do botão
        if (tempoDesdeChamada < 180) {
          setTempoParaLiberacao(180 - tempoDesdeChamada);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentTime, pacienteEmAtendimento, tempoDesdeChamada, confirmacaoLiberada]);
  
  // Função para confirmar atendimento
  const confirmarAtendimento = (automatico = false) => {
    if (pacienteEmAtendimento) {
      // Em um sistema real, enviaríamos uma requisição ao backend
      console.log(`Paciente ${pacienteEmAtendimento.nome} confirmado ${automatico ? 'automaticamente' : 'pelo atendente'}`);
      
      // Atualizar paciente como confirmado
      const pacienteConfirmado = { ...pacienteEmAtendimento, confirmado: true };
      setPacienteEmAtendimento(pacienteConfirmado);
      
      // Aguardar 2 segundos e chamar próximo da fila
      setTimeout(chamarProximoPaciente, 2000);
    }
  };
  
  // Função para chamar próximo paciente
  const chamarProximoPaciente = () => {
    if (filaAtendimento.length > 0) {
      // Obter próximo paciente da fila
      const proximoPaciente = filaAtendimento[0];
      // Atualizar paciente em atendimento
      setPacienteEmAtendimento(proximoPaciente);
      // Remover o paciente da fila
      setFilaAtendimento(filaAtendimento.slice(1));
      // Resetar contadores
      setTempoDesdeChamada(0);
      setConfirmacaoLiberada(false);
      setTempoParaLiberacao(600); // 10 minutos em segundos
    } else {
      // Não há mais pacientes na fila
      setPacienteEmAtendimento(null);
    }
  };
  
  // Função para ativar modo de emergência (bypass do tempo de espera)
  const ativarModoEmergencia = () => {
    // Contar quantas vezes o botão foi pressionado (3 vezes libera)
    const novoContador = contadorEmergencia + 1;
    setContadorEmergencia(novoContador);
    
    if (novoContador >= 3) {
      setModoEmergencia(true);
      setConfirmacaoLiberada(true);
      setContadorEmergencia(0);
      
      // Desativar modo de emergência após 30 segundos
      setTimeout(() => {
        setModoEmergencia(false);
        if (tempoDesdeChamada < 600) {
          setConfirmacaoLiberada(false);
        }
      }, 30000);
    }
  };
  
  // Formatação do tempo
  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
  };
  
  // Formatação do tempo de espera em minutos
  const formatarTempoEspera = (minutos) => {
    if (minutos < 60) {
      return `${minutos} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const minutosRestantes = minutos % 60;
      return `${horas}h ${minutosRestantes}min`;
    }
  };
  
  // Renderizar o cabeçalho com informações do usuário e opções
  const renderCabecalho = () => {
    if (!usuarioAtual) return null;

    return (
      <div className="cabecalho bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-700 mr-4">Painel do TSB</h1>
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
            
            {usuarioAtual.tipo === 'rh' && (
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
            onClick={() => {
              handleLogout();
              onLogout();
            }}
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

  // Se não estiver autenticado, mostra a tela de orientação e login
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {renderCabecalho()}
        <div className="flex flex-grow">
          {/* Conteúdo de orientações */}
          <div className="flex-grow p-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold text-blue-700 mb-4">Orientações para Auxiliares e Técnicos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Preparação do Consultório</h3>
                  <p className="text-gray-700 mb-3">Verifique se todos os equipamentos estão esterilizados e se os materiais necessários estão disponíveis antes do atendimento.</p>
                  <div className="flex justify-center">
                    <img 
                      src="https://via.placeholder.com/300x200?text=Preparação+do+Consultório" 
                      alt="Preparação do consultório" 
                      className="rounded-md shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Biossegurança</h3>
                  <p className="text-gray-700 mb-3">Utilize sempre EPIs completos: luvas, máscara, óculos de proteção, gorro e avental antes de qualquer procedimento.</p>
                  <div className="flex justify-center">
                    <img 
                      src="https://via.placeholder.com/300x200?text=Biossegurança" 
                      alt="Equipamentos de proteção" 
                      className="rounded-md shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Atendimento ao Paciente</h3>
                  <p className="text-gray-700 mb-3">Seja cordial e claro ao explicar procedimentos. Mantenha a comunicação direta com o dentista durante o atendimento.</p>
                  <div className="flex justify-center">
                    <img 
                      src="https://via.placeholder.com/300x200?text=Atendimento+ao+Paciente" 
                      alt="Interação com paciente" 
                      className="rounded-md shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Gestão de Agenda</h3>
                  <p className="text-gray-700 mb-3">Mantenha a agenda organizada, confirme consultas com antecedência e gerencie esperas e emergências de forma eficiente.</p>
                  <div className="flex justify-center">
                    <img 
                      src="https://via.placeholder.com/300x200?text=Gestão+de+Agenda" 
                      alt="Agenda organizada" 
                      className="rounded-md shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Área de login */}
          <div className="w-1/3 p-8 bg-gray-100 border-l border-gray-200">
            <Login 
              onLogin={handleLoginSuccess} 
              interfaceRequerida="tsb"
              mensagemBemVindo="Interface do TSB"
            />
          </div>
        </div>

        {/* Rodapé */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            <p>© 2025 Sistema de Atendimento Odontológico - Todos os direitos reservados</p>
          </div>
        </footer>
      </div>
    );
  }

  // A interface existente do TSB permanece a mesma quando autenticado
  return (
    <div className="min-h-screen bg-gray-100">
      {renderCabecalho()}
      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Bloco de informações do atendente */}
        <div className="col-span-1 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                <img src={atendente.foto} alt="Foto do atendente" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{atendente.nome}</h2>
              <p className="text-gray-500">{atendente.cargo}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Informações do Turno</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Turno:</span>
                  <span className="font-medium">{atendente.turnoAtual}</span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg mb-3">
                  <p className="text-sm font-medium text-indigo-800">Auxiliando:</p>
                  <p className="font-medium text-indigo-900">{atendente.dentista}</p>
                  <p className="text-xs text-indigo-700">{atendente.especialidadeDentista}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Próximo Turno</h3>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">{atendente.proximoTecnico}</p>
                <p className="text-sm text-blue-600">Início: {atendente.horarioProximoTecnico}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco de paciente em atendimento */}
        <div className="col-span-1 lg:col-span-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paciente em atendimento */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white py-3 px-4">
                <h2 className="text-lg font-semibold">Em Atendimento</h2>
              </div>
              
              {pacienteEmAtendimento ? (
                <div className="p-4">
                  <div className="mb-4 flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{pacienteEmAtendimento.nome}</h3>
                      <p className="text-gray-600">CPF: {pacienteEmAtendimento.cpf}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full font-medium text-sm ${
                      pacienteEmAtendimento.urgencia >= 4 ? 'bg-red-100 text-red-800' :
                      pacienteEmAtendimento.urgencia === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      Urgência {pacienteEmAtendimento.urgencia}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Chegada</p>
                      <p className="font-medium">{pacienteEmAtendimento.horarioChegada.toLocaleTimeString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Tempo de Espera</p>
                      <p className="font-medium">{formatarTempoEspera(pacienteEmAtendimento.tempoEspera)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Queixa Principal</p>
                    <p className="text-sm">{pacienteEmAtendimento.queixa}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium text-gray-700">Status de Confirmação</h4>
                        {!pacienteEmAtendimento.confirmado && (
                          <p className="text-sm text-gray-500">
                            {confirmacaoLiberada ? 
                              "Confirmação disponível" : 
                              `Liberação em ${formatarTempo(tempoParaLiberacao)}`
                            }
                          </p>
                        )}
                      </div>
                      
                      {modoEmergencia && !pacienteEmAtendimento.confirmado && (
                        <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                          Modo Emergência Ativo
                        </div>
                      )}
                    </div>
                    
                    {pacienteEmAtendimento.confirmado ? (
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center">
                        <Check size={18} className="mr-2" />
                        <span className="font-medium">Atendimento Confirmado</span>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        <button 
                          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center 
                            ${confirmacaoLiberada ? 
                              'bg-green-600 hover:bg-green-700 text-white' : 
                              'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                          onClick={() => confirmacaoLiberada && confirmarAtendimento()}
                          disabled={!confirmacaoLiberada}
                        >
                          <Check size={18} className="mr-2" />
                          Confirmar Atendimento
                        </button>
                        
                        <button 
                          className="bg-amber-50 text-amber-800 border border-amber-200 p-2 rounded-lg"
                          onClick={ativarModoEmergencia}
                          title="Pressione 3 vezes para ativar modo de emergência"
                        >
                          <AlertTriangle size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">Nenhum paciente em atendimento no momento</p>
                  {filaAtendimento.length > 0 && (
                    <button
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                      onClick={chamarProximoPaciente}
                    >
                      Chamar Próximo Paciente
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Próximos na fila */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-600 text-white py-3 px-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Próximos na Fila</h2>
                <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
                  {filaAtendimento.length} pacientes
                </span>
              </div>
              
              <div className="divide-y divide-gray-100">
                {filaAtendimento.length > 0 ? (
                  filaAtendimento.map((paciente, index) => (
                    <div key={paciente.id} className={`p-4 flex justify-between items-center ${index === 0 ? 'bg-blue-50' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center">
                          {index === 0 && <ChevronRight size={16} className="text-blue-600 mr-1" />}
                          <h3 className="font-medium text-gray-800">{paciente.nome}</h3>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <span className="mr-3">CPF: {paciente.cpf}</span>
                          <span>Espera: {formatarTempoEspera(paciente.tempoEspera)}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full font-medium text-xs ${
                        paciente.urgencia >= 4 ? 'bg-red-100 text-red-800' :
                        paciente.urgencia === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        Urgência {paciente.urgencia}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    Não há pacientes aguardando na fila
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Barra de status */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Bell size={16} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-700">
              {filaAtendimento.length > 0 ? 
                `Próximo paciente: ${filaAtendimento[0].nome}` : 
                'Não há pacientes na fila'
              }
            </span>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <NotificationCenter />
            <button
              onClick={() => {
                handleLogout();
                onLogout();
              }}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded flex items-center"
            >
              <LogOut size={14} className="mr-1" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InterfaceAtendente;