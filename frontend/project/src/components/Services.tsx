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
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nossas <span className="text-yellow-400">Soluções</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Oferecemos tecnologia de ponta para modernizar sua barbearia 
            e melhorar a experiência dos seus clientes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {service.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-yellow-400">
                  {service.price}
                </span>
                <span className="text-sm text-gray-500">
                  {service.duration}
                </span>
              </div>
              <button className="w-full mt-4 bg-black text-white py-2 rounded-full hover:bg-gray-800 transition-colors duration-300">
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