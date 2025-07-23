const express = require('express');
const router = express.Router();
const barbeiroController = require('./barbeiro.controller');

// Criar um novo barbeiro
router.post('/', barbeiroController.createBarbeiro);

// Buscar todos os barbeiros
router.get('/', barbeiroController.getAllBarbeiros);

// Buscar barbeiro por ID
router.get('/:id', barbeiroController.getBarbeiroById);

// Buscar barbeiros de uma barbearia específica
router.get('/barbearia/:barbeariaId', barbeiroController.getBarbeirosByBarbearia);

// Atualizar um barbeiro
router.put('/:id', barbeiroController.updateBarbeiro);

// Deletar um barbeiro
router.delete('/:id', barbeiroController.deleteBarbeiro);

module.exports = router;

