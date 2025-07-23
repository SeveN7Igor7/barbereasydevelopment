const { 
  default: makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const ChatHandler = require('./chat.handler');
const AIChatHandler = require('../ai/ai.chat.handler');
const geminiService = require('../ai/gemini.service');

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.isConnected = false;
    this.authDir = path.join(__dirname, 'auth_info');
    this.logger = P({ level: 'silent' });
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  // Função para formatar número de telefone
  formatPhoneNumber(phoneNumber) {
    // Remove todos os caracteres não numéricos
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Se o número começa com 55 (Brasil) e tem 13 dígitos, remove o 9 após o DDD
    if (cleanNumber.startsWith('55') && cleanNumber.length === 13) {
      // Formato: 5589994582600 -> 558994582600
      cleanNumber = cleanNumber.substring(0, 4) + cleanNumber.substring(5);
    }
    
    // Adiciona @s.whatsapp.net se não tiver
    if (!cleanNumber.includes('@')) {
      cleanNumber += '@s.whatsapp.net';
    }
    
    return cleanNumber;
  }

  // Limpar credenciais corrompidas
  clearAuthInfo() {
    try {
      if (fs.existsSync(this.authDir)) {
        console.log('🧹 Limpando credenciais corrompidas do WhatsApp...');
        fs.rmSync(this.authDir, { recursive: true, force: true });
        console.log('✅ Credenciais removidas com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao limpar credenciais:', error);
    }
  }

  async initialize() {
    try {
      console.log('🔄 Inicializando WhatsApp...');
      
      // Verificar status do sistema de IA
      if (geminiService.isSystemActive()) {
        console.log('🤖 Sistema de IA ativado - Usando chat inteligente');
      } else {
        console.log('💬 Sistema de IA desativado - Usando chat padrão');
      }
      
      // Criar diretório de autenticação se não existir
      if (!fs.existsSync(this.authDir)) {
        fs.mkdirSync(this.authDir, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      const { version, isLatest } = await fetchLatestBaileysVersion();
      
      console.log(`📱 Usando WhatsApp v${version.join('.')}, é a mais recente: ${isLatest}`);

      this.sock = makeWASocket({
        version,
        logger: this.logger,
        printQRInTerminal: false, // Vamos controlar o QR manualmente
        auth: state,
        generateHighQualityLinkPreview: true,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
      });

      // Eventos de conexão
      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          console.log('\n📱 QR Code gerado! Escaneie com seu WhatsApp:');
          console.log('📱 Abra o WhatsApp no seu celular > Menu (3 pontos) > Dispositivos conectados > Conectar dispositivo');
          console.log('📱 Escaneie o QR Code abaixo:\n');
          qrcode.generate(qr, { small: true });
          console.log('\n⏰ O QR Code expira em 20 segundos. Se não conseguir escanear, o sistema tentará gerar um novo.');
        }
        
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
          const statusCode = (lastDisconnect?.error)?.output?.statusCode;
          
          console.log('❌ Conexão fechada devido a:', lastDisconnect?.error);
          console.log('📊 Status Code:', statusCode);
          console.log('🔄 Deve reconectar:', shouldReconnect);
          
          this.isConnected = false;
          
          // Verificar se é erro de autenticação (401, 403, etc.)
          if (statusCode === 401 || statusCode === 403 || statusCode === DisconnectReason.badSession) {
            console.log('🧹 Erro de autenticação detectado. Limpando credenciais...');
            this.clearAuthInfo();
            this.reconnectAttempts = 0;
          }
          
          if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em 5 segundos...`);
            setTimeout(() => this.initialize(), 5000);
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Máximo de tentativas de reconexão atingido. Limpando credenciais e reiniciando...');
            this.clearAuthInfo();
            this.reconnectAttempts = 0;
            setTimeout(() => this.initialize(), 3000);
          } else {
            console.log('❌ WhatsApp desconectado permanentemente. Reinicie o servidor para tentar novamente.');
          }
        } else if (connection === 'open') {
          console.log('✅ WhatsApp conectado com sucesso!');
          if (geminiService.isSystemActive()) {
            console.log('🤖 Sistema de chat inteligente ativado!');
          } else {
            console.log('💬 Sistema de chat interativo ativado!');
          }
          this.isConnected = true;
          this.reconnectAttempts = 0;
        } else if (connection === 'connecting') {
          console.log('🔄 Conectando ao WhatsApp...');
        }
      });

      // Processar mensagens recebidas
      this.sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        
        if (!message.key.fromMe && message.message) {
          const phoneNumber = message.key.remoteJid;
          const messageText = message.message.conversation || 
                             message.message.extendedTextMessage?.text || '';
          
          if (messageText.trim()) {
            await this.processIncomingMessage(phoneNumber, messageText);
          }
        }
      });

      // Salvar credenciais quando atualizadas
      this.sock.ev.on('creds.update', saveCreds);

      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp:', error);
      
      // Se for erro de credenciais, limpar e tentar novamente
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('🧹 Erro de credenciais detectado. Limpando e tentando novamente...');
        this.clearAuthInfo();
        setTimeout(() => this.initialize(), 3000);
      }
      
      return false;
    }
  }

  async processIncomingMessage(phoneNumber, messageText) {
    try {
      // Tentar processar com IA primeiro (se ativa)
      if (geminiService.isSystemActive()) {
        const aiProcessed = await AIChatHandler.processMessage(phoneNumber, messageText, this);
        
        if (aiProcessed) {
          console.log('🤖 Mensagem processada pela IA');
          return;
        }
      }
      
      // Fallback para chat handler padrão
      console.log('💬 Usando chat handler padrão');
      await ChatHandler.processMessage(phoneNumber, messageText, this);
      
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      
      // Mensagem de erro para o usuário
      await this.sendMessage(phoneNumber, 
        '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.'
      );
    }
  }

  async sendMessage(phoneNumber, message) {
    try {
      if (!this.isConnected || !this.sock) {
        console.log('❌ WhatsApp não está conectado');
        return { success: false, error: 'WhatsApp não conectado' };
      }

      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      console.log(`📤 Enviando mensagem para: ${formattedNumber}`);
      console.log(`📝 Mensagem: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);

      await this.sock.sendMessage(formattedNumber, { text: message });
      
      console.log('✅ Mensagem enviada com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return { success: false, error: error.message };
    }
  }

  isReady() {
    return this.isConnected && this.sock;
  }

  async disconnect() {
    if (this.sock) {
      try {
        await this.sock.logout();
        console.log('📱 WhatsApp desconectado');
      } catch (error) {
        console.error('❌ Erro ao desconectar WhatsApp:', error);
      }
      this.sock = null;
      this.isConnected = false;
    }
  }

  // Método para forçar nova autenticação
  async forceReauth() {
    console.log('🔄 Forçando nova autenticação...');
    await this.disconnect();
    this.clearAuthInfo();
    this.reconnectAttempts = 0;
    setTimeout(() => this.initialize(), 2000);
  }
}

// Instância singleton
const whatsappService = new WhatsAppService();

module.exports = whatsappService;

