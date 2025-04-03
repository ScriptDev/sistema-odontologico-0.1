// Modelo de usuário para o sistema de autenticação
class User {
  constructor(id, nome, email, tipo, senha, status = 'ativo') {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.tipo = tipo; // 'rh', 'dentista', 'tsb', 'asb'
    this.senha = senha;
    this.status = status; // 'ativo', 'inativo', 'suspenso'
    this.ultimoLogin = null;
    this.criadoEm = new Date();
    this.atualizadoEm = new Date();
  }
}

export default User; 