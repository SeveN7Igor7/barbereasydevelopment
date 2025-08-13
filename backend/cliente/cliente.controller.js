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

exports.loginByTelefone = async (req, res) => {
  const { telefone } = req.body;
  
  try {
    // Adicionar prefixo 55 se não estiver presente
    let telefoneFormatado = telefone;
    if (!telefone.startsWith('55')) {
      telefoneFormatado = '55' + telefone;
    }

    // Buscar cliente pelo telefone formatado
    const cliente = await prisma.cliente.findFirst({
      where: {
        telefone: telefoneFormatado,
        status: 'ATIVA'
      },
      include: {
        barbearia: {
          select: {
            id: true,
            nome: true,
            nomeProprietario: true,
            nomeUrl: true,
            logoUrl: true,
            bannerUrl: true,
            telefone: true,
            email: true,
            ativa: true,
            plano: true,
            horarios: {
              select: {
                id: true,
                diaSemana: true,
                horaInicio: true,
                horaFim: true
              }
            },
            servicos: {
              select: {
                id: true,
                nome: true,
                duracaoMin: true,
                preco: true
              }
            },
            barbeiros: {
              where: {
                ativo: true
              },
              select: {
                id: true,
                nome: true,
                especialidade: true,
                ativo: true
              }
            }
          }
        },
        agendamentos: {
          include: {
            barbeiro: {
              select: {
                id: true,
                nome: true,
                especialidade: true
              }
            },
            barbearia: {
              select: {
                id: true,
                nome: true,
                nomeUrl: true
              }
            }
          },
          orderBy: {
            dataHora: 'desc'
          }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ 
        error: "Cliente não encontrado com este número de telefone.",
        telefoneFormatado: telefoneFormatado
      });
    }

    // Separar agendamentos por status
    const agendamentosAtivos = cliente.agendamentos.filter(
      agendamento => agendamento.status === 'AGENDAMENTO_PROGRAMADO'
    );
    
    const agendamentosHistorico = cliente.agendamentos.filter(
      agendamento => agendamento.status !== 'AGENDAMENTO_PROGRAMADO'
    );

    // Estruturar resposta completa
    const responseData = {
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        status: cliente.status
      },
      barbearia: cliente.barbearia,
      agendamentos: {
        ativos: agendamentosAtivos,
        historico: agendamentosHistorico,
        total: cliente.agendamentos.length
      },
      estatisticas: {
        totalAgendamentos: cliente.agendamentos.length,
        agendamentosAtivos: agendamentosAtivos.length,
        agendamentosFinalizados: agendamentosHistorico.filter(a => a.status === 'ATENDIDO').length,
        agendamentosCancelados: agendamentosHistorico.filter(a => a.status === 'CANCELADO').length
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Erro ao fazer login por telefone:", error);
    res.status(500).json({ error: "Não foi possível realizar o login." });
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


