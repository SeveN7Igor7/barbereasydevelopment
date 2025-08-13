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
                    src={`http://localhost:3000${barbearia.logoUrl}`}
                    alt={`Logo ${barbearia.nome}`}
                    className="h-12 w-12 rounded-lg object-cover mr-3"
                    onError={(e) => {
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Agendamentos para {formatDate(selectedDate.toISOString())}
                </h3>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Carregando agendamentos...</p>
                  </div>
                ) : agendamentosDodia.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum agendamento para esta data</p>
                ) : (
                  <div className="space-y-4">
                    {agendamentosDodia.map((agendamento) => (
                      <div key={agendamento.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
                            {agendamento.cliente?.telefone && (
                              <p className="text-xs text-gray-400">
                                Tel: {agendamento.cliente.telefone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {agendamento.status === 'AGENDAMENTO_PROGRAMADO' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateAgendamentoStatus(agendamento.id, 'ATENDIDO')}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs hover:bg-green-200"
                              >
                                Concluir
                              </button>
                              <button
                                onClick={() => handleUpdateAgendamentoStatus(agendamento.id, 'CANCELADO')}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs hover:bg-red-200"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
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

            {/* Modal Adicionar/Editar Profissional */}
            {showAddProfessional && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingProfessional ? 'Editar Profissional' : 'Adicionar Profissional'}
                  </h3>
                  <form onSubmit={handleAddProfessional} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={newProfessional.nome}
                        onChange={(e) => setNewProfessional(prev => ({ ...prev, nome: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
                      <input
                        type="text"
                        value={newProfessional.especialidade}
                        onChange={(e) => setNewProfessional(prev => ({ ...prev, especialidade: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500"
                      >
                        {editingProfessional ? 'Salvar' : 'Adicionar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProfessional(false);
                          setEditingProfessional(null);
                          setNewProfessional({ nome: '', especialidade: '' });
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Carregando profissionais...</p>
                </div>
              ) : barbeiros.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">Nenhum profissional cadastrado</p>
                </div>
              ) : (
                barbeiros.map((professional) => (
                  <div key={professional.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{professional.nome}</h3>
                        <p className="text-sm text-gray-600">{professional.especialidade}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          professional.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {professional.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProfessional(professional)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 text-blue-800 py-2 rounded-lg hover:bg-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleRemoveProfessional(professional.id)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-red-100 text-red-800 py-2 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
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

            {/* Modal Adicionar/Editar Serviço */}
            {showAddService && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingService ? 'Editar Serviço' : 'Adicionar Serviço'}
                  </h3>
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Serviço</label>
                      <input
                        type="text"
                        value={newService.nome}
                        onChange={(e) => setNewService(prev => ({ ...prev, nome: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duração (minutos)</label>
                      <input
                        type="number"
                        value={newService.duracaoMin}
                        onChange={(e) => setNewService(prev => ({ ...prev, duracaoMin: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newService.preco}
                        onChange={(e) => setNewService(prev => ({ ...prev, preco: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        required
                        min="0"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500"
                      >
                        {editingService ? 'Salvar' : 'Adicionar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddService(false);
                          setEditingService(null);
                          setNewService({ nome: '', duracaoMin: '', preco: '' });
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Carregando serviços...</p>
                </div>
              ) : servicos.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">Nenhum serviço cadastrado</p>
                </div>
              ) : (
                servicos.map((service) => (
                  <div key={service.id} className="bg-white rounded-lg shadow p-6">
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900">{service.nome}</h3>
                      <p className="text-sm text-gray-600">{service.duracaoMin} minutos</p>
                      <p className="text-lg font-semibold text-yellow-600 mt-2">
                        {formatCurrency(service.preco)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 text-blue-800 py-2 rounded-lg hover:bg-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleRemoveService(service.id)}
                        className="flex-1 flex items-center justify-center space-x-1 bg-red-100 text-red-800 py-2 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Configurações */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Barbearia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Barbearia</label>
                  <input
                    type="text"
                    value={barbearia.nome}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proprietário</label>
                  <input
                    type="text"
                    value={barbearia.nomeProprietario}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={barbearia.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plano</label>
                  <input
                    type="text"
                    value={barbearia.plano}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                {barbearia.telefone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone/WhatsApp</label>
                    <input
                      type="text"
                      value={barbearia.telefone}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{agendamentos.length}</p>
                  <p className="text-sm text-gray-600">Total de Agendamentos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {agendamentos.filter(a => a.status === 'ATENDIDO').length}
                  </p>
                  <p className="text-sm text-gray-600">Agendamentos Concluídos</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {formatCurrency(
                      agendamentos
                        .filter(a => a.status === 'ATENDIDO')
                        .reduce((total, a) => total + a.precoServico, 0)
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Faturamento Total</p>
                </div>
              </div>
            </div>

            {/* Horários de Funcionamento */}
            <HorariosFuncionamento barbeariaId={barbearia.id} />

            {/* Upload de Imagens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ImageUpload
                barbeariaId={barbearia.id}
                type="logo"
                currentImageUrl={barbearia.logoUrl ? apiService.getLogoUrl(barbearia.id) : undefined}
                onUploadSuccess={(imageUrl) => {
                  // Atualizar a barbearia com a nova URL da logo
                  if (barbearia) {
                    barbearia.logoUrl = imageUrl;
                  }
                }}
              />
              <ImageUpload
                barbeariaId={barbearia.id}
                type="banner"
                currentImageUrl={barbearia.bannerUrl ? apiService.getBannerUrl(barbearia.id) : undefined}
                onUploadSuccess={(imageUrl) => {
                  // Atualizar a barbearia com a nova URL do banner
                  if (barbearia) {
                    barbearia.bannerUrl = imageUrl;
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarbershopDashboard;

