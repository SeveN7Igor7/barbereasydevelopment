# BarberEasy - Sistema de Barbearia com IA Avançada

## 🚀 Funcionalidades Implementadas

### ✅ Integração Real com Banco de Dados
- **Consultas reais** de agendamentos, clientes, barbeiros e serviços
- **Dados atualizados** diretamente do PostgreSQL
- **Logs detalhados** de todas as operações de banco de dados
- **Sem simulações** - todas as informações são reais

### 🤖 Assistente IA Inteligente
- **Gemini AI** integrada para conversas naturais
- **Contexto real** do banco de dados em todas as respostas
- **Autenticação** de clientes e barbearias
- **Histórico de conversas** salvo no banco
- **Troca de conta** fácil e intuitiva
- **Comandos especiais** para ações específicas

### 📱 WhatsApp Integrado
- **Chat interativo** via WhatsApp
- **Login seguro** para clientes e barbearias
- **Consultas em tempo real** de agendamentos
- **Notificações automáticas** de confirmação
- **Interface conversacional** sem menções a botões ou interfaces gráficas

### 🔧 Funcionalidades para Clientes
- ✅ **Login** com telefone e nome
- ✅ **Consulta de agendamentos** reais
- ✅ **Cancelamento de agendamentos** via WhatsApp
- ✅ **Informações de serviços** e preços reais
- ✅ **Dados da equipe** de barbeiros
- ✅ **Troca de conta** simples e rápida
- 🔄 **Reagendamento** (em desenvolvimento)

### 🏪 Funcionalidades para Barbearias
- ✅ **Login** com email e senha
- ✅ **Agenda do dia** com dados reais
- ✅ **Agenda de amanhã** e da semana
- ✅ **Relatórios de agendamentos** reais
- ✅ **Informações da equipe** atualizada
- ✅ **Dados de serviços** e preços
- ✅ **Troca de conta** para gerenciar múltiplas barbearias

### 🔍 Sistema de Logs Avançado
- **Logs detalhados** de todas as operações de banco de dados
- **Entrada e saída** de todas as requisições
- **Rastreamento** de sessões de usuários
- **Monitoramento** de autenticação
- **Estatísticas** de uso em tempo real

## 🛠️ Tecnologias Utilizadas

- **Node.js** + **Express** - Backend API
- **Prisma ORM** - Gerenciamento do banco de dados
- **PostgreSQL** - Banco de dados principal
- **WhatsApp Web.js** - Integração com WhatsApp
- **Google Gemini AI** - Inteligência artificial conversacional
- **Axios** - Requisições HTTP

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `Barbearia` - Dados das barbearias
- `Cliente` - Informações dos clientes
- `Barbeiro` - Dados dos profissionais
- `Agendamento` - Agendamentos com status real
- `Servico` - Serviços oferecidos
- `ConversaIA` - Histórico de conversas com IA

### Status de Agendamentos
- `AGENDAMENTO_PROGRAMADO` - Agendado
- `ATENDIDO` - Concluído
- `CANCELADO` - Cancelado

## 🔐 Sistema de Autenticação

### Para Clientes
1. Informar número de telefone
2. Informar nome completo
3. Sistema busca no banco de dados real
4. Login automático se encontrado
5. Seleção de barbearia se múltiplas opções

### Para Barbearias
1. Informar email cadastrado
2. Informar senha
3. Autenticação no banco de dados
4. Acesso ao painel administrativo

### Troca de Conta
- Comando: "trocar conta", "mudar conta", "sair", "logout"
- Logout automático e reinício do processo de login
- Suporte a múltiplas contas por usuário

## 🚀 Como Usar

### Instalação
```bash
npm install
```

### Configuração
1. Configure o arquivo `.env` com:
   - `DATABASE_URL` - URL do PostgreSQL
   - `GEMINI_API_KEY` - Chave da API do Gemini
   - `AI_SYSTEM_ACTIVE` - "ATIVO" ou "INATIVO"

### Executar
```bash
npm start
```

### Conectar WhatsApp
1. Execute o projeto
2. Escaneie o QR Code que aparece no console
3. WhatsApp será conectado automaticamente

