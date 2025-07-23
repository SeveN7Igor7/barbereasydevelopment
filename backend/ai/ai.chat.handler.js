const geminiService = require('./gemini.service');
const sessionManager = require('./session.manager');
const MessageTemplates = require('../whatsapp/message.templates');

class AIChatHandler {
  
  static async processMessage(phoneNumber, messageText, whatsappService) {
    try {
      const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace('@s.whatsapp.net', '');
      const message = messageText.toLowerCase().trim();
      
      console.log(`🤖 [AI-CHAT] Processando mensagem de ${cleanNumber}: "${messageText}"`);

      // Verificar se o sistema de IA está ativo
      if (!geminiService.isSystemActive()) {
        console.log('🤖 [AI-CHAT] Sistema de IA desativado, usando chat handler padrão');
        return null; // Retorna null para usar o chat handler padrão
      }

      // Obter ou criar sessão do usuário
      console.log('🔐 [AI-CHAT] Obtendo sessão do usuário...');
      const session = sessionManager.getSession(phoneNumber);
      console.log(`📊 [AI-CHAT] Estado da sessão: ${session.conversationState}, Logado: ${session.loggedIn}, Tipo: ${session.type}`);
      
      // Verificar comandos especiais para troca de conta
      if (this.isLogoutCommand(message)) {
        console.log('🔄 [AI-CHAT] Comando de logout detectado');
        return await this.handleLogoutCommand(session);
      }
      
      // Processar mensagem baseado no estado da sessão
      console.log(`🔄 [AI-CHAT] Processando mensagem no estado: ${session.conversationState}`);
      const response = await this.handleMessageByState(session, message, messageText, whatsappService);
      
      if (response) {
        console.log('✅ [AI-CHAT] Resposta gerada, enviando para WhatsApp...');
        console.log(`📝 [AI-CHAT] Resposta: "${response.substring(0, 150)}${response.length > 150 ? '...' : ''}"`);
        await whatsappService.sendMessage(phoneNumber, response);
        return true;
      }

      console.log('❌ [AI-CHAT] Nenhuma resposta gerada');
      return false;
    } catch (error) {
      console.error('❌ [AI-CHAT] Erro no processamento da IA:', error);
      console.error('🔍 [AI-CHAT] Stack trace:', error.stack);
      return false;
    }
  }

  static isLogoutCommand(message) {
    const logoutCommands = [
      'trocar conta', 'trocar de conta', 'mudar conta', 'mudar de conta',
      'sair', 'logout', 'deslogar', 'fazer logout', 'nova conta',
      'outra conta', 'conta diferente', 'login diferente'
    ];
    
    return logoutCommands.some(cmd => message.includes(cmd));
  }

  static async handleLogoutCommand(session) {
    console.log(`🔄 [AI-CHAT] Executando logout para ${session.phoneNumber}`);
    
    // Limpar sessão
    sessionManager.clearSession(session.phoneNumber);
    
    return `👋 **Logout realizado com sucesso!**

Você foi deslogado da sua conta atual.

🔄 **Para fazer login novamente:**
Digite **"oi"** ou **"menu"** para começar o processo de login.

✨ Você pode fazer login como:
• Cliente
• Barbearia
• Barbeiro

Aguardo seu retorno! 😊`;
  }

  static async handleMessageByState(session, message, originalMessage, whatsappService) {
    const { conversationState, phoneNumber } = session;

    switch (conversationState) {
      case 'initial':
        return await this.handleInitialState(session, message);
      
      case 'login_type':
        return await this.handleLoginTypeSelection(session, message);
      
      case 'login_cliente_phone':
        return await this.handleClientePhoneInput(session, message);
      
      case 'login_cliente_name':
        return await this.handleClienteNameInput(session, message);
      
      case 'login_cliente_barbearia':
        return await this.handleClienteBarbeariaSelection(session, message);
      
      case 'login_barbearia_email':
        return await this.handleBarbeariaEmailInput(session, message);
      
      case 'login_barbearia_senha':
        return await this.handleBarbeariaSenhaInput(session, message);
      
      case 'cancelando_agendamento':
        return await this.handleCancelamentoConfirmacao(session, message);
      
      case 'authenticated':
        return await this.handleAuthenticatedConversation(session, originalMessage);
      
      default:
        return await this.handleInitialState(session, message);
    }
  }

