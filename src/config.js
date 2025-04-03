// Configuração central para seleção de interface

// Capturar a porta atual do servidor
const currentPort = parseInt(window.location.port, 10) || 3000; // Fallback para 3000 se a porta não for detectada

console.log('Porta detectada:', currentPort);

// Determinar qual interface exibir com base na porta
const getInterfaceConfig = () => {
  switch(currentPort) {
    case 3001:
      console.log('Configurando interface do Dentista');
      return {
        type: 'dentista',
        name: 'Interface do Dentista'
      };
    case 3002:
      console.log('Configurando interface do TSB');
      return {
        type: 'tsb',
        name: 'Interface do TSB'
      };
    case 3003:
      console.log('Configurando interface do Paciente');
      return {
        type: 'paciente',
        name: 'Interface do Paciente'
      };
    case 3004:
      console.log('Configurando interface do RH');
      return {
        type: 'rh',
        name: 'Interface do RH'
      };
    default:
      console.log('Configurando Menu Principal');
      return {
        type: 'menu',
        name: 'Menu Principal'
      };
  }
};

const config = getInterfaceConfig();
console.log('Configuração selecionada:', config);

export default config; 