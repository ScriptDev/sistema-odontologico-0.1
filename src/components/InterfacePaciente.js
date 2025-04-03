import React, { useState, useEffect } from 'react';
import { Bell, Printer, FileText, CheckCircle, Calendar, Clock, User, Save, AlertCircle } from 'lucide-react';
import notificationService from '../services/NotificationService';

const SistemaOdontologico = () => {
  const [etapa, setEtapa] = useState(0); // Iniciar com tela de busca por CPF
  const [paciente, setPaciente] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    sexo: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: ''
  });
  
  const [queixa, setQueixa] = useState({
    descricao: '',
    tipoQueixa: '',
    urgencia: 0
  });
  
  const [codigoAtendimento, setCodigoAtendimento] = useState('');
  const [horarioChegada, setHorarioChegada] = useState('');
  const [previsaoAtendimento, setPrevisaoAtendimento] = useState('');
  const [contadorDiario, setContadorDiario] = useState(0);
  const [validacaoErros, setValidacaoErros] = useState({});
  const [pesquisaCpf, setPesquisaCpf] = useState('');
  const [clienteExistente, setClienteExistente] = useState(false);
  const [historicoAtendimentos, setHistoricoAtendimentos] = useState([]);
  const [numeroFila, setNumeroFila] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [novoAtendimentoDisponivel, setNovoAtendimentoDisponivel] = useState(true);
  const [ultimoAtendimento, setUltimoAtendimento] = useState(null);
  const [totalPacientesNaFila, setTotalPacientesNaFila] = useState(8); // Simulação
  
  // Buscar paciente pelo CPF
  const buscarPacientePorCPF = async () => {
    if (pesquisaCpf.length !== 11) {
      setValidacaoErros({...validacaoErros, cpfPesquisa: 'CPF deve conter 11 dígitos'});
      return;
    }
    
    setValidacaoErros({...validacaoErros, cpfPesquisa: ''});
    
    try {
      // Simulação de busca em banco de dados
      // Em um cenário real, isso seria uma chamada a uma API
      if (pesquisaCpf === '12345678901') {
        // Simulação de paciente encontrado
        setPaciente({
          nome: 'João da Silva',
          cpf: '12345678901',
          dataNascimento: '1985-05-15',
          email: 'joao.silva@email.com',
          sexo: 'M',
          cep: '12345678',
          endereco: 'Rua das Flores',
          numero: '123',
          complemento: 'Apto 101'
        });
        
        // Simular histórico de atendimentos
        setHistoricoAtendimentos([
          {
            data: '15/03/2025',
            queixa: 'Dor de dente',
            urgencia: 4,
            codigo: '4002150325',
            status: 'Concluído'
          },
          {
            data: '20/01/2025',
            queixa: 'Inflamação gengival',
            urgencia: 3,
            codigo: '3001200125',
            status: 'Concluído'
          }
        ]);
        
        // Verificar último atendimento para controle de 40 minutos
        const ultimoAtend = new Date();
        ultimoAtend.setMinutes(ultimoAtend.getMinutes() - 30); // Simulando 30 minutos atrás
        setUltimoAtendimento(ultimoAtend);
        
        // Verificar se pode fazer novo atendimento (40 minutos)
        const agora = new Date();
        const diferenca = (agora - ultimoAtend) / (1000 * 60); // diferença em minutos
        setNovoAtendimentoDisponivel(diferenca >= 40);
        
        setClienteExistente(true);
        setEtapa(1); // Ir direto para a etapa de queixa
      } else {
        // Paciente não encontrado
        setClienteExistente(false);
        setEtapa(1); // Ir para etapa de cadastro
      }
    } catch (erro) {
      console.error('Erro ao buscar paciente:', erro);
      setValidacaoErros({
        ...validacaoErros,
        cpfPesquisa: 'Erro ao buscar paciente. Tente novamente.'
      });
    }
  };

  // Verificar CEP e preencher endereço
  const verificarCEP = async () => {
    if (paciente.cep.length === 8) {
      try {
        // Simulação de API de CEP
        setValidacaoErros({...validacaoErros, cep: ''});
        setPaciente({
          ...paciente,
          endereco: 'Endereço preenchido automaticamente'
        });
      } catch (erro) {
        setValidacaoErros({
          ...validacaoErros,
          cep: 'CEP não encontrado'
        });
      }
    }
  };

  // Função para validar CPF
  const validarCPF = (cpf) => {
    if (cpf.length !== 11) {
      return false;
    }
    return true; // Simplificado para o exemplo
  };

  // Função para validar campos da etapa 1
  const validarEtapa1 = () => {
    const erros = {};
    
    if (!paciente.nome.trim()) {
      erros.nome = 'Nome é obrigatório';
    }
    
    if (!validarCPF(paciente.cpf.replace(/\D/g, ''))) {
      erros.cpf = 'CPF inválido';
    }
    
    if (!paciente.dataNascimento) {
      erros.dataNascimento = 'Data de nascimento é obrigatória';
    }
    
    if (!paciente.email.includes('@')) {
      erros.email = 'Email inválido';
    }
    
    if (!paciente.sexo) {
      erros.sexo = 'Selecione o sexo';
    }
    
    if (!paciente.cep) {
      erros.cep = 'CEP é obrigatório';
    }
    
    if (!paciente.endereco) {
      erros.endereco = 'Endereço é obrigatório';
    }
    
    if (!paciente.numero) {
      erros.numero = 'Número é obrigatório';
    }
    
    setValidacaoErros(erros);
    return Object.keys(erros).length === 0;
  };

  // Avançar para a próxima etapa
  const avancarEtapa = () => {
    if (etapa === 1 && !clienteExistente) {
      if (validarEtapa1()) {
        setEtapa(2);
      }
    } else if (etapa === 1 && clienteExistente) {
      // Cliente existente já vai direto para descrição da queixa
      setEtapa(2);
    } else if (etapa === 2) {
      if (queixa.descricao.trim()) {
        analisarUrgencia(queixa.descricao);
        setEtapa(3);
      } else {
        setValidacaoErros({
          ...validacaoErros,
          descricao: !queixa.descricao.trim() ? 'Descrição é obrigatória' : ''
        });
      }
    }
  };

  // Voltar para a etapa anterior
  const voltarEtapa = () => {
    if (etapa > 0) {
      setEtapa(etapa - 1);
    }
  };

  // Analisar texto da queixa com IA para determinar urgência
  const analisarUrgencia = (texto) => {
    // Simulação de análise por IA
    // Em um cenário real, isso seria uma chamada a um modelo de IA
    
    const palavrasChave = {
      dor: 3,
      forte: 1,
      intensa: 2,
      insuportável: 2,
      sangramento: 3,
      quebrado: 4,
      trauma: 4,
      acidente: 4,
      inflamação: 2,
      inchado: 2,
      febre: 2,
      infecção: 3,
      pus: 3,
      emergência: 5
    };
    
    let pontuacaoUrgencia = 0;
    const textoLower = texto.toLowerCase();
    
    Object.keys(palavrasChave).forEach(palavra => {
      if (textoLower.includes(palavra)) {
        pontuacaoUrgencia += palavrasChave[palavra];
      }
    });
    
    // Limitar pontuação entre 1 e 5
    pontuacaoUrgencia = Math.max(1, Math.min(5, pontuacaoUrgencia));
    
    // Atualizar tipo de queixa com base na pontuação
    let tipoQueixa = '';
    switch(pontuacaoUrgencia) {
      case 5:
        tipoQueixa = 'emergência';
        break;
      case 4:
        tipoQueixa = 'urgência_alta';
        break;
      case 3:
        tipoQueixa = 'urgência_média';
        break;
      default:
        tipoQueixa = 'urgência_baixa';
    }
    
    setQueixa({
      ...queixa,
      urgencia: pontuacaoUrgencia,
      tipoQueixa: tipoQueixa
    });
    
    // Gerar código de atendimento e calcular número na fila
    gerarCodigoAtendimento(pontuacaoUrgencia);
  };

  // Gerar código de atendimento
  const gerarCodigoAtendimento = (nivelUrgencia) => {
    const data = new Date();
    const novoContador = contadorDiario + 1;
    setContadorDiario(novoContador);
    
    // Formato do código: Urgência + Contador + Data (DDMM)
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const codigo = `${nivelUrgencia}${String(novoContador).padStart(3, '0')}${dia}${mes}`;
    
    setCodigoAtendimento(codigo);
    setHorarioChegada(data.toLocaleTimeString());
    
    // Calcular previsão baseada na urgência
    const minutosEspera = calcularTempoEspera(nivelUrgencia);
    const previsao = new Date(data.getTime() + minutosEspera * 60000);
    setPrevisaoAtendimento(previsao.toLocaleTimeString());
    
    // Calcular posição na fila
    calcularPosicaoFila(nivelUrgencia);
    
    // Imprimir automaticamente
    setTimeout(() => {
      imprimirComprovante();
    }, 1000);
  };
  
  // Calcular tempo de espera baseado na urgência
  const calcularTempoEspera = (nivelUrgencia) => {
    // Tempos de espera em minutos por nível de urgência
    const temposEspera = {
      5: 10,  // Emergência: 10 minutos
      4: 20,  // Urgência alta: 20 minutos
      3: 40,  // Urgência média: 40 minutos
      2: 60,  // Urgência baixa: 60 minutos
      1: 90   // Não urgente: 90 minutos
    };
    
    return temposEspera[nivelUrgencia] || 60;
  };
  
  // Calcular posição na fila com base na urgência
  const calcularPosicaoFila = (nivelUrgencia) => {
    // Simulação de cálculo de fila
    // Em um cenário real, isso seria baseado em dados do banco
    
    // Contar pacientes com maior prioridade
    const pacientesComMaiorPrioridade = Math.floor(totalPacientesNaFila * 0.3 * (6 - nivelUrgencia));
    
    // Definir número na fila
    const numeroNaFila = pacientesComMaiorPrioridade + 1;
    setNumeroFila(numeroNaFila);
  };

  // Imprimir comprovante
  const imprimirComprovante = () => {
    // Simulação de impressão
    console.log('Enviando para impressora: Comprovante de Atendimento');
    // Em um ambiente real, isso enviaria para uma API de impressão
  };

  // Gerar relatório (ao final do dia)
  const gerarRelatorio = () => {
    // Simulação de geração de relatório
    console.log(`Relatório gerado: ${contadorDiario} atendimentos realizados hoje`);
    // Em um ambiente real, isso geraria um PDF
  };
  
  // Iniciar novo atendimento
  const iniciarNovoAtendimento = () => {
    // Verificar se já passaram 40 minutos desde o último atendimento
    const agora = new Date();
    const ultimoAtend = ultimoAtendimento || new Date(0);
    const diferenca = (agora - ultimoAtend) / (1000 * 60); // diferença em minutos
    
    if (diferenca >= 40 || isAdmin) {
      resetarFormulario();
      setEtapa(0);
    } else {
      alert(`Aguarde ${Math.ceil(40 - diferenca)} minutos para iniciar um novo atendimento.`);
    }
  };
  
  // Resetar formulário
  const resetarFormulario = () => {
    setPaciente({
      nome: '',
      cpf: '',
      dataNascimento: '',
      email: '',
      sexo: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: ''
    });
    
    setQueixa({
      descricao: '',
      tipoQueixa: '',
      urgencia: 0
    });
    
    setPesquisaCpf('');
    setClienteExistente(false);
    setHistoricoAtendimentos([]);
  };

  // Monitorar mudança de dia para reset do contador
  useEffect(() => {
    const verificarMeiaNoite = () => {
      const agora = new Date();
      if (agora.getHours() === 0 && agora.getMinutes() === 0) {
        if (isAdmin) {
          gerarRelatorio();
        }
        setContadorDiario(0);
      }
    };
    
    const intervalo = setInterval(verificarMeiaNoite, 60000); // Verificar a cada minuto
    
    return () => clearInterval(intervalo);
  }, [contadorDiario, isAdmin]);

  // Atualizar CEP quando digitado
  useEffect(() => {
    if (paciente.cep.length === 8) {
      verificarCEP();
    }
  }, [paciente.cep]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Sistema de Atendimento Odontológico</h1>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Clock className="mr-2" size={20} />
              {new Date().toLocaleDateString()}
            </span>
            {isAdmin && (
              <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-medium">
                Atendimentos: {contadorDiario}
              </span>
            )}
            <button 
              onClick={() => setIsAdmin(!isAdmin)} 
              className={`px-3 py-1 rounded-full font-medium ${isAdmin ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {isAdmin ? 'Modo Admin' : 'Modo Paciente'}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto py-8 px-4">
        {/* Indicador de progresso */}
        {etapa > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${etapa >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${etapa >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
                <span className="mt-2 text-sm">{clienteExistente ? 'Identificação' : 'Dados Pessoais'}</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-gray-200">
                <div className={`h-full ${etapa >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{width: etapa >= 2 ? '100%' : '0%'}}></div>
              </div>
              <div className={`flex flex-col items-center ${etapa >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${etapa >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
                <span className="mt-2 text-sm">Queixa</span>
              </div>
              <div className="flex-1 h-1 mx-2 bg-gray-200">
                <div className={`h-full ${etapa >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{width: etapa >= 3 ? '100%' : '0%'}}></div>
              </div>
              <div className={`flex flex-col items-center ${etapa >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${etapa >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
                <span className="mt-2 text-sm">Confirmação</span>
              </div>
            </div>
          </div>
        )}

        {/* Card principal */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {/* Etapa 0: Busca por CPF */}
          {etapa === 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Identificação do Paciente</h2>
              
              <div className="text-center mb-6">
                <User size={48} className="mx-auto text-blue-500 mb-4" />
                <p className="text-gray-600 mb-4">Por favor, informe seu CPF para iniciarmos o atendimento.</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input 
                    type="text"
                    className={`w-full p-3 border rounded-md text-center text-lg ${validacaoErros.cpfPesquisa ? 'border-red-500' : 'border-gray-300'}`}
                    value={pesquisaCpf}
                    onChange={(e) => setPesquisaCpf(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                    placeholder="Digite seu CPF (somente números)"
                  />
                  {validacaoErros.cpfPesquisa && <p className="text-red-500 text-xs mt-1">{validacaoErros.cpfPesquisa}</p>}
                </div>
                
                <button 
                  onClick={buscarPacientePorCPF}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continuar
                </button>
                
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Se for seu primeiro atendimento, você será direcionado para o cadastro.
                </p>
              </div>
            </div>
          )}

          {/* Etapa 1: Dados pessoais (apenas para novos pacientes) */}
          {etapa === 1 && !clienteExistente && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Dados Pessoais</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input 
                    type="text"
                    className={`w-full p-2 border rounded-md ${validacaoErros.nome ? 'border-red-500' : 'border-gray-300'}`}
                    value={paciente.nome}
                    onChange={(e) => setPaciente({...paciente, nome: e.target.value})}
                  />
                  {validacaoErros.nome && <p className="text-red-500 text-xs mt-1">{validacaoErros.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input 
                    type="text"
                    className={`w-full p-2 border rounded-md ${validacaoErros.cpf ? 'border-red-500' : 'border-gray-300'}`}
                    value={paciente.cpf}
                    onChange={(e) => setPaciente({...paciente, cpf: e.target.value.replace(/\D/g, '')})}
                    maxLength={11}
                  />
                  {validacaoErros.cpf && <p className="text-red-500 text-xs mt-1">{validacaoErros.cpf}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
                  <input 
                    type="date"
                    className={`w-full p-2 border rounded-md ${validacaoErros.dataNascimento ? 'border-red-500' : 'border-gray-300'}`}
                    value={paciente.dataNascimento}
                    onChange={(e) => setPaciente({...paciente, dataNascimento: e.target.value})}
                  />
                  {validacaoErros.dataNascimento && <p className="text-red-500 text-xs mt-1">{validacaoErros.dataNascimento}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input 
                    type="email"
                    className={`w-full p-2 border rounded-md ${validacaoErros.email ? 'border-red-500' : 'border-gray-300'}`}
                    value={paciente.email}
                    onChange={(e) => setPaciente({...paciente, email: e.target.value})}
                  />
                  {validacaoErros.email && <p className="text-red-500 text-xs mt-1">{validacaoErros.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
                  <select 
                    className={`w-full p-2 border rounded-md ${validacaoErros.sexo ? 'border-red-500' : 'border-gray-300'}`}
                    value={paciente.sexo}
                    onChange={(e) => setPaciente({...paciente, sexo: e.target.value})}
                  >
                    <option value="">Selecione</option>
                    <option value="F">Feminino</option>
                    <option value="M">Masculino</option>
                    <option value="O">Outro</option>
                  </select>
                  {validacaoErros.sexo && <p className="text-red-500 text-xs mt-1">{validacaoErros.sexo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                  <input 
                    type="text"
                    className={`w-full p-2 border rounded-md ${validacaoErros.cep ? 'border-red-500' : 'border-gray-300'}`}
                    value={paciente.cep}
                    onChange={(e) => setPaciente({...paciente, cep: e.target.value.replace(/\D/g, '')})}
                    maxLength={8}
                  />
                  {validacaoErros.cep && <p className="text-red-500 text-xs mt-1">{validacaoErros.cep}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                  <input 
                    type="text"
                    className={`w-full p-2 border rounded-md ${validacaoErros.endereco ? 'border-red-500' : 'border-gray-300'}`}
                    value={paciente.endereco}
                    onChange={(e) => setPaciente({...paciente, endereco: e.target.value})}
                  />
                  {validacaoErros.endereco && <p className="text-red-500 text-xs mt-1">{validacaoErros.endereco}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                    <input 
                      type="text"
                      className={`w-full p-2 border rounded-md ${validacaoErros.numero ? 'border-red-500' : 'border-gray-300'}`}
                      value={paciente.numero}
                      onChange={(e) => setPaciente({...paciente, numero: e.target.value})}
                    />
                    {validacaoErros.numero && <p className="text-red-500 text-xs mt-1">{validacaoErros.numero}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                    <input 
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={paciente.complemento}
                      onChange={(e) => setPaciente({...paciente, complemento: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 1: Resumo do paciente (para pacientes existentes) */}
          {etapa === 1 && clienteExistente && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Bem-vindo(a) de volta, {paciente.nome}</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Seus dados:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">CPF:</p>
                    <p className="font-medium">{paciente.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">E-mail:</p>
                    <p className="font-medium">{paciente.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Endereço:</p>
                    <p className="font-medium">{paciente.endereco}, {paciente.numero}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data de Nascimento:</p>
                    <p className="font-medium">{new Date(paciente.dataNascimento).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              {historicoAtendimentos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">Histórico de Atendimentos:</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Queixa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgência</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {historicoAtendimentos.map((atendimento, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">{atendimento.data}</td>
                            <td className="px-6 py-4">{atendimento.queixa}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${atendimento.urgencia >= 4 ? 'bg-red-100 text-red-800' :
                                  atendimento.urgencia === 3 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'}`}>
                                {atendimento.urgencia}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {atendimento.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {!novoAtendimentoDisponivel && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="text-yellow-400 mr-3 mt-0.5" size={20} />
                    <div>
                      <p className="font-medium text-yellow-700">Atenção</p>
                      <p className="text-sm text-yellow-600">
                        Seu último atendimento foi há menos de 40 minutos. O administrador precisará autorizar este novo atendimento.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Etapa 2: Queixa do paciente */}
          {etapa === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Descrição da Queixa</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descreva seu problema em detalhes *</label>
                <textarea 
                  className={`w-full p-3 border rounded-md h-32 ${validacaoErros.descricao ? 'border-red-500' : 'border-gray-300'}`}
                  value={queixa.descricao}
                  onChange={(e) => setQueixa({...queixa, descricao: e.target.value})}
                  placeholder="Por favor, detalhe seu problema ou motivo da consulta. Seja específico sobre sintomas, dor, localização, duração, etc."
                ></textarea>
                {validacaoErros.descricao && <p className="text-red-500 text-xs mt-1">{validacaoErros.descricao}</p>}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center text-blue-700 mb-2">
                  <AlertCircle size={18} className="mr-2" />
                  <p className="font-medium">Informações Importantes</p>
                </div>
                <ul className="text-sm text-blue-600 space-y-1 pl-6 list-disc">
                  <li>Nosso sistema analisará sua descrição para determinar o nível de urgência</li>
                  <li>Seja detalhado sobre sintomas, intensidade da dor e duração</li>
                  <li>Mencione se há sangramento, inchaço ou dificuldade para comer/falar</li>
                  <li>Informe qualquer alergia ou condição médica relevante</li>
                </ul>
              </div>
            </div>
          )}

          {/* Etapa 3: Confirmação e código de atendimento */}
          {etapa === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <CheckCircle className="text-green-500 mr-3" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Atendimento Registrado</h2>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{paciente.nome}</h3>
                    <p className="text-gray-600">CPF: {paciente.cpf}</p>
                  </div>
                  <div className="bg-white border border-blue-200 rounded-lg px-4 py-3 text-center">
                    <p className="text-sm text-gray-500">Código de Atendimento</p>
                    <p className="text-2xl font-bold text-blue-600">{codigoAtendimento}</p>
                    <div className="flex items-center justify-center mt-2 text-xs bg-blue-100 rounded-full px-2 py-1">
                      <span>Nível de urgência: </span>
                      <span className="ml-1 font-semibold">{queixa.urgencia}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Horário de Chegada</p>
                    <div className="flex items-center">
                      <Clock size={16} className="text-gray-400 mr-1" />
                      <p className="font-medium">{horarioChegada}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Previsão de Atendimento</p>
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-1" />
                      <p className="font-medium">{previsaoAtendimento}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Sua posição na fila</p>
                    <p className="font-medium text-lg">{numeroFila}º lugar</p>
                  </div>
                </div>

                <div className="border-t border-blue-100 pt-4">
                  <p className="text-sm text-gray-700 mb-2"><strong>Descrição da queixa:</strong></p>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">{queixa.descricao}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                <button 
                  onClick={imprimirComprovante}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Printer size={18} className="mr-2" />
                  Imprimir Comprovante
                </button>
                
                {(isAdmin || novoAtendimentoDisponivel) && (
                  <button 
                    onClick={iniciarNovoAtendimento}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Bell size={18} className="mr-2" />
                    {isAdmin ? 'Novo Atendimento' : 'Cancelar'}
                  </button>
                )}
                
                {isAdmin && (
                  <button 
                    onClick={gerarRelatorio}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <FileText size={18} className="mr-2" />
                    Gerar Relatório
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botões de navegação */}
        {etapa > 0 && etapa < 3 && (
          <div className="flex justify-between">
            <button 
              onClick={voltarEtapa}
              className={`px-6 py-2 rounded-lg ${etapa === 0 ? 'invisible' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              disabled={etapa === 0}
            >
              Voltar
            </button>
            
            <button 
              onClick={avancarEtapa}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {etapa === 2 ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 Sistema de Atendimento Odontológico - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default SistemaOdontologico;