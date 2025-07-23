class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
  }

  // Obter ou criar sessão
  getSession(phoneNumber) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    
    if (!this.sessions.has(cleanNumber)) {
      this.createSession(cleanNumber);
    }
    
    const session = this.sessions.get(cleanNumber);
    session.lastActivity = Date.now();
    
    console.log(`📱 [SESSION] Sessão obtida para ${cleanNumber}: Estado=${session.conversationState}, Logado=${session.loggedIn}`);
    
    return session;
  }

  // Criar nova sessão
  createSession(phoneNumber) {
    const session = {
      phoneNumber,
      type: null, // 'cliente', 'barbearia', 'barbeiro'
      loggedIn: false,
      userData: null,
      barbeariaAtual: null,
      loginAttempts: 0,
      lastActivity: Date.now(),
      conversationState: 'initial',
      pendingData: {}
    };
    
    this.sessions.set(phoneNumber, session);
    console.log(`✨ [SESSION] Nova sessão criada para ${phoneNumber}`);
    
    return session;
  }

  // Atualizar sessão
  updateSession(phoneNumber, updates) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    Object.assign(session, updates);
    session.lastActivity = Date.now();
    
    console.log(`🔄 [SESSION] Sessão atualizada para ${cleanNumber}:`, updates);
    
    return session;
  }

  // Definir estado da conversa
  setConversationState(phoneNumber, state) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    session.conversationState = state;
    session.lastActivity = Date.now();
    
    console.log(`🔄 [SESSION] Estado alterado para ${cleanNumber}: ${state}`);
    
    return session;
  }

  // Login de cliente
  loginCliente(phoneNumber, clienteData, barbeariaId) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    session.type = 'cliente';
    session.loggedIn = true;
    session.userData = clienteData;
    session.barbeariaAtual = barbeariaId;
    session.conversationState = 'authenticated';
    session.loginAttempts = 0;
    session.lastActivity = Date.now();
    
    console.log(`✅ [SESSION] Login de cliente realizado para ${cleanNumber}: ${clienteData.nome} (ID: ${clienteData.id})`);
    
    return session;
  }

  // Login de barbearia
  loginBarbearia(phoneNumber, barbeariaData) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    session.type = 'barbearia';
    session.loggedIn = true;
    session.userData = barbeariaData;
    session.barbeariaAtual = barbeariaData.id;
    session.conversationState = 'authenticated';
    session.loginAttempts = 0;
    session.lastActivity = Date.now();
    
    console.log(`✅ [SESSION] Login de barbearia realizado para ${cleanNumber}: ${barbeariaData.nome} (ID: ${barbeariaData.id})`);
    
    return session;
  }

  // Logout/Limpar sessão
  clearSession(phoneNumber) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    
    if (this.sessions.has(cleanNumber)) {
      const session = this.sessions.get(cleanNumber);
      console.log(`🔄 [SESSION] Limpando sessão para ${cleanNumber}: Tipo=${session.type}, Logado=${session.loggedIn}`);
      
      // Resetar para estado inicial
      session.type = null;
      session.loggedIn = false;
      session.userData = null;
      session.barbeariaAtual = null;
      session.loginAttempts = 0;
      session.conversationState = 'initial';
      session.pendingData = {};
      session.lastActivity = Date.now();
      
      console.log(`✅ [SESSION] Sessão limpa para ${cleanNumber}`);
    }
  }

  // Incrementar tentativas de login
  incrementLoginAttempts(phoneNumber) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    session.loginAttempts++;
    session.lastActivity = Date.now();
    
    console.log(`⚠️ [SESSION] Tentativa de login ${session.loginAttempts} para ${cleanNumber}`);
    
    return session;
  }

  // Definir dados pendentes
  setPendingData(phoneNumber, key, value) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    session.pendingData[key] = value;
    session.lastActivity = Date.now();
    
    console.log(`💾 [SESSION] Dados pendentes salvos para ${cleanNumber}: ${key} = ${JSON.stringify(value)}`);
    
    return session;
  }

  // Obter dados pendentes
  getPendingData(phoneNumber, key) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    const value = session.pendingData[key];
    console.log(`📤 [SESSION] Dados pendentes obtidos para ${cleanNumber}: ${key} = ${JSON.stringify(value)}`);
    
    return value;
  }

  // Limpar dados pendentes
  clearPendingData(phoneNumber) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    console.log(`🗑️ [SESSION] Limpando dados pendentes para ${cleanNumber}`);
    session.pendingData = {};
    session.lastActivity = Date.now();
    
    return session;
  }

  // Verificar se usuário está autenticado
  isAuthenticated(phoneNumber) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    const authenticated = session.loggedIn && session.userData;
    console.log(`🔐 [SESSION] Verificação de autenticação para ${cleanNumber}: ${authenticated}`);
    
    return authenticated;
  }

  // Obter tipo de usuário
  getUserType(phoneNumber) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    console.log(`👤 [SESSION] Tipo de usuário para ${cleanNumber}: ${session.type}`);
    
    return session.type;
  }

  // Obter dados do usuário
  getUserData(phoneNumber) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    const session = this.getSession(cleanNumber);
    
    console.log(`📊 [SESSION] Dados do usuário para ${cleanNumber}:`, session.userData ? 'Disponíveis' : 'Não disponíveis');
    
    return session.userData;
  }

  // Limpar sessões expiradas
  cleanExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [phoneNumber, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.sessionTimeout) {
        console.log(`🗑️ [SESSION] Removendo sessão expirada para ${phoneNumber}`);
        this.sessions.delete(phoneNumber);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`✅ [SESSION] ${cleanedCount} sessões expiradas removidas`);
    }
    
    return cleanedCount;
  }

  // Obter estatísticas das sessões
  getSessionStats() {
    const stats = {
      total: this.sessions.size,
      authenticated: 0,
      clientes: 0,
      barbearias: 0,
      barbeiros: 0,
      initial: 0,
      loginProcess: 0
    };
    
    for (const session of this.sessions.values()) {
      if (session.loggedIn) {
        stats.authenticated++;
        
        switch (session.type) {
          case 'cliente':
            stats.clientes++;
            break;
          case 'barbearia':
            stats.barbearias++;
            break;
          case 'barbeiro':
            stats.barbeiros++;
            break;
        }
      }
      
      if (session.conversationState === 'initial') {
        stats.initial++;
      } else if (session.conversationState !== 'authenticated') {
        stats.loginProcess++;
      }
    }
    
    console.log(`📊 [SESSION] Estatísticas:`, stats);
    
    return stats;
  }

  // Listar todas as sessões ativas
  listActiveSessions() {
    const sessions = [];
    
    for (const [phoneNumber, session] of this.sessions.entries()) {
      sessions.push({
        phoneNumber,
        type: session.type,
        loggedIn: session.loggedIn,
        conversationState: session.conversationState,
        lastActivity: new Date(session.lastActivity).toISOString(),
        userData: session.userData ? {
          id: session.userData.id,
          nome: session.userData.nome
        } : null
      });
    }
    
    console.log(`📋 [SESSION] Sessões ativas: ${sessions.length}`);
    
    return sessions;
  }

  // Forçar logout de um usuário
  forceLogout(phoneNumber) {
    const cleanNumber = this.cleanPhoneNumber(phoneNumber);
    
    if (this.sessions.has(cleanNumber)) {
      console.log(`🔒 [SESSION] Forçando logout para ${cleanNumber}`);
      this.clearSession(cleanNumber);
      return true;
    }
    
    console.log(`❌ [SESSION] Sessão não encontrada para logout forçado: ${cleanNumber}`);
    return false;
  }

  // Limpar número de telefone
  cleanPhoneNumber(phoneNumber) {
    return phoneNumber.replace('@s.whatsapp.net', '').replace(/\D/g, '');
  }

  // Inicializar limpeza automática de sessões
  startSessionCleanup() {
    console.log(`🔄 [SESSION] Iniciando limpeza automática de sessões (intervalo: ${this.sessionTimeout / 1000 / 60} minutos)`);
    
    setInterval(() => {
      this.cleanExpiredSessions();
    }, this.sessionTimeout / 2); // Limpar a cada metade do timeout
  }
}

// Instância singleton
const sessionManager = new SessionManager();

// Iniciar limpeza automática
sessionManager.startSessionCleanup();

module.exports = sessionManager;