## 📱 Comandos do WhatsApp

### Comandos Gerais
- `oi`, `olá`, `menu` - Iniciar conversa
- `1` ou `cliente` - Login como cliente
- `2` ou `barbearia` - Login como barbearia

### Comandos de Troca de Conta
- `trocar conta`, `mudar conta` - Trocar de conta
- `sair`, `logout` - Fazer logout
- `nova conta`, `outra conta` - Acessar conta diferente

### Para Clientes (após login)
- `meus agendamentos` - Ver agendamentos futuros
- `próximo agendamento` - Ver próximo agendamento
- `histórico` - Ver histórico de atendimentos
- `cancelar agendamento` - Cancelar agendamento específico
- `serviços` - Ver serviços e preços
- `barbeiros` - Ver equipe de barbeiros
- `reagendar` - Reagendar agendamento (em desenvolvimento)

### Para Barbearias (após login)
- `agendamentos hoje` - Ver agenda de hoje
- `agendamentos amanhã` - Ver agenda de amanhã
- `agendamentos semana` - Ver agenda da semana
- `equipe` - Ver dados da equipe
- `serviços` - Ver serviços oferecidos
- `relatório` - Relatórios e estatísticas

## 🔄 Endpoints da API

### Agendamentos
- `GET /agendamentos/:id` - Buscar por ID
- `GET /agendamentos/cliente/:clienteId` - Por cliente
- `GET /agendamentos/barbearia/:barbeariaId` - Por barbearia
- `POST /agendamentos` - Criar agendamento
- `PUT /agendamentos/:id` - Atualizar agendamento

### Clientes
- `GET /clientes` - Listar clientes
- `GET /clientes/:id` - Buscar por ID
- `POST /clientes` - Criar cliente
- `PUT /clientes/:id` - Atualizar cliente

### Barbearias
- `GET /barbearias` - Listar barbearias
- `GET /barbearias/:id` - Buscar por ID
- `POST /barbearias` - Criar barbearia
- `PUT /barbearias/:id` - Atualizar barbearia

### Barbeiros
- `GET /barbeiros` - Listar barbeiros
- `GET /barbeiros/barbearia/:barbeariaId` - Por barbearia
- `POST /barbeiros` - Criar barbeiro
- `PUT /barbeiros/:id` - Atualizar barbeiro

### Serviços
- `GET /servicos` - Listar serviços
- `GET /servicos/barbearia/:barbeariaId` - Por barbearia
- `POST /servicos` - Criar serviço
- `PUT /servicos/:id` - Atualizar serviço

## 🔧 Configurações Avançadas

### Logs do Sistema
- **Logs automáticos** de todas as operações
- **Rastreamento** de erros e sucessos
- **Estatísticas** de uso da API
- **Logs de banco de dados** com entrada e saída
- **Monitoramento** de sessões de usuários

### WhatsApp
- **Reconexão automática**
- **Tratamento** de erros de envio
- **Formatação automática** de números
- **Interface conversacional** adequada ao WhatsApp

### IA Gemini
- **Contexto inteligente** baseado no usuário
- **Histórico** de conversas
- **Respostas personalizadas** por tipo de usuário
- **Comandos especiais** para ações específicas
- **Dados reais** do banco de dados em todas as respostas

### Gerenciamento de Sessões
- **Sessões persistentes** por usuário
- **Timeout automático** de 30 minutos
- **Limpeza automática** de sessões expiradas
- **Suporte** a múltiplas contas por usuário
- **Estatísticas** de sessões ativas

## 🛡️ Segurança

- **Autenticação** obrigatória para dados sensíveis
- **Validação** de entrada em todos os endpoints
- **Logs** de todas as operações
- **Proteção** contra acesso não autorizado
- **Timeout** de sessões para segurança
- **Limpeza automática** de dados temporários

## 📈 Melhorias Implementadas

### Funcionalidades Novas
- ✅ **Troca de conta** fácil e intuitiva
- ✅ **Cancelamento** de agendamentos via WhatsApp
- ✅ **Logs detalhados** de todas as operações
- ✅ **Interface conversacional** adequada ao WhatsApp
- ✅ **Comandos especiais** para ações específicas
- ✅ **Gerenciamento** avançado de sessões

