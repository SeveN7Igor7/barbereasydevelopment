const { PrismaClient } = require('@prisma/client');
const whatsappService = require('../whatsapp/whatsapp.service');
const MessageTemplates = require('../whatsapp/message.templates');
const prisma = new PrismaClient();

exports.createCliente = async (req, res) => {
  const { nome, telefone, barbeariaId } = req.body;
  try {
    // Buscar dados da barbearia
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: parseInt(barbeariaId) }
    });

    if (!barbearia) {
      return res.status(404).json({ error: "Barbearia não encontrada." });
    }

    const newCliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        barbeariaId: parseInt(barbeariaId),
      },
    });

    // Enviar mensagem de boas-vindas via WhatsApp
    if (whatsappService.isReady()) {
      try {
        const welcomeMessage = MessageTemplates.clientAccountCreated(nome, barbearia.nome);
        await whatsappService.sendMessage(telefone, welcomeMessage);
        console.log(`✅ Mensagem de boas-vindas enviada para ${nome} (${telefone})`);
      } catch (whatsappError) {
        console.error('❌ Erro ao enviar mensagem de boas-vindas:', whatsappError);
        // Não falha a criação do cliente se o WhatsApp falhar
      }
    } else {
      console.log('⚠️ WhatsApp não conectado - mensagem de boas-vindas não enviada');
    }

    res.status(201).json(newCliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({ error: "Não foi possível criar o cliente." });
  }
};

exports.getClienteById = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }
    res.status(200).json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({ error: "Não foi possível buscar o cliente." });
  }
};

exports.getClientes = async (req, res) => {
  const { telefone, barbeariaId } = req.query;
  
  try {
    const whereClause = {};
    
    if (telefone) {
      whereClause.telefone = telefone;
    }
    
    if (barbeariaId) {
      whereClause.barbeariaId = parseInt(barbeariaId);
    }
    
    const clientes = await prisma.cliente.findMany({
      where: whereClause,
      include: {
        barbearia: {
          select: {
            id: true,
            nome: true,
            nomeProprietario: true
          }
        }
      }
    });
    
    res.status(200).json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ error: "Não foi possível buscar os clientes." });
  }
};


