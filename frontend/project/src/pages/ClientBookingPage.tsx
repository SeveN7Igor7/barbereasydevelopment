import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, Scissors, Star, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

interface ClientBookingPageProps {
  onBack: () => void;
}

const ClientBookingPage: React.FC<ClientBookingPageProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Dados da barbearia fictícia
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

  const services = [
    { id: 'corte-simples', name: 'Corte Simples', duration: '30 min', price: 'R$ 40', description: 'Corte tradicional com acabamento' },
    { id: 'corte-premium', name: 'Corte Premium', duration: '45 min', price: 'R$ 60', description: 'Corte moderno com lavagem e finalização' },
    { id: 'barba', name: 'Barba Completa', duration: '25 min', price: 'R$ 30', description: 'Aparar, desenhar e finalizar a barba' },
    { id: 'corte-barba', name: 'Corte + Barba', duration: '60 min', price: 'R$ 80', description: 'Pacote completo com desconto especial' },
    { id: 'sobrancelha', name: 'Sobrancelha', duration: '15 min', price: 'R$ 20', description: 'Aparar e desenhar sobrancelhas' },
    { id: 'tratamento', name: 'Tratamento Capilar', duration: '40 min', price: 'R$ 70', description: 'Hidratação e tratamento do couro cabeludo' },
    { id: 'relaxamento', name: 'Relaxamento + Massagem', duration: '50 min', price: 'R$ 90', description: 'Relaxamento capilar com massagem relaxante' },
    { id: 'bigode', name: 'Bigode', duration: '15 min', price: 'R$ 15', description: 'Aparar e modelar bigode' }
  ];

  const professionals = [
    { 
      id: 'carlos', 
      name: 'Carlos Mendes', 
      rating: 4.9, 
      specialty: 'Cortes Modernos & Degradês',
      experience: '8 anos de experiência',
      description: 'Especialista em cortes modernos e degradês perfeitos'
    },
    { 
      id: 'rafael', 
      name: 'Rafael Santos', 
      rating: 4.8, 
      specialty: 'Barbas Clássicas & Bigodes',
      experience: '6 anos de experiência',
      description: 'Mestre em barbas clássicas e modelagem de bigodes'
    },
    { 
      id: 'bruno', 
      name: 'Bruno Silva', 
      rating: 4.9, 
      specialty: 'Cortes Clássicos & Tratamentos',
      experience: '10 anos de experiência',
      description: 'Especialista em cortes clássicos e tratamentos capilares'
    },
    { 
      id: 'diego', 
      name: 'Diego Costa', 
      rating: 4.7, 
      specialty: 'Cortes Infantis & Relaxamento',
      experience: '5 anos de experiência',
      description: 'Especialista em cortes infantis e técnicas de relaxamento'
    }
  ];

  // Gerar próximos 14 dias (excluindo domingos)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    let daysAdded = 0;
    let currentDay = 0;
    
    while (daysAdded < 14) {
      const date = new Date(today);
      date.setDate(today.getDate() + currentDay);
      
      // Pular domingos (0 = domingo)
      if (date.getDay() !== 0) {
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        dates.push({
          date: date.toISOString().split('T')[0],
          dayName: dayNames[date.getDay()],
          dayNumber: date.getDate(),
          month: monthNames[date.getMonth()],
          isToday: currentDay === 0,
          isSaturday: date.getDay() === 6
        });
        daysAdded++;
      }
      currentDay++;
    }
    
    return dates;
  };

  const availableDates = generateDates();

  // Horários disponíveis
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 19;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Simular disponibilidade (80% dos horários disponíveis)
        const isAvailable = Math.random() > 0.2;
        slots.push({ time, isAvailable });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleBooking = () => {
    if (!selectedDate || !selectedService || !selectedProfessional || !selectedTime) {
      alert('Por favor, selecione todos os campos obrigatórios.');
      return;
    }

    const selectedServiceData = services.find(s => s.id === selectedService);
    const selectedProfessionalData = professionals.find(p => p.id === selectedProfessional);
    const selectedDateData = availableDates.find(d => d.date === selectedDate);

    const bookingData = {
      barbershop: barbershop.name,
      service: selectedServiceData?.name,
      professional: selectedProfessionalData?.name,
      date: `${selectedDateData?.dayNumber}/${selectedDateData?.month}`,
      time: selectedTime,
      price: selectedServiceData?.price
    };

    console.log('Dados do agendamento:', bookingData);
    alert(`Agendamento confirmado!\n\nBarbearia: ${barbershop.name}\nServiço: ${selectedServiceData?.name}\nProfissional: ${selectedProfessionalData?.name}\nData: ${selectedDateData?.dayNumber}/${selectedDateData?.month}\nHorário: ${selectedTime}\nValor: ${selectedServiceData?.price}\n\nVocê receberá uma confirmação via WhatsApp!`);
    
    // Reset form
    setSelectedDate('');
    setSelectedService('');
    setSelectedProfessional('');
    setSelectedTime('');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Agendar Serviço</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">João Silva</span>
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">JS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Informações da Barbearia */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-start space-x-4">
                <img
                  src={barbershop.image}
                  alt={barbershop.name}
                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-3xl font-bold text-gray-900">{barbershop.name}</h2>
                    <div className="flex items-center space-x-1">
                      {renderStars(barbershop.rating)}
                      <span className="text-sm text-gray-600 ml-1">({barbershop.rating})</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{barbershop.description}</p>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{barbershop.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{barbershop.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{barbershop.openHours}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Siga-nos nas redes</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  <span>{barbershop.instagram}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Facebook className="h-4 w-4 text-blue-500" />
                  <span>{barbershop.facebook}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-medium">
                  📱 Confirmação via WhatsApp: {barbershop.whatsapp}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Seleção de Data */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
              <span>Escolha a Data</span>
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {availableDates.map((date) => (
                <button
                  key={date.date}
                  onClick={() => setSelectedDate(date.date)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    selectedDate === date.date
                      ? 'bg-yellow-400 text-black'
                      : date.isSaturday
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
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
            <p className="text-xs text-gray-500 mt-3">
              * Fechado aos domingos
            </p>
          </div>

          {/* Seleção de Horário */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span>Escolha o Horário</span>
            </h3>
            {!selectedDate ? (
              <p className="text-gray-500 text-center py-8">
                Selecione uma data primeiro
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={!slot.isAvailable}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTime === slot.time
                        ? 'bg-yellow-400 text-black'
                        : slot.isAvailable
                        ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Seleção de Serviço */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Scissors className="h-5 w-5 text-yellow-400" />
              <span>Escolha o Serviço</span>
            </h3>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedService === service.id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.duration}</p>
                    </div>
                    <span className="font-bold text-lg text-gray-900">{service.price}</span>
                  </div>
                  <p className="text-xs text-gray-500">{service.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Profissional */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-yellow-400" />
              <span>Escolha o Profissional</span>
            </h3>
            <div className="space-y-3">
              {professionals.map((professional) => (
                <button
                  key={professional.id}
                  onClick={() => setSelectedProfessional(professional.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedProfessional === professional.id
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-sm">
                        {professional.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{professional.name}</h4>
                      <p className="text-sm text-gray-600 font-medium">{professional.specialty}</p>
                      <p className="text-xs text-gray-500">{professional.experience}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {renderStars(professional.rating)}
                        <span className="text-xs text-gray-600">({professional.rating})</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{professional.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo e Confirmação */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Agendamento</h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Barbearia:</span>
                <span className="font-medium">{barbershop.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">
                  {selectedDate ? 
                    availableDates.find(d => d.date === selectedDate)?.dayNumber + '/' + 
                    availableDates.find(d => d.date === selectedDate)?.month 
                    : 'Não selecionada'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium">{selectedTime || 'Não selecionado'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium">
                  {selectedService ? services.find(s => s.id === selectedService)?.name : 'Não selecionado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profissional:</span>
                <span className="font-medium">
                  {selectedProfessional ? professionals.find(p => p.id === selectedProfessional)?.name : 'Não selecionado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-bold text-xl text-yellow-600">
                  {selectedService ? services.find(s => s.id === selectedService)?.price : 'R$ 0'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              <strong>📱 Confirmação:</strong> Após confirmar o agendamento, você receberá uma mensagem de confirmação via WhatsApp no número {barbershop.whatsapp} com todos os detalhes do seu agendamento.
            </p>
          </div>
          
          <button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedService || !selectedProfessional || !selectedTime}
            className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
          >
            {!selectedDate || !selectedService || !selectedProfessional || !selectedTime 
              ? 'Preencha todos os campos para continuar'
              : 'Confirmar Agendamento'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientBookingPage;