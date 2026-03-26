import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Droplets, Mountain, Wind, Sparkles, Shirt } from 'lucide-react';
import { ImageModal } from './ImageModal';

export type ElementType = 'fire' | 'earth' | 'water' | 'air';

interface ElementContent {
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  essence: string[];
  dresswear: string;
  animationClass: string;
  image: string;
}

const elementData: Record<ElementType, ElementContent> = {
  fire: {
    title: 'FIRE',
    icon: <Zap size={48} />,
    color: 'text-fire-main',
    description: 'The Spark of Passion. Raw energy, fierce determination, and the burning desire to leave an indelible mark on the world.',
    essence: ['Courage & Bravery', 'Creative Transformation', 'Radiant Energy'],
    dresswear: 'Expect bold reds, vibrant oranges, and shimmering golds. Look for fabrics that catch the light like dancing embers—sequins, metallic silks, and sharp, dramatic silhouettes that command immediate attention.',
    animationClass: 'ember-animation',
    image: '/fire-dress.png'
  },
  earth: {
    title: 'EARTH',
    icon: <Mountain size={48} />,
    color: 'text-earth-main',
    description: 'The Foundation of Majesty. Stability, grounded wisdom, and the enduring strength of our cultural roots.',
    essence: ['Resilience & Growth', 'Cultural Heritage', 'Unwavering Stability'],
    dresswear: 'Deep forest greens, rich terracottas, and organic browns. Textures are key—think intricate embroidery, natural linens, and structured, regal gowns that feel as if they are part of the landscape itself.',
    animationClass: 'roots-animation',
    image: '/earth-dress.png'
  },
  water: {
    title: 'WATER',
    icon: <Droplets size={48} />,
    color: 'text-water-main',
    description: 'The Fluid Grace. Flow, adaptability, and the serene transition from candidate to royalty.',
    essence: ['Intuitive Wisdom', 'Purity of Spirit', 'Graceful Adaptability'],
    dresswear: 'Shimmering blues, deep teals, and liquid silvers. Flowing silks, chiffons, and organzas that move like waves. Expect iridescent beadwork and soft, draped necklines that evoke the serenity of the ocean.',
    animationClass: 'ripple-animation',
    image: '/water-dress.png'
  },
  air: {
    title: 'AIR',
    icon: <Wind size={48} />,
    color: 'text-white',
    description: 'The Breath of Wisdom. Intellectual depth, ethereal presence, and the soaring spirit of a true queen.',
    essence: ['Clarity of Vision', 'Intellectual Freedom', 'Ethereal Elegance'],
    dresswear: 'Ethereal whites, pale lavenders, and sky blues. Light-as-air fabrics like tulle and fine lace. Look for floating veils, delicate sheer panels, and silhouettes that seem to defy gravity.',
    animationClass: 'mist-animation',
    image: '/air-dress.png'
  }
};

interface ElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ElementType | null;
}

export const ElementModal: React.FC<ElementModalProps> = ({ isOpen, onClose, type }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!type) return null;
  const content = elementData[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
          />
          
          {/* Modal Container */}
          <div className="min-h-screen flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-4xl bg-rich-black border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto ${content.animationClass}`}
            >
              {/* Left: Image */}
              <div 
                className="w-full md:w-1/2 h-[300px] md:h-auto relative overflow-hidden cursor-zoom-in"
                onClick={() => setFullscreenImage(content.image)}
              >
                <img 
                  src={content.image} 
                  alt={content.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rich-black via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-rich-black" />
              </div>

              {/* Right: Content */}
              <div className="w-full md:w-1/2 flex flex-col">
                {/* Header: Visual/Icon */}
                <div className="w-full bg-white/5 p-8 flex flex-col items-center justify-center border-b border-white/10 relative">
                  <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white hover:text-white transition-colors z-10"
                  >
                    <X size={24} />
                  </button>
                  <div className={content.color}>
                    {content.icon}
                  </div>
                  <h2 className="mt-4 text-3xl md:text-4xl font-serif font-black tracking-tighter text-white text-center">
                    {content.title}
                  </h2>
                </div>

                {/* Body: Content */}
                <div className="p-8 md:p-12 space-y-8 relative bg-black/40 backdrop-blur-sm flex-grow">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-royal-gold">
                      <Sparkles size={16} />
                      <span className="uppercase tracking-[0.3em] text-[10px] font-black">The Philosophy</span>
                    </div>
                    <p className="text-lg md:text-xl font-serif italic text-white leading-relaxed">
                      "{content.description}"
                    </p>
                  </div>

                  <div className="grid gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-royal-gold">
                        <div className="w-6 h-[1px] bg-royal-gold"></div>
                        <span className="uppercase tracking-[0.3em] text-[10px] font-black">The Essence</span>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {content.essence.map((item, i) => (
                          <li key={i} className="text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-royal-gold">
                        <Shirt size={16} />
                        <span className="uppercase tracking-[0.3em] text-[10px] font-black">Dresswear</span>
                      </div>
                      <p className="text-white text-[10px] md:text-xs leading-loose uppercase tracking-widest">
                        {content.dresswear}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <ImageModal 
            src={fullscreenImage} 
            onClose={() => setFullscreenImage(null)} 
          />
        </div>
      )}
    </AnimatePresence>
  );
};
