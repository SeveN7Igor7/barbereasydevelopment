const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.isActive = process.env.AI_SYSTEM_ACTIVE === 'ATIVO';
  }

  // Método para logar requisições detalhadamente
  logDatabaseOperation(operation, method, data = null, result = null, error = null) {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 [DB-OPERATION] ${timestamp}`);
    console.log(`📋 Operação: ${operation}`);
    console.log(`🔧 Método: ${method}`);
    
    if (data) {
      console.log(`📥 ENTRADA:`, JSON.stringify(data, null, 2));
    }
    
    if (result) {
      console.log(`📤 SAÍDA:`, JSON.stringify(result, null, 2));
    }
    
    if (error) {
      console.log(`❌ ERRO:`, error.message);
      console.log(`🔍 Stack:`, error.stack);
    }
    
    console.log(`⏱️ Timestamp: ${timestamp}\n`);
  }

  async generateResponse(prompt, context = {}) {
    if (!this.isActive) {
      return null;
    }

    try {
      const response = await axios.post(this.baseUrl, {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey
        }
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('❌ Erro ao gerar resposta do Gemini:', error);
      return null;
    }
  }

  async processWhatsAppMessage(phoneNumber, message, userSession = {}) {
    if (!this.isActive) {
      console.log('🤖 Sistema de IA inativo, retornando null');
      return null;
    }

    try {
      console.log(`🤖 [GEMINI] Processando mensagem de ${phoneNumber}`);
      console.log(`📝 [GEMINI] Mensagem: "${message}"`);
      console.log(`👤 [GEMINI] Sessão do usuário:`, JSON.stringify(userSession, null, 2));
      
      // Construir contexto da conversa
      console.log('🔧 [GEMINI] Construindo prompt do sistema...');
      const systemPrompt = this.buildSystemPrompt();
      
      console.log('👤 [GEMINI] Construindo contexto do usuário...');
      const userContext = await this.buildUserContext(phoneNumber, userSession);
      
      console.log('📚 [GEMINI] Buscando histórico da conversa...');
      const conversationHistory = await this.getConversationHistory(phoneNumber);
      
      // Buscar dados relevantes do banco de dados baseado na mensagem
      console.log('🔍 [GEMINI] Buscando dados relevantes do banco...');
      const databaseContext = await this.buildDatabaseContext(message, userSession);
      
      const fullPrompt = `${systemPrompt}

CONTEXTO DO USUÁRIO:
${userContext}

DADOS DO BANCO DE DADOS:
${databaseContext}

HISTÓRICO DA CONVERSA:
${conversationHistory}

MENSAGEM ATUAL: ${message}

Responda de forma natural e focada no assunto da barbearia. Use os dados reais do banco de dados para fornecer informações precisas. Se o usuário quiser fazer alterações (cancelar agendamento, reagendar, trocar de conta, etc.), execute a ação diretamente ou explique como proceder.`;

      console.log('🚀 [GEMINI] Enviando prompt para API Gemini...');
      console.log(`📏 [GEMINI] Tamanho do prompt: ${fullPrompt.length} caracteres`);
      
      const response = await this.generateResponse(fullPrompt);
      
      if (response) {
        console.log('✅ [GEMINI] Resposta gerada com sucesso');
        console.log(`📝 [GEMINI] Resposta: "${response.substring(0, 200)}${response.length > 200 ? '...' : ''}"`);
        
        // Salvar a conversa no histórico
        console.log('💾 [GEMINI] Salvando conversa no histórico...');
        await this.saveConversation(phoneNumber, message, response, userSession);
        console.log('✅ [GEMINI] Conversa salva com sucesso');
      } else {
        console.log('❌ [GEMINI] Nenhuma resposta gerada');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [GEMINI] Erro ao processar mensagem WhatsApp:', error);
      console.error('🔍 [GEMINI] Stack trace:', error.stack);
      return null;
    }
  }

  async buildDatabaseContext(message, userSession) {
    let context = '';
    
    try {
      // Se o usuário está logado, buscar dados específicos
      if (userSession.loggedIn && userSession.userData) {
        if (userSession.type === 'cliente') {
          // Buscar agendamentos do cliente
          const agendamentos = await this.getAgendamentosByCliente(userSession.userData.id);
          context += `\nAGENDAMENTOS DO CLIENTE:\n`;
          if (agendamentos.length > 0) {
            agendamentos.forEach(ag => {
              const dataFormatada = new Date(ag.dataHora).toLocaleString('pt-BR');
              context += `- ID: ${ag.id} | ${ag.nomeServico} com ${ag.barbeiro.nome} em ${dataFormatada} (Status: ${ag.status}) - R$ ${ag.precoServico}\n`;
            });
          } else {
            context += `- Nenhum agendamento encontrado\n`;
          }
          
          // Buscar serviços da barbearia atual
          if (userSession.barbeariaAtual) {
            const servicos = await this.getServicosByBarbearia(userSession.barbeariaAtual);
            context += `\nSERVIÇOS DISPONÍVEIS:\n`;
            servicos.forEach(servico => {
              context += `- ID: ${servico.id} | ${servico.nome}: R$ ${servico.preco} (${servico.duracaoMin} min)\n`;
            });
            
            // Buscar barbeiros da barbearia
            const barbeiros = await this.getBarbeirosByBarbearia(userSession.barbeariaAtual);
            context += `\nBARBEIROS DISPONÍVEIS:\n`;
            barbeiros.forEach(barbeiro => {
              context += `- ID: ${barbeiro.id} | ${barbeiro.nome} (${barbeiro.especialidade || 'Especialidade não informada'})\n`;
            });
          }
          
        } else if (userSession.type === 'barbearia') {
          // Buscar agendamentos da barbearia
          const hoje = new Date();
          const agendamentosHoje = await this.getAgendamentosByBarbearia(userSession.userData.id, 'hoje');
          const agendamentosAmanha = await this.getAgendamentosByBarbearia(userSession.userData.id, 'amanha');
          
          context += `\nAGENDAMENTOS DE HOJE (${hoje.toLocaleDateString('pt-BR')}):\n`;
          if (agendamentosHoje.length > 0) {
            agendamentosHoje.forEach(ag => {
              const horaFormatada = new Date(ag.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              context += `- ID: ${ag.id} | ${horaFormatada}: ${ag.cliente.nome} (${ag.cliente.telefone}) - ${ag.nomeServico} com ${ag.barbeiro.nome} - R$ ${ag.precoServico} (${ag.status})\n`;
            });
          } else {
            context += `- Nenhum agendamento para hoje\n`;
          }
          
          context += `\nAGENDAMENTOS DE AMANHÃ:\n`;
          if (agendamentosAmanha.length > 0) {
            agendamentosAmanha.forEach(ag => {
              const horaFormatada = new Date(ag.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              context += `- ID: ${ag.id} | ${horaFormatada}: ${ag.cliente.nome} (${ag.cliente.telefone}) - ${ag.nomeServico} com ${ag.barbeiro.nome} - R$ ${ag.precoServico} (${ag.status})\n`;
            });
          } else {
            context += `- Nenhum agendamento para amanhã\n`;
          }
          
          // Buscar dados da equipe
          const barbeiros = await this.getBarbeirosByBarbearia(userSession.userData.id);
          context += `\nEQUIPE DE BARBEIROS:\n`;
          barbeiros.forEach(barbeiro => {
            context += `- ID: ${barbeiro.id} | ${barbeiro.nome} (${barbeiro.especialidade || 'Especialidade não informada'}) - ${barbeiro.ativo ? 'Ativo' : 'Inativo'}\n`;
          });
          
          // Buscar serviços
          const servicos = await this.getServicosByBarbearia(userSession.userData.id);
          context += `\nSERVIÇOS OFERECIDOS:\n`;
          servicos.forEach(servico => {
            context += `- ID: ${servico.id} | ${servico.nome}: R$ ${servico.preco} (${servico.duracaoMin} min)\n`;
          });
        }
      }
      
      // Verificar se a mensagem contém palavras-chave para buscar dados específicos
      const messageLower = message.toLowerCase();
      
      if (messageLower.includes('agendamento') || messageLower.includes('agenda') || messageLower.includes('horário')) {
        // Já incluído acima se o usuário estiver logado
      }
      
      if (messageLower.includes('serviço') || messageLower.includes('preço') || messageLower.includes('valor')) {
        // Já incluído acima se o usuário estiver logado
      }
      
      if (messageLower.includes('barbeiro') || messageLower.includes('profissional')) {
        // Já incluído acima se o usuário estiver logado
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar contexto do banco de dados:', error);
      context += '\n[Erro ao buscar dados do banco de dados]';
    }
    
    return context;
  }

  buildSystemPrompt() {
    return `Você é uma assistente inteligente e conversacional de um sistema de barbearia. Você deve ser natural, amigável e proativa nas conversas.

🎯 **SEU PAPEL:**
- Assistente virtual especializada em barbearias
- Personalidade amigável, prestativa e profissional
- Capaz de manter conversas naturais e fluidas
- Proativa em oferecer ajuda e sugestões
- SEMPRE use dados REAIS do banco de dados fornecidos no contexto
- NUNCA mencione "botões", "clique", "pressione" ou interfaces gráficas - você está no WhatsApp!

🔐 **AUTENTICAÇÃO (já gerenciada pelo sistema):**
- Usuários podem estar logados como Cliente, Barbearia ou Barbeiro
- Você recebe o contexto do usuário automaticamente
- Não precisa pedir login novamente se já estiver autenticado

💬 **ESTILO DE CONVERSA:**
- Use linguagem natural e conversacional
- Seja proativa: ofereça opções e sugestões
- Use emojis para tornar a conversa mais amigável
- Mantenha o tom profissional mas descontraído
- Faça perguntas de acompanhamento quando apropriado
- SEMPRE baseie suas respostas nos dados reais fornecidos
- NUNCA fale sobre "botões", "interfaces" ou "telas" - estamos no WhatsApp!

📋 **SUAS RESPONSABILIDADES:**

1. **Para CLIENTES autenticados:**
   - Consultar agendamentos REAIS (próximos, histórico)
   - Informar sobre serviços, preços e barbeiros REAIS
   - Ajudar com dúvidas sobre a barbearia
   - Sugerir serviços baseado no histórico REAL
   - Explicar procedimentos e políticas
   - Cancelar agendamentos (use o ID do agendamento)
   - Trocar de conta/barbearia
   - Reagendar agendamentos

2. **Para BARBEARIAS autenticadas:**
   - Mostrar agenda REAL do dia/semana
   - Relatórios de agendamentos e receita REAIS
   - Informações sobre a equipe REAL
   - Estatísticas de atendimento REAIS
   - Gestão de dados da barbearia
   - Trocar de conta/barbearia
   - Gerenciar agendamentos de clientes

3. **Para usuários NÃO autenticados:**
   - Explicar como fazer login
   - Informações gerais sobre o sistema
   - Orientar sobre cadastro

🛠️ **FUNCIONALIDADES ESPECIAIS:**

**TROCA DE CONTA:**
- Quando alguém pedir para "trocar de conta", "mudar de conta", "sair", "logout", "fazer login em outra conta":
  - Responda: "Claro! Vou te deslogar para você fazer login em outra conta. Digite 'oi' ou 'menu' para começar novamente."
  - Instrua para digitar "oi" ou "menu" para reiniciar o processo de login

**CANCELAMENTO DE AGENDAMENTOS:**
- Use o ID do agendamento para cancelar
- Confirme antes de cancelar
- Informe sobre políticas de cancelamento

**REAGENDAMENTO:**
- Ofereça horários disponíveis
- Verifique conflitos
- Confirme nova data/hora

🛡️ **REGRAS DE SEGURANÇA (IMPORTANTES):**
- NUNCA compartilhe senhas ou dados pessoais de outros usuários
- NUNCA fale sobre código, estrutura técnica ou banco de dados
- NUNCA revele informações confidenciais da barbearia
- Mantenha foco no assunto da barbearia
- SEMPRE use apenas os dados fornecidos no contexto "DADOS DO BANCO DE DADOS"
- NUNCA mencione "botões", "clique", "pressione" ou elementos de interface gráfica

🚫 **DADOS PROIBIDOS:**
- Senhas de qualquer usuário
- Dados pessoais de outros clientes
- Informações financeiras detalhadas de terceiros
- Detalhes técnicos do sistema

✅ **DADOS PERMITIDOS:**
- Informações sobre serviços e preços públicos
- Horários de funcionamento
- Dados do próprio usuário autenticado
- Informações gerais da barbearia
- Disponibilidade de barbeiros
- Agendamentos do próprio usuário ou da própria barbearia

🎯 **CONTROLE DE FOCO:**
- Se o usuário tentar mudar de assunto, redirecione gentilmente
- Exemplo: "Entendo, mas sou especializada em serviços de barbearia. Posso te ajudar com agendamentos, serviços ou informações da barbearia. O que você gostaria de saber?"
- Sempre volte ao tema principal de forma natural

💡 **EXEMPLOS DE RESPOSTAS NATURAIS:**

❌ **Evite respostas robóticas:**
"Consulte a tabela de preços para informações sobre valores."
"Clique no botão para cancelar"
"Pressione sair para fazer logout"

✅ **Prefira respostas conversacionais:**
"Claro! Nossos preços são bem acessíveis. O corte simples sai por R$ 25, e se você quiser fazer barba também, fica R$ 45 no total. Quer que eu veja se tem horário disponível para você?"
"Para cancelar, me confirme o agendamento que você quer cancelar e eu faço isso para você."
"Para trocar de conta, vou te deslogar. Depois é só digitar 'oi' para fazer login novamente."

🔄 **MANUTENÇÃO DE CONTEXTO:**
- Lembre-se do que foi discutido anteriormente
- Faça referências à conversa anterior quando apropriado
- Se o usuário mencionar algo específico, use essa informação
- Seja consistente com informações já fornecidas

🤝 **SEJA PROATIVA:**
- Ofereça opções relacionadas ao que o usuário perguntou
- Sugira próximos passos
- Pergunte se precisa de mais alguma coisa
- Antecipe necessidades baseado no contexto

📊 **USO DE DADOS REAIS:**
- SEMPRE consulte a seção "DADOS DO BANCO DE DADOS" para informações precisas
- NUNCA invente ou simule dados
- Se não houver dados disponíveis, informe que não há informações no momento
- Use os dados reais para fornecer respostas precisas e úteis
- Use IDs dos registros quando necessário para operações específicas

🔧 **COMANDOS ESPECIAIS:**
- "trocar conta", "mudar conta", "sair", "logout" → Deslogar e instruir para digitar "oi"
- "cancelar agendamento" → Mostrar agendamentos e permitir cancelamento
- "reagendar" → Oferecer opções de reagendamento
- "meus agendamentos" → Mostrar agendamentos do usuário
- "agenda hoje" → Mostrar agenda do dia (para barbearias)

Lembre-se: Você é uma assistente amigável e competente no WhatsApp. Mantenha sempre o foco na barbearia, seja natural na conversa, use APENAS dados reais do banco de dados, NUNCA mencione elementos de interface gráfica e ajude o usuário da melhor forma possível!`;
  }

  async buildUserContext(phoneNumber, userSession) {
    let context = `Telefone: ${phoneNumber}\n`;
    
    if (userSession.type) {
      context += `Tipo de usuário: ${userSession.type}\n`;
      context += `Status de login: ${userSession.loggedIn ? 'Logado' : 'Não logado'}\n`;
      
      if (userSession.loggedIn && userSession.userData) {
        const userData = userSession.userData;
        if (userSession.type === 'cliente') {
          context += `Nome: ${userData.nome}\n`;
          context += `ID do Cliente: ${userData.id}\n`;
          context += `Barbearia atual: ${userSession.barbeariaAtual || 'Não selecionada'}\n`;
        } else if (userSession.type === 'barbearia') {
          context += `Nome da barbearia: ${userData.nome}\n`;
          context += `ID da Barbearia: ${userData.id}\n`;
          context += `Proprietário: ${userData.nomeProprietario}\n`;
        }
      }
    } else {
      context += `Status: Usuário não identificado\n`;
    }
    
    return context;
  }

  async getConversationHistory(phoneNumber, limit = 5) {
    try {
      this.logDatabaseOperation('Buscar histórico de conversas', 'SELECT', { telefone: phoneNumber, limit });
      
      // Buscar últimas conversas do usuário
      const conversations = await prisma.conversaIA.findMany({
        where: { telefone: phoneNumber },
        orderBy: { createdAt: 'desc' },
        take: limit * 2 // Pegar mensagens do usuário e respostas da IA
      });

      this.logDatabaseOperation('Buscar histórico de conversas', 'SELECT', null, { count: conversations.length });

      if (conversations.length === 0) {
        return 'Primeira conversa com este usuário.';
      }

      let history = '';
      conversations.reverse().forEach(conv => {
        history += `${conv.tipo === 'USER' ? 'Usuário' : 'IA'}: ${conv.mensagem}\n`;
      });

      return history;
    } catch (error) {
      this.logDatabaseOperation('Buscar histórico de conversas', 'SELECT', null, null, error);
      console.error('❌ Erro ao buscar histórico:', error);
      return 'Erro ao carregar histórico.';
    }
  }

  async saveConversation(phoneNumber, userMessage, aiResponse, userSession) {
    try {
      this.logDatabaseOperation('Salvar mensagem do usuário', 'INSERT', { telefone: phoneNumber, mensagem: userMessage, tipo: 'USER' });
      
      // Salvar mensagem do usuário
      const userConv = await prisma.conversaIA.create({
        data: {
          telefone: phoneNumber,
          mensagem: userMessage,
          tipo: 'USER',
          sessao: JSON.stringify(userSession)
        }
      });

      this.logDatabaseOperation('Salvar mensagem do usuário', 'INSERT', null, { id: userConv.id });

      // Salvar resposta da IA
      if (aiResponse) {
        this.logDatabaseOperation('Salvar resposta da IA', 'INSERT', { telefone: phoneNumber, mensagem: aiResponse, tipo: 'AI' });
        
        const aiConv = await prisma.conversaIA.create({
          data: {
            telefone: phoneNumber,
            mensagem: aiResponse,
            tipo: 'AI',
            sessao: JSON.stringify(userSession)
          }
        });

        this.logDatabaseOperation('Salvar resposta da IA', 'INSERT', null, { id: aiConv.id });
      }
    } catch (error) {
      this.logDatabaseOperation('Salvar conversa', 'INSERT', null, null, error);
      console.error('❌ Erro ao salvar conversa:', error);
    }
  }

  // Métodos para interação com banco de dados
  async getBarbeariasByCliente(telefone, nome) {
    try {
      this.logDatabaseOperation('Buscar barbearias do cliente', 'SELECT', { telefone, nome });
      
      // Normalizar número de telefone para diferentes formatos
      const phoneVariations = this.generatePhoneVariations(telefone);
      console.log(`📱 Variações de telefone geradas: ${phoneVariations.join(', ')}`);
      
      // Buscar cliente com qualquer uma das variações de telefone
      const cliente = await prisma.cliente.findFirst({
        where: {
          telefone: {
            in: phoneVariations
          },
          nome: {
            contains: nome,
            mode: 'insensitive'
          }
        },
        include: {
          barbearia: true
        }
      });

      this.logDatabaseOperation('Buscar barbearias do cliente', 'SELECT', null, cliente ? { clienteId: cliente.id, barbeariaId: cliente.barbearia.id } : null);

      if (cliente) {
        return [cliente.barbearia];
      }

      return [];
    } catch (error) {
      this.logDatabaseOperation('Buscar barbearias do cliente', 'SELECT', null, null, error);
      console.error('❌ Erro ao buscar barbearias do cliente:', error);
      return [];
    }
  }

  // Gerar variações possíveis do número de telefone
  generatePhoneVariations(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    const variations = new Set();
    
    // Adicionar o número original limpo
    variations.add(cleanPhone);
    
    // Se tem 11 dígitos (DDD + 9 + número), adicionar versão sem o 9
    if (cleanPhone.length === 11) {
      const withoutNine = cleanPhone.substring(0, 2) + cleanPhone.substring(3);
      variations.add(withoutNine);
    }
    
    // Se tem 10 dígitos (DDD + número), adicionar versão com 9
    if (cleanPhone.length === 10) {
      const withNine = cleanPhone.substring(0, 2) + '9' + cleanPhone.substring(2);
      variations.add(withNine);
    }
    
    // Adicionar versões com código do país (55)
    variations.forEach(variation => {
      if (!variation.startsWith('55')) {
        variations.add('55' + variation);
      }
    });
    
    // Remover versões com código do país se necessário
    variations.forEach(variation => {
      if (variation.startsWith('55') && variation.length > 11) {
        const withoutCountry = variation.substring(2);
        variations.add(withoutCountry);
      }
    });
    
    return Array.from(variations);
  }

  async authenticateBarbearia(email, senha) {
    try {
      this.logDatabaseOperation('Autenticar barbearia', 'SELECT', { email });
      
      const barbearia = await prisma.barbearia.findFirst({
        where: {
          email: email,
        }
      });

      if (!barbearia) {
        this.logDatabaseOperation('Autenticar barbearia', 'SELECT', null, { found: false });
        return { success: false, message: 'Email ou senha incorretos' };
      }

      if (barbearia.senha.trim() === senha.trim()) {
        this.logDatabaseOperation('Autenticar barbearia', 'SELECT', null, { success: true, barbeariaId: barbearia.id });
        
        return {
          success: true,
          data: {
            id: barbearia.id,
            nome: barbearia.nome,
            nomeProprietario: barbearia.nomeProprietario,
            email: barbearia.email,
            telefone: barbearia.telefone
          }
        };
      }

      this.logDatabaseOperation('Autenticar barbearia', 'SELECT', null, { success: false, reason: 'senha_incorreta' });
      return { success: false, message: 'Email ou senha incorretos' };
    } catch (error) {
      this.logDatabaseOperation('Autenticar barbearia', 'SELECT', null, null, error);
      console.error('❌ Erro ao autenticar barbearia:', error);
      return { success: false, message: 'Erro interno' };
    }
  }

  async getAgendamentosByBarbearia(barbeariaId, filtro = 'hoje') {
    try {
      this.logDatabaseOperation('Buscar agendamentos da barbearia', 'SELECT', { barbeariaId, filtro });
      
      let whereClause = { barbeariaId: parseInt(barbeariaId) };
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      switch (filtro) {
        case 'hoje':
          const amanha = new Date(hoje);
          amanha.setDate(amanha.getDate() + 1);
          whereClause.dataHora = { gte: hoje, lt: amanha };
          break;
        case 'amanha':
          const amanha2 = new Date(hoje);
          amanha2.setDate(amanha2.getDate() + 1);
          const depoisAmanha = new Date(amanha2);
          depoisAmanha.setDate(depoisAmanha.getDate() + 1);
          whereClause.dataHora = { gte: amanha2, lt: depoisAmanha };
          break;
        case 'semana':
          const proximaSemana = new Date(hoje);
          proximaSemana.setDate(proximaSemana.getDate() + 7);
          whereClause.dataHora = { gte: hoje, lt: proximaSemana };
          break;
      }

      const agendamentos = await prisma.agendamento.findMany({
        where: whereClause,
        include: {
          cliente: true,
          barbeiro: true
        },
        orderBy: { dataHora: 'asc' }
      });

      this.logDatabaseOperation('Buscar agendamentos da barbearia', 'SELECT', null, { count: agendamentos.length });

      return agendamentos;
    } catch (error) {
      this.logDatabaseOperation('Buscar agendamentos da barbearia', 'SELECT', null, null, error);
      console.error('❌ Erro ao buscar agendamentos:', error);
      return [];
    }
  }

  async getAgendamentosByCliente(clienteId) {
    try {
      this.logDatabaseOperation('Buscar agendamentos do cliente', 'SELECT', { clienteId });
      
      const agendamentos = await prisma.agendamento.findMany({
        where: { 
          clienteId: parseInt(clienteId),
          dataHora: { gte: new Date() } // Apenas agendamentos futuros
        },
        include: {
          barbeiro: true,
          barbearia: true
        },
        orderBy: { dataHora: 'asc' }
      });

      this.logDatabaseOperation('Buscar agendamentos do cliente', 'SELECT', null, { count: agendamentos.length });

      return agendamentos;
    } catch (error) {
      this.logDatabaseOperation('Buscar agendamentos do cliente', 'SELECT', null, null, error);
      console.error('❌ Erro ao buscar agendamentos do cliente:', error);
      return [];
    }
  }

  async getServicosByBarbearia(barbeariaId) {
    try {
      this.logDatabaseOperation('Buscar serviços da barbearia', 'SELECT', { barbeariaId });
      
      const servicos = await prisma.servico.findMany({
        where: { barbeariaId: parseInt(barbeariaId) },
        orderBy: { nome: 'asc' }
      });

      this.logDatabaseOperation('Buscar serviços da barbearia', 'SELECT', null, { count: servicos.length });

      return servicos;
    } catch (error) {
      this.logDatabaseOperation('Buscar serviços da barbearia', 'SELECT', null, null, error);
      console.error('❌ Erro ao buscar serviços:', error);
      return [];
    }
  }

  async getBarbeirosByBarbearia(barbeariaId) {
    try {
      this.logDatabaseOperation('Buscar barbeiros da barbearia', 'SELECT', { barbeariaId });
      
      const barbeiros = await prisma.barbeiro.findMany({
        where: { 
          barbeariaId: parseInt(barbeariaId),
          ativo: true
        },
        orderBy: { nome: 'asc' }
      });

      this.logDatabaseOperation('Buscar barbeiros da barbearia', 'SELECT', null, { count: barbeiros.length });

      return barbeiros;
    } catch (error) {
      this.logDatabaseOperation('Buscar barbeiros da barbearia', 'SELECT', null, null, error);
      console.error('❌ Erro ao buscar barbeiros:', error);
      return [];
    }
  }

  // Método para cancelar agendamento
  async cancelarAgendamento(agendamentoId, motivo = 'Cancelado pelo cliente') {
    try {
      this.logDatabaseOperation('Cancelar agendamento', 'UPDATE', { agendamentoId, motivo });
      
      const agendamento = await prisma.agendamento.update({
        where: { id: parseInt(agendamentoId) },
        data: { status: 'CANCELADO' },
        include: {
          cliente: true,
          barbeiro: true,
          barbearia: true
        }
      });

      this.logDatabaseOperation('Cancelar agendamento', 'UPDATE', null, { success: true, agendamentoId: agendamento.id });
      
      console.log(`✅ Agendamento ${agendamentoId} cancelado com sucesso`);
      return { success: true, agendamento };
    } catch (error) {
      this.logDatabaseOperation('Cancelar agendamento', 'UPDATE', null, null, error);
      console.error('❌ Erro ao cancelar agendamento:', error);
      return { success: false, message: 'Erro ao cancelar agendamento' };
    }
  }

  // Método para reagendar agendamento
  async reagendarAgendamento(agendamentoId, novaDataHora) {
    try {
      this.logDatabaseOperation('Reagendar agendamento', 'UPDATE', { agendamentoId, novaDataHora });
      
      const agendamento = await prisma.agendamento.update({
        where: { id: parseInt(agendamentoId) },
        data: { dataHora: new Date(novaDataHora) },
        include: {
          cliente: true,
          barbeiro: true,
          barbearia: true
        }
      });

      this.logDatabaseOperation('Reagendar agendamento', 'UPDATE', null, { success: true, agendamentoId: agendamento.id });
      
      console.log(`✅ Agendamento ${agendamentoId} reagendado com sucesso`);
      return { success: true, agendamento };
    } catch (error) {
      this.logDatabaseOperation('Reagendar agendamento', 'UPDATE', null, null, error);
      console.error('❌ Erro ao reagendar agendamento:', error);
      return { success: false, message: 'Erro ao reagendar agendamento' };
    }
  }

  isSystemActive() {
    return this.isActive;
  }

  toggleSystem(active) {
    this.isActive = active;
    process.env.AI_SYSTEM_ACTIVE = active ? 'ATIVO' : 'INATIVO';
  }
}

// Instância singleton
const geminiService = new GeminiService();

module.exports = geminiService;

