import React, { useState, useEffect } from 'react';
import { Calendar, Users, Scissors, DollarSign, Clock, Star, TrendingUp, Settings, ArrowLeft, User, Building, Trash2, Edit, ChevronLeft, ChevronRight, CheckCircle, XCircle, MapPin, LogOut, Plus } from 'lucide-react';
import { Barbearia, apiService, formatCurrency, formatDate, formatTime } from '../services/api';
import { useBarbeariaData } from '../hooks/useBarbeariaData';
import HorariosFuncionamento from '../components/HorariosFuncionamento';
import ImageUpload from '../components/ImageUpload';

interface BarbershopDashboardProps {
  onBack: () => void;
  onLogout: () => void;
  barbearia: Barbearia | null;
}

const BarbershopDashboard: React.FC<BarbershopDashboardProps> = ({ onBack, onLogout, barbearia }) => {
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showAddProfessional, setShowAddProfessional] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [newProfessional, setNewProfessional] = useState({ nome: '', especialidade: '' });
  const [newService, setNewService] = useState({ nome: '', duracaoMin: '', preco: '' });

  // Hook para gerenciar dados da barbearia
  const {
    barbeiros,
    servicos,
    agendamentos,
    isLoading,
    error,
    addBarbeiro,
    updateBarbeiro,
    removeBarbeiro,
    addServico,
    updateServico,
    removeServico,
    updateAgendamento,
    refreshData
  } = useBarbeariaData(barbearia?.id || null);

  // Estatísticas calculadas a partir dos dados reais
  const stats = [
    { 
      label: 'Agendamentos Hoje', 
      value: agendamentos.filter(a => {
        const today = new Date().toDateString();
        const agendamentoDate = new Date(a.dataHora).toDateString();
        return agendamentoDate === today;
      }).length.toString(), 
      icon: Calendar, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Total de Barbeiros', 
      value: barbeiros.filter(b => b.ativo).length.toString(), 
      icon: Users, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Serviços Ativos', 
      value: servicos.length.toString(), 
      icon: Scissors, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Faturamento Hoje', 
      value: formatCurrency(
        agendamentos
          .filter(a => {
            const today = new Date().toDateString();
            const agendamentoDate = new Date(a.dataHora).toDateString();
            return agendamentoDate === today && a.status === 'ATENDIDO';
          })
          .reduce((total, a) => total + a.precoServico, 0)
      ), 
      icon: DollarSign, 
      color: 'bg-yellow-500' 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATENDIDO': return 'bg-green-100 text-green-800';
      case 'AGENDAMENTO_PROGRAMADO': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ATENDIDO': return 'Concluído';
      case 'AGENDAMENTO_PROGRAMADO': return 'Pendente';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATENDIDO': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'AGENDAMENTO_PROGRAMADO': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'CANCELADO': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const handleAddProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfessional.nome && newProfessional.especialidade) {
      try {
        if (editingProfessional) {
          await updateBarbeiro(editingProfessional.id, {
            nome: newProfessional.nome,
            especialidade: newProfessional.especialidade
          });
          setEditingProfessional(null);
        } else {
          await addBarbeiro(newProfessional);
        }
        setNewProfessional({ nome: '', especialidade: '' });
        setShowAddProfessional(false);
      } catch (error: any) {
        alert('Erro ao salvar barbeiro: ' + error.message);
      }
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newService.nome && newService.duracaoMin && newService.preco) {
      try {
        const duracaoMin = parseInt(newService.duracaoMin);
        const preco = parseFloat(newService.preco);

        if (editingService) {
          await updateServico(editingService.id, {
            nome: newService.nome,
            duracaoMin,
            preco
          });
          setEditingService(null);
        } else {
          await addServico({
            nome: newService.nome,
            duracaoMin,
            preco
          });
        }
        setNewService({ nome: '', duracaoMin: '', preco: '' });
        setShowAddService(false);
      } catch (error: any) {
        alert('Erro ao salvar serviço: ' + error.message);
      }
    }
  };

  const handleEditProfessional = (professional: any) => {
    setEditingProfessional(professional);
    setNewProfessional({
      nome: professional.nome,
      especialidade: professional.especialidade
    });
    setShowAddProfessional(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setNewService({
      nome: service.nome,
      duracaoMin: service.duracaoMin.toString(),
      preco: service.preco.toString()
    });
    setShowAddService(true);
  };

  const handleRemoveProfessional = async (professionalId: number) => {
    if (window.confirm('Tem certeza que deseja remover este profissional?')) {
      try {
        await removeBarbeiro(professionalId);
      } catch (error: any) {
        alert('Erro ao remover barbeiro: ' + error.message);
      }
    }
  };

  const handleRemoveService = async (serviceId: number) => {
    if (window.confirm('Tem certeza que deseja remover este serviço?')) {
      try {
        await removeServico(serviceId);
      } catch (error: any) {
        alert('Erro ao remover serviço: ' + error.message);
      }
    }
  };

  const handleUpdateAgendamentoStatus = async (agendamentoId: number, newStatus: string) => {
    try {
      await updateAgendamento(agendamentoId, { status: newStatus });
    } catch (error: any) {
      alert('Erro ao atualizar agendamento: ' + error.message);
    }
  };

  // Filtrar agendamentos por data selecionada
  const agendamentosDodia = agendamentos.filter(agendamento => {
    const agendamentoDate = new Date(agendamento.dataHora).toDateString();
    return agendamentoDate === selectedDate.toDateString();
  });

  if (!barbearia) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro: Dados da barbearia não encontrados</p>
          <button
            onClick={onBack}
            className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar</span>
              </button>
              <div className="flex items-center">
                {barbearia.logoUrl ? (
                  <img
                    src={(() => {
                      const imageUrl = barbearia.logoUrl ? apiService.getLogoUrl(barbearia.id, barbearia.logoUrl) : 
                                       (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/placeholder-logo.png'; // Fallback para uma imagem padrão
                      console.log('Barbearia ID:', barbearia.id);
                      console.log('Logo URL do backend (barbearia.logoUrl):', barbearia.logoUrl);
                      console.log('URL completa da imagem (construída):', imageUrl);
                      return imageUrl;
                    })()}
                    className="h-12 w-12 rounded-lg object-cover mr-3"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem da logo:', e.currentTarget.src);
                      // Se a logo falhar ao carregar, mostrar ícone padrão
                      (e.target as HTMLImageElement).style.display = 'none';
                      const scissors = document.createElement('div');
                      scissors.innerHTML = '<div class="h-8 w-8 text-yellow-400 mr-3"><svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.89-2 2-2 2 .89 2 2-.89 2-2 2zm0 12c-1.1 0-2-.89-2-2s.89-2 2-2 2 .89 2 2-.89 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z"/></svg></div>';
                      (e.target as HTMLImageElement).parentNode?.insertBefore(scissors.firstChild!, e.target);
                    }}
                  />
                ) : (
                  <Scissors className="h-8 w-8 text-yellow-400 mr-3" />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{barbearia.nome}</h1>
                  <p className="text-sm text-gray-600">Painel Administrativo</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {barbearia.nomeProprietario}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'visao-geral', label: 'Visão Geral', icon: TrendingUp },
              { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
              { id: 'profissionais', label: 'Profissionais', icon: Users },
              { id: 'servicos', label: 'Serviços', icon: Scissors },
              { id: 'configuracoes', label: 'Configurações', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={refreshData}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Visão Geral */}
        {activeTab === 'visao-geral' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Agendamentos Recentes */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Agendamentos de Hoje</h3>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando agendamentos...</p>
                  </div>
                ) : agendamentosDodia.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum agendamento para hoje</p>
                ) : (
                  <div className="space-y-4">
                    {agendamentosDodia.slice(0, 5).map((agendamento) => (
                      <div key={agendamento.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{agendamento.cliente?.nome}</p>
                            <p className="text-sm text-gray-600">
                              {agendamento.nomeServico} - {agendamento.barbeiro?.nome}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTime(agendamento.dataHora)} - {formatCurrency(agendamento.precoServico)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(agendamento.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                            {getStatusText(agendamento.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Agendamentos */}
        {activeTab === 'agendamentos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Agendamentos</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Carregando agendamentos...</p>
                  </div>
                ) : agendamentosDodia.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum agendamento para {formatDate(selectedDate)}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agendamentosDodia.map((agendamento) => (
                      <div key={agendamento.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{agendamento.cliente?.nome}</p>
                            <p className="text-sm text-gray-600">
                              {agendamento.nomeServico} - {agendamento.barbeiro?.nome}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTime(agendamento.dataHora)} - {formatCurrency(agendamento.precoServico)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(agendamento.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agendamento.status)}`}>
                              {getStatusText(agendamento.status)}
                            </span>
                          </div>
                          {agendamento.status === 'AGENDAMENTO_PROGRAMADO' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateAgendamentoStatus(agendamento.id, 'ATENDIDO')}
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                              >
                                Concluir
                              </button>
                              <button
                                onClick={() => handleUpdateAgendamentoStatus(agendamento.id, 'CANCELADO')}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profissionais */}
        {activeTab === 'profissionais' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Profissionais</h2>
              <button
                onClick={() => setShowAddProfessional(true)}
                className="flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Profissional</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbeiros.map((barbeiro) => (
                <div key={barbeiro.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProfessional(barbeiro)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveProfessional(barbeiro.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900">{barbeiro.nome}</h3>
                  <p className="text-sm text-gray-600">{barbeiro.especialidade}</p>
                  <div className="mt-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      barbeiro.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {barbeiro.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Adicionar/Editar Profissional */}
            {showAddProfessional && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingProfessional ? 'Editar Profissional' : 'Adicionar Profissional'}
                  </h3>
                  <form onSubmit={handleAddProfessional}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={newProfessional.nome}
                          onChange={(e) => setNewProfessional({ ...newProfessional, nome: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Especialidade
                        </label>
                        <input
                          type="text"
                          value={newProfessional.especialidade}
                          onChange={(e) => setNewProfessional({ ...newProfessional, especialidade: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProfessional(false);
                          setEditingProfessional(null);
                          setNewProfessional({ nome: '', especialidade: '' });
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
                      >
                        {editingProfessional ? 'Salvar' : 'Adicionar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Serviços */}
        {activeTab === 'servicos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Serviços</h2>
              <button
                onClick={() => setShowAddService(true)}
                className="flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Serviço</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicos.map((servico) => (
                <div key={servico.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Scissors className="h-8 w-8 text-yellow-400" />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditService(servico)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveService(servico.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900">{servico.nome}</h3>
                  <p className="text-sm text-gray-600">{servico.duracaoMin} minutos</p>
                  <p className="text-lg font-bold text-yellow-600 mt-2">
                    {formatCurrency(servico.preco)}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Adicionar/Editar Serviço */}
            {showAddService && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingService ? 'Editar Serviço' : 'Adicionar Serviço'}
                  </h3>
                  <form onSubmit={handleAddService}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Serviço
                        </label>
                        <input
                          type="text"
                          value={newService.nome}
                          onChange={(e) => setNewService({ ...newService, nome: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duração (minutos)
                        </label>
                        <input
                          type="number"
                          value={newService.duracaoMin}
                          onChange={(e) => setNewService({ ...newService, duracaoMin: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preço (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newService.preco}
                          onChange={(e) => setNewService({ ...newService, preco: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddService(false);
                          setEditingService(null);
                          setNewService({ nome: '', duracaoMin: '', preco: '' });
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
                      >
                        {editingService ? 'Salvar' : 'Adicionar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configurações */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações da Barbearia */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Barbearia</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={barbearia.nome}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proprietário</label>
                    <input
                      type="text"
                      value={barbearia.nomeProprietario}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={barbearia.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={barbearia.telefone || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Upload de Imagens */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagens</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <ImageUpload
                      type="logo"
                      barbeariaId={barbearia.id}
                      currentImageUrl={barbearia.logoUrl}
                      onUploadSuccess={refreshData}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner</label>
                    <ImageUpload
                      type="banner"
                      barbeariaId={barbearia.id}
                      currentImageUrl={barbearia.bannerUrl}
                      onUploadSuccess={refreshData}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Horários de Funcionamento */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários de Funcionamento</h3>
              <HorariosFuncionamento barbeariaId={barbearia.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarbershopDashboard;

