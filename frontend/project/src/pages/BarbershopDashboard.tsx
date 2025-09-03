import React, { useState, useEffect } from 'react';
import { Calendar, Users, Scissors, DollarSign, Clock, Star, TrendingUp, Settings, ArrowLeft, User, Building, Trash2, Edit, ChevronLeft, ChevronRight, CheckCircle, XCircle, MapPin, LogOut, Plus, CreditCard, AlertCircle, RefreshCw, Filter, Search, Download, Eye } from 'lucide-react';
import { Barbearia, apiService, formatCurrency, formatDate, formatTime } from '../services/api';
import { useBarbeariaData } from '../hooks/useBarbeariaData';
import HorariosFuncionamento from '../components/HorariosFuncionamento';
import ImageUpload from '../components/ImageUpload';
import PaymentModal from '../components/PaymentModal';

interface BarbershopDashboardProps {
  onBack: () => void;
  onLogout: () => void;
  barbearia: Barbearia | null;
}

const BarbershopDashboard: React.FC<BarbershopDashboardProps> = ({ onBack, onLogout, barbearia: initialBarbearia }) => {
  // =================================================================================
  // CORREÇÃO: Estado para gerenciar dados atualizados da barbearia
  // =================================================================================
  const [dadosBarbearia, setDadosBarbearia] = useState<Barbearia | null>(initialBarbearia);
  const [isLoadingPlano, setIsLoadingPlano] = useState(true);

  const [activeTab, setActiveTab] = useState('visao-geral');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showAddProfessional, setShowAddProfessional] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [newProfessional, setNewProfessional] = useState({ nome: '', especialidade: '' });
  const [newService, setNewService] = useState({ nome: '', duracaoMin: '', preco: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Novos estados para filtros e funcionalidades
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'AGENDAMENTO_PROGRAMADO' | 'ATENDIDO' | 'CANCELADO'>('all');
  const [barbeiroFilter, setBarbeiroFilter] = useState<'all' | number>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Estados para seção financeira
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);
  
  // Estado para controle de erro da logo
  const [logoError, setLogoError] = useState(false);

  // =================================================================================
  // CORREÇÃO: useEffect para verificar plano sempre que o componente for montado
  // =================================================================================
  useEffect(() => {
    const verificarPlanoAtualizado = async () => {
      if (!initialBarbearia?.id) {
        setIsLoadingPlano(false);
        return;
      }

      try {
        setIsLoadingPlano(true);
        // Busca os dados mais recentes da barbearia no servidor
        const barbeariaAtualizada = await apiService.getBarbeariaById(initialBarbearia.id);
        setDadosBarbearia(barbeariaAtualizada);
        
        // Atualiza também o localStorage com os dados mais recentes
        localStorage.setItem('barbeariaLogada', JSON.stringify(barbeariaAtualizada));
      } catch (error) {
        console.error('Erro ao verificar plano da barbearia:', error);
        // Em caso de erro, mantém os dados iniciais
        setDadosBarbearia(initialBarbearia);
      } finally {
        setIsLoadingPlano(false);
      }
    };

    verificarPlanoAtualizado();
  }, [initialBarbearia?.id]); // Executa sempre que o ID da barbearia mudar

  // Hook para gerenciar dados da barbearia (usando os dados atualizados)
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
  } = useBarbeariaData(dadosBarbearia?.id || null);

  // Função para formatar data e hora
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para validar se a URL da logo é válida
  const isValidLogoUrl = (url: string | null | undefined): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Função para resetar erro da logo quando a URL mudar
  useEffect(() => {
    setLogoError(false);
  }, [dadosBarbearia?.logoUrl]);

  // Função para atualizar dados com indicador visual
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Função para carregar pagamentos
  const loadPagamentos = async () => {
    if (!dadosBarbearia?.id) return;
    
    setLoadingPagamentos(true);
    try {
      const pagamentosData = await apiService.getPagamentosByBarbearia(dadosBarbearia.id);
      setPagamentos(pagamentosData);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoadingPagamentos(false);
    }
  };

  // Função para calcular dias restantes do plano
  const calcularDiasRestantes = (updatedAt: string): number => {
    const dataAtualizacao = new Date(updatedAt);
    const dataVencimento = new Date(dataAtualizacao);
    dataVencimento.setDate(dataVencimento.getDate() + 31);
    
    const hoje = new Date();
    const diffTime = dataVencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // Carregar pagamentos quando a aba financeiro for selecionada
  useEffect(() => {
    if (activeTab === 'financeiro') {
      loadPagamentos();
    }
  }, [activeTab, dadosBarbearia?.id]);

  // Função para filtrar agendamentos
  const getFilteredAgendamentos = () => {
    let filtered = [...agendamentos];

    // Filtro por data
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(a => {
          const agendamentoDate = new Date(a.dataHora).toDateString();
          return agendamentoDate === today.toDateString();
        });
        break;
      case 'week':
        filtered = filtered.filter(a => {
          const agendamentoDate = new Date(a.dataHora);
          return agendamentoDate >= startOfWeek && agendamentoDate <= endOfWeek;
        });
        break;
      case 'month':
        filtered = filtered.filter(a => {
          const agendamentoDate = new Date(a.dataHora);
          return agendamentoDate >= startOfMonth && agendamentoDate <= endOfMonth;
        });
        break;
      case 'custom':
        if (customDateStart && customDateEnd) {
          const startDate = new Date(customDateStart);
          const endDate = new Date(customDateEnd);
          endDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(a => {
            const agendamentoDate = new Date(a.dataHora);
            return agendamentoDate >= startDate && agendamentoDate <= endDate;
          });
        }
        break;
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    // Filtro por barbeiro
    if (barbeiroFilter !== 'all') {
      filtered = filtered.filter(a => a.barbeiroId === barbeiroFilter);
    }

    // Filtro por busca (nome do cliente)
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.nomeServico?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
  };

  const filteredAgendamentos = getFilteredAgendamentos();

  // Estatísticas calculadas a partir dos dados filtrados
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

  // Exportar dados para CSV
  const exportToCSV = () => {
    const headers = ['Data', 'Horário', 'Cliente', 'Telefone', 'Serviço', 'Barbeiro', 'Valor', 'Status'];
    const csvData = filteredAgendamentos.map(a => [
      formatDate(a.dataHora),
      formatTime(a.dataHora),
      a.cliente?.nome || 'N/A',
      a.cliente?.telefone || 'N/A',
      a.nomeServico,
      barbeiros.find(b => b.id === a.barbeiroId)?.nome || 'N/A',
      formatCurrency(a.precoServico),
      getStatusText(a.status)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar agendamentos por data selecionada (para visão geral)
  const agendamentosDodia = agendamentos.filter(agendamento => {
    const agendamentoDate = new Date(agendamento.dataHora).toDateString();
    return agendamentoDate === selectedDate.toDateString();
  });

  // =================================================================================
  // CORREÇÃO: Verificação de loading e dados da barbearia
  // =================================================================================
  if (isLoadingPlano) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando status do plano...</p>
        </div>
      </div>
    );
  }

  if (!dadosBarbearia) {
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

  // =================================================================================
  // CORREÇÃO: Função de sucesso do pagamento atualizada
  // =================================================================================
  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    
    // Recarregar dados da barbearia imediatamente após o pagamento
    try {
      const barbeariaAtualizada = await apiService.getBarbeariaById(dadosBarbearia.id);
      setDadosBarbearia(barbeariaAtualizada);
      localStorage.setItem('barbeariaLogada', JSON.stringify(barbeariaAtualizada));
    } catch (error) {
      console.error('Erro ao recarregar dados após pagamento:', error);
      // Fallback: recarregar a página
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de Pagamento */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        barbeariaId={dadosBarbearia.id}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* =================================================================================
          CORREÇÃO: Verificação de Plano CLOSED usando dados atualizados
          ================================================================================= */}
      {dadosBarbearia.plano === 'CLOSED' ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta Inativa</h2>
              <p className="text-gray-600 mb-4">
                Ative seu plano para usar todas as funcionalidades do sistema
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-semibold">
                  Plano Standard por apenas R$ 149,90/mês
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  (oferta de lançamento)
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Ativar Plano Agora</span>
                </button>
                <button
                  onClick={onBack}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Voltar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Voltar</span>
                  </button>
                  <div className="flex items-center space-x-3">
                    {isValidLogoUrl(dadosBarbearia.logoUrl) && !logoError ? (
                      <img
                        src={dadosBarbearia.logoUrl}
                        alt={`Logo ${dadosBarbearia.nome}`}
                        className="w-10 h-10 object-cover rounded-lg"
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <Scissors className="h-6 w-6 text-black" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">{dadosBarbearia.nome}</h1>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dadosBarbearia.plano === 'STANDARD' ? 'bg-green-100 text-green-800' : 
                          dadosBarbearia.plano === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {dadosBarbearia.plano === 'STANDARD' ? 'Plano Standard' :
                           dadosBarbearia.plano === 'PREMIUM' ? 'Plano Premium' : 
                           'Plano Básico'}
                        </span>
                        {dadosBarbearia.plano !== 'CLOSED' && dadosBarbearia.updatedAt && (
                          <span className="text-xs">
                            {calcularDiasRestantes(dadosBarbearia.updatedAt)} dias restantes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white border-b">
            <div className="container mx-auto px-4">
              <nav className="flex space-x-8">
                {[
                  { id: 'visao-geral', label: 'Visão Geral', icon: TrendingUp },
                  { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
                  { id: 'profissionais', label: 'Profissionais', icon: Users },
                  { id: 'servicos', label: 'Serviços', icon: Scissors },
                  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
                  { id: 'configuracoes', label: 'Configurações', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-yellow-400 text-yellow-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 text-yellow-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Carregando dados...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">Erro ao carregar dados: {error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-red-700 hover:text-red-900 underline"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Tab Content */}
            {!isLoading && !error && (
              <>
                {/* Visão Geral */}
                {activeTab === 'visao-geral' && (
                  <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                              </div>
                              <div className={`p-3 rounded-full ${stat.color}`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Calendar and Appointments */}
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Calendar */}
                      <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendário</h3>
                          <div className="space-y-4">
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => {
                                  const newMonth = new Date(currentMonth);
                                  newMonth.setMonth(currentMonth.getMonth() - 1);
                                  setCurrentMonth(newMonth);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <h4 className="font-medium">
                                {currentMonth.toLocaleDateString('pt-BR', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </h4>
                              <button
                                onClick={() => {
                                  const newMonth = new Date(currentMonth);
                                  newMonth.setMonth(currentMonth.getMonth() + 1);
                                  setCurrentMonth(newMonth);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 text-center">
                              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                <div key={day} className="p-2 text-xs font-medium text-gray-500">
                                  {day}
                                </div>
                              ))}
                              {(() => {
                                const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                                const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                                const days = [];
                                
                                // Empty cells for days before month starts
                                for (let i = 0; i < firstDay.getDay(); i++) {
                                  days.push(<div key={`empty-${i}`} className="p-2"></div>);
                                }
                                
                                // Days of the month
                                for (let day = 1; day <= lastDay.getDate(); day++) {
                                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                  const isSelected = selectedDate.toDateString() === date.toDateString();
                                  const isToday = new Date().toDateString() === date.toDateString();
                                  const hasAppointments = agendamentos.some(a => 
                                    new Date(a.dataHora).toDateString() === date.toDateString()
                                  );
                                  
                                  days.push(
                                    <button
                                      key={day}
                                      onClick={() => setSelectedDate(date)}
                                      className={`p-2 text-sm rounded-lg transition-colors relative ${
                                        isSelected
                                          ? 'bg-yellow-400 text-black'
                                          : isToday
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      {day}
                                      {hasAppointments && (
                                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                                      )}
                                    </button>
                                  );
                                }
                                
                                return days;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Appointments for Selected Date */}
                      <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Agendamentos - {selectedDate.toLocaleDateString('pt-BR')}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {agendamentosDodia.length} agendamento(s)
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {agendamentosDodia.length === 0 ? (
                              <p className="text-gray-500 text-center py-8">
                                Nenhum agendamento para esta data
                              </p>
                            ) : (
                              agendamentosDodia.map((agendamento) => (
                                <div key={agendamento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-black" />
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {agendamento.cliente?.nome || 'Cliente não informado'}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {agendamento.nomeServico} • {formatTime(agendamento.dataHora)}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {barbeiros.find(b => b.id === agendamento.barbeiroId)?.nome || 'Barbeiro não encontrado'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                                      {getStatusText(agendamento.status)}
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      {formatCurrency(agendamento.precoServico)}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Agendamentos */}
                {activeTab === 'agendamentos' && (
                  <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Filter className="h-4 w-4" />
                          <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
                        </button>
                      </div>

                      {showFilters && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Date Filter */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Período
                            </label>
                            <select
                              value={dateFilter}
                              onChange={(e) => setDateFilter(e.target.value as any)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                            >
                              <option value="today">Hoje</option>
                              <option value="week">Esta Semana</option>
                              <option value="month">Este Mês</option>
                              <option value="custom">Personalizado</option>
                            </select>
                          </div>

                          {/* Status Filter */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value as any)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                            >
                              <option value="all">Todos</option>
                              <option value="AGENDAMENTO_PROGRAMADO">Pendente</option>
                              <option value="ATENDIDO">Concluído</option>
                              <option value="CANCELADO">Cancelado</option>
                            </select>
                          </div>

                          {/* Barbeiro Filter */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Barbeiro
                            </label>
                            <select
                              value={barbeiroFilter}
                              onChange={(e) => setBarbeiroFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                            >
                              <option value="all">Todos</option>
                              {barbeiros.filter(b => b.ativo).map(barbeiro => (
                                <option key={barbeiro.id} value={barbeiro.id}>
                                  {barbeiro.nome}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Search */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Buscar
                            </label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Nome do cliente..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Custom Date Range */}
                      {dateFilter === 'custom' && showFilters && (
                        <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Data Inicial
                            </label>
                            <input
                              type="date"
                              value={customDateStart}
                              onChange={(e) => setCustomDateStart(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Data Final
                            </label>
                            <input
                              type="date"
                              value={customDateEnd}
                              onChange={(e) => setCustomDateEnd(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Appointments List */}
                    <div className="bg-white rounded-lg shadow-sm border">
                      <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Agendamentos ({filteredAgendamentos.length})
                          </h3>
                          <button
                            onClick={exportToCSV}
                            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span>Exportar CSV</span>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Serviço
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Barbeiro
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data/Hora
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAgendamentos.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                  Nenhum agendamento encontrado
                                </td>
                              </tr>
                            ) : (
                              filteredAgendamentos.map((agendamento) => (
                                <tr key={agendamento.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                          <User className="h-5 w-5 text-black" />
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {agendamento.cliente?.nome || 'Cliente não informado'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {agendamento.cliente?.telefone || 'Telefone não informado'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {agendamento.nomeServico}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {barbeiros.find(b => b.id === agendamento.barbeiroId)?.nome || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div>
                                      <div>{formatDate(agendamento.dataHora)}</div>
                                      <div className="text-gray-500">{formatTime(agendamento.dataHora)}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatCurrency(agendamento.precoServico)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      {getStatusIcon(agendamento.status)}
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                                        {getStatusText(agendamento.status)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                      {agendamento.status === 'AGENDAMENTO_PROGRAMADO' && (
                                        <button
                                          onClick={() => handleUpdateAgendamentoStatus(agendamento.id, 'ATENDIDO')}
                                          className="text-green-600 hover:text-green-900"
                                          title="Marcar como concluído"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </button>
                                      )}
                                      {agendamento.status !== 'CANCELADO' && (
                                        <button
                                          onClick={() => handleUpdateAgendamentoStatus(agendamento.id, 'CANCELADO')}
                                          className="text-red-600 hover:text-red-900"
                                          title="Cancelar agendamento"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      )}
                                      <button
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Ver detalhes"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profissionais */}
                {activeTab === 'profissionais' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Profissionais</h2>
                      <button
                        onClick={() => setShowAddProfessional(true)}
                        className="flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Profissional</span>
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {barbeiros.filter(b => b.ativo).map((barbeiro) => (
                        <div key={barbeiro.id} className="bg-white rounded-lg shadow-sm border p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-black" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{barbeiro.nome}</h3>
                                <p className="text-sm text-gray-600">{barbeiro.especialidade}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditProfessional(barbeiro)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveProfessional(barbeiro.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Remover"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Agendamentos hoje:</span>
                              <span className="font-medium">
                                {agendamentos.filter(a => {
                                  const today = new Date().toDateString();
                                  const agendamentoDate = new Date(a.dataHora).toDateString();
                                  return agendamentoDate === today && a.barbeiroId === barbeiro.id;
                                }).length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className="text-green-600 font-medium">Ativo</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Professional Modal */}
                    {showAddProfessional && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingProfessional ? 'Editar Profissional' : 'Adicionar Profissional'}
                          </h3>
                          <form onSubmit={handleAddProfessional} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome
                              </label>
                              <input
                                type="text"
                                value={newProfessional.nome}
                                onChange={(e) => setNewProfessional({...newProfessional, nome: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Especialidade
                              </label>
                              <input
                                type="text"
                                value={newProfessional.especialidade}
                                onChange={(e) => setNewProfessional({...newProfessional, especialidade: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                required
                              />
                            </div>
                            <div className="flex space-x-3 pt-4">
                              <button
                                type="submit"
                                className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition-colors"
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
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                Cancelar
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
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Serviços</h2>
                      <button
                        onClick={() => setShowAddService(true)}
                        className="flex items-center space-x-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Serviço</span>
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {servicos.map((servico) => (
                        <div key={servico.id} className="bg-white rounded-lg shadow-sm border p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                <Scissors className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{servico.nome}</h3>
                                <p className="text-sm text-gray-600">{servico.duracaoMin} min</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditService(servico)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveService(servico.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Remover"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Preço:</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(servico.preco)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Agendamentos hoje:</span>
                              <span className="font-medium">
                                {agendamentos.filter(a => {
                                  const today = new Date().toDateString();
                                  const agendamentoDate = new Date(a.dataHora).toDateString();
                                  return agendamentoDate === today && a.nomeServico === servico.nome;
                                }).length}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Service Modal */}
                    {showAddService && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingService ? 'Editar Serviço' : 'Adicionar Serviço'}
                          </h3>
                          <form onSubmit={handleAddService} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Serviço
                              </label>
                              <input
                                type="text"
                                value={newService.nome}
                                onChange={(e) => setNewService({...newService, nome: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duração (minutos)
                              </label>
                              <input
                                type="number"
                                value={newService.duracaoMin}
                                onChange={(e) => setNewService({...newService, duracaoMin: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                required
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preço (R$)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={newService.preco}
                                onChange={(e) => setNewService({...newService, preco: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                                required
                                min="0"
                              />
                            </div>
                            <div className="flex space-x-3 pt-4">
                              <button
                                type="submit"
                                className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition-colors"
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
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Financeiro */}
                {activeTab === 'financeiro' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Financeiro</h2>

                    {/* Financial Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Faturamento Hoje</p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(
                                agendamentos
                                  .filter(a => {
                                    const today = new Date().toDateString();
                                    const agendamentoDate = new Date(a.dataHora).toDateString();
                                    return agendamentoDate === today && a.status === 'ATENDIDO';
                                  })
                                  .reduce((total, a) => total + a.precoServico, 0)
                              )}
                            </p>
                          </div>
                          <div className="p-3 rounded-full bg-green-500">
                            <DollarSign className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Faturamento do Mês</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {formatCurrency(
                                agendamentos
                                  .filter(a => {
                                    const agendamentoDate = new Date(a.dataHora);
                                    const today = new Date();
                                    return agendamentoDate.getMonth() === today.getMonth() && 
                                           agendamentoDate.getFullYear() === today.getFullYear() &&
                                           a.status === 'ATENDIDO';
                                  })
                                  .reduce((total, a) => total + a.precoServico, 0)
                              )}
                            </p>
                          </div>
                          <div className="p-3 rounded-full bg-blue-500">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {(() => {
                                const atendidos = agendamentos.filter(a => a.status === 'ATENDIDO');
                                const total = atendidos.reduce((sum, a) => sum + a.precoServico, 0);
                                const media = atendidos.length > 0 ? total / atendidos.length : 0;
                                return formatCurrency(media);
                              })()}
                            </p>
                          </div>
                          <div className="p-3 rounded-full bg-purple-500">
                            <Star className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white rounded-lg shadow-sm border">
                      <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">Histórico de Pagamentos</h3>
                      </div>
                      <div className="p-6">
                        {loadingPagamentos ? (
                          <div className="text-center py-8">
                            <RefreshCw className="h-8 w-8 text-yellow-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Carregando histórico...</p>
                          </div>
                        ) : pagamentos.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">
                            Nenhum pagamento encontrado
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {pagamentos.map((pagamento, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Pagamento #{pagamento.id}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {formatDateTime(pagamento.createdAt)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-green-600">
                                    {formatCurrency(pagamento.valor)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {pagamento.status}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Configurações */}
                {activeTab === 'configuracoes' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>

                    {/* Plano Information */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Plano</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Plano Atual:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                dadosBarbearia.plano === 'STANDARD' ? 'bg-green-100 text-green-800' : 
                                dadosBarbearia.plano === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {dadosBarbearia.plano === 'STANDARD' ? 'Standard' :
                                 dadosBarbearia.plano === 'PREMIUM' ? 'Premium' : 
                                 'Básico'}
                              </span>
                            </div>
                            {dadosBarbearia.plano !== 'CLOSED' && dadosBarbearia.updatedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Dias Restantes:</span>
                                <span className="font-medium">
                                  {calcularDiasRestantes(dadosBarbearia.updatedAt)} dias
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-medium ${
                                dadosBarbearia.plano === 'CLOSED' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {dadosBarbearia.plano === 'CLOSED' ? 'Inativo' : 'Ativo'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {dadosBarbearia.plano === 'CLOSED' ? (
                            <button
                              onClick={() => setShowPaymentModal(true)}
                              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <CreditCard className="h-5 w-5" />
                              <span>Ativar Plano</span>
                            </button>
                          ) : (
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                              <p className="text-green-800 font-medium">Plano Ativo</p>
                              <p className="text-green-600 text-sm">
                                Todas as funcionalidades disponíveis
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barbearia Information */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Barbearia</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome da Barbearia
                            </label>
                            <input
                              type="text"
                              value={dadosBarbearia.nome}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={dadosBarbearia.email}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Telefone
                            </label>
                            <input
                              type="tel"
                              value={dadosBarbearia.telefone || ''}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Endereço
                            </label>
                            <textarea
                              value={dadosBarbearia.endereco || ''}
                              readOnly
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logo da Barbearia
                            </label>
                            <ImageUpload
                              currentImageUrl={dadosBarbearia.logoUrl}
                              onImageUpload={(url) => {
                                // Aqui você implementaria a lógica para atualizar a logo
                                console.log('Nova URL da logo:', url);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Horários de Funcionamento */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários de Funcionamento</h3>
                      <HorariosFuncionamento
                        barbeariaId={dadosBarbearia.id}
                        horarios={dadosBarbearia.horariosFuncionamento || []}
                        onHorariosUpdate={(horarios) => {
                          // Aqui você implementaria a lógica para atualizar os horários
                          console.log('Novos horários:', horarios);
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BarbershopDashboard;

