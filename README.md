# Sistema Odontológico

Sistema completo para gestão de clínicas odontológicas, incluindo interfaces para dentistas, técnicos em saúde bucal (TSB), pacientes e recursos humanos (RH).

## Características

- **Interface Múltipla**: Sistema distribuído em diferentes portas para cada tipo de usuário
- **Design Responsivo**: Interface baseada em Tailwind CSS, adaptável a diferentes dispositivos
- **Persistência de Dados**: Armazenamento em localStorage para demonstração
- **Gestão de Pacientes**: Cadastro, fila de atendimento e histórico
- **Gestão de Profissionais**: Cadastro, controle de ponto e escalas
- **Notificações em Tempo Real**: Sistema de notificações para novos pacientes
- **Backup e Restauração**: Módulo para exportação e importação de dados

## Interfaces

- **Menu Principal**: http://localhost:3000
- **Interface do Dentista**: http://localhost:3001
- **Interface do TSB**: http://localhost:3002
- **Interface do Paciente**: http://localhost:3003
- **Interface do RH**: http://localhost:3004

## Credenciais para Teste

- **Dentista**: Email: `marcos@clinica.com` / Senha: `dentista123`
- **TSB**: Email: `juliana@clinica.com` / Senha: `tsb123`
- **RH**: Email: `admin@clinica.com` / Senha: `admin123`

## Tecnologias Utilizadas

- **Frontend**: React 19.1.0, Tailwind CSS
- **Iconografia**: Lucide React
- **Persistência**: localStorage (para demonstração)
- **Serviços Paralelos**: Concurrently para execução de múltiplas instâncias

## Instalação

1. Clone o repositório:
```bash
git clone [URL-DO-REPOSITORIO]
cd sistema-odontologico
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o sistema completo:
```bash
npm run start-all
```

Ou inicie interfaces específicas:
```bash
npm run start-menu      # Menu principal (porta 3000)
npm run start-dentista  # Interface do dentista (porta 3001)
npm run start-tsb       # Interface do TSB (porta 3002)
npm run start-paciente  # Interface do paciente (porta 3003)
npm run start-rh        # Interface do RH (porta 3004)
```

## Funcionalidades Principais

### Interface do Dentista
- Visualização de ficha do paciente
- Registro de procedimentos
- Prescrição de medicamentos
- Anotações clínicas
- Confirmação de atendimentos

### Interface do TSB
- Gestão da fila de pacientes
- Triagem e classificação de urgência
- Encaminhamento para dentistas
- Controle de atendimentos

### Interface do Paciente
- Auto-registro no sistema
- Preenchimento de anamnese
- Descrição da queixa principal
- Acompanhamento de posição na fila

### Interface do RH
- Cadastro de funcionários
- Controle de ponto
- Gerenciamento de escalas
- Sistema de backup e restauração

## Contribuição

Contribuições são bem-vindas! Por favor, sinta-se à vontade para submeter pull requests.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
