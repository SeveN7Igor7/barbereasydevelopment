# Documentação API - Sistema de Barbearia com WhatsApp

## Visão Geral

Esta API fornece endpoints completos para gerenciar um sistema de barbearia, incluindo barbearias, barbeiros, clientes, serviços e agendamentos. **Integrado com sistema de mensagens automáticas via WhatsApp.**

**Base URL:** `http://localhost:3000`

**Formato de Dados:** JSON

**Autenticação:** Não implementada (desenvolvimento)

**📱 WhatsApp:** Mensagens automáticas para clientes e barbearias

---

## 📱 SISTEMA WHATSAPP

### Funcionalidades Automáticas

1. **Criação de Cliente:** Envia mensagem de boas-vindas
2. **Novo Agendamento:** Envia confirmação para cliente e notificação para barbearia
3. **Tratamento de Números:** Converte automaticamente números brasileiros

### Endpoint de Status
**GET /whatsapp/status**

**Resposta:**
```json
{
  "connected": true,
  "message": "WhatsApp conectado"
}
```

---

## 1. BARBEARIAS

### 1.1 Criar Barbearia
**Endpoint:** `POST /barbearias`

**Descrição:** Cria uma nova barbearia no sistema.

**Requisição:**
```json
{
  "nome": "Barbearia do João",
  "nomeProprietario": "João Silva",
  "email": "joao@barbearia.com",
  "senha": "senha123",
  "telefone": "5589994582600",
  "nomeUrl": "barbearia-do-joao",
  "plano": "TRIAL",
  "logoUrl": "https://exemplo.com/logo.png",
  "bannerUrl": "https://exemplo.com/banner.png"
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "nome": "Barbearia do João",
  "nomeProprietario": "João Silva",
  "email": "joao@barbearia.com",
  "senha": "senha123",
  "telefone": "5589994582600",
  "nomeUrl": "barbearia-do-joao",
  "plano": "TRIAL",
  "logoUrl": "https://exemplo.com/logo.png",
  "bannerUrl": "https://exemplo.com/banner.png",
  "ativa": true,
  "createdAt": "2025-07-22T21:00:00.000Z"
}
```

### 1.2 Buscar Barbearia por ID
**Endpoint:** `GET /barbearias/:id`

**Descrição:** Retorna os dados de uma barbearia específica.

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "Barbearia do João",
  "nomeProprietario": "João Silva",
  "email": "joao@barbearia.com",
  "nomeUrl": "barbearia-do-joao",
  "plano": "TRIAL",
  "logoUrl": "https://exemplo.com/logo.png",
  "bannerUrl": "https://exemplo.com/banner.png",
  "ativa": true,
  "createdAt": "2025-07-22T21:00:00.000Z",
  "barbeiros": [],
  "horarios": [],
  "servicos": [],
  "clientes": [],
  "agendamentos": []
}
```

**Resposta de Erro (404):**
```json
{
  "error": "Barbearia não encontrada."
}
```

---

## 2. CLIENTES

### 2.1 Criar Cliente
**Endpoint:** `POST /clientes`

**Descrição:** Cadastra um novo cliente no sistema.

**Requisição:**
```json
{
  "nome": "Maria Santos",
  "telefone": "5589994582600",
  "barbeariaId": 1
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "nome": "Maria Santos",
  "telefone": "5589994582600",
  "status": "ATIVA",
  "barbeariaId": 1,
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João",
    "nomeProprietario": "João Silva"
  }
}
```

### 2.2 Buscar Cliente por ID
**Endpoint:** `GET /clientes/:id`

**Descrição:** Retorna os dados de um cliente específico.

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "Maria Santos",
  "telefone": "5589994582600",
  "status": "ATIVA",
  "barbeariaId": 1
}
```

---

## 3. BARBEIROS

### 3.1 Criar Barbeiro
**Endpoint:** `POST /barbeiros`

**Descrição:** Cadastra um novo barbeiro no sistema.

**Requisição:**
```json
{
  "nome": "Carlos Oliveira",
  "especialidade": "Cortes modernos e barba",
  "barbeariaId": 1
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "nome": "Carlos Oliveira",
  "especialidade": "Cortes modernos e barba",
  "ativo": true,
  "barbeariaId": 1,
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João"
  }
}
```

### 3.2 Buscar Todos os Barbeiros
**Endpoint:** `GET /barbeiros`

