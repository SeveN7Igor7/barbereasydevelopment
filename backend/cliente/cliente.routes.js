const express = require('express');
const router = express.Router();
const clienteController = require('./cliente.controller');

// Criar um novo cliente
router.post('/', clienteController.createCliente);

// Buscar cliente por ID
router.get('/:id', clienteController.getClienteById);

module.exports = router;

