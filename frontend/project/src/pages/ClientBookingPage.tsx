import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Scissors, Star, MapPin, Phone, Instagram, Facebook } from 'lucide-react';
import { apiService, Barbearia, Barbeiro, Servico, Cliente } from '../services/api';

interface ClientBookingPageProps {
  onBack: () => void;
}

const ClientBookingPage: React.FC<ClientBookingPageProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Barbeiro | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientData, setClientData] = useState({
    nome: '',
    telefone: ''
  });
  
  // Estados para dados da API
  const [barbearias, setBarbearias] = useState<Barbearia[]>([]);
  const [selectedBarbearia, setSelectedBarbearia] = useState<Barbearia | null>(null);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Dados fictícios da barbearia para demonstração
  const barbershop = {
    name: 'Barbearia Elite Style',
    rating: 4.9,
    address: 'Rua Augusta, 1234 - Consolação, São Paulo - SP',
    phone: '(11) 99999-8888',
    whatsapp: '(11) 99999-8888',
    instagram: '@elitestyle_barber',
    facebook: 'Elite Style Barbearia',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'A melhor barbearia de São Paulo com mais de 10 anos de tradição em cortes masculinos modernos e clássicos.',
    openHours: 'Segunda à Sábado: 09:00 - 19:00'
  };

  // Carregar dados da primeira barbearia disponível (simulação)
  useEffect(() => {
    loadBarbeariaData();
  }, []);

  const loadBarbeariaData = async () => {
    setIsLoading(true);
    try {
      // Para demonstração, vamos usar a barbearia ID 1
      const barbeariaId = 1;
      
      const [barbeiros, servicos] = await Promise.all([
        apiService.getBarbeirosByBarbearia(barbeariaId),
        apiService.getServicosByBarbearia(barbeariaId)
      ]);

      setBarbeiros(barbeiros);
      setServicos(servicos);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da barbearia');
    } finally {
      setIsLoading(false);
    }
  };

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('55')) {
      return cleaned;
    } else {
      return '55' + cleaned;
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedService || !selectedProfessional || !selectedTime || !clientData.nome || !clientData.telefone) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Criar cliente
      const cliente = await apiService.createCliente({
        nome: clientData.nome,
        telefone: formatPhone(clientData.telefone),
        barbeariaId: 1 // Para demonstração, usando barbearia ID 1
      });

      // Criar agendamento
      const dataHora = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      
      const agendamento = await apiService.createAgendamento({
        clienteId: cliente.id,
        barbeiroId: selectedProfessional.id,
        barbeariaId: 1,
        dataHora,
        nomeServico: selectedService.nome,
        precoServico: selectedService.preco,
        status: 'AGENDAMENTO_PROGRAMADO'
      });

      alert(`Agendamento realizado com sucesso! 
      
Detalhes:
- Cliente: ${cliente.nome}
- Serviço: ${selectedService.nome}
- Barbeiro: ${selectedProfessional.nome}
- Data: ${new Date(dataHora).toLocaleDateString('pt-BR')}
- Horário: ${selectedTime}
- Valor: R$ ${selectedService.preco.toFixed(2)}

Você receberá uma confirmação via WhatsApp em breve!`);
      
      onBack();
    } catch (error: any) {
      console.error('Erro ao realizar agendamento:', error);
      setError(error.message || 'Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 dias no futuro
    return maxDate.toISOString().split('T')[0];
  };

  if (isLoading && servicos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados da barbearia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <h1 className="text-2xl font-bold text-gray-900">Agendar Horário</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Informações da Barbearia */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img
                  src={barbershop.image}
                  alt={barbershop.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="md:w-2/3">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{barbershop.name}</h2>
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-gray-600">{barbershop.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{barbershop.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{barbershop.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{barbershop.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{barbershop.openHours}</span>
                  </div>
                </div>

                <div className="flex space-x-4 mt-4">
                  <div className="flex items-center space-x-1 text-pink-600">
                    <Instagram className="h-4 w-4" />
                    <span className="text-sm">{barbershop.instagram}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Facebook className="h-4 w-4" />
                    <span className="text-sm">{barbershop.facebook}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Formulário de Agendamento */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Dados do Agendamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados do Cliente */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Seus Dados</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={clientData.nome}
                    onChange={(e) => setClientData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone/WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={clientData.telefone}
                    onChange={(e) => setClientData(prev => ({ ...prev, telefone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                    placeholder="(11) 99999-9999"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Você receberá confirmação via WhatsApp
                  </p>
                </div>
              </div>

              {/* Seleção de Data e Horário */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Data e Horário</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
                    required
                  >
                    <option value="">Selecione um horário</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Seleção de Serviço */}
            <div className="mt-8">
              <h4 className="font-medium text-gray-900 mb-4">Escolha o Serviço</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicos.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedService?.id === service.id
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h5 className="font-medium text-gray-900">{service.nome}</h5>
                    <p className="text-sm text-gray-600 mt-1">{service.duracaoMin} min</p>
                    <p className="text-lg font-semibold text-yellow-600 mt-2">
                      R$ {service.preco.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Seleção de Profissional */}
            <div className="mt-8">
              <h4 className="font-medium text-gray-900 mb-4">Escolha o Profissional</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barbeiros.map((professional) => (
                  <div
                    key={professional.id}
                    onClick={() => setSelectedProfessional(professional)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProfessional?.id === professional.id
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{professional.nome}</h5>
                        <p className="text-sm text-gray-600">{professional.especialidade}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">4.8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo e Confirmação */}
            {selectedService && selectedProfessional && selectedDate && selectedTime && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Resumo do Agendamento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Serviço:</span>
                    <span className="font-medium">{selectedService.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profissional:</span>
                    <span className="font-medium">{selectedProfessional.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horário:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duração:</span>
                    <span className="font-medium">{selectedService.duracaoMin} min</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-yellow-600 pt-2 border-t">
                    <span>Total:</span>
                    <span>R$ {selectedService.preco.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Confirmação */}
            <div className="mt-8">
              <button
                onClick={handleBooking}
                disabled={isLoading || !selectedDate || !selectedService || !selectedProfessional || !selectedTime || !clientData.nome || !clientData.telefone}
                className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBookingPage;

