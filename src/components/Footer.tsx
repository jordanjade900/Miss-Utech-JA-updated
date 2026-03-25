import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Crown, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Footer = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-rich-black text-white pt-32 pb-12 border-t border-royal-gold/10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-royal-gold/40 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
        <div className="space-y-8">
          <Link to="/" className="flex items-center gap-3">
            <Crown className="w-10 h-10 text-royal-gold" />
            <span className="text-3xl font-serif font-black tracking-tighter">
              MISS <span className="gold-text-glow">UTECH JA</span>
            </span>
          </Link>
          <p className="text-white leading-relaxed font-light text-sm uppercase tracking-widest">
            The Essence of a Queen. <br/>Celebrating Jamaican Excellence.
          </p>
          <div className="flex gap-6">
            <a href="https://instagram.com/missutechja" target="_blank" rel="noreferrer" className="text-white hover:text-royal-gold transition-colors">
              <Instagram size={24} />
            </a>
            <a href="mailto:missutechmanagement@gmail.com" className="text-white hover:text-royal-gold transition-colors">
              <Mail size={24} />
            </a>
            <a href="https://tiktok.com/@miss.utech_ja26" target="_blank" rel="noreferrer" className="text-white hover:text-royal-gold transition-colors">
              <span className="font-black text-xs tracking-tighter">TIKTOK</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-xl mb-8 text-royal-gold tracking-widest">Navigation</h4>
          <ul className="space-y-4 text-xs uppercase tracking-[0.2em] font-bold">
            <li><Link to="/" className="text-white hover:text-royal-gold transition-colors">Home</Link></li>
            <li><Link to="/#about" className="text-white hover:text-royal-gold transition-colors">About</Link></li>
            <li><Link to="/#events" className="text-white hover:text-royal-gold transition-colors">Events</Link></li>
            <li><Link to="/#contestants" className="text-white hover:text-royal-gold transition-colors">Queens</Link></li>
            <li><Link to="/#tickets" className="text-white hover:text-royal-gold transition-colors">Tickets</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-xl mb-8 text-royal-gold tracking-widest">The Events</h4>
          <ul className="space-y-6">
            <li>
              <p className="font-black text-xs uppercase tracking-widest text-white mb-1">Talent Showcase</p>
              <p className="text-xs text-white tracking-widest">March 19, 2026 | LT 48</p>
            </li>
            <li>
              <p className="font-black text-xs uppercase tracking-widest text-white mb-1">Grand Coronation</p>
              <p className="text-xs text-white tracking-widest">March 27, 2026 | ASA</p>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-xl mb-8 text-royal-gold tracking-widest">Contact</h4>
          <p className="text-xs text-white mb-6 uppercase tracking-widest leading-loose">
            For inquiries, sponsorship, or media requests, please reach out to us.
          </p>
          <a 
            href="mailto:missutechmanagement@gmail.com" 
            className="inline-block bg-white/5 border border-white/10 px-10 py-5 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-royal-gold hover:text-rich-black transition-all"
          >
            Email Management
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white text-[10px] uppercase tracking-[0.3em] font-bold">
        <p>© 2026 UTech Ja. Marketing Seminar</p>
        <div className="flex gap-12">
          <a href="#" className="hover:text-royal-gold">Privacy</a>
          <a href="#" className="hover:text-royal-gold">Terms</a>
        </div>
      </div>

      <AnimatePresence>
        {showScroll && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-12 right-12 bg-royal-gold text-rich-black p-4 rounded-none shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform z-40"
          >
            <Crown size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};
