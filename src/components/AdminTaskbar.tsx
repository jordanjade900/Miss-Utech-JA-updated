import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Ticket, Plus, QrCode, Database, Shield, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export const AdminTaskbar = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const activeTab = searchParams.get('tab') || 'pending';

  const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'issued', label: 'Issued', icon: Ticket },
    { id: 'manual', label: 'Manual Issue', icon: Plus },
    { id: 'scanner', label: 'Scanner', icon: QrCode },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'access', label: 'Access', icon: Shield }
  ];

  const handleTabChange = (tab: string) => {
    if (location.pathname !== '/admin') {
      navigate(`/admin?tab=${tab}`);
    } else {
      setSearchParams({ tab });
    }
    setIsMenuOpen(false);
  };

  if (!isAdmin) return null;

  // Only show on mobile for all pages, or on all devices for admin pages
  // But the user said "for mobile the taskbar for admin is not showing for all the pages"
  // So let's make it a mobile-specific floating dropdown for all pages.
  
  return (
    <div className="fixed top-24 left-6 right-6 z-[60] md:hidden">
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-rich-black/80 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-3">
            {(() => {
              const active = tabs.find(t => t.id === activeTab);
              const Icon = active?.icon || Clock;
              return (
                <>
                  <Icon size={14} className="text-royal-gold" />
                  <span>Admin: {active?.label}</span>
                </>
              );
            })()}
          </div>
          <ChevronDown size={14} className={cn("transition-transform duration-300", isMenuOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-2 left-0 right-0 bg-rich-black border border-white/10 rounded-[2rem] overflow-hidden z-50 shadow-2xl backdrop-blur-xl"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all text-left hover:bg-white/5",
                      activeTab === tab.id ? "bg-royal-gold/10 text-royal-gold" : "text-white/60 hover:text-white"
                    )}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
