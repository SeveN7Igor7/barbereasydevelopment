const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function createBarbearia(req, res) {
  try {
    const { nomeProprietario, nome, email, plano, senha } = req.body;

    if (!nomeProprietario || !nome || !email || !plano || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const nomeUrl = nome
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');

    const barbearia = await prisma.barbearia.create({
      data: {
        nomeProprietario,
        nome,
        email,
        plano,
        senha,
        nomeUrl,
      }
    });

    res.status(201).json({
      message: 'Barbearia criada com sucesso',
      barbearia: {
        id: barbearia.id,
        nome,
        nomeProprietario,
        email,
        plano,
        nomeUrl,
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email ou nomeUrl já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createBarbearia,
};
