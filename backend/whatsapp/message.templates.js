class MessageTemplates {
  
  // Template para criação de conta do cliente
  static clientAccountCreated(clienteName, barbeariaName) {
    return `🎉 *Bem-vindo(a) à ${barbeariaName}!*

Olá *${clienteName}*! 👋

Sua conta foi criada com sucesso em nossa plataforma! 

✅ *Agora você pode:*
• Fazer agendamentos online
• Acompanhar seus horários
• Receber lembretes automáticos
• Ver histórico de serviços

📱 *Como agendar:*
Entre em contato conosco ou use nossa plataforma online para escolher o melhor horário para você!

Estamos ansiosos para atendê-lo(a)! 💈✨

---
*${barbeariaName}*
_Sua beleza é nossa prioridade!_`;
  }

  // Template para confirmação de agendamento do cliente
  static clientAppointmentConfirmed(clienteName, barbeariaName, serviceName, price, dateTime, barbeiroName) {
    const formattedDate = new Date(dateTime).toLocaleDateString('pt-BR');
    const formattedTime = new Date(dateTime).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `✅ *Agendamento Confirmado!*

Olá *${clienteName}*! 

Seu agendamento foi realizado com sucesso! 🎉

📋 *Detalhes do Agendamento:*
• *Serviço:* ${serviceName}
• *Barbeiro:* ${barbeiroName}
• *Data:* ${formattedDate}
• *Horário:* ${formattedTime}
• *Valor:* R$ ${price.toFixed(2).replace('.', ',')}
• *Local:* ${barbeariaName}

⏰ *Lembrete:*
Chegue com 10 minutos de antecedência para garantir seu horário!

📞 *Precisa remarcar ou cancelar?*
Entre em contato conosco o mais breve possível.

Até breve! 💈✨

---
*${barbeariaName}*
_Sua beleza é nossa prioridade!_`;
  }

  // Template para notificação da barbearia sobre novo agendamento
  static barbeariaNewAppointment(clienteName, clientePhone, serviceName, price, dateTime, barbeiroName) {
    const formattedDate = new Date(dateTime).toLocaleDateString('pt-BR');
    const formattedTime = new Date(dateTime).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `🔔 *NOVO AGENDAMENTO!*

📅 *Detalhes do Agendamento:*

👤 *Cliente:* ${clienteName}
📱 *Telefone:* ${clientePhone}
✂️ *Serviço:* ${serviceName}
💰 *Valor:* R$ ${price.toFixed(2).replace('.', ',')}
📅 *Data:* ${formattedDate}
⏰ *Horário:* ${formattedTime}
💈 *Barbeiro:* ${barbeiroName}

📋 *Status:* AGENDAMENTO PROGRAMADO

⚠️ *Ação Necessária:*
Confirme a disponibilidade e prepare-se para o atendimento.

---
_Sistema de Agendamentos - Barbearia_`;
  }

  // Template de menu expandido para barbearia
  static barbeariaMenu(barbeariaName) {
    return `📋 *MENU DE COMANDOS - ${barbeariaName}*

🗓️ *AGENDAMENTOS:*
• *agendamentos hoje* - Ver agendamentos de hoje
• *agendamentos amanha* - Ver agendamentos de amanhã
• *semana* - Ver agendamentos da semana
• *cancelados* - Ver cancelamentos recentes

📊 *RELATÓRIOS:*
• *status* - Resumo geral da barbearia
• *faturamento* - Receita do mês atual

👥 *GESTÃO:*
• *barbeiros* - Lista da equipe
• *servicos* - Lista de serviços
• *clientes* - Clientes recentes

❓ *AJUDA:*
• *menu* - Exibir este menu

---
💈 *${barbeariaName}*
_Sistema de Gestão WhatsApp_`;
  }

  // Template de menu expandido para cliente
  static clienteMenu(clienteName) {
    return `📋 *MENU DE COMANDOS*

Olá *${clienteName}*! 👋

📅 *AGENDAMENTOS:*
• *meus agendamentos* - Ver próximos agendamentos
• *proximo* - Ver próximo agendamento
• *historico* - Ver histórico de atendimentos
• *cancelar agendamento* - Solicitar cancelamento

ℹ️ *INFORMAÇÕES:*
• *servicos* - Ver serviços e preços
• *barbeiros* - Conhecer a equipe
• *contato* - Informações da barbearia

❓ *AJUDA:*
• *menu* - Exibir este menu

---
💈 *Sistema de Agendamentos*
_Sua beleza é nossa prioridade!_`;
  }

  // Template para agendamentos de hoje
  static agendamentosHoje(agendamentos) {
    if (agendamentos.length === 0) {
      return `📅 *AGENDAMENTOS DE HOJE*

✅ Nenhum agendamento para hoje!

Aproveite para organizar a barbearia ou descansar! 😊

---
_${new Date().toLocaleDateString('pt-BR')}_ 📆`;
    }

    let message = `📅 *AGENDAMENTOS DE HOJE*\n\n`;
    message += `📊 *Total: ${agendamentos.length} agendamento(s)*\n\n`;

    agendamentos.forEach((agendamento, index) => {
      const time = new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      message += `${index + 1}. ⏰ *${time}*\n`;
      message += `   👤 ${agendamento.cliente.nome}\n`;
      message += `   💈 ${agendamento.barbeiro.nome}\n`;
      message += `   ✂️ ${agendamento.nomeServico}\n`;
      message += `   💰 R$ ${agendamento.precoServico.toFixed(2).replace('.', ',')}\n`;
      message += `   📱 ${agendamento.cliente.telefone}\n\n`;
    });

    message += `---\n_${new Date().toLocaleDateString('pt-BR')}_ 📆`;
    return message;
  }

  // Template para agendamentos de amanhã
  static agendamentosAmanha(agendamentos) {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    
    if (agendamentos.length === 0) {
      return `📅 *AGENDAMENTOS DE AMANHÃ*

✅ Nenhum agendamento para amanhã!

---
_${amanha.toLocaleDateString('pt-BR')}_ 📆`;
    }

    let message = `📅 *AGENDAMENTOS DE AMANHÃ*\n\n`;
    message += `📊 *Total: ${agendamentos.length} agendamento(s)*\n\n`;

    agendamentos.forEach((agendamento, index) => {
      const time = new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      message += `${index + 1}. ⏰ *${time}*\n`;
      message += `   👤 ${agendamento.cliente.nome}\n`;
      message += `   💈 ${agendamento.barbeiro.nome}\n`;
      message += `   ✂️ ${agendamento.nomeServico}\n`;
      message += `   💰 R$ ${agendamento.precoServico.toFixed(2).replace('.', ',')}\n`;
      message += `   📱 ${agendamento.cliente.telefone}\n\n`;
    });

    message += `---\n_${amanha.toLocaleDateString('pt-BR')}_ 📆`;
    return message;
  }

  // Template para agendamentos da semana
  static agendamentosSemana(agendamentos) {
    if (agendamentos.length === 0) {
      return `📅 *AGENDAMENTOS DA SEMANA*

✅ Nenhum agendamento para os próximos 7 dias!

---
_Próximos 7 dias_ 📆`;
    }

    let message = `📅 *AGENDAMENTOS DA SEMANA*\n\n`;
    message += `📊 *Total: ${agendamentos.length} agendamento(s)*\n\n`;

    // Agrupar por dia
    const agendamentosPorDia = {};
    agendamentos.forEach(agendamento => {
      const data = new Date(agendamento.dataHora).toLocaleDateString('pt-BR');
      if (!agendamentosPorDia[data]) {
        agendamentosPorDia[data] = [];
      }
      agendamentosPorDia[data].push(agendamento);
    });

    Object.keys(agendamentosPorDia).forEach(data => {
      message += `📅 *${data}*\n`;
      agendamentosPorDia[data].forEach(agendamento => {
        const time = new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        message += `   ⏰ ${time} - ${agendamento.cliente.nome} (${agendamento.barbeiro.nome})\n`;
      });
      message += '\n';
    });

    message += `---\n_Próximos 7 dias_ 📆`;
    return message;
  }

  // Template para resumo da barbearia
  static resumoBarbearia(resumo, barbeariaName) {
    return `📊 *RESUMO - ${barbeariaName}*

📅 *HOJE:*
• ${resumo.agendamentosHoje} agendamento(s)

👥 *EQUIPE:*
• ${resumo.totalBarbeiros} barbeiro(s) ativo(s)

✂️ *SERVIÇOS:*
• ${resumo.totalServicos} serviço(s) disponível(is)

👤 *CLIENTES:*
• ${resumo.totalClientes} cliente(s) cadastrado(s)

---
_Atualizado em ${new Date().toLocaleString('pt-BR')}_ 🕐`;
  }

  // Template para lista de barbeiros
  static listaBarbeiros(barbeiros) {
    if (barbeiros.length === 0) {
      return `👥 *EQUIPE DE BARBEIROS*

⚠️ Nenhum barbeiro ativo cadastrado.

---
_Sistema de Gestão_`;
    }

    let message = `👥 *EQUIPE DE BARBEIROS*\n\n`;
    message += `📊 *Total: ${barbeiros.length} barbeiro(s)*\n\n`;

    barbeiros.forEach((barbeiro, index) => {
      message += `${index + 1}. 💈 *${barbeiro.nome}*\n`;
      if (barbeiro.especialidade) {
        message += `   🎯 ${barbeiro.especialidade}\n`;
      }
      message += `   ✅ Ativo\n\n`;
    });

    message += `---\n_Sistema de Gestão_ 👥`;
    return message;
  }

  // Template para lista de serviços
  static listaServicos(servicos) {
    if (servicos.length === 0) {
      return `✂️ *SERVIÇOS DISPONÍVEIS*

⚠️ Nenhum serviço cadastrado.

---
_Sistema de Gestão_`;
    }

    let message = `✂️ *SERVIÇOS DISPONÍVEIS*\n\n`;
    message += `📊 *Total: ${servicos.length} serviço(s)*\n\n`;

    servicos.forEach((servico, index) => {
      message += `${index + 1}. ✂️ *${servico.nome}*\n`;
      message += `   ⏱️ ${servico.duracaoMin} minutos\n`;
      message += `   💰 R$ ${servico.preco.toFixed(2).replace('.', ',')}\n\n`;
    });

    message += `---\n_Sistema de Gestão_ ✂️`;
    return message;
  }

  // Template para agendamentos do cliente
  static agendamentosCliente(agendamentos, clienteName) {
    if (agendamentos.length === 0) {
      return `📅 *SEUS AGENDAMENTOS*

Olá *${clienteName}*! 👋

✅ Você não possui agendamentos futuros.

💡 *Que tal agendar um horário?*
Entre em contato conosco para marcar seu próximo atendimento!

---
💈 _Sistema de Agendamentos_`;
    }

    let message = `📅 *SEUS AGENDAMENTOS*\n\n`;
    message += `Olá *${clienteName}*! 👋\n\n`;
    message += `📊 *Próximos ${agendamentos.length} agendamento(s):*\n\n`;

    agendamentos.forEach((agendamento, index) => {
      const date = new Date(agendamento.dataHora).toLocaleDateString('pt-BR');
      const time = new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      message += `${index + 1}. 📅 *${date}* às *${time}*\n`;
      message += `   ✂️ ${agendamento.nomeServico}\n`;
      message += `   💈 ${agendamento.barbeiro.nome}\n`;
      message += `   🏪 ${agendamento.barbearia.nome}\n`;
      message += `   💰 R$ ${agendamento.precoServico.toFixed(2).replace('.', ',')}\n`;
      message += `   📋 ${agendamento.status.replace('_', ' ')}\n\n`;
    });

    message += `---\n💈 _Sistema de Agendamentos_`;
    return message;
  }

  // Template para próximo agendamento
  static proximoAgendamento(agendamento, clienteName) {
    if (!agendamento) {
      return `📅 *PRÓXIMO AGENDAMENTO*

Olá *${clienteName}*! 👋

✅ Você não possui agendamentos futuros.

💡 *Que tal agendar um horário?*
Entre em contato conosco para marcar seu próximo atendimento!

---
💈 _Sistema de Agendamentos_`;
    }

    const date = new Date(agendamento.dataHora).toLocaleDateString('pt-BR');
    const time = new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `📅 *SEU PRÓXIMO AGENDAMENTO*

Olá *${clienteName}*! 👋

🗓️ *Data:* ${date}
⏰ *Horário:* ${time}
✂️ *Serviço:* ${agendamento.nomeServico}
💈 *Barbeiro:* ${agendamento.barbeiro.nome}
🏪 *Local:* ${agendamento.barbearia.nome}
💰 *Valor:* R$ ${agendamento.precoServico.toFixed(2).replace('.', ',')}
📋 *Status:* ${agendamento.status.replace('_', ' ')}

⏰ *Lembrete:*
Chegue com 10 minutos de antecedência!

---
💈 _Sistema de Agendamentos_`;
  }

  // Template para histórico do cliente
  static historicoCliente(historico, clienteName) {
    if (historico.length === 0) {
      return `📋 *SEU HISTÓRICO*

Olá *${clienteName}*! 👋

📝 Você ainda não possui histórico de atendimentos.

💡 *Primeira vez?*
Seja bem-vindo(a)! Estamos ansiosos para atendê-lo(a)!

---
💈 _Sistema de Agendamentos_`;
    }

    let message = `📋 *SEU HISTÓRICO*\n\n`;
    message += `Olá *${clienteName}*! 👋\n\n`;
    message += `📊 *Últimos ${historico.length} atendimento(s):*\n\n`;

    historico.forEach((agendamento, index) => {
      const date = new Date(agendamento.dataHora).toLocaleDateString('pt-BR');
      
      message += `${index + 1}. 📅 *${date}*\n`;
      message += `   ✂️ ${agendamento.nomeServico}\n`;
      message += `   💈 ${agendamento.barbeiro.nome}\n`;
      message += `   🏪 ${agendamento.barbearia.nome}\n`;
      message += `   💰 R$ ${agendamento.precoServico.toFixed(2).replace('.', ',')}\n\n`;
    });

    message += `---\n💈 _Sistema de Agendamentos_`;
    return message;
  }

  // Template para clientes recentes
  static clientesRecentes(clientes) {
    if (clientes.length === 0) {
      return `👥 *CLIENTES RECENTES*

⚠️ Nenhum cliente cadastrado.

---
_Sistema de Gestão_`;
    }

    let message = `👥 *CLIENTES RECENTES*\n\n`;
    message += `📊 *Últimos ${clientes.length} cliente(s):*\n\n`;

    clientes.forEach((cliente, index) => {
      message += `${index + 1}. 👤 *${cliente.nome}*\n`;
      message += `   📱 ${cliente.telefone}\n`;
      message += `   📋 ${cliente.status}\n\n`;
    });

    message += `---\n_Sistema de Gestão_ 👥`;
    return message;
  }

  // Template para faturamento do mês
  static faturamentoMes(faturamento, barbeariaName) {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return `💰 *FATURAMENTO - ${barbeariaName}*

📅 *Mês:* ${meses[faturamento.mes - 1]}

💵 *Receita Total:* R$ ${faturamento.total.toFixed(2).replace('.', ',')}
📊 *Atendimentos:* ${faturamento.quantidade}
💳 *Ticket Médio:* R$ ${faturamento.quantidade > 0 ? (faturamento.total / faturamento.quantidade).toFixed(2).replace('.', ',') : '0,00'}

---
_Atualizado em ${new Date().toLocaleString('pt-BR')}_ 💰`;
  }

  // Template para agendamentos cancelados
  static agendamentosCancelados(cancelados) {
    if (cancelados.length === 0) {
      return `❌ *AGENDAMENTOS CANCELADOS*

✅ Nenhum cancelamento nos últimos 7 dias!

---
_Últimos 7 dias_ 📅`;
    }

    let message = `❌ *AGENDAMENTOS CANCELADOS*\n\n`;
    message += `📊 *Total: ${cancelados.length} cancelamento(s) (últimos 7 dias)*\n\n`;

    cancelados.forEach((agendamento, index) => {
      const date = new Date(agendamento.dataHora).toLocaleDateString('pt-BR');
      const time = new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      message += `${index + 1}. 📅 *${date}* às *${time}*\n`;
      message += `   👤 ${agendamento.cliente.nome}\n`;
      message += `   💈 ${agendamento.barbeiro.nome}\n`;
      message += `   ✂️ ${agendamento.nomeServico}\n`;
      message += `   💰 R$ ${agendamento.precoServico.toFixed(2).replace('.', ',')}\n\n`;
    });

    message += `---\n_Últimos 7 dias_ ❌`;
    return message;
  }

  // Template para serviços (visão do cliente)
  static servicosParaCliente(servicos, barbeariaName) {
    if (servicos.length === 0) {
      return `✂️ *NOSSOS SERVIÇOS*

⚠️ Nenhum serviço disponível no momento.

Entre em contato para mais informações!

---
💈 *${barbeariaName}*`;
    }

    let message = `✂️ *NOSSOS SERVIÇOS*\n\n`;

    servicos.forEach((servico, index) => {
      message += `${index + 1}. ✂️ *${servico.nome}*\n`;
      message += `   ⏱️ ${servico.duracaoMin} minutos\n`;
      message += `   💰 R$ ${servico.preco.toFixed(2).replace('.', ',')}\n\n`;
    });

    message += `💡 *Para agendar:*\nEntre em contato conosco!\n\n`;
    message += `---\n💈 *${barbeariaName}*`;
    return message;
  }

  // Template para barbeiros (visão do cliente)
  static barbeirosParaCliente(barbeiros, barbeariaName) {
    if (barbeiros.length === 0) {
      return `👥 *NOSSA EQUIPE*

⚠️ Nenhum barbeiro disponível no momento.

---
💈 *${barbeariaName}*`;
    }

    let message = `👥 *NOSSA EQUIPE*\n\n`;

    barbeiros.forEach((barbeiro, index) => {
      message += `${index + 1}. 💈 *${barbeiro.nome}*\n`;
      if (barbeiro.especialidade) {
        message += `   🎯 ${barbeiro.especialidade}\n`;
      }
      message += `   ✅ Disponível\n\n`;
    });

    message += `💡 *Para agendar:*\nEscolha seu barbeiro preferido e entre em contato!\n\n`;
    message += `---\n💈 *${barbeariaName}*`;
    return message;
  }

  // Template para cancelar agendamento
  static cancelarAgendamento(agendamento, clienteName) {
    const date = new Date(agendamento.dataHora).toLocaleDateString('pt-BR');
    const time = new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `❌ *CANCELAR AGENDAMENTO*

Olá *${clienteName}*! 👋

🗓️ *Agendamento a cancelar:*
• Data: ${date}
• Horário: ${time}
• Serviço: ${agendamento.nomeServico}
• Barbeiro: ${agendamento.barbeiro.nome}
• Local: ${agendamento.barbearia.nome}

⚠️ *Para cancelar:*
Entre em contato diretamente com a barbearia pelo telefone ou presencialmente.

📞 *Importante:*
Cancelamentos devem ser feitos com antecedência para evitar taxas.

---
💈 _Sistema de Agendamentos_`;
  }

  // Template para contato da barbearia
  static contatoBarbearia(barbearia) {
    return `📞 *CONTATO - ${barbearia.nome}*

👤 *Proprietário:* ${barbearia.nomeProprietario}
📧 *Email:* ${barbearia.email}
${barbearia.telefone ? `📱 *Telefone:* ${barbearia.telefone}` : ''}

🌐 *Acesso Online:*
${barbearia.nomeUrl}

⏰ *Horário de Funcionamento:*
Entre em contato para mais informações!

---
💈 *${barbearia.nome}*
_Sua beleza é nossa prioridade!_`;
  }
}

module.exports = MessageTemplates;

