import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShaderAnimation } from './ui/shader-lines';
import { Crown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import { useReveal } from '../context/RevealContext';

interface RevealOverlayProps {
  children: React.ReactNode;
}

export const RevealOverlay: React.FC<RevealOverlayProps> = ({ children }) => {
  const { isRevealed, setIsRevealed } = useReveal();
  const [isMounted, setIsMounted] = useState(false);
  const { isAdmin, login, user, setIsAdminModeActive, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("RevealOverlay mounted");
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log("RevealOverlay: isRevealed changed to:", isRevealed);
  }, [isRevealed]);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminClick = async () => {
    console.log("Admin button clicked");
    setIsLoggingIn(true);
    try {
      const loggedInUser = await login();
      console.log("Login result:", loggedInUser ? "Success" : "Failed/Cancelled");
    } catch (err) {
      console.error("Detailed login error:", err);
      alert("Login failed. Please ensure missutechja.netlify.app is added to 'Authorized Domains' in Firebase Console.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Redirect to admin if they become admin while on this screen
  useEffect(() => {
    console.log("RevealOverlay: isAdmin changed", isAdmin, "isRevealed", isRevealed);
    if (isAdmin && !isRevealed) {
      // We don't necessarily want to auto-redirect, but we could
    }
  }, [isAdmin, isRevealed]);

  if (!isMounted) {
    console.log("RevealOverlay: Not mounted yet");
    return null;
  }

  console.log("RevealOverlay: Rendering, isRevealed:", isRevealed);

  return (
    <>
      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            key="reveal-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-rich-black overflow-hidden"
          >
          {/* Shader Background */}
          <div className="absolute inset-0 opacity-60 blur-3xl bg-rich-black">
            <ShaderAnimation />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center space-y-12 px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex justify-center"
            >
              <div className="relative">
                <Crown size={80} className="text-royal-gold" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-royal-gold blur-2xl rounded-full -z-10"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="space-y-4"
            >
              <h2 className="text-royal-gold text-xs font-black tracking-[0.5em] uppercase">
                UTech Ja. Marketing Seminar Presents
              </h2>
              <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tighter leading-none">
                THE ESSENCE <br/>
                <span className="text-royal-gold">OF A QUEEN</span> <br/>
                <span className="italic font-light text-white text-3xl md:text-4xl">2025-2026</span>
              </h1>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              onClick={() => setIsRevealed(true)}
              className="group relative px-12 py-5 border border-royal-gold/30 text-royal-gold font-black text-sm tracking-[0.4em] uppercase overflow-hidden hover:text-rich-black transition-colors duration-500"
            >
              <span className="relative z-10">ENTER THE REALM</span>
              <motion.div
                className="absolute inset-0 bg-royal-gold -z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"
              />
            </motion.button>
          </div>

          {/* Decorative Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent to-royal-gold/20" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-t from-transparent to-royal-gold/20" />
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <div
        className={cn("relative transition-opacity duration-1000", !isRevealed ? "opacity-0 pointer-events-none h-screen overflow-hidden" : "opacity-100 z-0")}
      >
        {children}
      </div>
    </>
  );
};
