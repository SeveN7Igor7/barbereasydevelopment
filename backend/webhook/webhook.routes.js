const express = require('express');
const { webhookMercadoPago } = require('./webhook.controller');

const router = express.Router();

// Webhook do Mercado Pago
router.post('/mercado-pago', webhookMercadoPago);

module.exports = router;

