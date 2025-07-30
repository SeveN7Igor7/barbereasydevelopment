import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BarbershopDashboard from './pages/BarbershopDashboard';
import BarbershopLoginPage from './pages/BarbershopLoginPage';
import PaymentPage from './pages/PaymentPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ClientBookingPage from './pages/ClientBookingPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    if (page !== 'barbershop') {
      setIsLoggedIn(false);
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setIsLoggedIn(false);
  };

  const handleBarbershopLogin = () => {
    setIsLoggedIn(true);
  };

  if (currentPage === 'barbershop') {
    if (!isLoggedIn) {
      return <BarbershopLoginPage onBack={handleBackToHome} onLogin={handleBarbershopLogin} />;
    }
    return <BarbershopDashboard onBack={handleBackToHome} />;
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