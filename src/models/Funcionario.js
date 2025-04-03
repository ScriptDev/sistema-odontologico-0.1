import User from './User';

// Modelo de funcionário com dados específicos para profissionais de saúde
class Funcionario extends User {
  constructor(
    id, 
    nome, 
    email, 
    tipo, 
    senha, 
    cpf, 
    dataNascimento, 
    telefone, 
    endereco, 
    registro = '', // CRO para dentistas, CTSB para técnicos
    especialidade = '', 
    cargaHoraria = 40,
    status = 'ativo'
  ) {
    super(id, nome, email, tipo, senha, status);
    this.cpf = cpf;
    this.dataNascimento = dataNascimento;
    this.telefone = telefone;
    this.endereco = endereco;
    this.registro = registro;
    this.especialidade = especialidade;
    this.cargaHoraria = cargaHoraria; // horas semanais
    this.dataAdmissao = new Date();
    this.fotoPerfil = '';
    this.escalas = []; // array de objetos de escala
    this.pontos = []; // array de registros de ponto
    this.historicoAtendimentos = []; // array de IDs de atendimentos
  }
  
  // Verifica se o funcionário está com o ponto batido hoje
  estaPresenteHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    return this.pontos.some(ponto => 
      ponto.data.toISOString().split('T')[0] === hoje && 
      ponto.entrada && 
      !ponto.saida // se tem entrada mas não tem saída, está presente
    );
  }
  
  // Verifica se o funcionário está escalado para hoje
  estaEscaladoHoje() {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda, ...
    const horaAtual = hoje.getHours();
    
    return this.escalas.some(escala => 
      escala.ativa &&
      escala.diasSemana.includes(diaSemana) &&
      horaAtual >= escala.horaInicio &&
      horaAtual <= escala.horaFim
    );
  }
  
  // Adiciona um novo registro de ponto
  baterPonto(tipo = 'entrada') {
    const agora = new Date();
    const hoje = agora.toISOString().split('T')[0];
    
    // Verifica se já existe um ponto hoje
    const pontoHoje = this.pontos.find(ponto => 
      ponto.data.toISOString().split('T')[0] === hoje
    );
    
    if (tipo === 'entrada') {
      if (pontoHoje && pontoHoje.entrada) {
        return { sucesso: false, mensagem: 'Entrada já registrada hoje' };
      }
      
      if (pontoHoje) {
        pontoHoje.entrada = agora;
      } else {
        this.pontos.push({
          data: agora,
          entrada: agora,
          saida: null,
          observacoes: ''
        });
      }
      return { sucesso: true, mensagem: 'Entrada registrada com sucesso' };
    } 
    else if (tipo === 'saida') {
      if (!pontoHoje || !pontoHoje.entrada) {
        return { sucesso: false, mensagem: 'Entrada não registrada hoje' };
      }
      
      if (pontoHoje.saida) {
        return { sucesso: false, mensagem: 'Saída já registrada hoje' };
      }
      
      pontoHoje.saida = agora;
      return { sucesso: true, mensagem: 'Saída registrada com sucesso' };
    }
    
    return { sucesso: false, mensagem: 'Tipo de ponto inválido' };
  }
  
  // Adiciona uma nova escala
  adicionarEscala(diasSemana, horaInicio, horaFim, nome = '') {
    const escala = {
      id: Date.now().toString(),
      nome: nome || `Escala ${this.escalas.length + 1}`,
      diasSemana, // array [0, 1, 2, 3, 4, 5, 6] onde 0 = domingo
      horaInicio, // hora do dia (0-23)
      horaFim, // hora do dia (0-23)
      ativa: true,
      criadaEm: new Date()
    };
    
    this.escalas.push(escala);
    return escala;
  }
}

export default Funcionario; 