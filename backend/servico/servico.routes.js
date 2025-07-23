const express = require('express');
const router = express.Router();
const servicoController = require('./servico.controller');

// Criar um novo serviço
router.post('/', servicoController.createServico);

// Buscar todos os serviços
router.get('/', servicoController.getAllServicos);

// Buscar serviço por ID
router.get('/:id', servicoController.getServicoById);

// Buscar serviços de uma barbearia específica
router.get('/barbearia/:barbeariaId', servicoController.getServicosByBarbearia);

// Atualizar um serviço
router.put('/:id', servicoController.updateServico);

// Deletar um serviço
router.delete('/:id', servicoController.deleteServico);

module.exports = router;

