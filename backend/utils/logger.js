const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.formatTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    
    return JSON.stringify(logEntry);
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    const logLine = content + '\n';
    
    try {
      fs.appendFileSync(filePath, logLine);
    } catch (error) {
      console.error('❌ Erro ao escrever log:', error);
    }
  }

  // Logs de informação geral
  info(message, data = null) {
    const logMessage = this.formatMessage('INFO', message, data);
    console.log(`ℹ️  ${message}`, data ? data : '');
    this.writeToFile('app.log', logMessage);
  }

  // Logs de sucesso
  success(message, data = null) {
    const logMessage = this.formatMessage('SUCCESS', message, data);
    console.log(`✅ ${message}`, data ? data : '');
    this.writeToFile('app.log', logMessage);
  }

  // Logs de aviso
  warn(message, data = null) {
    const logMessage = this.formatMessage('WARN', message, data);
    console.log(`⚠️  ${message}`, data ? data : '');
    this.writeToFile('app.log', logMessage);
  }

  // Logs de erro
  error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null;
    
    const logMessage = this.formatMessage('ERROR', message, errorData);
    console.error(`❌ ${message}`, error ? error : '');
    this.writeToFile('error.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  // Logs específicos para WhatsApp
  whatsapp(message, data = null) {
    const logMessage = this.formatMessage('WHATSAPP', message, data);
    console.log(`📱 ${message}`, data ? data : '');
    this.writeToFile('whatsapp.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  // Logs específicos para API
  api(method, url, statusCode, responseTime = null, data = null) {
    const apiData = {
      method,
      url,
      statusCode,
      responseTime,
      ...data
    };
    
    const logMessage = this.formatMessage('API', `${method} ${url} - ${statusCode}`, apiData);
    
    const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✅' : 
                       statusCode >= 400 && statusCode < 500 ? '⚠️' : '❌';
    
    console.log(`${statusEmoji} ${method} ${url} - ${statusCode}${responseTime ? ` (${responseTime}ms)` : ''}`);
    this.writeToFile('api.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  // Logs específicos para banco de dados
  database(operation, table, data = null) {
    const dbData = {
      operation,
      table,
      ...data
    };
    
    const logMessage = this.formatMessage('DATABASE', `${operation} on ${table}`, dbData);
    console.log(`🗄️  ${operation} on ${table}`, data ? data : '');
    this.writeToFile('database.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  // Logs de sistema
  system(message, data = null) {
    const logMessage = this.formatMessage('SYSTEM', message, data);
    console.log(`🔧 ${message}`, data ? data : '');
    this.writeToFile('system.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  // Método para limpar logs antigos (opcional)
  cleanOldLogs(daysToKeep = 30) {
    const files = fs.readdirSync(this.logDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    files.forEach(file => {
      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        this.info(`Log antigo removido: ${file}`);
      }
    });
  }

  // Método para obter estatísticas dos logs
  getLogStats() {
    try {
      const files = fs.readdirSync(this.logDir);
      const stats = {};
      
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const fileStats = fs.statSync(filePath);
        stats[file] = {
          size: fileStats.size,
          created: fileStats.birthtime,
          modified: fileStats.mtime
        };
      });
      
      return stats;
    } catch (error) {
      this.error('Erro ao obter estatísticas dos logs', error);
      return {};
    }
  }
}

// Instância singleton
const logger = new Logger();

module.exports = logger;

