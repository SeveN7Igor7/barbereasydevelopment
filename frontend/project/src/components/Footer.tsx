import React from 'react';
import { Scissors, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Scissors className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold">BarberEasy</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Renovando o mercado de barbearia com tecnologia para comprovar resultados
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-yellow-400 hover:text-black transition-colors duration-300">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Soluções</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-yellow-400 transition-colors duration-300">Sistema de Agendamentos</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors duration-300">WhatsApp Integrado</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors duration-300">IA Assistente</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors duration-300">Analytics Avançado</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Links Rápidos</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#home" className="hover:text-yellow-400 transition-colors duration-300">Início</a></li>
              <li><a href="#about" className="hover:text-yellow-400 transition-colors duration-300">Sobre</a></li>
              <li><a href="#gallery" className="hover:text-yellow-400 transition-colors duration-300">Galeria</a></li>
              <li><a href="#contact" className="hover:text-yellow-400 transition-colors duration-300">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Contato</h4>
            <ul className="space-y-3 text-gray-400">
              <li>(11) 99999-9999</li>
              <li>vendas@barbereasy.com</li>
              <li></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 BarberEasy. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;