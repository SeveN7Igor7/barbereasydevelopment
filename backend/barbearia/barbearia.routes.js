const express = require('express');
const router = express.Router();
const barbeariaController = require('./barbearia.controller');

router.post('/', barbeariaController.createBarbearia);

// Se quiser outras rotas, exemplo:
// router.get('/', barbeariaController.listarBarbearias);
// router.get('/:id', barbeariaController.getBarbeariaById);

module.exports = router;
