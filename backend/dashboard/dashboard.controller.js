const { PrismaClient } = require('@prisma/client');
const si = require('systeminformation');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Cache para métricas do sistema
let systemMetricsCache = {
  cpu: [],
  memory: [],
  network: [],
  lastUpdate: 0
};

// Função para obter métricas do sistema
async function getSystemMetrics() {
  try {
    const [cpu, memory, networkStats, osInfo, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
      si.osInfo(),
      si.processes()
    ]);

    const timestamp = Date.now();
    
    // Adicionar ao cache (manter apenas últimos 100 pontos)
    systemMetricsCache.cpu.push({
      timestamp,
      usage: cpu.currentLoad
    });
    
    systemMetricsCache.memory.push({
      timestamp,
      used: memory.used,
      total: memory.total,
      percentage: (memory.used / memory.total) * 100
    });

    if (networkStats && networkStats.length > 0) {
      systemMetricsCache.network.push({
        timestamp,
        rx: networkStats[0].rx_sec || 0,
        tx: networkStats[0].tx_sec || 0
      });
    }

    // Manter apenas últimos 100 pontos
    if (systemMetricsCache.cpu.length > 100) {
      systemMetricsCache.cpu = systemMetricsCache.cpu.slice(-100);
    }
    if (systemMetricsCache.memory.length > 100) {
      systemMetricsCache.memory = systemMetricsCache.memory.slice(-100);
    }
    if (systemMetricsCache.network.length > 100) {
      systemMetricsCache.network = systemMetricsCache.network.slice(-100);
    }

    systemMetricsCache.lastUpdate = timestamp;

    return {
      cpu: {
        usage: cpu.currentLoad,
        cores: cpu.cpus.length
      },
      memory: {
        used: memory.used,
        total: memory.total,
        percentage: (memory.used / memory.total) * 100
      },
      network: networkStats && networkStats.length > 0 ? {
        rx: networkStats[0].rx_sec || 0,
        tx: networkStats[0].tx_sec || 0
      } : { rx: 0, tx: 0 },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        uptime: osInfo.uptime
      },
      processes: {
        all: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping
      },
      timestamp
    };
  } catch (error) {
    logger.error('Erro ao obter métricas do sistema', error);
    throw error;
  }
}

// Obter status dos serviços
async function getServicesStatus() {
  try {
    // Verificar status do banco de dados
    let dbStatus = 'disconnected';
    let dbError = null;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
      dbError = error.message;
    }

    // Verificar status do WhatsApp (assumindo que há uma função global)
    let whatsappStatus = 'unknown';
    try {
      const whatsappService = require('../whatsapp/whatsapp.service');
      whatsappStatus = whatsappService.isReady() ? 'connected' : 'disconnected';
    } catch (error) {
      whatsappStatus = 'error';
    }

    return {
      database: {
        status: dbStatus,
        error: dbError
      },
      whatsapp: {
        status: whatsappStatus
      },
      api: {
        status: 'running' // Se chegou até aqui, a API está rodando
      }
    };
  } catch (error) {
    logger.error('Erro ao obter status dos serviços', error);
    throw error;
  }
}

// Obter estatísticas do banco de dados
async function getDatabaseStats() {
  try {
    const [
      barbearias,
      clientes,
      barbeiros,
      agendamentos,
      servicos
    ] = await Promise.all([
      prisma.barbearia.count(),
      prisma.cliente.count(),
      prisma.barbeiro.count(),
      prisma.agendamento.count(),
      prisma.servico.count()
    ]);

    // Estatísticas de agendamentos por status
    const agendamentosPorStatus = await prisma.agendamento.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return {
      tables: {
        barbearias,
        clientes,
        barbeiros,
        agendamentos,
        servicos
      },
      agendamentosPorStatus: agendamentosPorStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {})
    };
  } catch (error) {
    logger.error('Erro ao obter estatísticas do banco de dados', error);
    throw error;
  }
}

// Obter logs do sistema
async function getSystemLogs(type = 'all', limit = 100) {
  try {
    const logsDir = path.join(__dirname, '../logs');
    const logFiles = {
      api: 'api.log',
      app: 'app.log',
      error: 'error.log',
      system: 'system.log'
    };

    if (type === 'all') {
      const allLogs = [];
      for (const [logType, fileName] of Object.entries(logFiles)) {
        const filePath = path.join(logsDir, fileName);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            if (line.trim()) {
              try {
                const logEntry = JSON.parse(line);
                allLogs.push({
                  ...logEntry,
                  type: logType
                });
              } catch (e) {
                // Se não for JSON válido, adicionar como texto simples
                allLogs.push({
                  time: new Date().toISOString(),
                  msg: line,
                  type: logType,
                  level: 'info'
                });
              }
            }
          });
        }
      }
      
      // Ordenar por timestamp e limitar
      return allLogs
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, limit);
    } else {
      const fileName = logFiles[type];
      if (!fileName) {
        throw new Error('Tipo de log inválido');
      }

      const filePath = path.join(logsDir, fileName);
      if (!fs.existsSync(filePath)) {
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim()).slice(-limit);
      
      return lines.map(line => {
        try {
          const logEntry = JSON.parse(line);
          return {
            ...logEntry,
            type
          };
        } catch (e) {
          return {
            time: new Date().toISOString(),
            msg: line,
            type,
            level: 'info'
          };
        }
      }).reverse();
    }
  } catch (error) {
    logger.error('Erro ao obter logs do sistema', error);
    throw error;
  }
}

// Executar consulta SQL (somente SELECT)
async function executeQuery(query) {
  try {
    // Verificar se é uma consulta SELECT
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      throw new Error('Apenas consultas SELECT são permitidas');
    }

    const result = await prisma.$queryRawUnsafe(query);
    return result;
  } catch (error) {
    logger.error('Erro ao executar consulta SQL', error);
    throw error;
  }
}

// Limpar logs antigos
async function cleanOldLogs(days = 30) {
  try {
    const logsDir = path.join(__dirname, '../logs');
    const files = fs.readdirSync(logsDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let cleanedFiles = 0;
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        cleanedFiles++;
      }
    }

    logger.system(`Limpeza de logs concluída: ${cleanedFiles} arquivos removidos`);
    return { cleanedFiles, cutoffDate: cutoffDate.toISOString() };
  } catch (error) {
    logger.error('Erro ao limpar logs antigos', error);
    throw error;
  }
}

module.exports = {
  getSystemMetrics,
  getServicesStatus,
  getDatabaseStats,
  getSystemLogs,
  executeQuery,
  cleanOldLogs,
  getSystemMetricsCache: () => systemMetricsCache
};

