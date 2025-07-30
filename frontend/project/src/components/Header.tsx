import React, { useState } from 'react';
import { Menu, X, Scissors } from 'lucide-react';
import Dashboard from './Dashboard';

interface HeaderProps {
  onPageChange: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Início', href: '#home' },
    { name: 'Serviços', href: '#services' },
    { name: 'Sobre', href: '#about' },
    { name: 'Galeria', href: '#gallery' },
    { name: 'Contato', href: '#contact' },
  ];

  return (
    <header className="bg-black text-white fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold">BarberEasy</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="hover:text-yellow-400 transition-colors duration-300 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <Dashboard onPageChange={onPageChange} />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-2 hover:text-yellow-400 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="mt-4">
              <Dashboard onPageChange={onPageChange} />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;