  static async handleInitialState(session, message) {
    // Verificar se é uma saudação ou primeira interação
    const greetings = ['oi', 'olá', 'hello', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'menu', 'ajuda'];
    const isGreeting = greetings.some(greeting => message.includes(greeting));

    if (isGreeting || session.conversationState === 'initial') {
      sessionManager.setConversationState(session.phoneNumber, 'login_type');
      
      return `👋 **Olá! Bem-vindo ao BarberEasy!**

🤖 Sou sua assistente virtual inteligente e posso te ajudar com:
• Consultar agendamentos REAIS
• Ver informações de serviços e preços
• Cancelar ou reagendar agendamentos
• Trocar de conta facilmente
• Relatórios e estatísticas
• E muito mais!

🔐 **Como você gostaria de acessar?**

1️⃣ **Cliente** - Para consultar seus agendamentos
2️⃣ **Barbearia** - Para gerenciar sua barbearia
3️⃣ **Barbeiro** - Para acessar como profissional

💬 Digite o número (1, 2 ou 3) ou a palavra correspondente.`;
    }

    // Se não for saudação, processar com IA
    return await geminiService.processWhatsAppMessage(session.phoneNumber, message, session);
  }

  static async handleLoginTypeSelection(session, message) {
    const cleanMessage = message.replace(/[^\w\s]/gi, '').toLowerCase();
    
    if (cleanMessage.includes('1') || cleanMessage.includes('cliente')) {
      sessionManager.updateSession(session.phoneNumber, {
        type: 'cliente',
        conversationState: 'login_cliente_phone'
      });
      
      return `👤 **Login como Cliente**

Para acessar suas informações REAIS do banco de dados, preciso confirmar sua identidade.

📱 **Digite seu número de telefone completo com DDD:**
Exemplos: 
• 5589994582600
• 89994582600

💡 Use o mesmo número cadastrado na barbearia.`;
    }
    
    if (cleanMessage.includes('2') || cleanMessage.includes('barbearia')) {
      sessionManager.updateSession(session.phoneNumber, {
        type: 'barbearia',
        conversationState: 'login_barbearia_email'
      });
      
      return `🏪 **Login como Barbearia**

Para acessar o painel da sua barbearia com dados REAIS, preciso dos dados de acesso.

📧 **Digite o email cadastrado da barbearia:**`;
    }
    
    if (cleanMessage.includes('3') || cleanMessage.includes('barbeiro')) {
      return `💈 **Login como Barbeiro**

Esta funcionalidade está em desenvolvimento! 🚧

Por enquanto, você pode:
• **1** - Fazer login como Cliente
• **2** - Fazer login como Barbearia

Digite 1 ou 2 para escolher uma opção disponível.`;
    }
    
    return `❓ **Opção não reconhecida.**

Por favor, escolha uma das opções:
1️⃣ **Cliente**
2️⃣ **Barbearia**  
3️⃣ **Barbeiro**

💬 Digite o número (1, 2 ou 3) ou a palavra correspondente.`;
  }

  static async handleClientePhoneInput(session, message) {
    console.log(`📱 [AI-CHAT] Processando entrada de telefone: "${message}"`);
    
    // Extrair número de telefone da mensagem (mais flexível)
    const phoneRegex = /(\d{8,13})/;
    const phoneMatch = message.match(phoneRegex);
    
    if (!phoneMatch) {
      return `❌ **Número de telefone inválido.**

📱 Por favor, digite apenas o número com DDD:
**Exemplos válidos:**
• 5589994582600
• 89994582600
• 558994582600

💡 Use o mesmo formato cadastrado na barbearia.`;
    }
    
    const phone = phoneMatch[0];
    console.log(`📱 [AI-CHAT] Telefone extraído: ${phone}`);
    
    sessionManager.setPendingData(session.phoneNumber, 'clientePhone', phone);
    sessionManager.setConversationState(session.phoneNumber, 'login_cliente_name');
    
    return `✅ **Telefone registrado:** ${phone}

👤 **Agora digite seu nome completo** para eu localizar sua conta no banco de dados:

💡 Use exatamente como está cadastrado na barbearia.`;
  }