**Descrição:** Retorna lista de todos os barbeiros.

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "Carlos Oliveira",
    "especialidade": "Cortes modernos e barba",
    "ativo": true,
    "barbeariaId": 1,
    "barbearia": {
      "id": 1,
      "nome": "Barbearia do João"
    }
  }
]
```

### 3.3 Buscar Barbeiro por ID
**Endpoint:** `GET /barbeiros/:id`

**Descrição:** Retorna dados de um barbeiro específico com seus agendamentos.

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "Carlos Oliveira",
  "especialidade": "Cortes modernos e barba",
  "ativo": true,
  "barbeariaId": 1,
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João"
  },
  "agendamentos": []
}
```

### 3.4 Buscar Barbeiros por Barbearia
**Endpoint:** `GET /barbeiros/barbearia/:barbeariaId`

**Descrição:** Retorna todos os barbeiros ativos de uma barbearia específica.

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "Carlos Oliveira",
    "especialidade": "Cortes modernos e barba",
    "ativo": true,
    "barbeariaId": 1,
    "barbearia": {
      "id": 1,
      "nome": "Barbearia do João"
    }
  }
]
```

### 3.5 Atualizar Barbeiro
**Endpoint:** `PUT /barbeiros/:id`

**Descrição:** Atualiza dados de um barbeiro.

**Requisição:**
```json
{
  "nome": "Carlos Oliveira Jr.",
  "especialidade": "Cortes modernos, barba e bigode",
  "ativo": true
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "Carlos Oliveira Jr.",
  "especialidade": "Cortes modernos, barba e bigode",
  "ativo": true,
  "barbeariaId": 1,
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João"
  }
}
```

### 3.6 Deletar Barbeiro
**Endpoint:** `DELETE /barbeiros/:id`

**Descrição:** Remove um barbeiro do sistema.

**Resposta de Sucesso (200):**
```json
{
  "message": "Barbeiro deletado com sucesso."
}
```

---

## 4. SERVIÇOS

### 4.1 Criar Serviço
**Endpoint:** `POST /servicos`

**Descrição:** Cadastra um novo serviço na barbearia.

**Requisição:**
```json
{
  "nome": "Corte Simples",
  "duracaoMin": 30,
  "preco": 25.00,
  "barbeariaId": 1
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "nome": "Corte Simples",
  "duracaoMin": 30,
  "preco": 25.00,
  "barbeariaId": 1,
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João"
  }
}
```

### 4.2 Buscar Todos os Serviços
**Endpoint:** `GET /servicos`

**Descrição:** Retorna lista de todos os serviços.

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "Corte Simples",
    "duracaoMin": 30,
    "preco": 25.00,
    "barbeariaId": 1,
    "barbearia": {
      "id": 1,
      "nome": "Barbearia do João"
    }
  },
  {
    "id": 2,
    "nome": "Corte + Barba",
    "duracaoMin": 45,
    "preco": 35.00,
    "barbeariaId": 1,
    "barbearia": {
      "id": 1,
      "nome": "Barbearia do João"
    }
  }
]
```

### 4.3 Buscar Serviço por ID
**Endpoint:** `GET /servicos/:id`

**Descrição:** Retorna dados de um serviço específico.

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "Corte Simples",
  "duracaoMin": 30,
  "preco": 25.00,
  "barbeariaId": 1,
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João"
  }
}
```

### 4.4 Buscar Serviços por Barbearia
**Endpoint:** `GET /servicos/barbearia/:barbeariaId`

**Descrição:** Retorna todos os serviços de uma barbearia específica.

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "Corte Simples",
    "duracaoMin": 30,
    "preco": 25.00,
    "barbeariaId": 1,
    "barbearia": {
      "id": 1,
      "nome": "Barbearia do João"
    }
  }
]
```

### 4.5 Atualizar Serviço
**Endpoint:** `PUT /servicos/:id`

**Descrição:** Atualiza dados de um serviço.

**Requisição:**
```json
{
  "nome": "Corte Premium",
  "duracaoMin": 40,
  "preco": 30.00
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "Corte Premium",
  "duracaoMin": 40,
  "preco": 30.00,
  "barbeariaId": 1,
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João"
  }
}
```

### 4.6 Deletar Serviço
**Endpoint:** `DELETE /servicos/:id`

**Descrição:** Remove um serviço do sistema.

**Resposta de Sucesso (200):**
```json
{
  "message": "Serviço deletado com sucesso."
}
```

---

## 5. AGENDAMENTOS

### 5.1 Criar Agendamento
**Endpoint:** `POST /agendamentos`

**Descrição:** Cria um novo agendamento no sistema.

