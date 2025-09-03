const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const whatsappService = require('../whatsapp/whatsapp.service');

const prisma = new PrismaClient();

// Função para formatar número de telefone para WhatsApp
function formatPhoneForWhatsApp(telefone) {
  if (!telefone) return null;
  
  // Remove todos os caracteres não numéricos
  let cleanNumber = telefone.replace(/\D/g, '');
  
  // Se o número começa com 55 (Brasil) e tem 13 dígitos, remove o 9 após o DDD
  if (cleanNumber.startsWith('55') && cleanNumber.length === 13) {
    // Formato: 5589994624921 -> 558994624921
    cleanNumber = cleanNumber.substring(0, 4) + cleanNumber.substring(5);
  }
  
  return cleanNumber;
}

// Webhook do Mercado Pago
async function webhookMercadoPago(req, res) {
  try {
    const notification = req.body;
    
    logger.info('Webhook recebido do Mercado Pago', notification);

    // Verificar se é uma notificação de pagamento
    if (notification.type !== 'payment' || notification.action !== 'payment.updated') {
      return res.status(200).json({ message: 'Notificação ignorada' });
    }

    const paymentId = notification.data?.id;
    
    if (!paymentId) {
      logger.error('Payment ID não encontrado na notificação', notification);
      return res.status(400).json({ error: 'Payment ID não encontrado' });
    }

    // Buscar o pagamento no banco de dados
    const pagamento = await prisma.pagamento.findUnique({
      where: { mercadoPagoId: paymentId.toString() },
      include: { barbearia: true }
    });

    if (!pagamento) {
      logger.error(`Pagamento não encontrado no banco: ${paymentId}`);
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Consultar o status atual do pagamento no Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      logger.error(`Erro ao consultar pagamento no Mercado Pago: ${paymentId}`);
      return res.status(500).json({ error: 'Erro ao consultar pagamento' });
    }

    const paymentData = await response.json();
    const newStatus = paymentData.status?.toUpperCase();

    logger.info(`Status do pagamento ${paymentId}: ${newStatus}`);

    // Atualizar o status do pagamento no banco
    await prisma.pagamento.update({
      where: { id: pagamento.id },
      data: { status: newStatus }
    });

    // Se o pagamento foi aprovado, ativar o plano da barbearia
    if (newStatus === 'APPROVED') {
      await prisma.barbearia.update({
        where: { id: pagamento.barbeariaId },
        data: { plano: 'STANDARD' }
      });

      logger.success(`Plano ativado para barbearia ${pagamento.barbearia.nome} (ID: ${pagamento.barbeariaId})`);

      // Enviar mensagem de WhatsApp após pagamento aprovado
      if (pagamento.barbearia.telefone) {
        const formattedPhone = formatPhoneForWhatsApp(pagamento.barbearia.telefone);
        if (formattedPhone) {
          const mensagem = `🎉 *Pagamento Aprovado!*\n\nOlá ${pagamento.barbearia.nomeProprietario}!\n\n✅ *Ótimas notícias!*\nSeu pagamento foi aprovado com sucesso e sua conta foi ativada!\n\n🚀 *Sua barbearia ${pagamento.barbearia.nome} está pronta para uso!*\n\n📋 *Próximos passos:*\n• Acesse seu dashboard\n• Complete as configurações restantes\n• Configure seus serviços e barbeiros\n• Comece a receber agendamentos\n\n💼 Agora você tem acesso a todas as funcionalidades da plataforma!\n\n📱 Em caso de dúvidas, estamos aqui para ajudar!`;
          
          try {
            await whatsappService.sendMessage(formattedPhone, mensagem);
            logger.info(`Mensagem de pagamento aprovado enviada para ${formattedPhone}`);
          } catch (error) {
            logger.error('Erro ao enviar mensagem de pagamento aprovado:', error);
          }
        }
      }
    }

    res.status(200).json({ message: 'Webhook processado com sucesso' });

  } catch (error) {
    logger.error('Erro ao processar webhook do Mercado Pago', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = {
  webhookMercadoPago
};