  static async handleClienteNameInput(session, message) {
    console.log(`👤 [AI-CHAT] Processando entrada de nome: "${message}"`);
    
    if (message.length < 2) {
      return `❌ **Nome muito curto.**

👤 Digite seu nome completo para eu localizar sua conta no banco de dados:`;
    }
    
    const clientePhone = sessionManager.getPendingData(session.phoneNumber, 'clientePhone');
    const clienteName = message.trim();
    
    console.log(`🔍 [AI-CHAT] Buscando cliente no banco de dados: telefone="${clientePhone}", nome="${clienteName}"`);
    
    // Buscar barbearias do cliente no banco de dados real
    const barbearias = await geminiService.getBarbeariasByCliente(clientePhone, clienteName);
    
    if (barbearias.length === 0) {
      const attempts = sessionManager.incrementLoginAttempts(session.phoneNumber);
      
      console.log(`❌ [AI-CHAT] Cliente não encontrado no banco de dados. Tentativa ${attempts.loginAttempts}`);
      
      return `❌ **Conta não encontrada no banco de dados.**

📋 **Dados informados:**
• Telefone: ${clientePhone}
• Nome: ${clienteName}

🤔 **Possíveis causas:**
• Nome pode estar cadastrado diferente
• Telefone pode ter formato diferente
• Conta pode estar em outra barbearia

🔄 **Opções:**
• Digite **"oi"** para tentar novamente
• Entre em contato com sua barbearia

💡 Verifique se os dados estão exatamente como cadastrados.`;
    }
    
    if (barbearias.length === 1) {
      // Login automático se só tem uma barbearia
      const barbearia = barbearias[0];
      const clienteData = await this.getClienteData(clientePhone, clienteName);
      
      sessionManager.loginCliente(session.phoneNumber, clienteData, barbearia.id);
      
      console.log(`✅ [AI-CHAT] Login automático realizado para ${clienteName} na barbearia ${barbearia.nome}`);
      
      return `🎉 **Login realizado com sucesso!**

Olá, **${clienteName}**! 😊
🏪 **${barbearia.nome}**

🤖 **Agora posso te ajudar com dados REAIS:**

📅 **Agendamentos**
• "meus agendamentos" - ver próximos
• "cancelar agendamento" - cancelar um agendamento
• "reagendar" - alterar data/hora

ℹ️ **Informações**
• "serviços" - preços e opções
• "barbeiros" - nossa equipe
• "contato" - dados da barbearia

🔄 **Outras opções**
• "trocar conta" - fazer login em outra conta

❓ **O que você gostaria de saber?**`;
    }
    
    // Múltiplas barbearias - mostrar opções
    sessionManager.setPendingData(session.phoneNumber, 'clienteName', clienteName);
    sessionManager.setPendingData(session.phoneNumber, 'barbearias', barbearias);
    sessionManager.setConversationState(session.phoneNumber, 'login_cliente_barbearia');
    
    console.log(`🏪 [AI-CHAT] Cliente encontrado em ${barbearias.length} barbearias`);
    
    let response = `🎉 **Conta encontrada no banco de dados!**

Você tem cadastro em **${barbearias.length} barbearias**. Qual você quer acessar?\n\n`;
    
    barbearias.forEach((barbearia, index) => {
      response += `${index + 1}️⃣ **${barbearia.nome}**\n`;
      if (barbearia.nomeProprietario) {
        response += `   👤 ${barbearia.nomeProprietario}\n`;
      }
      response += `\n`;
    });
    
    response += `💬 **Digite o número** da barbearia que deseja acessar:`;
    
    return response;
  }

  static async handleClienteBarbeariaSelection(session, message) {
    const barbearias = sessionManager.getPendingData(session.phoneNumber, 'barbearias');
    const clienteName = sessionManager.getPendingData(session.phoneNumber, 'clienteName');
    const clientePhone = sessionManager.getPendingData(session.phoneNumber, 'clientePhone');
    
    const selectedIndex = parseInt(message) - 1;
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= barbearias.length) {
      return `❌ **Opção inválida.**

Digite um número de **1 a ${barbearias.length}**:`;
    }
    
    const selectedBarbearia = barbearias[selectedIndex];
    const clienteData = await this.getClienteData(clientePhone, clienteName);
    
    sessionManager.loginCliente(session.phoneNumber, clienteData, selectedBarbearia.id);
    sessionManager.clearPendingData(session.phoneNumber);
    
