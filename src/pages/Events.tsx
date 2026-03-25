import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Ticket, ChevronRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export const Events = () => {
  const events = [
    {
      id: 'showcase',
      title: "Talent Showcase",
      subtitle: "The Spark of Creativity",
      date: "Thursday, March 19, 2026",
      time: "3:30 PM – 6:30 PM",
      venue: "LT 48, UTech Ja.",
      price: "Completed",
      image: "https://picsum.photos/seed/talent-showcase/1200/600",
      description: "A vibrant display of artistic expression where our contestants showcase their unique talents, from music and dance to spoken word and dramatic performance.",
      element: "fire",
      status: "completed"
    },
    {
      id: 'coronation',
      title: "Grand Coronation",
      subtitle: "The Essence of a Queen",
      date: "Friday, March 27, 2026",
      time: "6:00 PM – 10:00 PM",
      venue: "Alfred Sangster Auditorium",
      price: "$2,000 JMD",
      image: "https://picsum.photos/seed/coronation-event-bold/1200/600",
      description: "The pinnacle of the pageant journey. A night of elegance, intelligence, and cultural pride where one queen will be crowned. Experience the red carpet, evening wear, and the final Q&A.",
      element: "earth",
      status: "upcoming",
      schedule: [
        { time: "6:00 PM", event: "Red Carpet & Cocktail Hour" },
        { time: "7:00 PM", event: "Prayer & National Anthem" },
        { time: "7:10 PM", event: "Grand Opening & Parade of Queens" },
        { time: "8:00 PM", event: "Evening Wear Competition" },
        { time: "8:45 PM", event: "Top 5 Q&A Session" },
        { time: "9:30 PM", event: "Crowning Ceremony" },
        { time: "10:00 PM", event: "Event Close" }
      ]
    }
  ];

  const [activeEvent, setActiveEvent] = useState(events[1]);

  return (
    <div className="bg-rich-black">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 border-b border-white/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className={cn("absolute inset-0 transition-all duration-1000 opacity-10", 
            activeEvent.element === 'fire' ? 'element-fire' : 'element-earth'
          )}></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-serif mb-8 text-center"
          >
            Event <span className="gold-text-glow">Details</span>
          </motion.h1>
          
          <div className="flex gap-4">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveEvent(e)}
                className={cn(
                  "px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all border",
                  activeEvent.id === e.id 
                    ? "bg-royal-gold text-rich-black border-royal-gold" 
                    : "text-white border-white/10 hover:border-white/30"
                )}
              >
                {e.title}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        key={activeEvent.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-6 py-24 space-y-24"
      >
        {/* Key Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {[
            { icon: <Calendar size={20} />, label: "Date", val: activeEvent.date },
            { icon: <Clock size={20} />, label: "Time", val: activeEvent.time },
            { icon: <MapPin size={20} />, label: "Venue", val: activeEvent.venue },
            { icon: <Ticket size={20} />, label: "Price", val: activeEvent.price }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 p-8 border border-white/10"
            >
              <div className={cn("mb-4", 
                activeEvent.element === 'fire' ? 'text-fire-main' : 'text-earth-main'
              )}>{item.icon}</div>
              <p className="text-[10px] uppercase tracking-widest text-white mb-1">{item.label}</p>
              <p className="font-bold text-sm tracking-widest">{item.val}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-24">
          {/* Schedule Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <h3 className="text-3xl font-serif mb-10 flex items-center gap-4">
                <span className={cn(
                  activeEvent.element === 'fire' ? 'text-fire-main' : 'text-earth-main'
                )}>/</span> {activeEvent.status === 'completed' ? 'The Highlights' : 'The Schedule'}
              </h3>
              
              {activeEvent.schedule ? (
                <div className="space-y-8">
                  {activeEvent.schedule.map((item, idx) => (
                    <div key={idx} className="flex gap-8 group">
                      <div className={cn("w-20 shrink-0 font-black text-sm tracking-tighter",
                        activeEvent.element === 'fire' ? 'text-fire-main' : 'text-earth-main'
                      )}>
                        {item.time}
                      </div>
                      <div className="flex-grow pb-8 border-b border-white/5">
                        <p className="text-xl font-serif text-white group-hover:text-white transition-colors">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-white text-sm uppercase tracking-widest leading-loose opacity-60">
                    The Talent Showcase was a phenomenal success! Our queens displayed incredible artistry and passion across all elements.
                  </p>
                  <div className="aspect-video bg-white/5 border border-white/10 flex items-center justify-center">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-royal-gold">Gallery Coming Soon</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Description & CTA Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className={cn("p-12 text-white border", 
              activeEvent.element === 'fire' ? 'bg-fire-main/20 border-fire-main/30' : 'bg-earth-main/20 border-earth-main/30'
            )}>
              <h3 className="text-3xl font-serif mb-6">{activeEvent.status === 'completed' ? 'A Night to Remember' : 'Experience Majesty'}</h3>
              <p className="mb-10 text-white leading-relaxed italic">"{activeEvent.description}"</p>
              
              {activeEvent.status === 'upcoming' ? (
                <button 
                  onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
                  className={cn("w-full py-5 font-black uppercase tracking-[0.3em] transition-colors text-white",
                    activeEvent.element === 'fire' ? 'bg-fire-main hover:bg-fire-glow' : 'bg-earth-main hover:bg-earth-glow'
                  )}
                >
                  SECURE TICKETS
                </button>
              ) : (
                <div className="text-center py-4 border border-white/10 bg-white/5">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Event Concluded</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
