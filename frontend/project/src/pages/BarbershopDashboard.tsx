import React, { useState } from 'react';
import { Calendar, Users, Scissors, DollarSign, Clock, Star, TrendingUp, Settings, ArrowLeft, User, Building, Trash2, Edit, ChevronLeft, ChevronRight, CheckCircle, XCircle, MapPin } from 'lucide-react';

interface BarbershopDashboardProps {
  onBack: () => void;
}

const BarbershopDashboard: React.FC<BarbershopDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showAddProfessional, setShowAddProfessional] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [professionals, setProfessionals] = useState([
    { id: 1, name: 'Carlos Silva', specialty: 'Cortes Modernos', services: ['Corte Simples', 'Corte + Barba'], phone: '(11) 99999-1111' },
    { id: 2, name: 'João Santos', specialty: 'Barbas Clássicas', services: ['Barba', 'Corte + Barba'], phone: '(11) 99999-2222' },
    { id: 3, name: 'Pedro Lima', specialty: 'Tratamentos', services: ['Relaxamento'], phone: '(11) 99999-3333' }
  ]);
  const [services, setServices] = useState([
    { id: 1, name: 'Corte Simples', duration: '30 min', price: 'R$ 35' },
    { id: 2, name: 'Barba', duration: '20 min', price: 'R$ 25' },
    { id: 3, name: 'Corte + Barba', duration: '45 min', price: 'R$ 50' },
    { id: 4, name: 'Sobrancelha', duration: '15 min', price: 'R$ 15' },
    { id: 5, name: 'Relaxamento', duration: '60 min', price: 'R$ 80' }
  ]);
  const [newProfessional, setNewProfessional] = useState({ name: '', services: [], phone: '' });
  const [newService, setNewService] = useState({ name: '', duration: '', price: '' });
  const [barbershopDetails, setBarbershopDetails] = useState({
    name: 'Barbearia Premium',
    phone: '(11) 99999-1111',
    email: 'contato@barberiapremium.com',
    address: {
      street: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    workingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '15:00', closed: true }
    },
    description: 'Barbearia moderna com profissionais especializados em cortes masculinos e tratamentos capilares.',
    socialMedia: {
      instagram: '@barberiapremium',
      facebook: 'Barbearia Premium',
      whatsapp: '(11) 99999-1111'
    }
  });
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [tempDetails, setTempDetails] = useState(barbershopDetails);

  // Dados simulados de agendamentos por data
  const appointmentsByDate = {
    '2025-01-20': [
      { id: 1, client: 'João Silva', service: 'Corte + Barba', time: '10:00', professional: 'Carlos Silva', status: 'completed', phone: '(11) 99999-1111' },
      { id: 2, client: 'Pedro Santos', service: 'Corte Simples', time: '14:30', professional: 'João Santos', status: 'pending', phone: '(11) 99999-2222' },
      { id: 3, client: 'Rafael Lima', service: 'Barba', time: '16:00', professional: 'Pedro Lima', status: 'cancelled', phone: '(11) 99999-3333' }
    ],
    '2025-01-21': [
      { id: 4, client: 'Carlos Costa', service: 'Relaxamento', time: '09:30', professional: 'Carlos Silva', status: 'pending', phone: '(11) 99999-4444' },
      { id: 5, client: 'Lucas Oliveira', service: 'Corte + Barba', time: '11:00', professional: 'Rafael Costa', status: 'completed', phone: '(11) 99999-5555' }
    ],
    '2025-01-22': [
      { id: 6, client: 'André Ferreira', service: 'Corte Simples', time: '15:00', professional: 'João Santos', status: 'pending', phone: '(11) 99999-6666' },
      { id: 7, client: 'Bruno Alves', service: 'Sobrancelha', time: '16:30', professional: 'Pedro Lima', status: 'completed', phone: '(11) 99999-7777' },
      { id: 8, client: 'Diego Rocha', service: 'Tratamento Capilar', time: '17:00', professional: 'Carlos Silva', status: 'cancelled', phone: '(11) 99999-8888' }
    ]
  };

  const handleEditProfessional = (professional: any) => {
    setEditingProfessional(professional);
    setNewProfessional({
      name: professional.name,
      services: professional.services,
      phone: professional.phone
    });
    setShowAddProfessional(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      duration: service.duration.replace(' min', ''),
      price: service.price.replace('R$ ', '')
    });
    setShowAddService(true);
  };

  const handleRemoveService = (serviceId: number) => {
    if (window.confirm('Tem certeza que deseja remover este serviço?')) {
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  const handleSaveBarbershopDetails = () => {
    setBarbershopDetails(tempDetails);
    setIsEditingDetails(false);
    alert('Detalhes da barbearia salvos com sucesso!');
  };

  const handleCancelEditDetails = () => {
    setTempDetails(barbershopDetails);
    setIsEditingDetails(false);
  };

  const handleDetailsChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTempDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setTempDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setTempDetails(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const getDayName = (day: string) => {
    const dayNames = {
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return dayNames[day] || day;
  };

  const stats = [
    { label: 'Agendamentos Hoje', value: '12', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Total de Clientes', value: '248', icon: Users, color: 'bg-green-500' },
    { label: 'Serviços Realizados', value: '156', icon: Scissors, color: 'bg-purple-500' },
    { label: 'Faturamento Hoje', value: 'R$ 1.240', icon: DollarSign, color: 'bg-yellow-500' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  // Funções do calendário
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return appointmentsByDate[dateKey] || [];
  };

  const getAppointmentStats = (appointments: any[]) => {
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const pending = appointments.filter(apt => apt.status === 'pending').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    return { completed, pending, cancelled };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Adicionar dias vazios do início do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const appointments = getAppointmentsForDate(date);
      const stats = getAppointmentStats(appointments);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-200 p-2 cursor-pointer transition-colors ${
            isSelected ? 'bg-yellow-100 border-yellow-400' : 'hover:bg-gray-50'
          } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
            {isToday && <span className="text-xs ml-1">(Hoje)</span>}
          </div>
          {appointments.length > 0 && (
            <div className="space-y-1">
              {stats.completed > 0 && (
                <div className="text-xs bg-green-100 text-green-800 px-1 rounded">
                  {stats.completed} concluído{stats.completed > 1 ? 's' : ''}
                </div>
              )}
              {stats.pending > 0 && (
                <div className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                  {stats.pending} pendente{stats.pending > 1 ? 's' : ''}
                </div>
              )}
              {stats.cancelled > 0 && (
                <div className="text-xs bg-red-100 text-red-800 px-1 rounded">
                  {stats.cancelled} cancelado{stats.cancelled > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Cabeçalho do calendário */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 border-b">
          {dayNames.map((dayName) => (
            <div key={dayName} className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0">
              {dayName}
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  const handleAddProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfessional.name && newProfessional.services.length > 0 && newProfessional.phone) {
      if (editingProfessional) {
        // Editando profissional existente
        const updatedProfessionals = professionals.map(p => 
          p.id === editingProfessional.id 
            ? {
                ...p,
                name: newProfessional.name,
                specialty: newProfessional.services.join(', '),
                services: newProfessional.services,
                phone: newProfessional.phone
              }
            : p
        );
        setProfessionals(updatedProfessionals);
        setEditingProfessional(null);
      } else {
        // Adicionando novo profissional
        const professional = {
          id: professionals.length + 1,
          name: newProfessional.name,
          specialty: newProfessional.services.join(', '),
          services: newProfessional.services,
          phone: newProfessional.phone
        };
        setProfessionals([...professionals, professional]);
      }
      setNewProfessional({ name: '', services: [], phone: '' });
      setShowAddProfessional(false);
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newService.name && newService.duration && newService.price) {
      // Formatar duração e preço se necessário
      const formattedDuration = newService.duration.includes('min') ? newService.duration : `${newService.duration} min`;
      const formattedPrice = newService.price.includes('R$') ? newService.price : `R$ ${newService.price}`;
      
      if (editingService) {
        // Editando serviço existente
        const updatedServices = services.map(s => 
          s.id === editingService.id 
            ? {
                ...s,
                name: newService.name,
                duration: formattedDuration,
                price: formattedPrice
              }
            : s
        );
        setServices(updatedServices);
        setEditingService(null);
      } else {
        // Adicionando novo serviço
        const service = {
          id: services.length + 1,
          name: newService.name,
          duration: formattedDuration,
          price: formattedPrice
        };
        setServices([...services, service]);
      }
      setNewService({ name: '', duration: '', price: '' });
      setShowAddService(false);
    }
  };

  const handleRemoveProfessional = (professionalId: number) => {
    if (window.confirm('Tem certeza que deseja remover este profissional?')) {
      setProfessionals(professionals.filter(p => p.id !== professionalId));
    }
  };

  const handleServiceToggle = (serviceName: string) => {
    setNewProfessional(prev => ({
      ...prev,
      services: prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
    }));
  };

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
                <Scissors className="h-8 w-8 text-yellow-400 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Painel da Barbearia</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-black text-sm font-medium">BP</span>
                </div>
                <span className="text-gray-700 font-medium">Barbearia Premium</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'visao-geral', label: 'Visão Geral' },
              { id: 'profissionais', label: 'Profissionais' },
              { id: 'servicos', label: 'Serviços' },
              { id: 'calendarios', label: 'Calendários' },
              { id: 'detalhes', label: 'Detalhes da Barbearia' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'visao-geral' && (
          <div className="space-y-8">
            {/* Stats Grid */}
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

            {/* Ações Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Agendar Horário</h4>
                    <p className="text-sm text-gray-500">Criar um novo agendamento</p>
                  </div>
                </div>
              </button>
              
              <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Gerenciar Clientes</h4>
                    <p className="text-sm text-gray-500">Ver e editar informações dos clientes</p>
                  </div>
                </div>
              </button>
              
              <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Ver Relatórios</h4>
                    <p className="text-sm text-gray-500">Verificar desempenho do negócio</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profissionais' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gerenciar Profissionais</h3>
                <button 
                  onClick={() => setShowAddProfessional(true)}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Adicionar Profissional
                </button>
              </div>
            </div>
            
            {/* Popup Modal */}
            {showAddProfessional && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {editingProfessional ? 'Editar Profissional' : 'Adicionar Novo Profissional'}
                    </h4>
                  </div>
                  
                  <form onSubmit={handleAddProfessional} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Profissional</label>
                      <input
                        type="text"
                        value={newProfessional.name}
                        onChange={(e) => setNewProfessional({...newProfessional, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        placeholder="Nome completo do profissional"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número do Profissional</label>
                      <input
                        type="tel"
                        value={newProfessional.phone}
                        onChange={(e) => setNewProfessional({...newProfessional, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Serviços</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {services.map((service) => (
                          <label key={service.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newProfessional.services.includes(service.name)}
                              onChange={() => handleServiceToggle(service.name)}
                              className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                            />
                            <span className="text-sm text-gray-700">{service.name}</span>
                            <span className="text-xs text-gray-500">({service.price})</span>
                          </label>
                        ))}
                      </div>
                      {newProfessional.services.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">Selecione pelo menos um serviço</p>
                      )}
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                      >
                        {editingProfessional ? 'Salvar Alterações' : 'Adicionar Profissional'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProfessional(false);
                          setEditingProfessional(null);
                          setNewProfessional({ name: '', services: [], phone: '' });
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((professional) => (
                  <div key={professional.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold">
                          {professional.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{professional.name}</h4>
                        <p className="text-sm text-gray-600">{professional.specialty}</p>
                        <p className="text-xs text-gray-500">{professional.phone}</p>
                      </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProfessional(professional)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Editar profissional"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveProfessional(professional.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Remover profissional"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Serviços:</p>
                      <div className="flex flex-wrap gap-1">
                        {professional.services.map((service, index) => (
                          <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'servicos' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gerenciar Serviços</h3>
                <button 
                  onClick={() => setShowAddService(true)}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Adicionar Serviço
                </button>
              </div>
            </div>
            
            {/* Popup Modal para Adicionar Serviço */}
            {showAddService && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
                    </h4>
                  </div>
                  
                  <form onSubmit={handleAddService} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Serviço</label>
                      <input
                        type="text"
                        value={newService.name}
                        onChange={(e) => setNewService({...newService, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        placeholder="Ex: Corte Degradê"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duração</label>
                      <input
                        type="text"
                        value={newService.duration}
                        onChange={(e) => setNewService({...newService, duration: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        placeholder="Ex: 45"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">A duração será automaticamente formatada com "min"</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preço</label>
                      <input
                        type="text"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                        placeholder="Ex: 40"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">O preço será automaticamente formatado com "R$"</p>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                      >
                        {editingService ? 'Salvar Alterações' : 'Adicionar Serviço'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddService(false);
                          setEditingService(null);
                          setNewService({ name: '', duration: '', price: '' });
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="p-6">
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Scissors className="h-8 w-8 text-yellow-400" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.duration}</p>
                      </div>
                    </div>
                      <div className="flex items-center space-x-4">
                      <span className="font-bold text-lg">{service.price}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Editar serviço"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveService(service.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Remover serviço"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendarios' && (
          <div className="space-y-8">
            {/* Calendário */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Calendário de Agendamentos</h2>
              {renderCalendar()}
            </div>

            {/* Detalhes do dia selecionado */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Agendamentos para {selectedDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>
              <div className="p-6">
                {(() => {
                  const appointments = getAppointmentsForDate(selectedDate);
                  if (appointments.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum agendamento para este dia</p>
                      </div>
                    );
                  }

                  const stats = getAppointmentStats(appointments);
                  
                  return (
                    <div className="space-y-6">
                      {/* Resumo do dia */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                          <div className="text-sm text-green-600">Concluídos</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                          <div className="text-sm text-yellow-600">Pendentes</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                          <div className="text-sm text-red-600">Cancelados</div>
                        </div>
                      </div>

                      {/* Lista de agendamentos */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Detalhes dos Agendamentos</h4>
                        <div className="divide-y divide-gray-200">
                          {appointments.map((appointment) => (
                            <div key={appointment.id} className="py-4 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-medium text-sm">
                                      {appointment.client.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-gray-900">{appointment.client}</p>
                                    {getStatusIcon(appointment.status)}
                                  </div>
                                  <p className="text-sm text-gray-500">{appointment.service}</p>
                                  <p className="text-xs text-gray-400">Profissional: {appointment.professional}</p>
                                  <p className="text-xs text-gray-400">Telefone: {appointment.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {appointment.time}
                                  </div>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                    {getStatusText(appointment.status)}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  {appointment.status === 'pending' && (
                                    <>
                                      <button className="text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-100 rounded">
                                        Concluir
                                      </button>
                                      <button className="text-red-600 hover:text-red-800 text-xs px-2 py-1 bg-red-100 rounded">
                                        Cancelar
                                      </button>
                                    </>
                                  )}
                                  <button className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded">
                                    Editar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detalhes' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Detalhes da Barbearia</h3>
                {!isEditingDetails ? (
                  <button
                    onClick={() => {
                      setIsEditingDetails(true);
                      setTempDetails(barbershopDetails);
                    }}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                  >
                    Editar Detalhes
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveBarbershopDetails}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelEditDetails}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-8">
                {/* Informações Básicas */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Building className="h-5 w-5 text-yellow-400" />
                    <span>Informações Básicas</span>
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Barbearia</label>
                      <input
                        type="text"
                        value={isEditingDetails ? tempDetails.name : barbershopDetails.name}
                        onChange={(e) => handleDetailsChange('name', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={isEditingDetails ? tempDetails.phone : barbershopDetails.phone}
                        onChange={(e) => handleDetailsChange('phone', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={isEditingDetails ? tempDetails.email : barbershopDetails.email}
                        onChange={(e) => handleDetailsChange('email', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <input
                        type="tel"
                        value={isEditingDetails ? tempDetails.socialMedia.whatsapp : barbershopDetails.socialMedia.whatsapp}
                        onChange={(e) => handleDetailsChange('socialMedia.whatsapp', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h4>
                  <textarea
                    value={isEditingDetails ? tempDetails.description : barbershopDetails.description}
                    onChange={(e) => handleDetailsChange('description', e.target.value)}
                    disabled={!isEditingDetails}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 resize-none ${
                      !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="Descreva sua barbearia, especialidades e diferenciais..."
                  />
                </div>

                {/* Endereço */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-yellow-400" />
                    <span>Endereço</span>
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                      <input
                        type="text"
                        value={isEditingDetails ? tempDetails.address.street : barbershopDetails.address.street}
                        onChange={(e) => handleDetailsChange('address.street', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                      <input
                        type="text"
                        value={isEditingDetails ? tempDetails.address.neighborhood : barbershopDetails.address.neighborhood}
                        onChange={(e) => handleDetailsChange('address.neighborhood', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        value={isEditingDetails ? tempDetails.address.city : barbershopDetails.address.city}
                        onChange={(e) => handleDetailsChange('address.city', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <input
                        type="text"
                        value={isEditingDetails ? tempDetails.address.state : barbershopDetails.address.state}
                        onChange={(e) => handleDetailsChange('address.state', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <input
                        type="text"
                        value={isEditingDetails ? tempDetails.address.zipCode : barbershopDetails.address.zipCode}
                        onChange={(e) => handleDetailsChange('address.zipCode', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Horários de Funcionamento */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-400" />
                    <span>Horários de Funcionamento</span>
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(isEditingDetails ? tempDetails.workingHours : barbershopDetails.workingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-32">
                          <span className="font-medium text-gray-900">{getDayName(day)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => handleWorkingHoursChange(day, 'closed', !e.target.checked)}
                            disabled={!isEditingDetails}
                            className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                          />
                          <span className="text-sm text-gray-600">Aberto</span>
                        </div>
                        {!hours.closed && (
                          <>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-600">Das:</label>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                                disabled={!isEditingDetails}
                                className={`px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-yellow-400 ${
                                  !isEditingDetails ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-600">Às:</label>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                                disabled={!isEditingDetails}
                                className={`px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-yellow-400 ${
                                  !isEditingDetails ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                              />
                            </div>
                          </>
                        )}
                        {hours.closed && (
                          <span className="text-sm text-red-600 font-medium">Fechado</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Redes Sociais */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">Redes Sociais</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <input
                        type="text"
                        value={isEditingDetails ? tempDetails.socialMedia.instagram : barbershopDetails.socialMedia.instagram}
                        onChange={(e) => handleDetailsChange('socialMedia.instagram', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="@suabarbearia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <input
                        type="text"
                        value={isEditingDetails ? tempDetails.socialMedia.facebook : barbershopDetails.socialMedia.facebook}
                        onChange={(e) => handleDetailsChange('socialMedia.facebook', e.target.value)}
                        disabled={!isEditingDetails}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 ${
                          !isEditingDetails ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Nome da página no Facebook"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarbershopDashboard;