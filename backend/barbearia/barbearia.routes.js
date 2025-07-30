const express = require('express');
const router = express.Router();
const barbeariaController = require('./barbearia.controller');

router.post('/', barbeariaController.createBarbearia);
router.get('/:id', barbeariaController.getBarbeariaById);
router.post('/login', barbeariaController.loginBarbearia);

module.exports = router;
