const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createBarbeiro = async (req, res) => {
  const { nome, especialidade, barbeariaId } = req.body;
  try {
    const newBarbeiro = await prisma.barbeiro.create({
      data: {
        nome,
        especialidade,
        barbeariaId: parseInt(barbeariaId),
      },
      include: {
        barbearia: true,
      },
    });
    res.status(201).json(newBarbeiro);
  } catch (error) {
    console.error("Erro ao criar barbeiro:", error);
    res.status(500).json({ error: "Não foi possível criar o barbeiro." });
  }
};

exports.getBarbeiroById = async (req, res) => {
  const { id } = req.params;
  try {
    const barbeiro = await prisma.barbeiro.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        barbearia: true,
        agendamentos: {
          include: {
            cliente: true,
          },
        },
      },
    });
    if (!barbeiro) {
      return res.status(404).json({ error: "Barbeiro não encontrado." });
    }
    res.status(200).json(barbeiro);
  } catch (error) {
    console.error("Erro ao buscar barbeiro:", error);
    res.status(500).json({ error: "Não foi possível buscar o barbeiro." });
  }
};

exports.getAllBarbeiros = async (req, res) => {
  try {
    const barbeiros = await prisma.barbeiro.findMany({
      include: {
        barbearia: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    res.status(200).json(barbeiros);
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    res.status(500).json({ error: "Não foi possível buscar os barbeiros." });
  }
};

exports.getBarbeirosByBarbearia = async (req, res) => {
  const { barbeariaId } = req.params;
  try {
    const barbeiros = await prisma.barbeiro.findMany({
      where: {
        barbeariaId: parseInt(barbeariaId),
        ativo: true,
      },
      include: {
        barbearia: true,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    res.status(200).json(barbeiros);
  } catch (error) {
    console.error("Erro ao buscar barbeiros da barbearia:", error);
    res.status(500).json({ error: "Não foi possível buscar os barbeiros da barbearia." });
  }
};

exports.updateBarbeiro = async (req, res) => {
  const { id } = req.params;
  const { nome, especialidade, ativo } = req.body;
  
  try {
    const updateData = {};
    
    if (nome) updateData.nome = nome;
    if (especialidade) updateData.especialidade = especialidade;
    if (ativo !== undefined) updateData.ativo = Boolean(ativo);
    
    const updatedBarbeiro = await prisma.barbeiro.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
      include: {
        barbearia: true,
      },
    });
    
    res.status(200).json(updatedBarbeiro);
  } catch (error) {
    console.error("Erro ao atualizar barbeiro:", error);
    res.status(500).json({ error: "Não foi possível atualizar o barbeiro." });
  }
};

exports.deleteBarbeiro = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.barbeiro.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ message: "Barbeiro deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar barbeiro:", error);
    res.status(500).json({ error: "Não foi possível deletar o barbeiro." });
  }
};

