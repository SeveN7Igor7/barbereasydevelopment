import React from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="bg-gradient-to-r from-black to-gray-900 text-white py-20 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Tecnologia & 
              <span className="text-yellow-400"> Inovação</span>
              <br />
              Para Sua Barbearia
            </h1>
            <p className="text-xl mb-8 text-gray-300 leading-relaxed">
              Revolucione sua barbearia com nossa plataforma completa de agendamentos, 
              comunicação via WhatsApp e IA integrada para barbeiros e clientes.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span>Suporte 24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-yellow-400" />
                <span>IA Integrada</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Plataforma BarberEasy"
                className="w-full h-80 object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;