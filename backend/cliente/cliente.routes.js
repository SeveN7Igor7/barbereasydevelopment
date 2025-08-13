const express = require('express');
const router = express.Router();
const clienteController = require('./cliente.controller');

// Criar um novo cliente
router.post('/', clienteController.createCliente);

// Login por telefone
router.post('/login', clienteController.loginByTelefone);

// Buscar clientes (com query parameters)
router.get('/', clienteController.getClientes);

// Buscar cliente por ID
router.get('/:id', clienteController.getClienteById);

module.exports = router;

