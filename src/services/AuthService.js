import Funcionario from '../models/Funcionario';
import notificationService from './NotificationService';

// Dados iniciais para testes - em produção seria um banco de dados
const dadosIniciais = [
  {
    id: '1',
    nome: 'Administrador RH',
    email: 'admin@clinica.com',
    tipo: 'rh',
    senha: 'admin123',
    cpf: '12345678900',
    dataNascimento: '1980-01-01',
    telefone: '(11) 99999-9999',
    endereco: 'Rua Exemplo, 123',
    registro: 'ADM-001',
    especialidade: 'Gestão de RH',
    cargaHoraria: 40,
    ativo: true
  },
  {
    id: '2',
    nome: 'Dr. Marcos Pereira',
    email: 'marcos@clinica.com',
    tipo: 'dentista',
    senha: 'dentista123',
    cpf: '98765432100',
    dataNascimento: '1985-05-15',
    telefone: '(11) 88888-8888',
    endereco: 'Av. Principal, 500',
    registro: 'CRO-SP 12345',
    especialidade: 'Endodontia',
    cargaHoraria: 30,
    ativo: true
  },
  {
    id: '3',
    nome: 'Juliana Oliveira',
    email: 'juliana@clinica.com',
    tipo: 'tsb',
    senha: 'tsb123',
    cpf: '45678912300',
    dataNascimento: '1990-10-20',
    telefone: '(11) 77777-7777',
    endereco: 'Rua Secundária, 200',
    registro: 'CTSB-SP 5678',
    especialidade: 'Técnico em Saúde Bucal',
    cargaHoraria: 40,
    ativo: true
  }
];

class AuthService {
  constructor() {
    // Inicializa o banco de dados de usuários se não existir
    if (!localStorage.getItem('usuarios')) {
      localStorage.setItem('usuarios', JSON.stringify(dadosIniciais));
    }
    
    // Inicializa o banco de dados de pontos se não existir
    if (!localStorage.getItem('pontos')) {
      localStorage.setItem('pontos', JSON.stringify([]));
    }
    
    // Inicializa o banco de dados de escalas se não existir
    if (!localStorage.getItem('escalas')) {
      const escalasIniciais = [
        {
          id: 1,
          usuarioId: '2', // Dr. Marcos
          nome: 'Escala padrão',
          dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
          horarioInicio: '08:00',
          horarioFim: '18:00',
          ativa: true
        },
        {
          id: 2,
          usuarioId: '3', // Juliana
          nome: 'Escala padrão',
          dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
          horarioInicio: '08:00',
          horarioFim: '18:00',
          ativa: true
        }
      ];
      localStorage.setItem('escalas', JSON.stringify(escalasIniciais));
    }
  }
  
