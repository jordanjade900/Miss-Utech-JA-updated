import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Eye, ShoppingCart, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { TicketPreview } from '../components/TicketPreview';

export const TicketsContact = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const { user, login, isAdmin } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);

  const handleAddToCart = (tier: any) => {
    addToCart({
      id: `${tier.event}-${tier.name}`,
      tierName: tier.name,
      price: tier.price,
      priceValue: parseInt(tier.price.replace(/[^0-9]/g, '')),
      element: tier.element
    });
    setIsCartOpen(true);
  };

  const handlePreviewClick = (tier: any) => {
    setPreviewData({
      userName: user?.displayName || 'Your Name',
      event: tier.event,
      tier: tier.name,
      price: tier.price,
      date: tier.event === "Talent Showcase" ? "March 19, 2026 • 3:30 PM" : "March 27, 2026 • 6:00 PM",
      venue: tier.event === "Talent Showcase" ? "LT 48, UTech Ja." : "Alfred Sangster Auditorium",
      ticketId: "MUT-2026-XXXX",
      element: tier.element
    });
    setIsPreviewOpen(true);
  };

  const ticketTiers = [
    {
      event: "Grand Coronation",
      name: "General/Grand Stand",
      price: "$2,000",
      perks: ["Entry to Grand Coronation", "Standard Seating", "The Essence of a Queen Experience"],
      color: "bg-earth-main/5",
      borderColor: "border-earth-main/20",
      element: "earth"
    }
  ];

  return (
    <div className={cn("bg-rich-black", hideHeader && "py-0")}>
      {/* Tickets Header */}
      {!hideHeader && (
        <section className="py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full element-earth opacity-10"></div>
          </div>
          <div className="max-w-4xl mx-auto px-6 relative z-10">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-9xl font-serif text-white mb-6 tracking-tighter"
              >
                THE <span className="gold-text-glow">TICKETS</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-white text-lg uppercase tracking-[0.4em]"
              >
                Elemental Presence • Fire • Water • Earth • Air
              </motion.p>
          </div>
        </section>
      )}

      {/* Ticket Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            {ticketTiers.map((tier, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "p-10 flex flex-col h-full border transition-all cursor-default max-w-md w-full",
                  tier.color,
                  tier.borderColor,
                  tier.element === 'air' ? "text-rich-black" : "text-white"
                )}
              >
                <div className="mb-12">
                  <span className={cn("text-[10px] uppercase tracking-[0.3em] font-black block mb-4", 
                    tier.element === 'fire' ? 'fire-text' : 
                    tier.element === 'earth' ? 'earth-text' : 
                    tier.element === 'air' ? 'text-rich-black/60' : 'text-white'
                  )}>{tier.event}</span>
                  <h3 className="text-2xl font-serif mb-6 leading-tight">{tier.name}</h3>
                  <div className="text-5xl font-serif font-black">{tier.price}</div>
                  <div className="text-[10px] uppercase tracking-widest mt-2 opacity-60">JMD / Per Person</div>
                </div>

                <ul className="space-y-6 mb-16 flex-grow">
                  {tier.perks.map((perk, i) => (
                    <li key={i} className={cn("flex items-start gap-4 text-xs uppercase tracking-widest", tier.element === 'air' ? "text-rich-black" : "text-white")}>
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1", 
                        tier.element === 'fire' ? 'bg-fire-main' : 
                        tier.element === 'earth' ? 'bg-earth-main' : 
                        tier.element === 'air' ? 'bg-rich-black' : 'bg-white'
                      )}></div>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3 mt-auto">
                  <button 
                    onClick={() => handleAddToCart(tier)}
                    className={cn(
                      "w-full py-5 font-black text-xs tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-2 group cursor-pointer relative z-20",
                      tier.element === 'fire' ? "bg-fire-main/20 text-fire-main hover:bg-fire-main hover:text-white" :
                      tier.element === 'air' ? "bg-rich-black text-white hover:bg-white hover:text-rich-black" :
                      "bg-earth-main/20 text-earth-main hover:bg-earth-main hover:text-white"
                    )}
                  >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                    ADD TO CART
                  </button>
                  <button 
                    onClick={() => handlePreviewClick(tier)}
                    className={cn(
                      "w-full py-4 border transition-all font-bold text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-2",
                      tier.element === 'air' ? "border-rich-black/20 text-rich-black hover:bg-rich-black/5" : "border-white/10 text-white hover:text-white hover:border-white/30"
                    )}
                  >
                    <Eye size={14} />
                    PREVIEW TICKET
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-32 bg-rich-black border-t border-white/5"
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-serif mb-16 text-center tracking-tighter">FREQUENTLY ASKED <span className="gold-text-glow">QUESTIONS</span></h2>
          <div className="space-y-1">
            {[
              { q: "Can I buy tickets at the door?", a: "Tickets may be available at the gate for the Grand Coronation, but we recommend buying presold tickets to save and ensure entry." },
              { q: "Is there a dress code for the event?", a: "For the Grand Coronation, we encourage elegant or semi-formal attire to match the prestige of the evening." },
              { q: "How do I become a sponsor?", a: "We welcome corporate and individual sponsors. Please contact us via the form above or email missutechmanagement@gmail.com for our sponsorship package." },
              { q: "Where can I park?", a: "Ample parking is available on the UTech Ja. campus near the Alfred Sangster Auditorium. Security will be present." },
              { q: "How do I receive my ticket?", a: "After your payment is verified by our team, your digital ticket with a unique QR code will be sent to your registered email address." }
            ].map((faq, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border border-white/10 overflow-hidden"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-10 py-8 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-serif text-xl tracking-widest">{faq.q}</span>
                  <ChevronDown className={cn("transition-transform text-royal-gold", openFaq === idx && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-white/5"
                    >
                      <div className="px-10 pb-10 text-white text-sm leading-loose uppercase tracking-widest">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      <TicketPreview 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        ticketData={previewData}
      />
    </div>
  );
};
