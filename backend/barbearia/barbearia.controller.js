const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function createBarbearia(req, res) {
  try {
    const { nomeProprietario, nome, email, plano, senha, telefone } = req.body;

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
        telefone: telefone || null,
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
        telefone: barbearia.telefone,
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email ou nomeUrl já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
}

async function getBarbeariaById(req, res) {
  try {
    const { id } = req.params;
    
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: parseInt(id) },
      include: {
        barbeiros: true,
        servicos: true,
        clientes: true,
        agendamentos: {
          include: {
            cliente: true,
            barbeiro: true
          }
        }
      }
    });

    if (!barbearia) {
      return res.status(404).json({ error: 'Barbearia não encontrada.' });
    }

    res.json(barbearia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function loginBarbearia(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const barbearia = await prisma.barbearia.findUnique({
      where: { email },
      include: {
        barbeiros: true,
        servicos: true,
        clientes: true,
        agendamentos: {
          include: {
            cliente: true,
            barbeiro: true
          }
        }
      }
    });

    if (!barbearia) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificação simples de senha (sem hash para simplicidade)
    if (barbearia.senha !== senha) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    if (!barbearia.ativa) {
      return res.status(401).json({ error: 'Barbearia inativa. Entre em contato com o suporte.' });
    }

    // Remover senha da resposta
    const { senha: _, ...barbeariaData } = barbearia;

    res.json({
      message: 'Login realizado com sucesso',
      barbearia: barbeariaData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createBarbearia,
  getBarbeariaById,
  loginBarbearia,
};
