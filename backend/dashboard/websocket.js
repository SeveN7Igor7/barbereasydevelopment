const WebSocket = require('ws');
const logger = require('../utils/logger');

class DashboardWebSocket {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/dashboard/ws'
    });

    this.wss.on('connection', (ws, req) => {
      logger.info('Nova conexão WebSocket do dashboard', {
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      this.clients.add(ws);

      // Enviar mensagem de boas-vindas
      ws.send(JSON.stringify({
        type: 'console',
        message: 'Conectado ao console do BarbeEasy Dashboard'
      }));

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error('Erro ao processar mensagem WebSocket', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('Conexão WebSocket do dashboard fechada');
      });

      ws.on('error', (error) => {
        logger.error('Erro na conexão WebSocket do dashboard', error);
        this.clients.delete(ws);
      });
    });

    // Interceptar logs do sistema para enviar via WebSocket
    this.interceptLogs();

    logger.success('WebSocket do dashboard inicializado');
  }

  handleMessage(ws, message) {
    switch (message.type) {
      case 'command':
        this.handleCommand(ws, message.command);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      default:
        logger.warn('Tipo de mensagem WebSocket desconhecido', { type: message.type });
    }
  }

  handleCommand(ws, command) {
    // Por segurança, limitamos os comandos disponíveis
    const allowedCommands = [
      'status',
      'uptime',
      'ps aux | head -10',
      'df -h',
      'free -h',
      'whoami'
    ];

    if (!allowedCommands.includes(command)) {
      ws.send(JSON.stringify({
        type: 'console',
        message: `Comando não permitido: ${command}`
      }));
      return;
    }

    const { exec } = require('child_process');
    exec(command, (error, stdout, stderr) => {
      let output = '';
      
      if (error) {
        output = `Erro: ${error.message}`;
      } else if (stderr) {
        output = `Stderr: ${stderr}`;
      } else {
        output = stdout;
      }

      ws.send(JSON.stringify({
        type: 'console',
        message: `$ ${command}\n${output}`
      }));
    });
  }

  interceptLogs() {
    // Interceptar console.log, console.error, etc.
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog.apply(console, args);
      this.broadcast({
        type: 'console',
        message: args.join(' ')
      });
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      this.broadcast({
        type: 'console',
        message: `[ERROR] ${args.join(' ')}`
      });
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      this.broadcast({
        type: 'console',
        message: `[WARN] ${args.join(' ')}`
      });
    };
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (error) {
          logger.error('Erro ao enviar mensagem WebSocket', error);
          this.clients.delete(client);
        }
      }
    });
  }

  sendToAll(type, message) {
    this.broadcast({ type, message });
  }

  getConnectedClients() {
    return this.clients.size;
  }
}

module.exports = new DashboardWebSocket();

