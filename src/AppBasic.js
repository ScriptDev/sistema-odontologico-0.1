import React from 'react';

function AppBasic() {
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '32px',
    maxWidth: '800px',
    width: '100%'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1d4ed8',
    marginBottom: '32px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  };

  const linkStyle = {
    display: 'block',
    padding: '24px',
    backgroundColor: '#e0e7ff',
    borderRadius: '8px',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  };

  const iconStyle = {
    fontSize: '48px',
    marginBottom: '16px'
  };

  const linkTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '8px'
  };

  const descriptionStyle = {
    color: '#3730a3'
  };

  const portStyle = {
    marginTop: '16px',
    fontSize: '12px',
    color: '#6366f1'
  };

  const infoBoxStyle = {
    marginTop: '32px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#4b5563'
  };

  const codeStyle = {
    backgroundColor: '#e5e7eb',
    padding: '4px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace'
  };

  const listStyle = {
    listStyleType: 'disc',
    marginLeft: '24px',
    marginTop: '4px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Sistema Odontológico</h1>
        
        <div style={gridStyle}>
          <a 
            href="http://localhost:3001" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{...linkStyle, backgroundColor: '#e0e7ff'}}
          >
            <div style={iconStyle}>👨‍⚕️</div>
            <h2 style={linkTitleStyle}>Interface do Dentista</h2>
            <p style={descriptionStyle}>Acesse o painel do cirurgião-dentista</p>
            <div style={portStyle}>Porta 3001</div>
          </a>
          
          <a 
            href="http://localhost:3002" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{...linkStyle, backgroundColor: '#dbeafe'}}
          >
            <div style={iconStyle}>👩‍⚕️</div>
            <h2 style={linkTitleStyle}>Interface do TSB</h2>
            <p style={descriptionStyle}>Acesse o painel do técnico em saúde bucal</p>
            <div style={portStyle}>Porta 3002</div>
          </a>
          
          <a 
            href="http://localhost:3003" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{...linkStyle, backgroundColor: '#dcfce7'}}
          >
            <div style={iconStyle}>👨‍👩‍👧</div>
            <h2 style={linkTitleStyle}>Interface do Paciente</h2>
            <p style={descriptionStyle}>Acesse o painel do paciente</p>
            <div style={portStyle}>Porta 3003</div>
          </a>
          
          <a 
            href="http://localhost:3004" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{...linkStyle, backgroundColor: '#fef3c7'}}
          >
            <div style={iconStyle}>👨‍💼</div>
            <h2 style={linkTitleStyle}>Interface do RH</h2>
            <p style={descriptionStyle}>Acesse o painel de Recursos Humanos</p>
            <div style={portStyle}>Porta 3004</div>
          </a>
        </div>
        
        <div style={infoBoxStyle}>
          <p>Para iniciar todos os serviços simultaneamente, execute no terminal: <code style={codeStyle}>npm run start-all</code></p>
          <p style={{marginTop: '8px'}}>Para iniciar apenas um serviço, execute:</p>
          <ul style={listStyle}>
            <li><code style={codeStyle}>npm run start-dentista</code> - Interface do dentista (porta 3001)</li>
            <li><code style={codeStyle}>npm run start-tsb</code> - Interface do TSB (porta 3002)</li>
            <li><code style={codeStyle}>npm run start-paciente</code> - Interface do paciente (porta 3003)</li>
            <li><code style={codeStyle}>npm run start-rh</code> - Interface do RH (porta 3004)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AppBasic; 