**Requisição:**
```json
{
  "clienteId": 1,
  "barbeiroId": 1,
  "barbeariaId": 1,
  "dataHora": "2025-07-23T10:00:00Z",
  "nomeServico": "Corte Simples",
  "precoServico": 25.00,
  "status": "AGENDAMENTO_PROGRAMADO"
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "dataHora": "2025-07-23T10:00:00.000Z",
  "status": "AGENDAMENTO_PROGRAMADO",
  "nomeServico": "Corte Simples",
  "precoServico": 25.00,
  "clienteId": 1,
  "barbeiroId": 1,
  "barbeariaId": 1,
  "cliente": {
    "id": 1,
    "nome": "Maria Santos",
    "telefone": "5589994582600"
  },
  "barbeiro": {
    "id": 1,
    "nome": "Carlos Oliveira",
    "especialidade": "Cortes modernos e barba"
  },
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João"
  }
}
```

### 5.2 Buscar Agendamento por ID
**Endpoint:** `GET /agendamentos/:id`

**Descrição:** Retorna dados de um agendamento específico.

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "dataHora": "2025-07-23T10:00:00.000Z",
  "status": "AGENDAMENTO_PROGRAMADO",
  "nomeServico": "Corte Simples",
  "precoServico": 25.00,
  "clienteId": 1,
  "barbeiroId": 1,
  "barbeariaId": 1,
  "cliente": {
    "id": 1,
    "nome": "Maria Santos",
    "telefone": "5589994582600"
  },
  "barbeiro": {
    "id": 1,
    "nome": "Carlos Oliveira",
    "especialidade": "Cortes modernos e barba"
  },
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João"
  }
}
```

### 5.3 Buscar Agendamentos por Cliente
**Endpoint:** `GET /agendamentos/cliente/:clienteId`

**Descrição:** Retorna todos os agendamentos de um cliente específico.

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "dataHora": "2025-07-23T10:00:00.000Z",
    "status": "AGENDAMENTO_PROGRAMADO",
    "nomeServico": "Corte Simples",
    "precoServico": 25.00,
    "clienteId": 1,
    "barbeiroId": 1,
    "barbeariaId": 1,
    "cliente": {
      "id": 1,
      "nome": "Maria Santos",
      "telefone": "5589994582600"
    },
    "barbeiro": {
      "id": 1,
      "nome": "Carlos Oliveira"
    },
    "barbearia": {
      "id": 1,
      "nome": "Barbearia do João"
    }
  }
]
```

### 5.4 Buscar Agendamentos por Barbearia
**Endpoint:** `GET /agendamentos/barbearia/:barbeariaId`

**Descrição:** Retorna todos os agendamentos de uma barbearia específica.

**Query Parameters:**
- `status` (opcional): Filtra por status específico (AGENDAMENTO_PROGRAMADO, ATENDIDO, CANCELADO)

