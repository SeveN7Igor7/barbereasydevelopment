const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const crypto = require('crypto'); // 1. Importe o módulo crypto

const prisma = new PrismaClient();

// Função para gerar Pix via Mercado Pago
async function gerarPix(req, res) {
  try {
    const { barbeariaId } = req.body;

    if (!barbeariaId) {
      return res.status(400).json({ error: 'ID da barbearia é obrigatório' });
    }

    const barbearia = await prisma.barbearia.findUnique({
      where: { id: parseInt(barbeariaId) }
    });

    if (!barbearia) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    if (barbearia.plano === 'STANDARD' || barbearia.plano === 'PAGO' || barbearia.plano === 'VITALICIO') {
      return res.status(400).json({ error: 'Barbearia já possui um plano ativo' });
    }

    const valor = 0.01;

    const paymentData = {
      transaction_amount: valor,
      description: `Plano Standard - ${barbearia.nome}`,
      payment_method_id: 'pix',
      payer: {
        email: barbearia.email,
        first_name: barbearia.nomeProprietario,
        identification: {
          type: 'CPF',
          number: '00000000000'
        }
      }
    };

    // 2. Gere uma chave de idempotência única
    const idempotencyKey = crypto.randomUUID();

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'X-Idempotency-Key': idempotencyKey // 3. Adicione a chave ao cabeçalho
      },
      body: JSON.stringify(paymentData )
    });

    const paymentResponse = await response.json();

    if (!response.ok) {
      logger.error('Erro ao criar pagamento no Mercado Pago', paymentResponse);
      // Retorne o erro do Mercado Pago para facilitar a depuração no frontend
      return res.status(response.status).json({ 
        error: 'Erro ao gerar Pix no provedor de pagamento.',
        details: paymentResponse 
      });
    }

    // Salvar o pagamento no banco de dados
    // O campo no banco deve ser 'mercadoPagoId' e não 'id' do paymentResponse
    const pagamento = await prisma.pagamento.create({
      data: {
        barbeariaId: parseInt(barbeariaId),
        mercadoPagoId: paymentResponse.id.toString(), // ID do pagamento do Mercado Pago
        valor: valor,
        status: 'PENDING'
      }
    });

    logger.info(`Pix gerado para barbearia ${barbeariaId}`, {
      paymentId: paymentResponse.id,
      valor: valor
    });

    res.json({
      message: 'Pix gerado com sucesso',
      pagamento: {
        id: pagamento.id, // ID do seu banco de dados
        mercadoPagoId: paymentResponse.id, // ID do Mercado Pago
        valor: valor,
        status: 'PENDING',
        qrCode: paymentResponse.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64,
        pixCopyPaste: paymentResponse.point_of_interaction?.transaction_data?.qr_code
      }
    });

  } catch (error) {
    logger.error('Erro ao gerar Pix', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Função para consultar status do pagamento (sem alterações)
async function consultarPagamento(req, res) {
  try {
    const { pagamentoId } = req.params;

    const pagamento = await prisma.pagamento.findUnique({
      where: { id: parseInt(pagamentoId) },
      include: { barbearia: true }
    });

    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${pagamento.mercadoPagoId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      }
    } );

    const paymentData = await response.json();

    if (response.ok) {
      if (paymentData.status !== pagamento.status) {
        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: { status: paymentData.status.toUpperCase() }
        });
      }
    }

    res.json({
      pagamento: {
        id: pagamento.id,
        mercadoPagoId: pagamento.mercadoPagoId,
        valor: pagamento.valor,
        status: paymentData.status?.toUpperCase() || pagamento.status,
        createdAt: pagamento.createdAt
      }
    });

  } catch (error) {
    logger.error('Erro ao consultar pagamento', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Função para buscar pagamentos por barbearia
async function getPagamentosByBarbearia(req, res) {
  try {
    const { barbeariaId } = req.params;

    if (!barbeariaId) {
      return res.status(400).json({ error: 'ID da barbearia é obrigatório' });
    }

    const pagamentos = await prisma.pagamento.findMany({
      where: { 
        barbeariaId: parseInt(barbeariaId) 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(pagamentos);

  } catch (error) {
    logger.error('Erro ao buscar pagamentos da barbearia', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = {
  gerarPix,
  consultarPagamento,
  getPagamentosByBarbearia
};