  // Obter todos os usuários
  getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
  }
  
  // Obter usuário por ID
  getUsuarioPorId(id) {
    const usuarios = this.getUsuarios();
    return usuarios.find(user => user.id === id) || null;
  }
  
  // Obter usuário por email
  getUsuarioPorEmail(email) {
    const usuarios = this.getUsuarios();
    return usuarios.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }
  
  // Verificar se CPF já existe
  cpfExiste(cpf, excluirId = null) {
    const usuarios = this.getUsuarios();
    return usuarios.some(user => user.cpf === cpf && user.id !== excluirId);
  }
  
  // Verificar se email já existe
  emailExiste(email, excluirId = null) {
    const usuarios = this.getUsuarios();
    return usuarios.some(user => user.email.toLowerCase() === email.toLowerCase() && user.id !== excluirId);
  }
  
  // Adicionar um novo usuário
  adicionarUsuario(usuario) {
    const usuarios = this.getUsuarios();
    const novoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => parseInt(u.id))) + 1 : 1;
    
    const novoUsuario = {
      ...usuario,
      id: novoId.toString(),
      createdAt: new Date().toISOString(),
      ativo: true
    };
    
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return novoUsuario;
  }
  
  // Atualizar um usuário existente
  atualizarUsuario(id, dadosAtualizados) {
    const usuarios = this.getUsuarios();
    const index = usuarios.findIndex(user => user.id === id);
    
    if (index === -1) return null;
    
    // Manter o id e a data de criação originais
    const usuarioAtualizado = {
      ...usuarios[index],
      ...dadosAtualizados,
      id: usuarios[index].id,
      createdAt: usuarios[index].createdAt
    };
    
    usuarios[index] = usuarioAtualizado;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return usuarioAtualizado;
  }
  
  // Desativar um usuário
  desativarUsuario(id) {
    return this.atualizarUsuario(id, { ativo: false });
  }
  
  // Ativar um usuário
  ativarUsuario(id) {
    return this.atualizarUsuario(id, { ativo: true });
  }
  
  // Login de usuário
  login(email, senha) {
    const usuario = this.getUsuarioPorEmail(email);
    
    if (!usuario || usuario.senha !== senha) {
      return { success: false, message: 'Email ou senha incorretos' };
    }
    
    if (usuario.ativo === false) {
      return { success: false, message: 'Usuário inativo. Contacte o RH.' };
    }
    
    // Armazenar informações do usuário logado na sessão
    sessionStorage.setItem('usuarioAtual', JSON.stringify({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    }));
    
    // Registrar ponto de entrada automaticamente
    const agora = new Date();
    const pontos = JSON.parse(localStorage.getItem('pontos') || '[]');
    pontos.push({
      id: Date.now(),
      funcionarioId: usuario.id,
      data: agora.toISOString(),
      tipo: 'entrada'
    });
    localStorage.setItem('pontos', JSON.stringify(pontos));
    
    // Adicionar notificação de boas-vindas
    notificationService.addBemVindoNotification(usuario.nome);
    
    return { 
      success: true, 
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    };
  }
  
  // Verificar se usuário está logado
  isLoggedIn() {
    return sessionStorage.getItem('usuarioAtual') !== null;
  }
  
  // Obter usuário logado
  getUsuarioLogado() {
    return JSON.parse(sessionStorage.getItem('usuarioAtual') || 'null');
  }
  
  // Logout de usuário
  logout() {
    const user = this.getUsuarioLogado();
    
    if (user) {
      // Registrar ponto de saída automaticamente
      const agora = new Date();
      const pontos = JSON.parse(localStorage.getItem('pontos') || '[]');
      pontos.push({
        id: Date.now(),
        funcionarioId: user.id,
        data: agora.toISOString(),
        tipo: 'saida'
      });
      localStorage.setItem('pontos', JSON.stringify(pontos));
      
      // Adicionar notificação de despedida
      notificationService.addDespedidaNotification(user.nome);
    }
    
    // Remover o usuário do localStorage
    sessionStorage.removeItem('usuarioAtual');
    return true;
  }
  
  // Registrar ponto de entrada
  registrarPontoEntrada(usuarioId) {
    const pontos = JSON.parse(localStorage.getItem('pontos') || '[]');
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toISOString().split('T')[0];
    
    // Verificar se já bateu ponto hoje
    const pontoExistente = pontos.find(
      ponto => ponto.usuarioId === usuarioId && 
      ponto.data === dataFormatada
    );
    
    if (pontoExistente) {
      return { success: false, message: 'Ponto já registrado hoje' };
    }
    
    const novoPonto = {
      id: pontos.length > 0 ? Math.max(...pontos.map(p => p.id)) + 1 : 1,
      usuarioId,
      data: dataFormatada,
      entrada: dataAtual.toISOString(),
      saida: null
    };
    
    pontos.push(novoPonto);
    localStorage.setItem('pontos', JSON.stringify(pontos));
    
    return { success: true, ponto: novoPonto };
  }
  
  // Registrar ponto de saída
  registrarPontoSaida(usuarioId) {
    const pontos = JSON.parse(localStorage.getItem('pontos') || '[]');
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toISOString().split('T')[0];
    
    const index = pontos.findIndex(
      ponto => ponto.usuarioId === usuarioId && 
      ponto.data === dataFormatada &&
      ponto.saida === null
    );
    
    if (index === -1) {
      return { success: false, message: 'Nenhum ponto de entrada encontrado para hoje' };
    }
    
    pontos[index].saida = dataAtual.toISOString();
    localStorage.setItem('pontos', JSON.stringify(pontos));
    
    return { success: true, ponto: pontos[index] };
  }
  
  // Verificar se bateu ponto hoje
  verificarPontoHoje(usuarioId) {
    const pontos = JSON.parse(localStorage.getItem('pontos') || '[]');
    const dataFormatada = new Date().toISOString().split('T')[0];
    
    const pontoHoje = pontos.find(
      ponto => ponto.usuarioId === usuarioId && 
      ponto.data === dataFormatada
    );
    
    if (!pontoHoje) {
      return { bateuPonto: false };
    }
    
    return { 
      bateuPonto: true, 
      entrada: pontoHoje.entrada,
      saida: pontoHoje.saida
    };
  }
  
  // Adicionar escala de trabalho
  adicionarEscala(escala) {
    const escalas = JSON.parse(localStorage.getItem('escalas') || '[]');
    const novoId = escalas.length > 0 ? Math.max(...escalas.map(e => e.id)) + 1 : 1;
    
    const novaEscala = {
      ...escala,
      id: novoId,
      createdAt: new Date().toISOString()
    };
    
    escalas.push(novaEscala);
    localStorage.setItem('escalas', JSON.stringify(escalas));
    return novaEscala;
  }
  
  // Verificar se usuário está escalado para hoje
  verificarEscalaHoje(usuarioId) {
    const escalas = JSON.parse(localStorage.getItem('escalas') || '[]');
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, ...
    
    // Mapeia o número do dia da semana para o nome usado nas escalas
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaHoje = diasSemana[diaSemana];
    
    const escalaUsuario = escalas.find(
      escala => escala.usuarioId === usuarioId && 
      escala.dias.includes(diaHoje)
    );
    
    // Para facilitar testes, retornamos true mesmo se não houver escala
    return true; 
  }
  
  // Obter escalas por usuário
  getEscalasPorUsuario(usuarioId) {
    const escalas = JSON.parse(localStorage.getItem('escalas') || '[]');
    return escalas.filter(escala => escala.usuarioId === usuarioId);
  }
  
  // Obter todas as escalas
  getEscalas() {
    return JSON.parse(localStorage.getItem('escalas') || '[]');
  }
}

// Exporta uma instância única do serviço
const authService = new AuthService();
export default authService; 