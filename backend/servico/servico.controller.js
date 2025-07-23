const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createServico = async (req, res) => {
  const { nome, duracaoMin, preco, barbeariaId } = req.body;
  try {
    const newServico = await prisma.servico.create({
      data: {
        nome,
        duracaoMin: parseInt(duracaoMin),
        preco: parseFloat(preco),
        barbeariaId: parseInt(barbeariaId),
      },
      include: {
        barbearia: true,
      },
    });
    res.status(201).json(newServico);
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    res.status(500).json({ error: "Não foi possível criar o serviço." });
  }
};

exports.getServicoById = async (req, res) => {
  const { id } = req.params;
  try {
    const servico = await prisma.servico.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        barbearia: true,
      },
    });
    if (!servico) {
      return res.status(404).json({ error: "Serviço não encontrado." });
    }
    res.status(200).json(servico);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    res.status(500).json({ error: "Não foi possível buscar o serviço." });
  }
};

exports.getAllServicos = async (req, res) => {
  try {
    const servicos = await prisma.servico.findMany({
      include: {
        barbearia: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    res.status(200).json(servicos);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    res.status(500).json({ error: "Não foi possível buscar os serviços." });
  }
};

exports.getServicosByBarbearia = async (req, res) => {
  const { barbeariaId } = req.params;
  try {
    const servicos = await prisma.servico.findMany({
      where: {
        barbeariaId: parseInt(barbeariaId),
      },
      include: {
        barbearia: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    res.status(200).json(servicos);
  } catch (error) {
    console.error("Erro ao buscar serviços da barbearia:", error);
    res.status(500).json({ error: "Não foi possível buscar os serviços da barbearia." });
  }
};

exports.updateServico = async (req, res) => {
  const { id } = req.params;
  const { nome, duracaoMin, preco } = req.body;
  
  try {
    const updateData = {};
    
    if (nome) updateData.nome = nome;
    if (duracaoMin) updateData.duracaoMin = parseInt(duracaoMin);
    if (preco) updateData.preco = parseFloat(preco);
    
    const updatedServico = await prisma.servico.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
      include: {
        barbearia: true,
      },
    });
    
    res.status(200).json(updatedServico);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    res.status(500).json({ error: "Não foi possível atualizar o serviço." });
  }
};

exports.deleteServico = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.servico.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: "Serviço deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    res.status(500).json({ error: "Não foi possível deletar o serviço." });
  }
};

