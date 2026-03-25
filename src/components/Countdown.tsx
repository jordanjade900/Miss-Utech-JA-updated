import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownProps {
  targetDate: string;
  label: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate, label }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, unit }: { value: number; unit: string }) => (
    <div className="flex flex-col items-center">
      <div className="text-4xl md:text-6xl font-serif font-black text-royal-gold tracking-tighter">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white mt-2 font-black">
        {unit}
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative group w-full"
    >
      <div className="bg-black/20 backdrop-blur-xl p-8 md:p-10 border border-white/10 rounded-[3rem] shadow-2xl transition-all duration-500 group-hover:bg-black/40 group-hover:border-royal-gold/30">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-8 bg-royal-gold/50"></div>
          <h3 className="text-white text-xs uppercase tracking-[0.5em] font-black">{label}</h3>
        </div>
        <div className="flex justify-between items-center gap-4 md:gap-8">
          <TimeUnit value={timeLeft.days} unit="Days" />
          <div className="text-royal-gold text-3xl md:text-4xl font-light">:</div>
          <TimeUnit value={timeLeft.hours} unit="Hours" />
          <div className="text-royal-gold text-3xl md:text-4xl font-light">:</div>
          <TimeUnit value={timeLeft.minutes} unit="Mins" />
          <div className="text-royal-gold text-3xl md:text-4xl font-light">:</div>
          <TimeUnit value={timeLeft.seconds} unit="Secs" />
        </div>
      </div>
    </motion.div>
  );
};
