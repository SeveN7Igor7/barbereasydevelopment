const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const logger = require('../utils/logger');

// Middleware para log das requisições do dashboard
router.use((req, res, next) => {
  logger.info(`Dashboard API: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Rota principal do dashboard - serve o HTML
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BarbeEasy - Painel de Controle</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            body { background-color: #0f172a; color: #e2e8f0; }
            .sidebar { background-color: #1e293b; }
            .card { background-color: #1e293b; border: 1px solid #334155; }
            .btn-primary { background-color: #f59e0b; color: #000; }
            .btn-primary:hover { background-color: #d97706; }
            .status-connected { color: #10b981; }
            .status-disconnected { color: #ef4444; }
            .status-error { color: #f59e0b; }
        </style>
    </head>
    <body class="bg-slate-900 text-slate-200">
        <div id="app" class="flex h-screen">
            <!-- Sidebar -->
            <div class="sidebar w-64 p-4 flex flex-col">
                <div class="mb-8">
                    <h1 class="text-2xl font-bold text-yellow-400">BarbeEasy</h1>
                    <p class="text-sm text-slate-400">Painel de Controle</p>
                </div>
                
                <nav class="flex-1">
                    <ul class="space-y-2">
                        <li><a href="#dashboard" class="nav-link flex items-center p-3 rounded hover:bg-slate-700 cursor-pointer" onclick="showSection('dashboard')">
                            <i class="fas fa-tachometer-alt mr-3"></i> Dashboard
                        </a></li>
                        <li><a href="#system" class="nav-link flex items-center p-3 rounded hover:bg-slate-700 cursor-pointer" onclick="showSection('system')">
                            <i class="fas fa-server mr-3"></i> Sistema
                        </a></li>
                        <li><a href="#database" class="nav-link flex items-center p-3 rounded hover:bg-slate-700 cursor-pointer" onclick="showSection('database')">
                            <i class="fas fa-database mr-3"></i> Banco de Dados
                        </a></li>
                        <li><a href="#logs" class="nav-link flex items-center p-3 rounded hover:bg-slate-700 cursor-pointer" onclick="showSection('logs')">
                            <i class="fas fa-file-alt mr-3"></i> Logs
                        </a></li>
                        <li><a href="#services" class="nav-link flex items-center p-3 rounded hover:bg-slate-700 cursor-pointer" onclick="showSection('services')">
                            <i class="fas fa-cogs mr-3"></i> Serviços
                        </a></li>
                        <li><a href="#console" class="nav-link flex items-center p-3 rounded hover:bg-slate-700 cursor-pointer" onclick="showSection('console')">
                            <i class="fas fa-terminal mr-3"></i> Console
                        </a></li>
                    </ul>
                </nav>
                
                <div class="mt-auto">
                    <div class="text-xs text-slate-500">
                        <p>Uptime: <span id="uptime">--</span></p>
                        <p>Última atualização: <span id="lastUpdate">--</span></p>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 p-6 overflow-auto">
                <!-- Dashboard Section -->
                <div id="dashboard-section" class="section">
                    <h2 class="text-3xl font-bold mb-6">Dashboard</h2>
                    
                    <!-- Status Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="card p-6 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-slate-400">CPU</p>
                                    <p class="text-2xl font-bold" id="cpu-usage">--</p>
                                </div>
                                <i class="fas fa-microchip text-3xl text-blue-400"></i>
                            </div>
                        </div>
                        
                        <div class="card p-6 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-slate-400">Memória</p>
                                    <p class="text-2xl font-bold" id="memory-usage">--</p>
                                </div>
                                <i class="fas fa-memory text-3xl text-green-400"></i>
                            </div>
                        </div>
                        
                        <div class="card p-6 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-slate-400">Banco de Dados</p>
                                    <p class="text-lg font-bold" id="db-status">--</p>
                                </div>
                                <i class="fas fa-database text-3xl text-purple-400"></i>
                            </div>
                        </div>
                        
                        <div class="card p-6 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-slate-400">WhatsApp</p>
                                    <p class="text-lg font-bold" id="whatsapp-status">--</p>
                                </div>
                                <i class="fab fa-whatsapp text-3xl text-green-500"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Charts -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="card p-6 rounded-lg">
                            <h3 class="text-xl font-bold mb-4">CPU Usage</h3>
                            <canvas id="cpuChart" width="400" height="200"></canvas>
                        </div>
                        
                        <div class="card p-6 rounded-lg">
                            <h3 class="text-xl font-bold mb-4">Memory Usage</h3>
                            <canvas id="memoryChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>

                <!-- System Section -->
                <div id="system-section" class="section hidden">
                    <h2 class="text-3xl font-bold mb-6">Informações do Sistema</h2>
                    <div class="card p-6 rounded-lg">
                        <div id="system-info">Carregando...</div>
                    </div>
                </div>

                <!-- Database Section -->
                <div id="database-section" class="section hidden">
                    <h2 class="text-3xl font-bold mb-6">Banco de Dados</h2>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div class="card p-6 rounded-lg">
                            <h3 class="text-xl font-bold mb-4">Estatísticas</h3>
                            <div id="db-stats">Carregando...</div>
                        </div>
                        
                        <div class="card p-6 rounded-lg">
                            <h3 class="text-xl font-bold mb-4">Consulta SQL</h3>
                            <textarea id="sql-query" class="w-full h-32 p-3 bg-slate-800 border border-slate-600 rounded text-white" placeholder="SELECT * FROM barbearia LIMIT 10;"></textarea>
                            <button onclick="executeQuery()" class="btn-primary px-4 py-2 rounded mt-3">Executar</button>
                            <div id="query-result" class="mt-4"></div>
                        </div>
                    </div>
                </div>

                <!-- Logs Section -->
                <div id="logs-section" class="section hidden">
                    <h2 class="text-3xl font-bold mb-6">Logs do Sistema</h2>
                    
                    <div class="mb-4 flex gap-4">
                        <select id="log-type" class="bg-slate-800 border border-slate-600 rounded px-3 py-2">
                            <option value="all">Todos os Logs</option>
                            <option value="api">API</option>
                            <option value="app">App</option>
                            <option value="error">Erro</option>
                            <option value="system">Sistema</option>
                        </select>
                        <button onclick="loadLogs()" class="btn-primary px-4 py-2 rounded">Atualizar</button>
                        <button onclick="clearLogs()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">Limpar Logs Antigos</button>
                    </div>
                    
                    <div class="card p-6 rounded-lg">
                        <div id="logs-container" class="h-96 overflow-auto bg-black p-4 rounded font-mono text-sm">
                            Carregando logs...
                        </div>
                    </div>
                </div>

                <!-- Services Section -->
                <div id="services-section" class="section hidden">
                    <h2 class="text-3xl font-bold mb-6">Controle de Serviços</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="card p-6 rounded-lg">
                            <h3 class="text-xl font-bold mb-4">WhatsApp</h3>
                            <div class="space-y-3">
                                <div>Status: <span id="service-whatsapp-status">--</span></div>
                                <button onclick="reAuthWhatsApp()" class="btn-primary px-4 py-2 rounded">Reautenticar</button>
                            </div>
                        </div>
                        
                        <div class="card p-6 rounded-lg">
                            <h3 class="text-xl font-bold mb-4">Manutenção</h3>
                            <div class="space-y-3">
                                <button onclick="cleanLogs()" class="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white">Limpar Logs</button>
                                <button onclick="restartServer()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">Reiniciar Servidor</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Console Section -->
                <div id="console-section" class="section hidden">
                    <h2 class="text-3xl font-bold mb-6">Console em Tempo Real</h2>
                    
                    <div class="card p-6 rounded-lg">
                        <div id="console-output" class="h-96 overflow-auto bg-black p-4 rounded font-mono text-sm text-green-400">
                            Conectando ao console...
                        </div>
                        <div class="mt-4 flex">
                            <input type="text" id="console-input" class="flex-1 bg-slate-800 border border-slate-600 rounded-l px-3 py-2" placeholder="Digite um comando...">
                            <button onclick="sendCommand()" class="btn-primary px-4 py-2 rounded-r">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let cpuChart, memoryChart;
            let ws;
            
            // Inicializar dashboard
            document.addEventListener('DOMContentLoaded', function() {
                initCharts();
                connectWebSocket();
                loadDashboardData();
                setInterval(loadDashboardData, 5000); // Atualizar a cada 5 segundos
            });

            function initCharts() {
                // CPU Chart
                const cpuCtx = document.getElementById('cpuChart').getContext('2d');
                cpuChart = new Chart(cpuCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'CPU Usage (%)',
                            data: [],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { labels: { color: '#e2e8f0' } } },
                        scales: {
                            y: { beginAtZero: true, max: 100, ticks: { color: '#e2e8f0' } },
                            x: { ticks: { color: '#e2e8f0' } }
                        }
                    }
                });

                // Memory Chart
                const memoryCtx = document.getElementById('memoryChart').getContext('2d');
                memoryChart = new Chart(memoryCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Memory Usage (%)',
                            data: [],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { labels: { color: '#e2e8f0' } } },
                        scales: {
                            y: { beginAtZero: true, max: 100, ticks: { color: '#e2e8f0' } },
                            x: { ticks: { color: '#e2e8f0' } }
                        }
                    }
                });
            }

            function connectWebSocket() {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                ws = new WebSocket(protocol + '//' + window.location.host + '/dashboard/ws');
                
                ws.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    if (data.type === 'console') {
                        appendToConsole(data.message);
                    }
                };
                
                ws.onclose = function() {
                    setTimeout(connectWebSocket, 5000); // Reconectar após 5 segundos
                };
            }

            async function loadDashboardData() {
                try {
                    const [metrics, services, dbStats] = await Promise.all([
                        fetch('/dashboard/api/metrics').then(r => r.json()),
                        fetch('/dashboard/api/services').then(r => r.json()),
                        fetch('/dashboard/api/database/stats').then(r => r.json())
                    ]);

                    updateMetrics(metrics);
                    updateServices(services);
                    updateDatabaseStats(dbStats);
                    updateCharts(metrics);
                } catch (error) {
                    console.error('Erro ao carregar dados:', error);
                }
            }

            function updateMetrics(data) {
                document.getElementById('cpu-usage').textContent = data.cpu.usage.toFixed(1) + '%';
                document.getElementById('memory-usage').textContent = data.memory.percentage.toFixed(1) + '%';
                document.getElementById('uptime').textContent = formatUptime(data.os.uptime);
                document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
            }

            function updateServices(data) {
                const dbStatus = document.getElementById('db-status');
                const whatsappStatus = document.getElementById('whatsapp-status');
                const serviceWhatsappStatus = document.getElementById('service-whatsapp-status');

                dbStatus.textContent = data.database.status;
                dbStatus.className = 'text-lg font-bold status-' + data.database.status;

                whatsappStatus.textContent = data.whatsapp.status;
                whatsappStatus.className = 'text-lg font-bold status-' + data.whatsapp.status;

                if (serviceWhatsappStatus) {
                    serviceWhatsappStatus.textContent = data.whatsapp.status;
                    serviceWhatsappStatus.className = 'status-' + data.whatsapp.status;
                }
            }

            function updateDatabaseStats(data) {
                const container = document.getElementById('db-stats');
                if (container) {
                    container.innerHTML = \`
                        <div class="space-y-2">
                            <div>Barbearias: <span class="font-bold">\${data.tables.barbearias}</span></div>
                            <div>Clientes: <span class="font-bold">\${data.tables.clientes}</span></div>
                            <div>Barbeiros: <span class="font-bold">\${data.tables.barbeiros}</span></div>
                            <div>Agendamentos: <span class="font-bold">\${data.tables.agendamentos}</span></div>
                            <div>Serviços: <span class="font-bold">\${data.tables.servicos}</span></div>
                        </div>
                    \`;
                }
            }

            function updateCharts(data) {
                const now = new Date().toLocaleTimeString();
                
                // CPU Chart
                cpuChart.data.labels.push(now);
                cpuChart.data.datasets[0].data.push(data.cpu.usage);
                
                if (cpuChart.data.labels.length > 20) {
                    cpuChart.data.labels.shift();
                    cpuChart.data.datasets[0].data.shift();
                }
                cpuChart.update('none');

                // Memory Chart
                memoryChart.data.labels.push(now);
                memoryChart.data.datasets[0].data.push(data.memory.percentage);
                
                if (memoryChart.data.labels.length > 20) {
                    memoryChart.data.labels.shift();
                    memoryChart.data.datasets[0].data.shift();
                }
                memoryChart.update('none');
            }

            function showSection(sectionName) {
                // Esconder todas as seções
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Mostrar seção selecionada
                document.getElementById(sectionName + '-section').classList.remove('hidden');
                
                // Atualizar navegação
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('bg-slate-700');
                });
                event.target.closest('.nav-link').classList.add('bg-slate-700');

                // Carregar dados específicos da seção
                if (sectionName === 'logs') {
                    loadLogs();
                } else if (sectionName === 'system') {
                    loadSystemInfo();
                }
            }

            async function loadLogs() {
                const type = document.getElementById('log-type').value;
                try {
                    const response = await fetch(\`/dashboard/api/logs?type=\${type}&limit=100\`);
                    const logs = await response.json();
                    
                    const container = document.getElementById('logs-container');
                    container.innerHTML = logs.map(log => {
                        const time = new Date(log.time).toLocaleString();
                        const level = log.level || 'info';
                        const color = level === 'error' ? 'text-red-400' : level === 'warn' ? 'text-yellow-400' : 'text-green-400';
                        return \`<div class="\${color}">[<span class="text-slate-400">\${time}</span>] [\${level.toUpperCase()}] \${log.msg}</div>\`;
                    }).join('');
                } catch (error) {
                    console.error('Erro ao carregar logs:', error);
                }
            }

            async function loadSystemInfo() {
                try {
                    const response = await fetch('/dashboard/api/metrics');
                    const data = await response.json();
                    
                    const container = document.getElementById('system-info');
                    container.innerHTML = \`
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-lg font-bold mb-3">Sistema Operacional</h4>
                                <div class="space-y-2">
                                    <div>Plataforma: <span class="font-bold">\${data.os.platform}</span></div>
                                    <div>Distribuição: <span class="font-bold">\${data.os.distro}</span></div>
                                    <div>Release: <span class="font-bold">\${data.os.release}</span></div>
                                    <div>Uptime: <span class="font-bold">\${formatUptime(data.os.uptime)}</span></div>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-lg font-bold mb-3">Processos</h4>
                                <div class="space-y-2">
                                    <div>Total: <span class="font-bold">\${data.processes.all}</span></div>
                                    <div>Executando: <span class="font-bold">\${data.processes.running}</span></div>
                                    <div>Bloqueados: <span class="font-bold">\${data.processes.blocked}</span></div>
                                    <div>Dormindo: <span class="font-bold">\${data.processes.sleeping}</span></div>
                                </div>
                            </div>
                        </div>
                    \`;
                } catch (error) {
                    console.error('Erro ao carregar informações do sistema:', error);
                }
            }

            async function executeQuery() {
                const query = document.getElementById('sql-query').value;
                if (!query.trim()) return;

                try {
                    const response = await fetch('/dashboard/api/database/query', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query })
                    });
                    
                    const result = await response.json();
                    
                    const container = document.getElementById('query-result');
                    if (result.error) {
                        container.innerHTML = \`<div class="text-red-400">Erro: \${result.error}</div>\`;
                    } else {
                        container.innerHTML = \`
                            <div class="overflow-auto">
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr class="border-b border-slate-600">
                                            \${Object.keys(result[0] || {}).map(key => \`<th class="text-left p-2">\${key}</th>\`).join('')}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        \${result.map(row => \`
                                            <tr class="border-b border-slate-700">
                                                \${Object.values(row).map(value => \`<td class="p-2">\${value}</td>\`).join('')}
                                            </tr>
                                        \`).join('')}
                                    </tbody>
                                </table>
                            </div>
                        \`;
                    }
                } catch (error) {
                    document.getElementById('query-result').innerHTML = \`<div class="text-red-400">Erro: \${error.message}</div>\`;
                }
            }

            async function reAuthWhatsApp() {
                try {
                    const response = await fetch('/whatsapp/reauth', { method: 'POST' });
                    const result = await response.json();
                    alert(result.message);
                } catch (error) {
                    alert('Erro ao reautenticar WhatsApp: ' + error.message);
                }
            }

            async function clearLogs() {
                if (confirm('Tem certeza que deseja limpar logs antigos?')) {
                    try {
                        const response = await fetch('/logs/cleanup', { method: 'POST' });
                        const result = await response.json();
                        alert(result.message);
                    } catch (error) {
                        alert('Erro ao limpar logs: ' + error.message);
                    }
                }
            }

            function appendToConsole(message) {
                const container = document.getElementById('console-output');
                const div = document.createElement('div');
                div.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
                container.appendChild(div);
                container.scrollTop = container.scrollHeight;
            }

            function sendCommand() {
                const input = document.getElementById('console-input');
                const command = input.value.trim();
                if (command && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'command', command }));
                    input.value = '';
                }
            }

            function formatUptime(seconds) {
                const days = Math.floor(seconds / 86400);
                const hours = Math.floor((seconds % 86400) / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                return \`\${days}d \${hours}h \${minutes}m\`;
            }

            // Enter key para enviar comando
            document.getElementById('console-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendCommand();
                }
            });
        </script>
    </body>
    </html>
  `);
});

// API Routes
router.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await dashboardController.getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Erro ao obter métricas do sistema', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/services', async (req, res) => {
  try {
    const services = await dashboardController.getServicesStatus();
    res.json(services);
  } catch (error) {
    logger.error('Erro ao obter status dos serviços', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/database/stats', async (req, res) => {
  try {
    const stats = await dashboardController.getDatabaseStats();
    res.json(stats);
  } catch (error) {
    logger.error('Erro ao obter estatísticas do banco de dados', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/logs', async (req, res) => {
  try {
    const { type = 'all', limit = 100 } = req.query;
    const logs = await dashboardController.getSystemLogs(type, parseInt(limit));
    res.json(logs);
  } catch (error) {
    logger.error('Erro ao obter logs do sistema', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/database/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query é obrigatória' });
    }
    
    const result = await dashboardController.executeQuery(query);
    res.json(result);
  } catch (error) {
    logger.error('Erro ao executar consulta SQL', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/logs/clean', async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const result = await dashboardController.cleanOldLogs(days);
    res.json({
      message: `Logs antigos removidos com sucesso`,
      ...result
    });
  } catch (error) {
    logger.error('Erro ao limpar logs antigos', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