### Melhorias na IA
- ✅ **Contexto real** do banco de dados
- ✅ **Respostas personalizadas** por tipo de usuário
- ✅ **Comandos inteligentes** para ações específicas
- ✅ **Histórico** de conversas persistente
- ✅ **Tratamento** de erros melhorado

### Melhorias no Sistema
- ✅ **Logs detalhados** com entrada e saída
- ✅ **Monitoramento** de operações de banco
- ✅ **Estatísticas** em tempo real
- ✅ **Limpeza automática** de dados temporários
- ✅ **Reconexão automática** do WhatsApp

## 🔍 Sistema de Logs

### Logs de Banco de Dados
```
🔍 [DB-OPERATION] 2025-01-23T10:30:00.000Z
📋 Operação: Buscar agendamentos do cliente
🔧 Método: SELECT
📥 ENTRADA: {"clienteId": 3}
📤 SAÍDA: {"count": 2}
⏱️ Timestamp: 2025-01-23T10:30:00.000Z
```

### Logs de Sessão
```
📱 [SESSION] Sessão obtida para 5589994582600: Estado=authenticated, Logado=true
✅ [SESSION] Login de cliente realizado para 5589994582600: Igor Vinícius (ID: 3)
🔄 [SESSION] Estado alterado para 5589994582600: cancelando_agendamento
```

### Logs de IA
```
🤖 [AI-CHAT] Processando mensagem de 5589994582600: "cancelar agendamento"
🔍 [AI-CHAT] Buscando agendamentos do cliente ID: 3
✅ [AI-CHAT] Resposta gerada, enviando para WhatsApp...
```

## 🐛 Resolução de Problemas

### WhatsApp não conecta
1. Verifique se o QR Code foi escaneado
2. Reinicie o servidor
3. Use `/whatsapp/reauth` para forçar nova autenticação

### IA não responde
1. Verifique se `AI_SYSTEM_ACTIVE=ATIVO` no `.env`
2. Confirme se a `GEMINI_API_KEY` está correta
3. Verifique os logs do console

### Banco de dados
1. Confirme se o PostgreSQL está rodando
2. Verifique a `DATABASE_URL` no `.env`
3. Execute `npx prisma migrate dev` se necessário

### Sessões não funcionam
1. Verifique os logs de sessão no console
2. Confirme se o usuário está autenticado
3. Use "trocar conta" para reiniciar a sessão

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs detalhados no console
2. Consulte a documentação da API
3. Use os comandos de diagnóstico disponíveis
4. Entre em contato com o desenvolvedor

## 🎯 Comandos de Diagnóstico

### API
- `GET /` - Status geral do sistema
- `GET /whatsapp/status` - Status do WhatsApp
- `GET /logs/stats` - Estatísticas dos logs

### WhatsApp
- `POST /whatsapp/reauth` - Forçar nova autenticação
- Logs automáticos de todas as mensagens

### Sessões
- Logs automáticos de todas as operações
- Limpeza automática de sessões expiradas
- Estatísticas em tempo real

---

**Desenvolvido com ❤️ para revolucionar o atendimento em barbearias!**

## 🆕 Novidades desta Versão

### Funcionalidades Principais
- **Troca de conta** sem complicações
- **Cancelamento** de agendamentos via chat
- **Logs detalhados** de todas as operações
- **Interface** 100% adequada ao WhatsApp
- **Comandos inteligentes** para ações específicas

### Melhorias na Experiência
- **Conversação natural** sem menções a botões
- **Respostas contextualizadas** com dados reais
- **Comandos especiais** para ações rápidas
- **Feedback** imediato de todas as operações
- **Suporte** a múltiplas contas por usuário

### Melhorias Técnicas
- **Logs completos** com entrada e saída
- **Monitoramento** de todas as operações
- **Gerenciamento** avançado de sessões
- **Limpeza automática** de dados temporários
- **Reconexão automática** em caso de falhas

