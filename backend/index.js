const path = require("path");
const express = require("express");
const cors = require('cors');
const http = require('http');
const barbeariaRoutes = require('./barbearia/barbearia.routes');
const clienteRoutes = require('./cliente/cliente.routes');
const agendamentoRoutes = require('./agendamento/agendamento.routes');
const servicoRoutes = require('./servico/servico.routes');
const barbeiroRoutes = require('./barbeiro/barbeiro.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');
const dashboardWebSocket = require('./dashboard/websocket');
const whatsappService = require('./whatsapp/whatsapp.service');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.json());

// Middleware de logging avançado
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Limpar URL de caracteres inválidos
  req.originalUrl = req.originalUrl.trim();
  req.url = req.url.trim().replace(/[\r\n]+/g, '');
  
  // Log da requisição
  logger.api(req.method, req.originalUrl, 'STARTED', null, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Interceptar a resposta
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log da resposta
    logger.api(req.method, req.originalUrl, res.statusCode, responseTime, {
      ip: req.ip,
      responseSize: data ? data.length : 0
    });
    
    originalSend.call(this, data);
  };

  next();
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  logger.error(`Erro não tratado na rota ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use('/barbearias', barbeariaRoutes);

// Usa as rotas de cliente, prefixadas por /clientes
app.use('/clientes', clienteRoutes);

// Usa as rotas de agendamento, prefixadas por /agendamentos
app.use('/agendamentos', agendamentoRoutes);

// Usa as rotas de serviços, prefixadas por /servicos
app.use('/servicos', servicoRoutes);

// Usa as rotas de barbeiros, prefixadas por /barbeiros
app.use('/barbeiros', barbeiroRoutes);

// Usa as rotas do dashboard, prefixadas por /dashboard
app.use('/dashboard', dashboardRoutes);

// Rota raiz para teste
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Barbearia - API funcionando!',
    version: '2.0.0',
    features: [
      'Gestão de Barbearias',
      'Gestão de Clientes',
      'Gestão de Barbeiros',
      'Gestão de Serviços',
      'Sistema de Agendamentos',
      'Controle de Conflitos',
      'WhatsApp Integrado',
      'Chat Interativo',
      'Logs Avançados'
    ],
    whatsapp: {
      connected: !!whatsappService.isReady(),
      features: [
        'Mensagens Automáticas',
        'Chat Interativo para Barbearias',
        'Chat Interativo para Clientes',
        'Consulta de Agendamentos',
        'Relatórios via WhatsApp'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Rota para verificar status do WhatsApp
app.get('/whatsapp/status', (req, res) => {
  const status = {
    connected: !!whatsappService.isReady(),
    message: whatsappService.isReady() ? 'WhatsApp conectado' : 'WhatsApp desconectado',
    features: [
      'Mensagens automáticas de boas-vindas',
      'Confirmação de agendamentos',
      'Chat interativo para barbearias',
      'Chat interativo para clientes',
      'Consultas de agendamentos',
      'Relatórios e estatísticas'
    ]
  };
  
  res.json(status);
});

// Rota para forçar nova autenticação do WhatsApp
app.post('/whatsapp/reauth', async (req, res) => {
  try {
    logger.system('Forçando nova autenticação do WhatsApp via API');
    await whatsappService.forceReauth();
    res.json({
      message: 'Nova autenticação do WhatsApp iniciada. Verifique o console para escanear o QR Code.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao forçar reautenticação do WhatsApp', error);
    res.status(500).json({ error: 'Erro ao forçar reautenticação do WhatsApp' });
  }
});

// Rota para estatísticas dos logs
app.get('/logs/stats', (req, res) => {
  try {
    const stats = logger.getLogStats();
    res.json({
      message: 'Estatísticas dos logs',
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas dos logs', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas dos logs' });
  }
});

// Rota para limpeza de logs antigos
app.post('/logs/cleanup', (req, res) => {
  try {
    const { days = 30 } = req.body;
    logger.cleanOldLogs(days);
    res.json({
      message: `Logs antigos (mais de ${days} dias) foram removidos`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Erro ao limpar logs antigos', error);
    res.status(500).json({ error: 'Erro ao limpar logs antigos' });
  }
});

const port = process.env.PORT || 3000;

// Criar servidor HTTP para suportar WebSocket
const server = http.createServer(app);

// Inicializar WhatsApp quando o servidor iniciar
async function startServer() {
  try {
    logger.system('Iniciando servidor do sistema de barbearia...');
    
    // Inicializar WhatsApp
    logger.system('Inicializando sistema WhatsApp...');
    await whatsappService.initialize();
    
    // Inicializar WebSocket do dashboard
    dashboardWebSocket.initialize(server);
    
    server.listen(port, '0.0.0.0', () => {
      logger.success(`Servidor rodando na porta ${port}`);
      logger.success(`Dashboard disponível em: http://localhost:${port}/dashboard`);
      logger.system(`WhatsApp Status: ${whatsappService.isReady() ? 'Conectado' : 'Aguardando conexão'}`);
      logger.info('Sistema de barbearia totalmente operacional!', {
        port,
        dashboardUrl: `http://localhost:${port}/dashboard`,
        whatsappConnected: !!whatsappService.isReady(),
        features: [
          'API REST completa',
          'Controle de conflitos de agendamento',
          'WhatsApp integrado',
          'Chat interativo',
          'Logs avançados',
          'Dashboard de monitoramento'
        ]
      });
    });
    
  } catch (error) {
    logger.error('Erro crítico ao iniciar servidor', error);
    process.exit(1);
  }
}

// Tratamento de sinais do sistema
process.on('SIGINT', async () => {
  logger.system('Recebido sinal SIGINT, encerrando servidor...');
  await whatsappService.disconnect();
  logger.system('Servidor encerrado com sucesso');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.system('Recebido sinal SIGTERM, encerrando servidor...');
  await whatsappService.disconnect();
  logger.system('Servidor encerrado com sucesso');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada', { reason, promise });
  process.exit(1);
});

startServer();