    return `✅ **Login realizado com sucesso!**

Bem-vindo(a), **${clienteName}**! 😊
🏪 **${selectedBarbearia.nome}**

🤖 **Posso te ajudar com dados REAIS:**
• Consultar agendamentos atualizados
• Cancelar ou reagendar
• Ver informações da barbearia
• Trocar de conta facilmente

💬 **Digite sua pergunta ou comando!**`;
  }

  static async handleBarbeariaEmailInput(session, message) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(message.trim())) {
      return `❌ **Email inválido.**

📧 Digite um email válido:
**Exemplo:** contato@barbearia.com`;
    }
    
    sessionManager.setPendingData(session.phoneNumber, 'barbeariaEmail', message.trim());
    sessionManager.setConversationState(session.phoneNumber, 'login_barbearia_senha');
    
    return `✅ **Email registrado:** ${message.trim()}

🔐 **Agora digite a senha da barbearia:**`;
  }

  static async handleBarbeariaSenhaInput(session, message) {
    const email = sessionManager.getPendingData(session.phoneNumber, 'barbeariaEmail');
    const senha = message.trim();
    
    console.log(`🔐 [AI-CHAT] Tentando autenticar barbearia no banco de dados: ${email}`);
    const authResult = await geminiService.authenticateBarbearia(email, senha);
    
    if (!authResult.success) {
      sessionManager.incrementLoginAttempts(session.phoneNumber);
      
      return `❌ **${authResult.message}**

💡 **Verifique seus dados:**
• Email: ${email}
• Senha: (verifique se está correta)

🔄 **Digite a senha novamente** ou digite **"oi"** para recomeçar.`;
    }
    
    sessionManager.loginBarbearia(session.phoneNumber, authResult.data);
    sessionManager.clearPendingData(session.phoneNumber);
    
    return `✅ **Login realizado com sucesso!**

Bem-vindo(a), **${authResult.data.nomeProprietario}**! 😊
🏪 **${authResult.data.nome}**

🤖 **Como administrador, posso te ajudar com dados REAIS:**
• Agenda de hoje, amanhã e semana
• Relatórios e estatísticas
• Informações da equipe
• Gestão de agendamentos
• Trocar de conta

💬 **Digite sua pergunta ou comando!**`;
  }

  static async handleCancelamentoConfirmacao(session, message) {
    const agendamentos = sessionManager.getPendingData(session.phoneNumber, 'agendamentosParaCancelar');
    const selectedIndex = parseInt(message) - 1;
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= agendamentos.length) {
      return `❌ **Opção inválida.**

Digite um número de **1 a ${agendamentos.length}** para cancelar o agendamento correspondente.`;
    }
    
    const agendamentoSelecionado = agendamentos[selectedIndex];
    
    try {
      console.log(`🗑️ [AI-CHAT] Cancelando agendamento ID: ${agendamentoSelecionado.id}`);
      
      const resultado = await geminiService.cancelarAgendamento(agendamentoSelecionado.id, 'Cancelado pelo cliente via WhatsApp');
      
      if (resultado.success) {
        sessionManager.clearPendingData(session.phoneNumber);
        sessionManager.setConversationState(session.phoneNumber, 'authenticated');
        
        const dataFormatada = new Date(agendamentoSelecionado.dataHora).toLocaleString('pt-BR');
        
        return `✅ **Agendamento cancelado com sucesso!**

📋 **Detalhes do cancelamento:**
• Serviço: ${agendamentoSelecionado.nomeServico}
• Data/Hora: ${dataFormatada}
• Barbeiro: ${agendamentoSelecionado.barbeiro.nome}
• Valor: R$ ${agendamentoSelecionado.precoServico}

💡 **Precisa de mais alguma coisa?**
• "meus agendamentos" - ver outros agendamentos
• "agendar" - fazer novo agendamento
• "trocar conta" - fazer login em outra conta`;
      } else {
        return `❌ **Erro ao cancelar agendamento.**

${resultado.message}

🔄 Tente novamente ou entre em contato com a barbearia.`;
      }
    } catch (error) {
      console.error('❌ [AI-CHAT] Erro ao cancelar agendamento:', error);
      return `❌ **Erro interno ao cancelar agendamento.**

🔄 Tente novamente mais tarde ou entre em contato com a barbearia.`;
    }
  }

  static async handleAuthenticatedConversation(session, message) {
    // Verificar se é um comando específico para ações no banco de dados
    const messageLower = message.toLowerCase();
    
    // Comandos para cancelar agendamento
    if (messageLower.includes('cancelar') && messageLower.includes('agendamento')) {
      return await this.handleCancelAgendamento(session, message);
    }
    
    // Comandos para reagendar
    if (messageLower.includes('reagendar') || messageLower.includes('remarcar')) {
      return await this.handleReagendarAgendamento(session, message);
    }
    
    // Usuário autenticado - processar com IA usando dados reais
    const response = await geminiService.processWhatsAppMessage(session.phoneNumber, message, session);
    
    if (!response) {
      return `❌ **Não consegui processar sua mensagem.**

🤖 **Comandos disponíveis:**
• "meus agendamentos" - ver agendamentos
• "cancelar agendamento" - cancelar
• "serviços" - ver preços
• "trocar conta" - mudar de conta
• "menu" - ver opções

💬 Tente novamente ou digite um dos comandos acima.`;
    }
    
    return response;
  }

  static async handleCancelAgendamento(session, message) {
    if (session.type !== 'cliente') {
      return `❌ **Apenas clientes podem cancelar agendamentos.**

💡 Se você é uma barbearia, pode gerenciar agendamentos através dos relatórios.`;
    }

    try {
      console.log(`🔍 [AI-CHAT] Buscando agendamentos do cliente ID: ${session.userData.id}`);
      
      // Buscar agendamentos do cliente
      const agendamentos = await geminiService.getAgendamentosByCliente(session.userData.id);
      const agendamentosFuturos = agendamentos.filter(ag => 
        ag.status === 'AGENDAMENTO_PROGRAMADO' && new Date(ag.dataHora) > new Date()
      );

      if (agendamentosFuturos.length === 0) {
        return `❌ **Você não possui agendamentos futuros para cancelar.**

📅 **Opções:**
• "meus agendamentos" - ver histórico completo
• "agendar" - fazer novo agendamento
• "trocar conta" - acessar outra conta`;
      }

      let response = `📅 **Seus agendamentos que podem ser cancelados:**\n\n`;
      
      agendamentosFuturos.forEach((ag, index) => {
        const dataFormatada = new Date(ag.dataHora).toLocaleString('pt-BR');
        response += `${index + 1}️⃣ **${ag.nomeServico}**\n`;
        response += `   📅 ${dataFormatada}\n`;
        response += `   💈 ${ag.barbeiro.nome}\n`;
        response += `   💰 R$ ${ag.precoServico}\n\n`;
      });

      response += `❓ **Digite o número do agendamento que deseja cancelar:**`;
      
      // Salvar agendamentos na sessão para próxima interação
      sessionManager.setPendingData(session.phoneNumber, 'agendamentosParaCancelar', agendamentosFuturos);
      sessionManager.setConversationState(session.phoneNumber, 'cancelando_agendamento');
      
      return response;
    } catch (error) {
      console.error('❌ [AI-CHAT] Erro ao buscar agendamentos para cancelar:', error);
      return `❌ **Erro ao buscar seus agendamentos.**

🔄 Tente novamente ou entre em contato com a barbearia.`;
    }
  }

  static async handleReagendarAgendamento(session, message) {
    if (session.type !== 'cliente') {
      return `❌ **Apenas clientes podem reagendar agendamentos.**`;
    }

    return `🔄 **Reagendamento de Agendamentos**

Esta funcionalidade está sendo implementada! 🚧

**Por enquanto, você pode:**
1️⃣ **Cancelar** o agendamento atual
2️⃣ **Entrar em contato** com a barbearia para reagendar

💡 **Comandos disponíveis:**
• "cancelar agendamento" - cancelar um agendamento
• "meus agendamentos" - ver seus agendamentos
• "contato" - informações da barbearia`;
  }

  static async getClienteData(telefone, nome) {
    try {
      console.log(`🔍 [AI-CHAT] Buscando dados do cliente: telefone="${telefone}", nome="${nome}"`);
      
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Usar as mesmas variações de telefone do geminiService
      const phoneVariations = geminiService.generatePhoneVariations(telefone);
      
      const cliente = await prisma.cliente.findFirst({
        where: {
          telefone: {
            in: phoneVariations
          },
          nome: {
            contains: nome,
            mode: 'insensitive'
          }
        },
        include: {
          barbearia: true
        }
      });
      
      console.log(`📋 [AI-CHAT] Cliente encontrado: ${cliente ? 'SIM' : 'NÃO'}`);
      if (cliente) {
        console.log(`📊 [AI-CHAT] Dados: ID=${cliente.id}, Nome="${cliente.nome}"`);
      }
      
      return cliente;
    } catch (error) {
      console.error('❌ [AI-CHAT] Erro ao buscar dados do cliente:', error);
      return null;
    }
  }
}

module.exports = AIChatHandler;

