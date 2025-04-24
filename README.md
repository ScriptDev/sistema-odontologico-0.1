# Sistema Odontológico

Sistema de gestão para clínicas odontológicas, com módulos para pacientes, dentistas, TSB (Técnicos em Saúde Bucal) e RH.

## Telas do Sistema

O sistema possui quatro interfaces principais:

1. **Painel do Paciente** - Interface principal para acompanhamento de consultas, histórico e agendamentos
2. **Painel do Dentista** - Gerenciamento de atendimentos, prontuários e procedimentos
3. **Painel do TSB** - Preparação de salas, assistência e organização de materiais
4. **Painel do RH** - Gestão de funcionários, escala de trabalho e ponto eletrônico

## Características

- Autenticação e controle de acesso por perfil
- Sistema responsivo para uso em diferentes dispositivos
- Armazenamento local via localStorage (para fins de demonstração)
- Notificações em tempo real
- Gestão de ponto eletrônico
- Backup e restauração de dados

## Tecnologias Utilizadas

- React.js
- Tailwind CSS
- Lucide Icons
- Armazenamento local (localStorage)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sistema-odontologico.git
cd sistema-odontologico
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Acesse no navegador:
```
http://localhost:3000
```

## Usuários de Teste

Para facilitar os testes, o sistema já vem com os seguintes usuários pré-cadastrados:

| Tipo     | Email                | Senha       |
|----------|----------------------|-------------|
| RH       | admin@clinica.com    | admin123    |
| Dentista | marcos@clinica.com   | dentista123 |
| TSB      | juliana@clinica.com  | tsb123      |

## Funcionamento

### Fluxo de Acesso

1. O sistema inicia na tela de login
2. Após autenticação, o usuário é direcionado à interface correspondente ao seu perfil
3. O administrador (RH) tem acesso a todas as áreas do sistema
4. Usuários com permissões podem alternar entre as interfaces disponíveis

### Módulos

#### Painel do Paciente
- Consulta de agendamentos
- Histórico de atendimentos
- Atualização de dados cadastrais

#### Painel do Dentista
- Visualização de agenda do dia
- Registro de procedimentos
- Gerenciamento de prontuários

#### Painel do TSB
- Preparação de materiais
- Assistência aos dentistas
- Gerenciamento de estoque

#### Painel do RH
- Cadastro de funcionários
- Controle de ponto
- Gestão de escalas de trabalho

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
