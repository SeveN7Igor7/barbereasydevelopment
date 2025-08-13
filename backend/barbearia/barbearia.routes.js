const express = require('express');
const router = express.Router();
const barbeariaController = require('./barbearia.controller');
const { uploadLogo, uploadBanner, serveImage } = require('../utils/upload');

// Rotas existentes
router.post('/', barbeariaController.createBarbearia);
router.get('/:id', barbeariaController.getBarbeariaById);
router.get('/url/:nomeUrl', barbeariaController.getBarbeariaByNomeUrl);
router.post('/login', barbeariaController.loginBarbearia);

// Rotas para horários de funcionamento
router.get('/:id/horarios', barbeariaController.getHorariosByBarbearia);
router.post('/:id/horarios', barbeariaController.createOrUpdateHorarios);
router.put('/:id/horarios/:horarioId', barbeariaController.updateHorario);
router.delete('/:id/horarios/:horarioId', barbeariaController.deleteHorario);



// Rotas para upload de imagens
router.post("/:id/upload/logo", uploadLogo, barbeariaController.uploadLogo);
router.post("/:id/upload/banner", uploadBanner, barbeariaController.uploadBanner);



module.exports = router;
