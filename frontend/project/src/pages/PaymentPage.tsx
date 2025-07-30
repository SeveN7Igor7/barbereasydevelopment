import React, { useState } from 'react';
import { ArrowLeft, Check, Star, CreditCard, Shield, Zap } from 'lucide-react';

interface PaymentPageProps {
  onBack: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState('premium');

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$ 49',
      period: '/mês',
      description: 'Ideal para barbearias pequenas',
      features: [
        'Sistema de agendamentos',
        'Até 100 clientes',
        'Suporte por email',
        'Relatórios básicos'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 99',
      period: '/mês',
      description: 'Perfeito para barbearias em crescimento',
      features: [
        'Tudo do plano Básico',
        'WhatsApp integrado',
        'IA Assistente',
        'Clientes ilimitados',
        'Relatórios avançados',
        'Suporte prioritário'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R$ 199',
      period: '/mês',
      description: 'Para redes de barbearias',
      features: [
        'Tudo do plano Premium',
        'Múltiplas unidades',
        'API personalizada',
        'Treinamento dedicado',
        'Suporte 24/7',
        'Customizações'
      ],
      popular: false
    }
  ];

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
            <h1 className="text-2xl font-bold text-gray-900">Escolha seu Plano</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transforme sua barbearia com a <span className="text-yellow-400">BarberEasy</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para sua barbearia e comece a revolucionar 
            seu negócio hoje mesmo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg border-2 transition-all duration-300 ${
                selectedPlan === plan.id 
                  ? 'border-yellow-400 transform scale-105' 
                  : 'border-gray-200 hover:border-yellow-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Mais Popular</span>
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 mb-6 ${
                    selectedPlan === plan.id
                      ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Plano Selecionado' : 'Selecionar Plano'}
                </button>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-yellow-400" />
            <span>Finalizar Contratação</span>
          </h3>
          
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Barbearia
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Digite o nome da sua barbearia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h4>
              <div className="flex justify-between items-center mb-2">
                <span>Plano {plans.find(p => p.id === selectedPlan)?.name}</span>
                <span className="font-semibold">{plans.find(p => p.id === selectedPlan)?.price}/mês</span>
              </div>
              <div className="border-t pt-2 mt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-yellow-600">{plans.find(p => p.id === selectedPlan)?.price}/mês</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Pagamento seguro e criptografado</span>
            </div>
            
            <button
              type="submit"
              className="w-full bg-yellow-400 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <Zap className="h-5 w-5" />
              <span>Contratar Agora</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;