import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BarbershopDashboard from './pages/BarbershopDashboard';
import BarbershopLoginPage from './pages/BarbershopLoginPage';
import PaymentPage from './pages/PaymentPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ClientBookingPage from './pages/ClientBookingPage';
import { Barbearia } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [barbeariaLogada, setBarbeariaLogada] = useState<Barbearia | null>(null);

  // Verificar se há uma sessão salva no localStorage
  useEffect(() => {
    const barbeariaData = localStorage.getItem('barbeariaLogada');
    if (barbeariaData) {
      try {
        const barbearia = JSON.parse(barbeariaData);
        setBarbeariaLogada(barbearia);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Erro ao recuperar dados da barbearia:', error);
        localStorage.removeItem('barbeariaLogada');
      }
    }
  }, []);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page !== 'barbershop') {
      // Não limpar a sessão ao navegar para outras páginas
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    // Não limpar a sessão ao voltar para home
  };

  const handleBarbershopLogin = (barbearia: Barbearia) => {
    setIsLoggedIn(true);
    setBarbeariaLogada(barbearia);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setBarbeariaLogada(null);
    localStorage.removeItem('barbeariaLogada');
    setCurrentPage('home');
  };

  if (currentPage === 'barbershop') {
    if (!isLoggedIn) {
      return <BarbershopLoginPage onBack={handleBackToHome} onLogin={handleBarbershopLogin} />;
    }
    return <BarbershopDashboard onBack={handleBackToHome} onLogout={handleLogout} barbearia={barbeariaLogada} />;
  }

  if (currentPage === 'payment') {
    return <PaymentPage onBack={handleBackToHome} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onBack={handleBackToHome} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onBack={handleBackToHome} onPageChange={handlePageChange} />;
  }

  if (currentPage === 'client-booking') {
    return <ClientBookingPage onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header onPageChange={handlePageChange} />
      <Hero />
      <Services />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;