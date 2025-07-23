const { PrismaClient } = require('@prisma/client');
const MessageTemplates = require('./message.templates');
const prisma = new PrismaClient();

class ChatHandler {
  
  // Processar mensagens recebidas
  static async processMessage(phoneNumber, messageText, whatsappService) {
    try {
      const cleanNumber = whatsappService.formatPhoneNumber(phoneNumber).replace('@s.whatsapp.net', '');
      const message = messageText.toLowerCase().trim();
      
      console.log(`📨 Mensagem recebida de ${cleanNumber}: "${messageText}"`);

      // Verificar se é uma barbearia
      const barbearia = await prisma.barbearia.findFirst({
        where: { telefone: cleanNumber }
      });

      if (barbearia) {
        return await this.handleBarbeariaMessage(barbearia, message, whatsappService, phoneNumber);
      }

      // Verificar se é um cliente
      const cliente = await prisma.cliente.findFirst({
        where: { telefone: cleanNumber }
      });

      if (cliente) {
        return await this.handleClienteMessage(cliente, message, whatsappService, phoneNumber);
      }

      // Usuário não identificado
      const welcomeMessage = `👋 Olá! Não consegui identificar seu número em nosso sistema.

📋 *Para se cadastrar:*
• Entre em contato com uma de nossas barbearias
• Ou acesse nossa plataforma online

💈 *Sistema de Agendamentos*
_Sua beleza é nossa prioridade!_`;

      await whatsappService.sendMessage(phoneNumber, welcomeMessage);
      
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  // Processar mensagens da barbearia
  static async handleBarbeariaMessage(barbearia, message, whatsappService, phoneNumber) {
    try {
      if (message.includes('menu') || message.includes('ajuda') || message.includes('comandos')) {
        const menuMessage = MessageTemplates.barbeariaMenu(barbearia.nome);
        await whatsappService.sendMessage(phoneNumber, menuMessage);
        return;
      }

      if (message.includes('agendamentos hoje') || message.includes('hoje')) {
        const agendamentos = await this.getAgendamentosHoje(barbearia.id);
        const response = MessageTemplates.agendamentosHoje(agendamentos);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('agendamentos amanha') || message.includes('amanhã')) {
        const agendamentos = await this.getAgendamentosAmanha(barbearia.id);
        const response = MessageTemplates.agendamentosAmanha(agendamentos);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('semana') || message.includes('próximos 7 dias')) {
        const agendamentos = await this.getAgendamentosSemana(barbearia.id);
        const response = MessageTemplates.agendamentosSemana(agendamentos);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('status') || message.includes('resumo')) {
        const resumo = await this.getResumoBarbearia(barbearia.id);
        const response = MessageTemplates.resumoBarbearia(resumo, barbearia.nome);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('barbeiros') || message.includes('equipe')) {
        const barbeiros = await this.getBarbeiros(barbearia.id);
        const response = MessageTemplates.listaBarbeiros(barbeiros);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('servicos') || message.includes('serviços')) {
        const servicos = await this.getServicos(barbearia.id);
        const response = MessageTemplates.listaServicos(servicos);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('clientes') || message.includes('cadastrados')) {
        const clientes = await this.getClientesRecentes(barbearia.id);
        const response = MessageTemplates.clientesRecentes(clientes);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('faturamento') || message.includes('receita')) {
        const faturamento = await this.getFaturamentoMes(barbearia.id);
        const response = MessageTemplates.faturamentoMes(faturamento, barbearia.nome);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('cancelados') || message.includes('cancelamentos')) {
        const cancelados = await this.getAgendamentosCancelados(barbearia.id);
        const response = MessageTemplates.agendamentosCancelados(cancelados);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      // Comando não reconhecido
      const helpMessage = `❓ Comando não reconhecido.

Digite *menu* para ver todos os comandos disponíveis.

💈 *${barbearia.nome}*`;

      await whatsappService.sendMessage(phoneNumber, helpMessage);

    } catch (error) {
      console.error('❌ Erro ao processar mensagem da barbearia:', error);
    }
  }

  // Processar mensagens do cliente
  static async handleClienteMessage(cliente, message, whatsappService, phoneNumber) {
    try {
      if (message.includes('menu') || message.includes('ajuda') || message.includes('comandos')) {
        const menuMessage = MessageTemplates.clienteMenu(cliente.nome);
        await whatsappService.sendMessage(phoneNumber, menuMessage);
        return;
      }

      if (message.includes('meus agendamentos') || message.includes('agendamentos')) {
        const agendamentos = await this.getAgendamentosCliente(cliente.id);
        const response = MessageTemplates.agendamentosCliente(agendamentos, cliente.nome);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('proximo') || message.includes('próximo')) {
        const proximoAgendamento = await this.getProximoAgendamento(cliente.id);
        const response = MessageTemplates.proximoAgendamento(proximoAgendamento, cliente.nome);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('historico') || message.includes('histórico')) {
        const historico = await this.getHistoricoCliente(cliente.id);
        const response = MessageTemplates.historicoCliente(historico, cliente.nome);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('servicos') || message.includes('serviços') || message.includes('precos') || message.includes('preços')) {
        const barbearia = await prisma.barbearia.findUnique({
          where: { id: cliente.barbeariaId },
          include: { servicos: true }
        });
        const response = MessageTemplates.servicosParaCliente(barbearia.servicos, barbearia.nome);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('barbeiros') || message.includes('equipe')) {
        const barbearia = await prisma.barbearia.findUnique({
          where: { id: cliente.barbeariaId },
          include: { barbeiros: { where: { ativo: true } } }
        });
        const response = MessageTemplates.barbeirosParaCliente(barbearia.barbeiros, barbearia.nome);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      if (message.includes('cancelar') && message.includes('agendamento')) {
        const proximoAgendamento = await this.getProximoAgendamento(cliente.id);
        if (proximoAgendamento) {
          const response = MessageTemplates.cancelarAgendamento(proximoAgendamento, cliente.nome);
          await whatsappService.sendMessage(phoneNumber, response);
        } else {
          const response = `❌ *CANCELAMENTO*

Olá *${cliente.nome}*! 👋

Você não possui agendamentos futuros para cancelar.

---
💈 _Sistema de Agendamentos_`;
          await whatsappService.sendMessage(phoneNumber, response);
        }
        return;
      }

      if (message.includes('contato') || message.includes('telefone') || message.includes('endereço')) {
        const barbearia = await prisma.barbearia.findUnique({
          where: { id: cliente.barbeariaId }
        });
        const response = MessageTemplates.contatoBarbearia(barbearia);
        await whatsappService.sendMessage(phoneNumber, response);
        return;
      }

      // Comando não reconhecido
      const helpMessage = `❓ Comando não reconhecido.

Digite *menu* para ver todos os comandos disponíveis.

👤 *${cliente.nome}*`;

      await whatsappService.sendMessage(phoneNumber, helpMessage);

    } catch (error) {
      console.error('❌ Erro ao processar mensagem do cliente:', error);
    }
  }

  // Métodos auxiliares para buscar dados
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
        status: { not: 'CANCELADO' }
      },
      include: {
        cliente: true,
        barbeiro: true
      },
      orderBy: { dataHora: 'asc' }
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
        status: { not: 'CANCELADO' }
      },
      include: {
        cliente: true,
        barbeiro: true
      },
      orderBy: { dataHora: 'asc' }
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
        status: { not: 'CANCELADO' }
      },
      include: {
        cliente: true,
        barbeiro: true
      },
      orderBy: { dataHora: 'asc' }
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
          status: { not: 'CANCELADO' }
        }
      }),
      prisma.barbeiro.count({
        where: { barbeariaId, ativo: true }
      }),
      prisma.servico.count({
        where: { barbeariaId }
      }),
      prisma.cliente.count({
        where: { barbeariaId, status: 'ATIVA' }
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
      orderBy: { nome: 'asc' }
    });
  }

  static async getServicos(barbeariaId) {
    return await prisma.servico.findMany({
      where: { barbeariaId },
      orderBy: { nome: 'asc' }
    });
  }

  static async getAgendamentosCliente(clienteId) {
    const hoje = new Date();
    
    return await prisma.agendamento.findMany({
      where: {
        clienteId,
        dataHora: { gte: hoje },
        status: { not: 'CANCELADO' }
      },
      include: {
        barbeiro: true,
        barbearia: true
      },
      orderBy: { dataHora: 'asc' },
      take: 5
    });
  }

  static async getProximoAgendamento(clienteId) {
    const hoje = new Date();
    
    return await prisma.agendamento.findFirst({
      where: {
        clienteId,
        dataHora: { gte: hoje },
        status: { not: 'CANCELADO' }
      },
      include: {
        barbeiro: true,
        barbearia: true
      },
      orderBy: { dataHora: 'asc' }
    });
  }

  static async getHistoricoCliente(clienteId) {
    return await prisma.agendamento.findMany({
      where: {
        clienteId,
        status: 'ATENDIDO'
      },
      include: {
        barbeiro: true,
        barbearia: true
      },
      orderBy: { dataHora: 'desc' },
      take: 5
    });
  }

  static async getClientesRecentes(barbeariaId) {
    return await prisma.cliente.findMany({
      where: { barbeariaId, status: 'ATIVA' },
      orderBy: { id: 'desc' },
      take: 10
    });
  }

  static async getFaturamentoMes(barbeariaId) {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    
    const fimMes = new Date(inicioMes);
    fimMes.setMonth(fimMes.getMonth() + 1);

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        barbeariaId,
        dataHora: { gte: inicioMes, lt: fimMes },
        status: 'ATENDIDO'
      }
    });

    const total = agendamentos.reduce((sum, agendamento) => sum + agendamento.precoServico, 0);
    const quantidade = agendamentos.length;

    return { total, quantidade, mes: inicioMes.getMonth() + 1 };
  }

  static async getAgendamentosCancelados(barbeariaId) {
    const hoje = new Date();
    hoje.setDate(hoje.getDate() - 7); // Últimos 7 dias

    return await prisma.agendamento.findMany({
      where: {
        barbeariaId,
        status: 'CANCELADO',
        dataHora: { gte: hoje }
      },
      include: {
        cliente: true,
        barbeiro: true
      },
      orderBy: { dataHora: 'desc' },
      take: 10
    });
  }
}

module.exports = ChatHandler;

