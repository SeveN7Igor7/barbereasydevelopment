import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Scissors, Star, MapPin, Phone, CheckCircle } from 'lucide-react';
import { Barbearia, Barbeiro, Servico, Cliente, apiService, formatCurrency } from '../services/api';

interface BookingPageProps {
  onBack: () => void;
  barbearia: Barbearia;
}

type BookingStep = 'date' | 'time' | 'service' | 'barber' | 'summary' | 'client' | 'confirmation';

const BookingPage: React.FC<BookingPageProps> = ({ onBack, barbearia }) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barbeiro | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dados do cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // Gerar próximos 14 dias (excluindo domingos)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    let addedDays = 0;
    let currentDate = new Date(today);
    
    while (addedDays < 14) {
      // Pular domingos (0 = domingo)
      if (currentDate.getDay() !== 0) {
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        dates.push({
          date: currentDate.toISOString().split('T')[0],
          dayName: dayNames[currentDate.getDay()],
          dayNumber: currentDate.getDate(),
          month: monthNames[currentDate.getMonth()],
          isToday: addedDays === 0 && currentDate.getDay() !== 0,
          fullDate: new Date(currentDate)
        });
        addedDays++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const availableDates = generateDates();

  // Carregar horários disponíveis quando data e barbeiro são selecionados
  useEffect(() => {
    if (selectedDate && selectedBarber) {
      loadAvailableTimes();
    }
  }, [selectedDate, selectedBarber]);

  const loadAvailableTimes = async () => {
    if (!selectedDate || !selectedBarber) return;
    
    setLoading(true);
    try {
      const times = await apiService.checkAvailability(barbearia.id, selectedBarber.id, selectedDate);
      setAvailableTimes(times);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setError('Erro ao carregar horários disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setCurrentStep('service');
  };

  const handleServiceSelect = (service: Servico) => {
    setSelectedService(service);
    setCurrentStep('barber');
  };

  const handleBarberSelect = (barbeiro: Barbeiro) => {
    setSelectedBarber(barbeiro);
    setSelectedTime(''); // Reset time when barber changes
    setCurrentStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('summary');
  };

  const handleConfirmBooking = () => {
    setCurrentStep('client');
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim() || !clientPhone.trim()) {
      setError('Nome e telefone são obrigatórios');
      return;
    }

    if (!selectedDate || !selectedTime || !selectedService || !selectedBarber) {
      setError('Todos os dados do agendamento são obrigatórios');
      return;
    }

    setIsCreatingBooking(true);
    setError(null);

    // **INÍCIO DA MODIFICAÇÃO**
    // Garante que o telefone tenha apenas números e adiciona o prefixo "55"
    const formattedPhone = `55${clientPhone.replace(/\D/g, '')}`;
    // **FIM DA MODIFICAÇÃO**

    try {
      // Verificar se cliente já existe usando o telefone formatado
      let cliente = await apiService.getClienteByTelefone(formattedPhone, barbearia.id);
      
      // Se não existe, criar novo cliente com o telefone formatado
      if (!cliente) {
        cliente = await apiService.createCliente({
          nome: clientName.trim(),
          telefone: formattedPhone, // Usar o telefone formatado
          barbeariaId: barbearia.id
        });
      }

      // Criar agendamento
      const dataHora = new Date(`${selectedDate}T${selectedTime}:00`);
      
      await apiService.createAgendamento({
        clienteId: cliente.id,
        barbeiroId: selectedBarber.id,
        barbeariaId: barbearia.id,
        dataHora: dataHora.toISOString(),
        nomeServico: selectedService.nome,
        precoServico: selectedService.preco
      });

      setCurrentStep('confirmation');
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      setError(error.message || 'Erro ao criar agendamento');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'date', label: 'Data', icon: Calendar },
      { key: 'service', label: 'Serviço', icon: Scissors },
      { key: 'barber', label: 'Barbeiro', icon: User },
      { key: 'time', label: 'Horário', icon: Clock },
      { key: 'summary', label: 'Resumo', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isActive ? 'bg-yellow-400 text-black' :
                isCompleted ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-yellow-600' :
                isCompleted ? 'text-green-600' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDateSelection = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-yellow-400" />
        <span>Escolha a Data</span>
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {availableDates.map((date) => (
          <button
            key={date.date}
            onClick={() => handleDateSelect(date.date)}
            className={`p-3 rounded-lg text-center transition-colors ${
              selectedDate === date.date
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="text-xs font-medium">{date.dayName}</div>
            <div className="text-lg font-bold">{date.dayNumber}</div>
            <div className="text-xs">{date.month}</div>
            {date.isToday && (
              <div className="text-xs text-yellow-600 font-medium">Hoje</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderServiceSelection = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Scissors className="h-5 w-5 text-yellow-400" />
        <span>Escolha o Serviço</span>
      </h3>
      <div className="space-y-3">
        {barbearia.servicos?.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
              selectedService?.id === service.id
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{service.nome}</h4>
                <p className="text-sm text-gray-600">{service.duracaoMin} min</p>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency(service.preco)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderBarberSelection = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <User className="h-5 w-5 text-yellow-400" />
        <span>Escolha o Barbeiro</span>
      </h3>
      <div className="space-y-3">
        {barbearia.barbeiros?.map((barbeiro) => (
          <button
            key={barbeiro.id}
            onClick={() => handleBarberSelect(barbeiro)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
              selectedBarber?.id === barbeiro.id
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold">
                  {barbeiro.nome.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{barbeiro.nome}</h4>
                {barbeiro.especialidade && (
                  <p className="text-sm text-gray-600">{barbeiro.especialidade}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTimeSelection = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Clock className="h-5 w-5 text-yellow-400" />
        <span>Escolha o Horário</span>
      </h3>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando horários...</p>
        </div>
      ) : availableTimes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Nenhum horário disponível para esta data
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {availableTimes.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTime === time
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderSummary = () => {
    const selectedDateData = availableDates.find(d => d.date === selectedDate);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Agendamento</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Barbearia:</span>
            <span className="font-medium">{barbearia.nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data:</span>
            <span className="font-medium">
              {selectedDateData ? 
                `${selectedDateData.dayNumber}/${selectedDateData.month}` 
                : 'Não selecionada'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Horário:</span>
            <span className="font-medium">{selectedTime || 'Não selecionado'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Serviço:</span>
            <span className="font-medium">{selectedService?.nome || 'Não selecionado'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Barbeiro:</span>
            <span className="font-medium">{selectedBarber?.nome || 'Não selecionado'}</span>
          </div>
          <div className="flex justify-between border-t pt-4">
            <span className="text-gray-600">Valor:</span>
            <span className="font-bold text-lg text-yellow-600">
              {selectedService ? formatCurrency(selectedService.preco) : 'R$ 0'}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleConfirmBooking}
          className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors"
        >
          Confirmar Agendamento
        </button>
      </div>
    );
  };

  const renderClientForm = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Identificação do Cliente</h3>
      
      <form onSubmit={handleClientSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            id="name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="Digite seu nome completo"
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone (WhatsApp)
          </label>
          <input
            type="tel"
            id="phone"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="89994582600"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isCreatingBooking}
          className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isCreatingBooking ? 'Criando Agendamento...' : 'Finalizar Agendamento'}
        </button>
      </form>
    </div>
  );

  const renderConfirmation = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h3>
      <p className="text-gray-600 mb-6">
        Seu agendamento foi realizado com sucesso. Você receberá uma confirmação via WhatsApp.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h4 className="font-semibold text-gray-900 mb-2">Detalhes do Agendamento:</h4>
        <div className="space-y-1 text-sm">
          <p><strong>Barbearia:</strong> {barbearia.nome}</p>
          <p><strong>Serviço:</strong> {selectedService?.nome}</p>
          <p><strong>Barbeiro:</strong> {selectedBarber?.nome}</p>
          <p><strong>Data:</strong> {availableDates.find(d => d.date === selectedDate)?.dayNumber}/{availableDates.find(d => d.date === selectedDate)?.month}</p>
          <p><strong>Horário:</strong> {selectedTime}</p>
          <p><strong>Valor:</strong> {selectedService ? formatCurrency(selectedService.preco) : ''}</p>
        </div>
      </div>
      
      <button
        onClick={onBack}
        className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
      >
        Voltar ao Início
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Agendar Serviço</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Informações da Barbearia */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-2xl">
                {barbearia.nome.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{barbearia.nome}</h2>
              <div className="space-y-1 text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{barbearia.nomeProprietario}</span>
                </div>
                {barbearia.telefone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{barbearia.telefone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de Passos */}
        {currentStep !== 'client' && currentStep !== 'confirmation' && renderStepIndicator()}

        {/* Conteúdo baseado no passo atual */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'date' && renderDateSelection()}
          {currentStep === 'service' && renderServiceSelection()}
          {currentStep === 'barber' && renderBarberSelection()}
          {currentStep === 'time' && renderTimeSelection()}
          {currentStep === 'summary' && renderSummary()}
          {currentStep === 'client' && renderClientForm()}
          {currentStep === 'confirmation' && renderConfirmation()}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
