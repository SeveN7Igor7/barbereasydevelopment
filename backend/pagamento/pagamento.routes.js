const express = require('express');
const { gerarPix, consultarPagamento, getPagamentosByBarbearia } = require('./pagamento.controller');

const router = express.Router();

// Rota para gerar Pix
router.post('/gerar-pix', gerarPix);

// Rota para consultar status do pagamento
router.get('/:pagamentoId', consultarPagamento);

// Rota para buscar pagamentos por barbearia
router.get('/barbearia/:barbeariaId', getPagamentosByBarbearia);

module.exports = router;

