import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ src, onClose }) => {
  React.useEffect(() => {
    if (src) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [src]);

  return (
    <AnimatePresence>
      {src && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl cursor-zoom-out"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-7xl max-h-full z-10 pointer-events-none"
          >
            <button
              onClick={onClose}
              className="absolute -top-16 right-0 text-white hover:text-royal-gold transition-colors p-2 pointer-events-auto"
            >
              <X size={32} />
            </button>
            <img
              src={src}
              alt="Fullscreen view"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
