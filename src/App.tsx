import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { NavBar } from './components/ui/tubelight-navbar';
import { Home as HomeIcon, User, Calendar, Trophy, Ticket, Shield, UserCircle } from 'lucide-react';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { MyTickets } from './pages/MyTickets';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useCart } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { ShoppingCart } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageWrapper = ({ children, title }: { children: React.ReactNode, title: string }) => {
  useEffect(() => {
    document.title = `${title} | Miss UTech, Ja. 2026`;
  }, [title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

import { ErrorBoundary } from './components/ErrorBoundary';

import { RevealOverlay } from './components/RevealOverlay';

export default function App() {
  const { user, isAdmin, loading } = useAuth();
  const { itemCount, isCartOpen, setIsCartOpen } = useCart();
  const location = useLocation();
  
  console.log("App: Rendering, user:", user?.email, "isAdmin:", isAdmin, "loading:", loading);
  const navItems = [
    { name: 'Home', url: '/', icon: HomeIcon },
    { name: 'About', url: '/#about', icon: User },
    { name: 'Events', url: '/#events', icon: Calendar },
    { name: 'Contestants', url: '/#contestants', icon: Trophy },
    { name: 'Tickets', url: '/#tickets', icon: Ticket }
  ];

  if (isAdmin) {
    navItems.push({ name: 'My Tickets', url: '/my-tickets', icon: UserCircle });
  }

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RevealOverlay>
        <div className="min-h-screen flex flex-col crown-cursor">
          <NavBar items={navItems} />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <PageWrapper title="Home">
                    <Home />
                  </PageWrapper>
                } />
                <Route path="/admin" element={
                  <PageWrapper title="Admin Dashboard">
                    <AdminDashboard />
                  </PageWrapper>
                } />
                <Route path="/my-tickets" element={
                  <PageWrapper title="My Tickets">
                    <MyTickets />
                  </PageWrapper>
                } />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </RevealOverlay>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Floating Cart Button */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.button
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, x: 20 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed top-24 right-6 z-[100] w-16 h-16 bg-royal-gold text-rich-black rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 transition-transform"
          >
            <div className="absolute -top-1 -left-1 w-6 h-6 bg-white text-rich-black rounded-full flex items-center justify-center text-[10px] font-black border-2 border-rich-black">
              {itemCount}
            </div>
            <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
