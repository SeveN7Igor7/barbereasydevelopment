const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { removeOldImage } = require('../utils/upload');
const logger = require('../utils/logger');
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

async function getBarbeariaByNomeUrl(req, res) {
  try {
    const { nomeUrl } = req.params;

    if (!nomeUrl) {
      return res.status(400).json({ error: 'nomeUrl é obrigatório' });
    }

    const barbearia = await prisma.barbearia.findUnique({
      where: { nomeUrl },
      include: {
        barbeiros: {
          where: { ativo: true }
        },
        servicos: true,
        horarios: true
      }
    });

    if (!barbearia) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    if (!barbearia.ativa) {
      return res.status(404).json({ error: 'Barbearia inativa' });
    }

    // Remover senha da resposta
    const { senha: _, ...barbeariaData } = barbearia;

    res.json(barbeariaData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Métodos para gerenciar horários de funcionamento
async function getHorariosByBarbearia(req, res) {
  try {
    const { id } = req.params;
    
    const horarios = await prisma.horario.findMany({
      where: { barbeariaId: parseInt(id) },
      orderBy: {
        diaSemana: 'asc'
      }
    });

    res.json(horarios);
  } catch (error) {
    logger.error('Erro ao buscar horários', error);
    res.status(500).json({ error: error.message });
  }
}

async function createOrUpdateHorarios(req, res) {
  try {
    const { id } = req.params;
    const { horarios } = req.body;

    if (!horarios || !Array.isArray(horarios)) {
      return res.status(400).json({ error: 'Horários devem ser fornecidos como array' });
    }

    const barbeariaId = parseInt(id);

    // Verificar se a barbearia existe
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: barbeariaId }
    });

    if (!barbearia) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    // Remover horários existentes
    await prisma.horario.deleteMany({
      where: { barbeariaId }
    });

    // Criar novos horários
    const horariosData = horarios.map(horario => ({
      diaSemana: horario.diaSemana,
      horaInicio: horario.horaInicio,
      horaFim: horario.horaFim,
      barbeariaId
    }));

    const novosHorarios = await prisma.horario.createMany({
      data: horariosData
    });

    logger.info(`Horários atualizados para barbearia ${barbeariaId}`, {
      quantidade: novosHorarios.count
    });

    res.json({
      message: 'Horários atualizados com sucesso',
      quantidade: novosHorarios.count
    });
  } catch (error) {
    logger.error('Erro ao atualizar horários', error);
    res.status(500).json({ error: error.message });
  }
}

async function updateHorario(req, res) {
  try {
    const { id, horarioId } = req.params;
    const { diaSemana, horaInicio, horaFim } = req.body;

    const horario = await prisma.horario.update({
      where: {
        id: parseInt(horarioId),
        barbeariaId: parseInt(id)
      },
      data: {
        diaSemana,
        horaInicio,
        horaFim
      }
    });

    logger.info(`Horário ${horarioId} atualizado para barbearia ${id}`);
    res.json(horario);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Horário não encontrado' });
    }
    logger.error('Erro ao atualizar horário', error);
    res.status(500).json({ error: error.message });
  }
}

async function deleteHorario(req, res) {
  try {
    const { id, horarioId } = req.params;

    await prisma.horario.delete({
      where: {
        id: parseInt(horarioId),
        barbeariaId: parseInt(id)
      }
    });

    logger.info(`Horário ${horarioId} removido da barbearia ${id}`);
    res.json({ message: 'Horário removido com sucesso' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Horário não encontrado' });
    }
    logger.error('Erro ao remover horário', error);
    res.status(500).json({ error: error.message });
  }
}

// Métodos para upload de imagens
async function uploadLogo(req, res) {
  try {
    const { id } = req.params;
    const barbeariaId = parseInt(id);

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Verificar se a barbearia existe
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: barbeariaId }
    });

    if (!barbearia) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    // Remover logo antiga se existir
    removeOldImage(barbeariaId, 'logo');

    // Construir URL da nova logo
    const fileExtension = path.extname(req.file.filename);
    const logoUrl = `/barbearias/${barbeariaId}/images/logo${fileExtension}`;

    // Atualizar URL no banco de dados
    await prisma.barbearia.update({
      where: { id: barbeariaId },
      data: { logoUrl }
    });

    logger.info(`Logo atualizada para barbearia ${barbeariaId}`, {
      filename: req.file.filename,
      size: req.file.size
    });

    res.json({
      message: 'Logo enviada com sucesso',
      logoUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    logger.error('Erro ao fazer upload da logo', error);
    res.status(500).json({ error: error.message });
  }
}

async function uploadBanner(req, res) {
  try {
    const { id } = req.params;
    const barbeariaId = parseInt(id);

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Verificar se a barbearia existe
    const barbearia = await prisma.barbearia.findUnique({
      where: { id: barbeariaId }
    });

    if (!barbearia) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    // Remover banner antigo se existir
    removeOldImage(barbeariaId, 'banner');

    // Construir URL do novo banner
    const fileExtension = path.extname(req.file.filename);
    const bannerUrl = `/barbearias/${barbeariaId}/images/banner${fileExtension}`;

    // Atualizar URL no banco de dados
    await prisma.barbearia.update({
      where: { id: barbeariaId },
      data: { bannerUrl }
    });

    logger.info(`Banner atualizado para barbearia ${barbeariaId}`, {
      filename: req.file.filename,
      size: req.file.size
    });

    res.json({
      message: 'Banner enviado com sucesso',
      bannerUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    logger.error('Erro ao fazer upload do banner', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createBarbearia,
  getBarbeariaById,
  getBarbeariaByNomeUrl,
  loginBarbearia,
  // Métodos para horários
  getHorariosByBarbearia,
  createOrUpdateHorarios,
  updateHorario,
  deleteHorario,
  // Métodos para upload
  uploadLogo,
  uploadBanner,
};
