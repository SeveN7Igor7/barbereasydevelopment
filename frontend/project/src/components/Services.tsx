import React from 'react';
import { MessageSquare, Calendar, Bot, BarChart3 } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Calendar className="h-12 w-12 text-yellow-400" />,
      title: 'Sistema de Agendamentos',
      description: 'Plataforma completa para gerenciar horários, clientes e serviços da sua barbearia.',
      price: 'A partir de R$ 49/mês',
      duration: 'Ilimitado',
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-yellow-400" />,
      title: 'WhatsApp Integrado',
      description: 'Comunicação automática via WhatsApp entre barbeiros e clientes.',
      price: 'Incluído no plano',
      duration: 'Mensagens ilimitadas',
    },
    {
      icon: <Bot className="h-12 w-12 text-yellow-400" />,
      title: 'IA Assistente',
      description: 'Inteligência artificial para auxiliar barbeiros e clientes com recomendações.',
      price: 'Premium R$ 99/mês',
      duration: 'Suporte 24/7',
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-yellow-400" />,
      title: 'Relatórios e Analytics',
      description: 'Dashboard completo com métricas de desempenho e análise de dados.',
      price: 'Incluído em todos os planos',
      duration: 'Dados em tempo real',
    },
  ];

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nossas <span className="text-yellow-400">Soluções</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Oferecemos tecnologia de ponta para modernizar sua barbearia 
            e melhorar a experiência dos seus clientes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                {service.description}
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400">
                  {service.price}
                </span>
                <span className="text-sm text-gray-500">
                  {service.duration}
                </span>
              </div>
              <button className="w-full mt-4 bg-black text-white py-2 sm:py-3 rounded-full hover:bg-gray-800 transition-colors duration-300 text-sm sm:text-base">
                Contratar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;