**Exemplos:**
- `GET /agendamentos/barbearia/1` - Todos os agendamentos da barbearia 1
- `GET /agendamentos/barbearia/1?status=ATENDIDO` - Apenas agendamentos atendidos da barbearia 1

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "dataHora": "2025-07-23T10:00:00.000Z",
    "status": "AGENDAMENTO_PROGRAMADO",
    "nomeServico": "Corte Simples",
    "precoServico": 25.00,
    "clienteId": 1,
    "barbeiroId": 1,
    "barbeariaId": 1,
    "cliente": {
      "id": 1,
      "nome": "Maria Santos",
      "telefone": "5589994582600"
    },
    "barbeiro": {
      "id": 1,
      "nome": "Carlos Oliveira"
    },
    "barbearia": {
      "id": 1,
      "nome": "Barbearia do João"
    }
  }
]
```

### 5.5 Atualizar Agendamento
**Endpoint:** `PUT /agendamentos/:id`

**Descrição:** Atualiza status ou data/hora de um agendamento.

**Requisição:**
```json
{
  "status": "ATENDIDO",
  "dataHora": "2025-07-23T11:00:00Z"
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "dataHora": "2025-07-23T11:00:00.000Z",
  "status": "ATENDIDO",
  "nomeServico": "Corte Simples",
  "precoServico": 25.00,
  "clienteId": 1,
  "barbeiroId": 1,
  "barbeariaId": 1,
  "cliente": {
    "id": 1,
    "nome": "Maria Santos",
    "telefone": "5589994582600"
  },
  "barbeiro": {
    "id": 1,
    "nome": "Carlos Oliveira"
  },
  "barbearia": {
    "id": 1,
    "nome": "Barbearia do João"
  }
}
```

---

## 6. CÓDIGOS DE STATUS HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro interno do servidor |

---

## 7. ENUMS E VALORES PERMITIDOS

### Status de Agendamento
- `AGENDAMENTO_PROGRAMADO` (padrão)
- `ATENDIDO`
- `CANCELADO`

### Planos de Barbearia
- `TRIAL` (padrão)
- `PAGO`
- `VITALICIO`

### Status de Conta do Cliente
- `ATIVA` (padrão)
- `INATIVA`

### Dias da Semana
- `DOMINGO`
- `SEGUNDA`
- `TERCA`
- `QUARTA`
- `QUINTA`
- `SEXTA`
- `SABADO`

---

## 8. EXEMPLOS DE USO COMPLETO

### Fluxo Completo: Criar Barbearia e Fazer Agendamento

1. **Criar Barbearia:**
```bash
POST /barbearias
{
  "nome": "Barbearia Premium",
  "nomeProprietario": "João Silva",
  "email": "joao@premium.com",
  "senha": "senha123",
  "nomeUrl": "barbearia-premium"
}
```

2. **Criar Barbeiro:**
```bash
POST /barbeiros
{
  "nome": "Carlos Oliveira",
  "especialidade": "Cortes modernos",
  "barbeariaId": 1
}
```

3. **Criar Serviço:**
```bash
POST /servicos
{
  "nome": "Corte + Barba",
  "duracaoMin": 45,
  "preco": 35.00,
  "barbeariaId": 1
}
```

4. **Criar Cliente:**
```bash
POST /clientes
{
  "nome": "Maria Santos",
  "telefone": "5589994582600",
  "barbeariaId": 1
}
```

5. **Criar Agendamento:**
```bash
POST /agendamentos
{
  "clienteId": 1,
  "barbeiroId": 1,
  "barbeariaId": 1,
  "dataHora": "2025-07-23T10:00:00Z",
  "nomeServico": "Corte + Barba",
  "precoServico": 35.00
}
```

---

## 9. OBSERVAÇÕES IMPORTANTES

- Todos os campos de ID são números inteiros
- Datas devem estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- Preços são números decimais (float)
- Telefones devem incluir código do país (ex: 5589994582600)
- URLs de imagem devem ser válidas e acessíveis
- O sistema não possui autenticação implementada (adequado apenas para desenvolvimento)

---

**Versão da API:** 1.0  
**Última Atualização:** 22/07/2025  
**Desenvolvido por:** Manus AI



---

## 10. MENSAGENS WHATSAPP AUTOMÁTICAS

### 10.1 Mensagem de Boas-vindas (Cliente)
**Quando:** Cliente é criado via `POST /clientes`
**Para:** Telefone do cliente
**Conteúdo:**
- Boas-vindas à barbearia
- Informações sobre funcionalidades
- Como fazer agendamentos

### 10.2 Confirmação de Agendamento (Cliente)
**Quando:** Agendamento é criado via `POST /agendamentos`
**Para:** Telefone do cliente
**Conteúdo:**
- Confirmação do agendamento
- Detalhes completos (serviço, barbeiro, data, hora, valor)
- Instruções de comparecimento
- Informações de contato

### 10.3 Notificação de Agendamento (Barbearia)
**Quando:** Agendamento é criado via `POST /agendamentos`
**Para:** Telefone da barbearia (se cadastrado)
**Conteúdo:**
- Alerta de novo agendamento
- Dados do cliente e telefone
- Detalhes do serviço
- Status do agendamento

### 10.4 Tratamento de Números
- **Entrada:** `5589994582600` (13 dígitos)
- **Processamento:** Remove o 9 extra → `558994582600`
- **Saída:** `558994582600@s.whatsapp.net`

### 10.5 Comportamento em Caso de Erro
- WhatsApp desconectado: Operação continua, mensagem não é enviada
- Número inválido: Erro é logado, operação continua
- Falha no envio: Erro é logado, operação continua

---

## 11. CONFIGURAÇÃO E INICIALIZAÇÃO

### 11.1 Primeira Execução
1. Instalar dependências: `npm install`
2. Configurar banco: `npx prisma migrate dev`
3. Iniciar servidor: `npm start`
4. Escanear QR Code do WhatsApp no terminal
5. Aguardar confirmação de conexão

### 11.2 Execuções Subsequentes
- Conexão automática (credenciais salvas)
- Se sessão expirar, novo QR Code será gerado
- Status disponível em: `GET /whatsapp/status`

---

## 12. DEPENDÊNCIAS ADICIONAIS

### 12.1 Pacotes WhatsApp
- `@whiskeysockets/baileys`: Cliente WhatsApp
- `qrcode-terminal`: Exibição de QR Code
- `pino`: Sistema de logs

### 12.2 Estrutura de Arquivos
```
whatsapp/
├── whatsapp.service.js    # Serviço principal
├── message.templates.js   # Templates de mensagem
└── auth_info/            # Credenciais (auto-gerado)
```

