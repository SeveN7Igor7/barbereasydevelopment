const { PrismaClient } = require('@prisma/client');
const whatsappService = require('../whatsapp/whatsapp.service');
const MessageTemplates = require('../whatsapp/message.templates');
const prisma = new PrismaClient();

exports.createAgendamento = async (req, res) => {
  const { clienteId, barbeiroId, barbeariaId, dataHora, status, nomeServico, precoServico } = req.body;
  try {
    const agendamentoDateTime = new Date(dataHora);
    
    // Verificar se já existe agendamento para o mesmo barbeiro na mesma data e horário
    const conflictingAgendamento = await prisma.agendamento.findFirst({
      where: {
        barbeiroId: parseInt(barbeiroId),
        dataHora: agendamentoDateTime,
        status: {
          not: 'CANCELADO' // Não considera agendamentos cancelados como conflito
        }
      },
      include: {
        cliente: true,
        barbeiro: true
      }
    });

    if (conflictingAgendamento) {
      const formattedDate = agendamentoDateTime.toLocaleDateString('pt-BR');
      const formattedTime = agendamentoDateTime.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return res.status(409).json({ 
        error: "Conflito de agendamento",
        message: `Já existe um agendamento registrado para o barbeiro ${conflictingAgendamento.barbeiro.nome} no dia ${formattedDate} às ${formattedTime}. Cliente: ${conflictingAgendamento.cliente.nome}`,
        conflictingAgendamento: {
          id: conflictingAgendamento.id,
          cliente: conflictingAgendamento.cliente.nome,
          barbeiro: conflictingAgendamento.barbeiro.nome,
          dataHora: conflictingAgendamento.dataHora,
          status: conflictingAgendamento.status
        }
      });
    }

    const newAgendamento = await prisma.agendamento.create({
      data: {
        clienteId: parseInt(clienteId),
        barbeiroId: parseInt(barbeiroId),
        barbeariaId: parseInt(barbeariaId),
        dataHora: agendamentoDateTime,
        status: status || 'AGENDAMENTO_PROGRAMADO',
        nomeServico,
        precoServico: parseFloat(precoServico),
      },
      include: {
        cliente: true,
        barbeiro: true,
        barbearia: true,
      },
    });

    console.log(`✅ Agendamento criado com sucesso - ID: ${newAgendamento.id}, Cliente: ${newAgendamento.cliente.nome}, Barbeiro: ${newAgendamento.barbeiro.nome}`);

    // Enviar mensagens via WhatsApp
    if (whatsappService.isReady()) {
      try {
        // Mensagem para o cliente
        const clientMessage = MessageTemplates.clientAppointmentConfirmed(
          newAgendamento.cliente.nome,
          newAgendamento.barbearia.nome,
          newAgendamento.nomeServico,
          newAgendamento.precoServico,
          newAgendamento.dataHora,
          newAgendamento.barbeiro.nome
        );
        
        await whatsappService.sendMessage(newAgendamento.cliente.telefone, clientMessage);
        console.log(`✅ Mensagem de confirmação enviada para cliente: ${newAgendamento.cliente.nome} (${newAgendamento.cliente.telefone})`);

        // Mensagem para a barbearia (se tiver telefone cadastrado)
        if (newAgendamento.barbearia.telefone) {
          const barbeariaMessage = MessageTemplates.barbeariaNewAppointment(
            newAgendamento.cliente.nome,
            newAgendamento.cliente.telefone,
            newAgendamento.nomeServico,
            newAgendamento.precoServico,
            newAgendamento.dataHora,
            newAgendamento.barbeiro.nome
          );
          
          await whatsappService.sendMessage(newAgendamento.barbearia.telefone, barbeariaMessage);
          console.log(`✅ Notificação enviada para barbearia: ${newAgendamento.barbearia.nome} (${newAgendamento.barbearia.telefone})`);
        } else {
          console.log('⚠️ Barbearia não possui telefone cadastrado - notificação não enviada');
        }

      } catch (whatsappError) {
        console.error('❌ Erro ao enviar mensagens do agendamento:', whatsappError);
        // Não falha a criação do agendamento se o WhatsApp falhar
      }
    } else {
      console.log('⚠️ WhatsApp não conectado - mensagens do agendamento não enviadas');
    }

    res.status(201).json(newAgendamento);
  } catch (error) {
    console.error("❌ Erro ao criar agendamento:", error);
    res.status(500).json({ error: "Não foi possível criar o agendamento." });
  }
};

exports.getAgendamentoById = async (req, res) => {
  const { id } = req.params;
  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        cliente: true,
        barbeiro: true,
        barbearia: true,
      },
    });
    if (!agendamento) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }
    res.status(200).json(agendamento);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    res.status(500).json({ error: "Não foi possível buscar o agendamento." });
  }
};

exports.getAgendamentosByCliente = async (req, res) => {
  const { clienteId } = req.params;
  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        clienteId: parseInt(clienteId),
      },
      include: {
        cliente: true,
        barbeiro: true,
        barbearia: true,
      },
      orderBy: {
        dataHora: 'desc',
      },
    });
    res.status(200).json(agendamentos);
  } catch (error) {
    console.error("Erro ao buscar agendamentos do cliente:", error);
    res.status(500).json({ error: "Não foi possível buscar os agendamentos do cliente." });
  }
};

exports.getAgendamentosByBarbearia = async (req, res) => {
  const { barbeariaId } = req.params;
  const { status } = req.query;
  
  try {
    const whereClause = {
      barbeariaId: parseInt(barbeariaId),
    };
    
    if (status) {
      whereClause.status = status.toUpperCase();
    }
    
    const agendamentos = await prisma.agendamento.findMany({
      where: whereClause,
      include: {
        cliente: true,
        barbeiro: true,
        barbearia: true,
      },
      orderBy: {
        dataHora: 'desc',
      },
    });
    res.status(200).json(agendamentos);
  } catch (error) {
    console.error("Erro ao buscar agendamentos da barbearia:", error);
    res.status(500).json({ error: "Não foi possível buscar os agendamentos da barbearia." });
  }
};

exports.updateAgendamento = async (req, res) => {
  const { id } = req.params;
  const { status, dataHora } = req.body;
  
  try {
    const updateData = {};
    
    if (status) {
      updateData.status = status.toUpperCase();
    }
    
    if (dataHora) {
      updateData.dataHora = new Date(dataHora);
    }
    
    const updatedAgendamento = await prisma.agendamento.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
      include: {
        cliente: true,
        barbeiro: true,
        barbearia: true,
      },
    });
    
    res.status(200).json(updatedAgendamento);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    res.status(500).json({ error: "Não foi possível atualizar o agendamento." });
  }
};

