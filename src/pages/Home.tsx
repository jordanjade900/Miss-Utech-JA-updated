import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Countdown } from '../components/Countdown';
import { cn } from '../lib/utils';
import { Calendar, MapPin, Star, Sparkles, Trophy, Music, Users, ArrowRight, Crown, Zap, Droplets, Mountain, Sparkle, Wind, Globe } from 'lucide-react';
import { Typewriter } from '../components/ui/typewriter';
import { RevealOverlay } from '../components/RevealOverlay';
import { ElementModal, ElementType } from '../components/ElementModal';
import { ImageModal } from '../components/ImageModal';

import logo from '../assets/miss-utech-logo.png';
import elementsGroup from '../assets/group-photo-elements.png';
import fireDress from '../assets/fire-dress.png';
import earthDress from '../assets/earth-dress.png';
import waterDress from '../assets/water-dress.png';
import airDress from '../assets/air-dress.png';

import { Events } from './Events';
import { Contestants } from './Contestants';
import { TicketsContact } from './TicketsContact';

export const Home = () => {
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const openElementModal = (type: ElementType) => {
    setSelectedElement(type);
    setIsModalOpen(true);
  };

  return (
    <div className="overflow-hidden bg-rich-black text-white selection:bg-royal-gold selection:text-rich-black">
      {/* Hero Section - Centered Logo Only */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center py-24 px-6 bg-black overflow-hidden">
        {/* Background Elements - Subtle and Pure Black */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div 
            animate={{ opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-royal-gold/5 blur-[150px] rounded-full"
          ></motion.div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center space-y-20">
          {/* 1. The Logo - Large and Central */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-full max-w-5xl"
          >
            <img 
              src={logo} 
              alt="Miss UTech Logo" 
              className="w-full h-auto block mx-auto"
            />
          </motion.div>
        </div>

        {/* Decorative Vertical Text */}
        <div className="absolute left-10 bottom-10 hidden xl:block">
          <p className="writing-mode-vertical rotate-180 text-xs uppercase tracking-[0.6em] text-white font-bold">
            EST. 2025 • KINGSTON, JAMAICA
          </p>
        </div>
        <div className="absolute right-10 bottom-10 hidden xl:block">
          <p className="writing-mode-vertical text-xs uppercase tracking-[0.6em] text-white font-bold">
            FIRE • WATER • EARTH • AIR
          </p>
        </div>
      </section>

      {/* Countdown Section - Dedicated space to ensure visibility */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-rich-black relative z-30"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-serif tracking-tighter mb-4">THE <span className="gold-text-glow">COUNTDOWN</span></h2>
            <div className="h-px w-24 bg-royal-gold/50 mx-auto"></div>
          </motion.div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <Countdown targetDate="2026-03-27T18:00:00" label="Grand Coronation" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* The Essence Section (About) - Moved under Countdown */}
      <section id="about" className="relative py-24 bg-rich-black overflow-hidden z-30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center text-center space-y-12 max-w-4xl"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 text-royal-gold">
                <div className="h-[1px] w-12 bg-royal-gold/30"></div>
                <span className="uppercase tracking-[0.5em] text-xs md:text-sm font-black">UTech Ja. Marketing Seminar 2025-2026</span>
                <div className="h-[1px] w-12 bg-royal-gold/30"></div>
              </div>
            </div>

            <motion.h2 
              className="text-3xl md:text-6xl font-serif font-light italic text-white leading-tight min-h-[5rem]"
            >
              <span>A Queen is born to </span>
              <Typewriter 
                text={[
                  "inspire.",
                  "lead.",
                  "grace.",
                  "empower.",
                  "reign.",
                  "shine."
                ]}
                speed={70}
                className="text-royal-gold not-italic font-black"
                waitTime={1500}
                deleteSpeed={40}
                cursorChar={"_"}
              />
            </motion.h2>

            <motion.p 
              className="text-white text-lg md:text-2xl leading-relaxed uppercase tracking-[0.2em] font-medium max-w-3xl"
            >
              Experience the elemental journey of fire, water, earth, and air. A celebration of beauty, intelligence, and cultural heritage.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-8 pt-8">
              <a 
                href="#tickets" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative px-14 py-6 bg-royal-gold text-rich-black font-black text-sm tracking-[0.4em] uppercase overflow-hidden transition-all hover:bg-white rounded-full shadow-2xl text-center min-w-[280px]"
              >
                SECURE TICKETS
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marketing Seminar Section (Additional Info) */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-rich-black text-white border-y border-white/5 relative z-30"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 bg-white/5 rounded-none flex items-center justify-center mb-8 border border-white/10"
          >
            <Globe className="text-royal-gold" size={40} />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-serif mb-8 tracking-tighter">UTech Ja. Marketing Seminar</h2>
          <p className="max-w-3xl text-white text-lg leading-relaxed mb-12 font-light uppercase tracking-widest">
            Bridging the gap between academic theory and professional practice.
          </p>
          <div className="grid md:grid-cols-3 gap-1 w-full">
            {[
              { title: "Professionalism", desc: "Executing events with the highest standards of industry excellence." },
              { title: "Innovation", desc: "Bringing fresh perspectives and creative strategies to the pageant world." },
              { title: "Community", desc: "Fostering a sense of unity and pride within the UTech Ja. family." }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 p-12 text-center"
              >
                <h4 className="text-royal-gold font-serif text-2xl mb-6 tracking-widest">{item.title}</h4>
                <p className="text-white text-sm leading-loose uppercase tracking-widest">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Events Section */}
      <div id="events">
        <Events />
      </div>

      {/* Elemental Sections - Brutalist Grid */}
      <section className="py-32 bg-rich-black relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={() => setFullscreenImage(elementsGroup)}
            className="mb-24 relative rounded-[3rem] overflow-hidden group cursor-zoom-in"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-rich-black via-rich-black/40 to-transparent z-10" />
            <img 
              src={elementsGroup} 
              alt="The Elements" 
              className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute bottom-12 left-12 z-20 max-w-2xl">
              <div className="flex items-center gap-4 text-royal-gold mb-4">
                <div className="h-[1px] w-12 bg-royal-gold"></div>
                <span className="uppercase tracking-[0.5em] text-xs font-black">The Elemental Journey</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-serif font-black tracking-tighter text-white mb-6">
                THE <span className="gold-text-glow">CONVERGENCE</span>
              </h2>
              <p className="text-white/80 text-lg md:text-xl uppercase tracking-[0.4em] leading-relaxed">
                FIRE • WATER • EARTH • AIR
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {/* Fire */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative h-[500px] bg-black/20 backdrop-blur-xl border border-white/10 overflow-hidden z-30 rounded-[3rem] shadow-2xl transition-all duration-300 hover:border-fire-main/30 cursor-pointer ember-animation"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src={fireDress} 
                  alt="Fire" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              <div className="relative z-10 p-12 h-full flex flex-col justify-end">
                <div className="absolute -right-8 -top-8 text-fire-main/10 group-hover:text-fire-main/20 transition-colors pointer-events-none">
                  <Zap size={200} />
                </div>
                <span className="text-5xl font-serif font-black text-white mb-8 block">01</span>
                <motion.h3 
                  className="text-4xl font-serif mb-6 flex items-center gap-4"
                >
                  <span className="text-fire-main">/</span> FIRE
                </motion.h3>
                <motion.p 
                  className="text-white text-xs uppercase tracking-widest leading-loose mb-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  The Spark of Passion. Raw energy, fierce determination, and the burning desire to leave an indelible mark.
                </motion.p>
                <div className="flex items-center gap-4 text-xs font-black tracking-[0.3em] uppercase group-hover:text-fire-main transition-colors">
                  EXPLORE <ArrowRight size={16} />
                </div>
              </div>
              <button 
                onClick={() => openElementModal('fire')}
                className="absolute inset-0 z-50 w-full h-full"
              ></button>
            </motion.div>

            {/* Earth */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative h-[500px] bg-black/20 backdrop-blur-xl border border-white/10 overflow-hidden z-30 rounded-[3rem] shadow-2xl transition-all duration-300 hover:border-earth-main/30 cursor-pointer roots-animation"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src={earthDress} 
                  alt="Earth" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              <div className="relative z-10 p-12 h-full flex flex-col justify-end">
                <div className="absolute -right-8 -top-8 text-earth-main/10 group-hover:text-earth-main/20 transition-colors pointer-events-none">
                  <Mountain size={200} />
                </div>
                <span className="text-5xl font-serif font-black text-white mb-8 block">02</span>
                <motion.h3 
                  className="text-4xl font-serif mb-6 flex items-center gap-4"
                >
                  <span className="text-earth-main">/</span> EARTH
                </motion.h3>
                <motion.p 
                  className="text-white text-xs uppercase tracking-widest leading-loose mb-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  The Foundation of Majesty. Stability, grounded wisdom, and the enduring strength of our cultural roots.
                </motion.p>
                <div className="flex items-center gap-4 text-xs font-black tracking-[0.3em] uppercase group-hover:text-earth-main transition-colors">
                  EXPLORE <ArrowRight size={16} />
                </div>
              </div>
              <button 
                onClick={() => openElementModal('earth')}
                className="absolute inset-0 z-50 w-full h-full"
              ></button>
            </motion.div>

            {/* Water */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative h-[500px] bg-black/20 backdrop-blur-xl border border-white/10 overflow-hidden z-30 rounded-[3rem] shadow-2xl transition-all duration-300 hover:border-water-main/30 cursor-pointer ripple-animation"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src={waterDress} 
                  alt="Water" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              <div className="relative z-10 p-12 h-full flex flex-col justify-end">
                <div className="absolute -right-8 -top-8 text-water-main/10 group-hover:text-water-main/20 transition-colors pointer-events-none">
                  <Droplets size={200} />
                </div>
                <span className="text-5xl font-serif font-black text-white mb-8 block">03</span>
                <motion.h3 
                  className="text-4xl font-serif mb-6 flex items-center gap-4"
                >
                  <span className="text-water-main">/</span> WATER
                </motion.h3>
                <motion.p 
                  className="text-white text-xs uppercase tracking-widest leading-loose mb-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  The Fluid Grace. Flow, adaptability, and the serene transition from candidate to royalty.
                </motion.p>
                <div className="flex items-center gap-4 text-xs font-black tracking-[0.3em] uppercase group-hover:text-water-main transition-colors">
                  EXPLORE <ArrowRight size={16} />
                </div>
              </div>
              <button 
                onClick={() => openElementModal('water')}
                className="absolute inset-0 z-50 w-full h-full"
              ></button>
            </motion.div>

            {/* Air */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative h-[500px] bg-black/20 backdrop-blur-xl border border-white/10 overflow-hidden z-30 rounded-[3rem] shadow-2xl transition-all duration-300 hover:border-white/30 cursor-pointer mist-animation"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src={airDress} 
                  alt="Air" 
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              <div className="relative z-10 p-12 h-full flex flex-col justify-end">
                <div className="absolute -right-8 -top-8 text-white/10 group-hover:text-white transition-colors pointer-events-none">
                  <Wind size={200} />
                </div>
                <span className="text-5xl font-serif font-black text-white mb-8 block">04</span>
                <motion.h3 
                  className="text-4xl font-serif mb-6 flex items-center gap-4"
                >
                  <span className="text-white">/</span> AIR
                </motion.h3>
                <motion.p 
                  className="text-white text-xs uppercase tracking-widest leading-loose mb-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  The Breath of Wisdom. Intellectual depth, communication, and the ethereal grace of a true queen.
                </motion.p>
                <div className="flex items-center gap-4 text-xs font-black tracking-[0.3em] uppercase group-hover:text-white transition-colors">
                  EXPLORE <ArrowRight size={16} />
                </div>
              </div>
              <button 
                onClick={() => openElementModal('air')}
                className="absolute inset-0 z-50 w-full h-full"
              ></button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contestants Section */}
      <div id="contestants">
        <Contestants />
      </div>

      {/* Tickets Section */}
      <div id="tickets">
        <TicketsContact />
      </div>

      <ElementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={selectedElement} 
      />

      <ImageModal 
        src={fullscreenImage} 
        onClose={() => setFullscreenImage(null)} 
      />
    </div>
  );
};
