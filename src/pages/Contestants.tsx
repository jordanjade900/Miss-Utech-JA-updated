import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Info, X, LogIn, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { ImageModal } from '../components/ImageModal';

interface Contestant {
  id: string;
  name: string;
  faculty: string;
  major: string;
  parish: string;
  quote: string;
  bio: string;
  image: string;
  element: 'fire' | 'water' | 'earth' | 'air';
}

export const Contestants = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const { user } = useAuth();
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Initial contestants data
  const initialContestants: Contestant[] = [
    {
      id: "5",
      name: "Kayla Lyons",
      faculty: "Faculty of Engineering and Computing",
      major: "Computing",
      parish: "St. James",
      quote: "The crown is not just about beauty, but taking up responsibility, leadership, and carrying out acts of service.",
      bio: "I am a disciplined, authentic, and goal-oriented person ready to grow into my crown.",
      image: "https://i0.wp.com/i.postimg.cc/xCzXDBTW/image.png",
      element: 'fire'
    },
    {
      id: "10",
      name: "Ronecia Clarke",
      faculty: "College of Business Administration and Management",
      major: "Tourism Management",
      parish: "Westmoreland",
      quote: "I am the Miss Utech, Ja 2026 because I am audacious.",
      bio: "A bold and driven individual with a vision for transforming the tourism landscape through cultural pride.",
      image: "https://i0.wp.com/i.postimg.cc/NFZbG312/image.png",
      element: 'fire'
    },
    {
      id: "11",
      name: "Tessanne Tyell",
      faculty: "College of Business Administration and Management",
      major: "Accounting",
      parish: "St. Elizabeth",
      quote: "I embody change, intelligence, confidence, and the true spirit of excellence.",
      bio: "I think I should be Miss UTech 2026 because I stand for the true spirit of excellence which the university represents.",
      image: "https://i0.wp.com/i.postimg.cc/KjchrgVg/image.png",
      element: 'fire'
    },
    {
      id: "6",
      name: "Lashana Green",
      faculty: "College of Business Administration and Management",
      major: "Food Services Management",
      parish: "St. Ann",
      quote: "I love to inspire other girls and I love to see when a woman has confidence.",
      bio: "I think that I’d be the perfect Miss UTech because I’d love to spread confidence and inspiration around.",
      image: "https://i0.wp.com/i.postimg.cc/gchZfLxH/image.png",
      element: 'water'
    },
    {
      id: "7",
      name: "Nastasia Barrette",
      faculty: "Faculty of Engineering and Computing",
      major: "Information Technology",
      parish: "Manchester",
      quote: "A queen is someone who carries out her duties with grace.",
      bio: "I may be a bit shy, but I am dependable and self-aware. I believe in leading through service and technical excellence.",
      image: "https://i0.wp.com/i.postimg.cc/Vkmn9sLq/image.png",
      element: 'water'
    },
    {
      id: "8",
      name: "Ottavia Bradshaw",
      faculty: "College of Business Administration and Management",
      major: "Marketing",
      parish: "Clarendon",
      quote: "I’m hard-working, talented, and capable of becoming your next leader.",
      bio: "The reason why I will be Miss UTech, 2026 is because of my dedication to the university's values and my leadership potential.",
      image: "https://i0.wp.com/i.postimg.cc/pdVQvWwH/image.png",
      element: 'water'
    },
    {
      id: "1",
      name: "Abigail Vassel",
      faculty: "College of Business Administration and Management",
      major: "Accounting",
      parish: "St. Catherine",
      quote: "I bring together a sense of resilience, intelligence and authenticity.",
      bio: "I’m not only driven to succeed, but also driven to empower other women to do their best.",
      image: "https://i0.wp.com/i.postimg.cc/pXpXggG0/image.png",
      element: 'earth'
    },
    {
      id: "3",
      name: "Aziza Notice",
      faculty: "Faculty of Engineering and Computing",
      major: "Computer Science",
      parish: "St. Andrew",
      quote: "I lead with confidence, stay grounded in my values and strive to inspire others.",
      bio: "I’m going to be your next Miss UTech Queen because I’m dedicated, hardworking and I’m committed to excellence.",
      image: "https://i0.wp.com/i.postimg.cc/P5VbtsTG/image.png",
      element: 'earth'
    },
    {
      id: "9",
      name: "Rogneilia Cameron",
      faculty: "Faculty of Engineering and Computing",
      major: "Electronical Engineering",
      parish: "Hanover",
      quote: "Just as a flower needs a solid foundation before it can bloom, I have been raised with the right foundation.",
      bio: "I believe it isn’t just one trait that makes a person fit for the crown; it is a blend of authenticity, self-respect, and strong morals.",
      image: "https://i0.wp.com/i.postimg.cc/v8KVKLYK/image.png",
      element: 'earth'
    },
    {
      id: "2",
      name: "Adrienne Gordon",
      faculty: "Faculty of The Built Environment",
      major: "Urban and Regional Planning",
      parish: "Kingston",
      quote: "I am the best fit for Miss UTech 2026 because I have realized that the construction industry has been oversaturated with males.",
      bio: "With this platform, I can better educate students, particularly females, on the different career paths in the construction industry.",
      image: "https://i0.wp.com/i.postimg.cc/tJDZ2Wgb/image.png",
      element: 'air'
    },
    {
      id: "4",
      name: "Cresia Simpson",
      faculty: "Faculty of Education and Liberal Studies",
      major: "Journalism",
      parish: "Portland",
      quote: "I believe that confidence is not perfection, but it is someone who believes in their true value and morals.",
      bio: "A passionate communicator dedicated to uncovering truth and sharing stories that matter to the community.",
      image: "https://i0.wp.com/i.postimg.cc/9Qg04c4m/image.png",
      element: 'air'
    },
    {
      id: "12",
      name: "Tianna Watches",
      faculty: "College of Business Administration and Management",
      major: "Finance and Banking",
      parish: "Trelawny",
      quote: "A queen is not someone who wears the crown just for attention.",
      bio: "I may be a bit shy, but I am dependable and self-aware. I carry out my duties with grace and financial prudence.",
      image: "https://i0.wp.com/i.postimg.cc/cC3k311j/image.png",
      element: 'air'
    }
  ];

  useEffect(() => {
    // Real-time listener for contestants
    const unsubscribe = onSnapshot(collection(db, 'contestants'), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => doc.data() as Contestant);
        setContestants(data);
      } else {
        setContestants(initialContestants);
      }
    }, (err) => {
      if (err.code === 'permission-denied') {
        setContestants(initialContestants);
      } else {
        handleFirestoreError(err, OperationType.LIST, 'contestants');
      }
    });

    return () => unsubscribe();
  }, []);

  const getElementClass = (element: string) => {
    switch (element) {
      case 'fire': return 'fire-text';
      case 'water': return 'water-text';
      case 'earth': return 'earth-text';
      case 'air': return 'text-white font-bold tracking-widest';
      default: return 'gold-text-glow';
    }
  };

  const getElementBorder = (element: string) => {
    switch (element) {
      case 'fire': return 'border-fire-main/30';
      case 'water': return 'border-water-main/30';
      case 'earth': return 'border-earth-main/30';
      case 'air': return 'border-white/30';
      default: return 'border-royal-gold/30';
    }
  };

  return (
    <div className={cn("bg-rich-black", hideHeader && "py-0")}>
      {/* Header */}
      {!hideHeader && (
        <section className="py-32 text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full element-water opacity-10"></div>
          </div>
          <div className="max-w-4xl mx-auto px-6 relative z-10">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-9xl font-serif mb-8 tracking-tighter"
              >
                THE <span className="gold-text-glow">QUEENS</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-white text-lg uppercase tracking-[0.4em]"
              >
                Elemental Majesty • Fire • Water • Earth • Air
              </motion.p>
          </div>
        </section>
      )}

      {/* Contestant Grid by Elements */}
      <section className="pb-40 px-6 space-y-32">
        {['fire', 'water', 'earth', 'air'].map((element) => {
          const elementQueens = contestants.filter(q => q.element === element);
          if (elementQueens.length === 0) return null;

          return (
            <div key={element} className="max-w-7xl mx-auto space-y-12">
              <div className="flex items-center gap-8">
                <h2 className={cn("text-4xl md:text-6xl font-serif uppercase tracking-tighter", getElementClass(element))}>
                  {element}
                </h2>
                <div className={cn("h-px flex-grow opacity-20", 
                  element === 'fire' ? 'bg-fire-main' : 
                  element === 'water' ? 'bg-water-main' : 
                  element === 'earth' ? 'bg-earth-main' : 'bg-royal-gold'
                )}></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {elementQueens.map((queen, idx) => (
                  <motion.div
                    key={queen.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: (idx % 3) * 0.1 }}
                    whileHover={{ scale: 1.02, zIndex: 40 }}
                    className={cn(
                      "relative aspect-[3/4] overflow-hidden group cursor-pointer border",
                      getElementBorder(queen.element)
                    )}
                    onClick={() => setSelectedContestant(queen)}
                  >
                    <img 
                      src={queen.image} 
                      alt={queen.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rich-black via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform">
                      <span className={cn("font-black text-[10px] uppercase tracking-[0.3em] mb-2 block", getElementClass(queen.element))}>
                        Element: {queen.element}
                      </span>
                      <h3 className="text-2xl font-serif text-white mb-4">{queen.name}</h3>
                      
                      <div className={cn("h-px w-0 group-hover:w-full transition-all duration-500 mb-4", 
                        queen.element === 'fire' ? 'bg-fire-main' : 
                        queen.element === 'water' ? 'bg-water-main' : 
                        queen.element === 'earth' ? 'bg-earth-main' : 'bg-royal-gold'
                      )}></div>
                      
                      <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-white">{queen.faculty}</span>
                        </div>
                        <Info size={16} className={cn(getElementClass(queen.element))} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Essence of Royalty Section - Element Overview */}
      <section className="py-40 bg-rich-black text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className="text-5xl md:text-7xl font-serif tracking-tighter">The Essence of <span className="gold-text-glow">Royalty</span></h2>
              <p className="text-white text-lg leading-loose uppercase tracking-widest font-light">
                Beyond the crown lies a journey of transformation. Our contestants embody the elemental forces of nature, representing the strength, grace, and intelligence of the modern Jamaican woman.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group cursor-zoom-in"
              onClick={() => setFullscreenImage('/miss-utech-group.jpeg')}
            >
              <div className="absolute -inset-10 bg-royal-gold/5 blur-[100px] rounded-full group-hover:bg-royal-gold/10 transition-colors"></div>
              <img 
                src="/miss-utech-group.jpeg" 
                alt="The Essence of Royalty" 
                className="w-full h-auto border border-white/10 relative z-10 grayscale group-hover:grayscale-0 transition-all duration-700 rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contestant Modal */}
      <AnimatePresence>
        {selectedContestant && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContestant(null)}
              className="absolute inset-0 bg-rich-black/95 backdrop-blur-xl"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-rich-black border border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10 flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedContestant(null)}
                className="absolute top-8 right-8 z-20 text-white hover:text-royal-gold transition-colors"
              >
                <X size={32} />
              </button>

              <div className="md:w-1/2 aspect-[3/4] md:aspect-auto relative overflow-hidden cursor-zoom-in" onClick={() => setFullscreenImage(selectedContestant.image)}>
                <img 
                  src={selectedContestant.image} 
                  alt={selectedContestant.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="md:w-1/2 p-12 md:p-20 space-y-12">
                <div>
                  <span className="text-royal-gold font-black text-xs tracking-[0.4em] uppercase mb-4 block">{selectedContestant.faculty}</span>
                  <h2 className="text-5xl md:text-6xl font-serif text-white tracking-tighter">{selectedContestant.name}</h2>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] font-bold text-white">
                    <div>
                      <p className="mb-2 text-royal-gold">Major</p>
                      <p className="text-white">{selectedContestant.major}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-royal-gold">Parish</p>
                      <p className="text-white">{selectedContestant.parish}</p>
                    </div>
                  </div>

                  <p className="text-2xl font-serif italic text-white leading-relaxed">
                    "{selectedContestant.quote}"
                  </p>

                  <p className="text-white leading-loose uppercase tracking-widest text-xs font-light">
                    {selectedContestant.bio}
                  </p>
                </div>

                <div className="pt-12 border-t border-white/5">
                  <button 
                    onClick={() => setSelectedContestant(null)}
                    className="w-full bg-royal-gold text-rich-black py-6 font-black text-xs tracking-[0.4em] uppercase hover:bg-gold-bright transition-all"
                  >
                    CLOSE PROFILE
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageModal 
        src={fullscreenImage} 
        onClose={() => setFullscreenImage(null)} 
      />
    </div>
  );
};
