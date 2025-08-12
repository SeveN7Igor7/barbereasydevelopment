const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Tipos para as entidades
export interface Barbearia {
  id: number;
  nome: string;
  nomeProprietario: string;
  email: string;
  telefone?: string;
  nomeUrl: string;
  plano: string;
  logoUrl?: string;
  bannerUrl?: string;
  ativa: boolean;
  createdAt: string;
  barbeiros?: Barbeiro[];
  servicos?: Servico[];
  clientes?: Cliente[];
  agendamentos?: Agendamento[];
}

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  status: string;
  barbeariaId: number;
  barbearia?: {
    id: number;
    nome: string;
    nomeProprietario: string;
  };
}

export interface Barbeiro {
  id: number;
  nome: string;
  especialidade: string;
  ativo: boolean;
  barbeariaId: number;
  barbearia?: {
    id: number;
    nome: string;
  };
  agendamentos?: Agendamento[];
}

export interface Servico {
  id: number;
  nome: string;
  duracaoMin: number;
  preco: number;
  barbeariaId: number;
  barbearia?: {
    id: number;
    nome: string;
  };
}

export interface Agendamento {
  id: number;
  dataHora: string;
  status: string;
  nomeServico: string;
  precoServico: number;
  clienteId: number;
  barbeiroId: number;
  barbeariaId: number;
  cliente?: {
    id: number;
    nome: string;
    telefone: string;
  };
  barbeiro?: {
    id: number;
    nome: string;
    especialidade?: string;
  };
  barbearia?: {
    id: number;
    nome: string;
  };
}

// Classe para gerenciar as chamadas da API
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Métodos para Barbearias
  async createBarbearia(data: {
    nome: string;
    nomeProprietario: string;
    email: string;
    senha: string;
    telefone?: string;
    nomeUrl?: string;
    plano?: string;
    logoUrl?: string;
    bannerUrl?: string;
  }): Promise<Barbearia> {
    return this.request<Barbearia>('/barbearias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBarbeariaById(id: number): Promise<Barbearia> {
    return this.request<Barbearia>(`/barbearias/${id}`);
  }

  async getBarbeariaByNomeUrl(nomeUrl: string): Promise<Barbearia> {
    return this.request<Barbearia>(`/barbearias/url/${nomeUrl}`);
  }

  async loginBarbearia(data: {
    email: string;
    senha: string;
  }): Promise<{ message: string; barbearia: Barbearia }> {
    return this.request<{ message: string; barbearia: Barbearia }>('/barbearias/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Métodos para Clientes
  async createCliente(data: {
    nome: string;
    telefone: string;
    barbeariaId: number;
  }): Promise<Cliente> {
    return this.request<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getClienteById(id: number): Promise<Cliente> {
    return this.request<Cliente>(`/clientes/${id}`);
  }

  async getClienteByTelefone(telefone: string, barbeariaId: number): Promise<Cliente | null> {
    try {
      const clientes = await this.request<Cliente[]>(`/clientes?telefone=${telefone}&barbeariaId=${barbeariaId}`);
      return clientes.length > 0 ? clientes[0] : null;
    } catch (error) {
      return null;
    }
  }

  // Métodos para Barbeiros
  async createBarbeiro(data: {
    nome: string;
    especialidade: string;
    barbeariaId: number;
  }): Promise<Barbeiro> {
    return this.request<Barbeiro>('/barbeiros', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllBarbeiros(): Promise<Barbeiro[]> {
    return this.request<Barbeiro[]>('/barbeiros');
  }

  async getBarbeiroById(id: number): Promise<Barbeiro> {
    return this.request<Barbeiro>(`/barbeiros/${id}`);
  }

  async getBarbeirosByBarbearia(barbeariaId: number): Promise<Barbeiro[]> {
    return this.request<Barbeiro[]>(`/barbeiros/barbearia/${barbeariaId}`);
  }

  async updateBarbeiro(id: number, data: {
    nome?: string;
    especialidade?: string;
    ativo?: boolean;
  }): Promise<Barbeiro> {
    return this.request<Barbeiro>(`/barbeiros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBarbeiro(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/barbeiros/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Serviços
  async createServico(data: {
    nome: string;
    duracaoMin: number;
    preco: number;
    barbeariaId: number;
  }): Promise<Servico> {
    return this.request<Servico>('/servicos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllServicos(): Promise<Servico[]> {
    return this.request<Servico[]>('/servicos');
  }

  async getServicoById(id: number): Promise<Servico> {
    return this.request<Servico>(`/servicos/${id}`);
  }

  async getServicosByBarbearia(barbeariaId: number): Promise<Servico[]> {
    return this.request<Servico[]>(`/servicos/barbearia/${barbeariaId}`);
  }

  async updateServico(id: number, data: {
    nome?: string;
    duracaoMin?: number;
    preco?: number;
  }): Promise<Servico> {
    return this.request<Servico>(`/servicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteServico(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/servicos/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Agendamentos
  async createAgendamento(data: {
    clienteId: number;
    barbeiroId: number;
    barbeariaId: number;
    dataHora: string;
    nomeServico: string;
    precoServico: number;
    status?: string;
  }): Promise<Agendamento> {
    return this.request<Agendamento>('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAgendamentoById(id: number): Promise<Agendamento> {
    return this.request<Agendamento>(`/agendamentos/${id}`);
  }

  async getAgendamentosByCliente(clienteId: number): Promise<Agendamento[]> {
    return this.request<Agendamento[]>(`/agendamentos/cliente/${clienteId}`);
  }

  async getAgendamentosByBarbearia(barbeariaId: number, status?: string): Promise<Agendamento[]> {
    const queryParam = status ? `?status=${status}` : '';
    return this.request<Agendamento[]>(`/agendamentos/barbearia/${barbeariaId}${queryParam}`);
  }

  async updateAgendamento(id: number, data: {
    status?: string;
    dataHora?: string;
  }): Promise<Agendamento> {
    return this.request<Agendamento>(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async checkAvailability(barbeariaId: number, barbeiroId: number, data: string): Promise<string[]> {
    try {
      const agendamentos = await this.getAgendamentosByBarbearia(barbeariaId);
      const dataAgendamentos = agendamentos.filter(ag => 
        ag.barbeiroId === barbeiroId && 
        ag.dataHora.startsWith(data) && 
        ag.status !== 'CANCELADO'
      );
      
      const horariosOcupados = dataAgendamentos.map(ag => {
        const hora = new Date(ag.dataHora).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        return hora;
      });

      // Gerar horários disponíveis (9h às 18h, de 30 em 30 minutos)
      const horariosDisponiveis: string[] = [];
      for (let hora = 9; hora < 18; hora++) {
        for (let minuto of [0, 30]) {
          const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
          if (!horariosOcupados.includes(horario)) {
            horariosDisponiveis.push(horario);
          }
        }
      }

      return horariosDisponiveis;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return [];
    }
  }

  // Método para verificar status do WhatsApp
  async getWhatsAppStatus(): Promise<{
    connected: boolean;
    message: string;
    features: string[];
  }> {
    return this.request<{
      connected: boolean;
      message: string;
      features: string[];
    }>('/whatsapp/status');
  }
}

// Instância única do serviço
export const apiService = new ApiService();

// Funções utilitárias
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR');
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

