const express = require('express');
const router = express.Router();
const agendamentoController = require('./agendamento.controller');

// Criar um novo agendamento
router.post('/', agendamentoController.createAgendamento);

// Buscar agendamento por ID
router.get('/:id', agendamentoController.getAgendamentoById);

// Buscar todos os agendamentos de um cliente específico
router.get('/cliente/:clienteId', agendamentoController.getAgendamentosByCliente);

// Buscar agendamentos de uma barbearia específica (com filtro opcional por status)
router.get('/barbearia/:barbeariaId', agendamentoController.getAgendamentosByBarbearia);

// Atualizar um agendamento (status, data/hora)
router.put('/:id', agendamentoController.updateAgendamento);

module.exports = router;

