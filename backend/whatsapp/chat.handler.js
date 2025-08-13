const { PrismaClient } = require("@prisma/client");
const MessageTemplates = require("./message.templates");
const prisma = new PrismaClient();

// Armazenar sessões de usuários
const userSessions = new Map();

// Estados da sessão
const SESSION_STATES = {
  INITIAL: "initial",
  CHOOSING_LOGIN_TYPE: "choosing_login_type",
  BARBEARIA_LOGIN_CONFIRM: "barbearia_login_confirm",
  BARBEARIA_MENU: "barbearia_menu",
  BARBEARIA_AGENDAMENTOS_PENDENTES: "barbearia_agendamentos_pendentes",
  BARBEARIA_CANCELAR_AGENDAMENTO_SELECT: "barbearia_cancelar_agendamento_select",
  CLIENTE_LOGIN_CONFIRM: "cliente_login_confirm",
  CLIENTE_MENU: "cliente_menu",
  CLIENTE_AGENDAMENTOS: "cliente_agendamentos",
  CLIENTE_HISTORICO: "cliente_historico",
  CLIENTE_SERVICOS: "cliente_servicos",
  CLIENTE_BARBEIROS: "cliente_barbeiros",
};

class ChatHandler {
  static async processMessage(phoneNumber, messageText, whatsappService) {
    try {
      const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
      const message = messageText.trim();

      console.log(`📨 Mensagem recebida de ${cleanNumber}: "${messageText}"`);

      let session = userSessions.get(cleanNumber);

      // Se a mensagem for '0' ou 'voltar', tentar voltar um passo na sessão
      if (message === "0" || message.toLowerCase() === "voltar") {
        if (session) {
          // Se estiver no menu principal, não fazer nada (já está no menu principal)
          if (session.step === SESSION_STATES.BARBEARIA_MENU || session.step === SESSION_STATES.CLIENTE_MENU) {
            if (session.userType === "barbearia") {
              await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(session.userData.nome));
            } else if (session.userType === "cliente") {
              await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteMenu(session.userData.nome));
            }
            return;
          }
          
          // Para outros estados, voltar ao menu principal mantendo a sessão
          if (session.userType === "barbearia") {
            session.step = SESSION_STATES.BARBEARIA_MENU;
            userSessions.set(cleanNumber, session);
            await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(session.userData.nome));
          } else if (session.userType === "cliente") {
            session.step = SESSION_STATES.CLIENTE_MENU;
            userSessions.set(cleanNumber, session);
            await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteMenu(session.userData.nome));
          } else {
            // Se não tiver tipo de usuário definido, reiniciar
            userSessions.delete(cleanNumber);
            return await this.offerLoginOptions(cleanNumber, whatsappService, phoneNumber);
          }
          return;
        } else {
          // Se não houver sessão, tentar identificar o usuário automaticamente
          const barbearia = await this.findBarbearia(cleanNumber);
          const cliente = await this.findCliente(cleanNumber);

          if (barbearia) {
            session = { step: SESSION_STATES.BARBEARIA_MENU, userType: "barbearia", userId: barbearia.id, userData: barbearia };
            userSessions.set(cleanNumber, session);
            await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(barbearia.nome));
            return;
          } else if (cliente) {
            session = { step: SESSION_STATES.CLIENTE_MENU, userType: "cliente", userId: cliente.id, userData: cliente };
            userSessions.set(cleanNumber, session);
            await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteMenu(cliente.nome));
            return;
          } else {
            // Se não identificado, iniciar o fluxo de escolha de login
            return await this.offerLoginOptions(cleanNumber, whatsappService, phoneNumber);
          }
        }
      }

      if (!session) {
        // Tentar identificar o usuário se não houver sessão
        const barbearia = await this.findBarbearia(cleanNumber);
        const cliente = await this.findCliente(cleanNumber);

        if (barbearia) {
          session = { step: SESSION_STATES.BARBEARIA_MENU, userType: "barbearia", userId: barbearia.id, userData: barbearia };
          userSessions.set(cleanNumber, session);
          // Enviar menu da barbearia diretamente
          await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(barbearia.nome));
          return;
        } else if (cliente) {
          session = { step: SESSION_STATES.CLIENTE_MENU, userType: "cliente", userId: cliente.id, userData: cliente };
          userSessions.set(cleanNumber, session);
          // Enviar menu do cliente diretamente
          await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteMenu(cliente.nome));
          return;
        } else {
          // Se não identificado, iniciar o fluxo de escolha de login
          session = { step: SESSION_STATES.CHOOSING_LOGIN_TYPE };
          userSessions.set(cleanNumber, session);
          return await this.offerLoginOptions(cleanNumber, whatsappService, phoneNumber);
        }
      }

      // Processar mensagem com sessão ativa
      await this.handleSessionMessage(session, message, whatsappService, phoneNumber);

    } catch (error) {
      console.error("❌ Erro ao processar mensagem:", error);
      await whatsappService.sendMessage(phoneNumber, "❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.");
      userSessions.delete(cleanNumber); // Limpa a sessão em caso de erro grave
    }
  }

  static async offerLoginOptions(cleanNumber, whatsappService, phoneNumber) {
    const welcomeMessage = MessageTemplates.initialGreeting();
    userSessions.set(cleanNumber, { step: SESSION_STATES.CHOOSING_LOGIN_TYPE });
    await whatsappService.sendMessage(phoneNumber, welcomeMessage);
  }

  static async handleSessionMessage(session, message, whatsappService, phoneNumber, isBackCommand = false) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");

    // Salvar estado anterior para a opção 'voltar'
    if (!isBackCommand && session.step !== SESSION_STATES.INITIAL) {
      session.prevState = session.step;
    }

    switch (session.step) {
      case SESSION_STATES.CHOOSING_LOGIN_TYPE:
        await this.handleChoosingLoginType(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.BARBEARIA_LOGIN_CONFIRM:
        await this.handleBarbeariaLoginConfirm(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.BARBEARIA_MENU:
        await this.handleBarbeariaMenu(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.BARBEARIA_AGENDAMENTOS_PENDENTES:
        await this.handleBarbeariaAgendamentosPendentes(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.BARBEARIA_CANCELAR_AGENDAMENTO_SELECT:
        await this.handleBarbeariaCancelamentoSelect(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.CLIENTE_LOGIN_CONFIRM:
        await this.handleClienteLoginConfirm(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.CLIENTE_MENU:
        await this.handleClienteMenu(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.CLIENTE_AGENDAMENTOS:
        await this.handleClienteAgendamentos(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.CLIENTE_HISTORICO:
        await this.handleClienteHistorico(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.CLIENTE_SERVICOS:
        await this.handleClienteServicos(session, message, whatsappService, phoneNumber);
        break;
      case SESSION_STATES.CLIENTE_BARBEIROS:
        await this.handleClienteBarbeiros(session, message, whatsappService, phoneNumber);
        break;
      default:
        // Caso o estado seja desconhecido, reiniciar a sessão
        userSessions.delete(cleanNumber);
        await whatsappService.sendMessage(phoneNumber, "❌ Sua sessão expirou ou ocorreu um erro. Por favor, digite 'Oi' para recomeçar.");
        break;
    }
  }

  static async handleChoosingLoginType(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    if (message === "1") {
      session.step = SESSION_STATES.BARBEARIA_LOGIN_CONFIRM;
      userSessions.set(cleanNumber, session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.confirmBarbeariaLogin(cleanNumber));
    } else if (message === "2") {
      session.step = SESSION_STATES.CLIENTE_LOGIN_CONFIRM;
      userSessions.set(cleanNumber, session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.confirmClienteLogin(cleanNumber));
    } else {
      await whatsappService.sendMessage(phoneNumber, "❌ Opção inválida. Por favor, digite '1' para Barbearia ou '2' para Cliente.");
    }
  }

  static async handleBarbeariaLoginConfirm(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    if (message === "1") {
      const barbearia = await this.findBarbearia(cleanNumber);
      if (barbearia) {
        session.step = SESSION_STATES.BARBEARIA_MENU;
        session.userType = "barbearia";
        session.userId = barbearia.id;
        session.userData = barbearia;
        userSessions.set(cleanNumber, session);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaLoginSuccess(barbearia.nome));
      } else {
        userSessions.delete(cleanNumber);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaNotFound(cleanNumber));
      }
    } else if (message === "2") {
      userSessions.delete(cleanNumber);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.incorrectNumber());
    } else {
      await whatsappService.sendMessage(phoneNumber, "❌ Opção inválida. Digite '1' para confirmar ou '2' para corrigir.");
    }
  }

  static async handleBarbeariaMenu(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    const barbearia = session.userData;
    
    switch (message) {
      case "1": // Agendamentos de Hoje
        const agendamentosHoje = await this.getAgendamentosHoje(barbearia.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.agendamentosHoje(agendamentosHoje));
        break;
      case "2": // Agendamentos Pendentes
        session.step = SESSION_STATES.BARBEARIA_AGENDAMENTOS_PENDENTES;
        userSessions.set(cleanNumber, session);
        const agendamentosPendentes = await this.getAgendamentosPendentes(barbearia.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.agendamentosPendentes(agendamentosPendentes));
        break;
      case "3": // Agendamentos de Amanhã
        const agendamentosAmanha = await this.getAgendamentosAmanha(barbearia.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.agendamentosAmanha(agendamentosAmanha));
        break;
      case "4": // Agendamentos da Semana
        const agendamentosSemana = await this.getAgendamentosSemana(barbearia.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.agendamentosSemana(agendamentosSemana));
        break;
      case "5": // Cancelar Agendamento
        const agendamentosParaCancelar = await this.getAgendamentosPendentes(barbearia.id);
        if (agendamentosParaCancelar.length === 0) {
          await whatsappService.sendMessage(phoneNumber, MessageTemplates.noAppointmentsToCancel());
        } else {
          session.step = SESSION_STATES.BARBEARIA_CANCELAR_AGENDAMENTO_SELECT;
          session.agendamentos = agendamentosParaCancelar; // Armazena os agendamentos na sessão
          userSessions.set(cleanNumber, session);
          await whatsappService.sendMessage(phoneNumber, MessageTemplates.listAgendamentosParaCancelar(agendamentosParaCancelar, barbearia.nome));
        }
        break;
      case "6": // Resumo da Barbearia
        const resumo = await this.getResumoBarbearia(barbearia.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.resumoBarbearia(resumo, barbearia.nome));
        break;
      case "7": // Lista de Barbeiros
        const barbeiros = await this.getBarbeiros(barbearia.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.listaBarbeiros(barbeiros));
        break;
      case "8": // Lista de Serviços
        const servicos = await this.getServicos(barbearia.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.listaServicos(servicos));
        break;
      case "0": // Voltar/Menu Principal
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(barbearia.nome));
        break;
      default:
        // Para opções inválidas, mostrar mensagem de erro mas manter no menu
        await whatsappService.sendMessage(phoneNumber, `❌ Opção inválida. Digite um número de 1 a 8, ou 0 para o menu principal.

${MessageTemplates.barbeariaMenu(barbearia.nome)}`);
        break;
    }
  }

  static async handleBarbeariaAgendamentosPendentes(session, message, whatsappService, phoneNumber) {
    // Após listar agendamentos pendentes, o usuário pode querer cancelar ou voltar
    if (message === "1") { // Opção de cancelar
      const agendamentosParaCancelar = await this.getAgendamentosPendentes(session.userId);
      if (agendamentosParaCancelar.length === 0) {
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.noAppointmentsToCancel());
        session.step = SESSION_STATES.BARBEARIA_MENU; // Volta para o menu principal
        userSessions.set(whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", ""), session);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(session.userData.nome));
      } else {
        session.step = SESSION_STATES.BARBEARIA_CANCELAR_AGENDAMENTO_SELECT;
        session.agendamentos = agendamentosParaCancelar;
        userSessions.set(whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", ""), session);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.listAgendamentosParaCancelar(agendamentosParaCancelar, session.userData.nome));
      }
    } else if (message === "0") { // Voltar
      session.step = SESSION_STATES.BARBEARIA_MENU;
      userSessions.set(whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", ""), session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(session.userData.nome));
    } else {
      await whatsappService.sendMessage(phoneNumber, "❌ Opção inválida. Digite '1' para cancelar ou '0' para voltar ao menu principal.");
    }
  }

  static async handleBarbeariaCancelamentoSelect(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    const numeroAgendamento = parseInt(message);

    if (message === "0") { // Voltar
      session.step = SESSION_STATES.BARBEARIA_MENU;
      userSessions.set(cleanNumber, session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(session.userData.nome));
      return;
    }

    if (isNaN(numeroAgendamento) || numeroAgendamento < 1 || numeroAgendamento > session.agendamentos.length) {
      await whatsappService.sendMessage(phoneNumber, `❌ Número inválido. Digite um número entre 1 e ${session.agendamentos.length}, ou '0' para voltar.`);
      return;
    }

    const agendamento = session.agendamentos[numeroAgendamento - 1];

    try {
      await prisma.agendamento.update({
        where: { id: agendamento.id },
        data: { status: "CANCELADO" }
      });

      await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaCancelConfirmation(agendamento, session.userData.nome));
      await this.notifyClienteCancelamento(agendamento, whatsappService);

      session.step = SESSION_STATES.BARBEARIA_MENU; // Volta para o menu principal
      userSessions.set(cleanNumber, session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(session.userData.nome));

    } catch (error) {
      console.error("❌ Erro ao cancelar agendamento:", error);
      await whatsappService.sendMessage(phoneNumber, "❌ Erro ao cancelar agendamento. Tente novamente.");
      session.step = SESSION_STATES.BARBEARIA_MENU; // Volta para o menu principal
      userSessions.set(cleanNumber, session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeariaMenu(session.userData.nome));
    }
  }

  static async handleClienteLoginConfirm(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    if (message === "1") {
      const cliente = await this.findCliente(cleanNumber);
      if (cliente) {
        session.step = SESSION_STATES.CLIENTE_MENU;
        session.userType = "cliente";
        session.userId = cliente.id;
        session.userData = cliente;
        userSessions.set(cleanNumber, session);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteLoginSuccess(cliente.nome));
      } else {
        userSessions.delete(cleanNumber);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteNotFound(cleanNumber));
      }
    } else if (message === "2") {
      userSessions.delete(cleanNumber);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.incorrectNumber());
    } else {
      await whatsappService.sendMessage(phoneNumber, "❌ Opção inválida. Digite '1' para confirmar ou '2' para corrigir.");
    }
  }

  static async handleClienteMenu(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    const cliente = session.userData;
    
    switch (message) {
      case "1": // Meus Agendamentos
        session.step = SESSION_STATES.CLIENTE_AGENDAMENTOS;
        userSessions.set(cleanNumber, session);
        const agendamentosCliente = await this.getAgendamentosCliente(cliente.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.agendamentosCliente(agendamentosCliente, cliente.nome));
        break;
      case "2": // Próximo Agendamento
        const proximoAgendamento = await this.getProximoAgendamento(cliente.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.proximoAgendamento(proximoAgendamento, cliente.nome));
        break;
      case "3": // Histórico
        session.step = SESSION_STATES.CLIENTE_HISTORICO;
        userSessions.set(cleanNumber, session);
        const historico = await this.getHistoricoCliente(cliente.id);
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.historicoCliente(historico, cliente.nome));
        break;
      case "4": // Serviços
        session.step = SESSION_STATES.CLIENTE_SERVICOS;
        userSessions.set(cleanNumber, session);
        const barbeariaServicos = await prisma.barbearia.findUnique({
          where: { id: cliente.barbeariaId },
          include: { servicos: true }
        });
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.servicosParaCliente(barbeariaServicos.servicos, barbeariaServicos.nome));
        break;
      case "5": // Barbeiros
        session.step = SESSION_STATES.CLIENTE_BARBEIROS;
        userSessions.set(cleanNumber, session);
        const barbeariaBarbeiros = await prisma.barbearia.findUnique({
          where: { id: cliente.barbeariaId },
          include: { barbeiros: { where: { ativo: true } } }
        });
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.barbeirosParaCliente(barbeariaBarbeiros.barbeiros, barbeariaBarbeiros.nome));
        break;
      case "0": // Voltar/Menu Principal
        await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteMenu(cliente.nome));
        break;
      default:
        // Para opções inválidas, mostrar mensagem de erro mas manter no menu
        await whatsappService.sendMessage(phoneNumber, `❌ Opção inválida. Digite um número de 1 a 5, ou 0 para o menu principal.

${MessageTemplates.clienteMenu(cliente.nome)}`);
        break;
    }
  }

  static async handleClienteAgendamentos(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    if (message === "0") { // Voltar
      session.step = SESSION_STATES.CLIENTE_MENU;
      userSessions.set(cleanNumber, session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteMenu(session.userData.nome));
    } else {
      await whatsappService.sendMessage(phoneNumber, `❌ Opção inválida. Digite '0' para voltar ao menu principal.

${MessageTemplates.clienteMenu(session.userData.nome)}`);
    }
  }

  static async handleClienteHistorico(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    if (message === "0") { // Voltar
      session.step = SESSION_STATES.CLIENTE_MENU;
      userSessions.set(cleanNumber, session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteMenu(session.userData.nome));
    } else {
      await whatsappService.sendMessage(phoneNumber, `❌ Opção inválida. Digite '0' para voltar ao menu principal.

${MessageTemplates.clienteMenu(session.userData.nome)}`);
    }
  }

  static async handleClienteServicos(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    if (message === "0") { // Voltar
      session.step = SESSION_STATES.CLIENTE_MENU;
      userSessions.set(cleanNumber, session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteMenu(session.userData.nome));
    } else {
      await whatsappService.sendMessage(phoneNumber, `❌ Opção inválida. Digite '0' para voltar ao menu principal.

${MessageTemplates.clienteMenu(session.userData.nome)}`);
    }
  }

  static async handleClienteBarbeiros(session, message, whatsappService, phoneNumber) {
    const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace("@s.whatsapp.net", "");
    if (message === "0") { // Voltar
      session.step = SESSION_STATES.CLIENTE_MENU;
      userSessions.set(cleanNumber, session);
      await whatsappService.sendMessage(phoneNumber, MessageTemplates.clienteMenu(session.userData.nome));
    } else {
      await whatsappService.sendMessage(phoneNumber, `❌ Opção inválida. Digite '0' para voltar ao menu principal.

${MessageTemplates.clienteMenu(session.userData.nome)}`);
    }
  }

  // Buscar barbearia pelo telefone (com formatação especial)
  static async findBarbearia(phoneNumber) {
    console.log(`🔍 Buscando barbearia com número: ${phoneNumber}`);
    
    // Primeiro, tentar buscar com o número original
    let barbearia = await prisma.barbearia.findFirst({
      where: { telefone: phoneNumber }
    });

    console.log(`📞 Primeira busca (${phoneNumber}): ${barbearia ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);

    if (!barbearia) {
      // Se não encontrar, tentar com o 9 adicional após o DDD
      // Exemplo: 558994624921 -> 5589994624921
      if (phoneNumber.startsWith("55") && phoneNumber.length === 12) {
        const numberWithExtra9 = phoneNumber.substring(0, 4) + "9" + phoneNumber.substring(4);
        console.log(`🔄 Tentando busca com 9 adicional: ${numberWithExtra9}`);
        
        barbearia = await prisma.barbearia.findFirst({
          where: { telefone: numberWithExtra9 }
        });
        
        console.log(`📞 Segunda busca (${numberWithExtra9}): ${barbearia ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
      } else {
        console.log(`❌ Número não atende aos critérios para adicionar 9: ${phoneNumber}`);
      }
    }

    if (barbearia) {
      console.log(`✅ Barbearia encontrada: ${barbearia.nome} (ID: ${barbearia.id})`);
    } else {
      console.log(`❌ Barbearia não encontrada em nenhuma das tentativas`);
    }

    return barbearia;
  }
  // Buscar cliente pelo telefone (com formatação especial)
  static async findCliente(phoneNumber) {
    console.log(`🔍 Buscando cliente com número: ${phoneNumber}`);
    
    // Primeiro, tentar buscar com o número original
    let cliente = await prisma.cliente.findFirst({
      where: { telefone: phoneNumber }
    });

    console.log(`📞 Primeira busca (${phoneNumber}): ${cliente ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);

    if (!cliente) {
      // Se não encontrar, tentar com o 9 adicional após o DDD
      // Exemplo: 558994624921 -> 5589994624921
      if (phoneNumber.startsWith("55") && phoneNumber.length === 12) {
        const numberWithExtra9 = phoneNumber.substring(0, 4) + "9" + phoneNumber.substring(4);
        console.log(`🔄 Tentando busca com 9 adicional: ${numberWithExtra9}`);
        
        cliente = await prisma.cliente.findFirst({
          where: { telefone: numberWithExtra9 }
        });
        
        console.log(`📞 Segunda busca (${numberWithExtra9}): ${cliente ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
      } else {
        console.log(`❌ Número não atende aos critérios para adicionar 9: ${phoneNumber}`);
      }
    }

    if (cliente) {
      console.log(`✅ Cliente encontrado: ${cliente.nome} (ID: ${cliente.id})`);
    } else {
      console.log(`❌ Cliente não encontrado em nenhuma das tentativas`);
    }

    return cliente;
  }

  // Notificar cliente sobre cancelamento
  static async notifyClienteCancelamento(agendamento, whatsappService) {
    try {
      let clientePhone = agendamento.cliente.telefone;
      if (clientePhone.startsWith("55") && clientePhone.length === 13) {
        clientePhone = clientePhone.substring(0, 4) + clientePhone.substring(5);
      }
      await whatsappService.sendMessage(clientePhone + "@s.whatsapp.net", MessageTemplates.clientAppointmentCanceled(agendamento));
    } catch (error) {
      console.error("❌ Erro ao notificar cliente sobre cancelamento:", error);
    }
  }

  // Métodos auxiliares para buscar dados (mantidos do código anterior)
  static async getAgendamentosHoje(barbeariaId) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    return await prisma.agendamento.findMany({
      where: {
        barbeariaId,
        dataHora: {
          gte: hoje,
          lt: amanha
        },
        status: { not: "CANCELADO" }
      },
      include: {
        cliente: true,
        barbeiro: true
      },
      orderBy: { dataHora: "asc" }
    });
  }

  static async getAgendamentosPendentes(barbeariaId) {
    const hoje = new Date();

    return await prisma.agendamento.findMany({
      where: {
        barbeariaId,
        dataHora: { gte: hoje },
        status: "AGENDAMENTO_PROGRAMADO"
      },
      include: {
        cliente: true,
        barbeiro: true
      },
      orderBy: { dataHora: "asc" }
    });
  }

  static async getAgendamentosAmanha(barbeariaId) {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);
    const depoisAmanha = new Date(amanha);
    depoisAmanha.setDate(depoisAmanha.getDate() + 1);

    return await prisma.agendamento.findMany({
      where: {
        barbeariaId,
        dataHora: {
          gte: amanha,
          lt: depoisAmanha
        },
        status: { not: "CANCELADO" }
      },
      include: {
        cliente: true,
        barbeiro: true
      },
      orderBy: { dataHora: "asc" }
    });
  }

  static async getAgendamentosSemana(barbeariaId) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const proximaSemana = new Date(hoje);
    proximaSemana.setDate(proximaSemana.getDate() + 7);

    return await prisma.agendamento.findMany({
      where: {
        barbeariaId,
        dataHora: {
          gte: hoje,
          lt: proximaSemana
        },
        status: { not: "CANCELADO" }
      },
      include: {
        cliente: true,
        barbeiro: true
      },
      orderBy: { dataHora: "asc" }
    });
  }

  static async getResumoBarbearia(barbeariaId) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const [agendamentosHoje, totalBarbeiros, totalServicos, totalClientes] = await Promise.all([
      prisma.agendamento.count({
        where: {
          barbeariaId,
          dataHora: { gte: hoje, lt: amanha },
          status: { not: "CANCELADO" }
        }
      }),
      prisma.barbeiro.count({
        where: { barbeariaId, ativo: true }
      }),
      prisma.servico.count({
        where: { barbeariaId }
      }),
      prisma.cliente.count({
        where: { barbeariaId, status: "ATIVA" }
      })
    ]);

    return {
      agendamentosHoje,
      totalBarbeiros,
      totalServicos,
      totalClientes
    };
  }

  static async getBarbeiros(barbeariaId) {
    return await prisma.barbeiro.findMany({
      where: { barbeariaId, ativo: true },
      orderBy: { nome: "asc" }
    });
  }

  static async getServicos(barbeariaId) {
    return await prisma.servico.findMany({
      where: { barbeariaId },
      orderBy: { nome: "asc" }
    });
  }

  static async getAgendamentosCliente(clienteId) {
    const hoje = new Date();
    
    return await prisma.agendamento.findMany({
      where: {
        clienteId,
        dataHora: { gte: hoje },
        status: { not: "CANCELADO" }
      },
      include: {
        barbeiro: true,
        barbearia: true
      },
      orderBy: { dataHora: "asc" },
      take: 5
    });
  }

  static async getProximoAgendamento(clienteId) {
    const hoje = new Date();
    
    return await prisma.agendamento.findFirst({
      where: {
        clienteId,
        dataHora: { gte: hoje },
        status: { not: "CANCELADO" }
      },
      include: {
        barbeiro: true,
        barbearia: true
      },
      orderBy: { dataHora: "asc" }
    });
  }

  static async getHistoricoCliente(clienteId) {
    return await prisma.agendamento.findMany({
      where: {
        clienteId,
        status: "ATENDIDO"
      },
      include: {
        barbeiro: true,
        barbearia: true
      },
      orderBy: { dataHora: "desc" },
      take: 5
    });
  }
}

module.exports = ChatHandler;

