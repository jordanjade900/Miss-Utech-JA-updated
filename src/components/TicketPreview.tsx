import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, MapPin, User, Download, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TicketPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  autoDownload?: boolean;
  onDownloadComplete?: () => void;
  ticketData: {
    userName: string;
    event: string;
    tier: string;
    price: string;
    date: string;
    venue: string;
    ticketId: string;
    purchaseId?: string;
    element: string;
  } | null;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ 
  isOpen, 
  onClose, 
  ticketData, 
  autoDownload,
  onDownloadComplete 
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !ticketData) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0a',
        logging: false,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            
            // Helper to check if a value contains modern CSS colors
            const isModernColor = (val: string) => /oklab|oklch|color\(|lab\(|lch\(/.test(val);

            // Clean common color properties
            ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor'].forEach(prop => {
              const val = style.getPropertyValue(prop);
              if (val && isModernColor(val)) {
                // Fallback to safe colors
                if (prop === 'color') el.style.color = '#ffffff';
                else if (prop.includes('border')) el.style.borderColor = '#D4AF37';
                else el.style.backgroundColor = 'transparent';
              } else if (val) {
                // Force the computed style to inline style for html2canvas
                (el.style as any)[prop] = val;
              }
            });

            // Handle gradients and filters
            const bgImage = style.getPropertyValue('background-image');
            if (bgImage && isModernColor(bgImage)) {
              el.style.backgroundImage = 'none';
              el.style.backgroundColor = '#0a0a0a';
            }

            const filter = style.getPropertyValue('filter');
            if (filter && isModernColor(filter)) {
              el.style.filter = 'none';
            }

            // Remove backdrop-filter which is unsupported
            const backdropFilter = style.getPropertyValue('backdrop-filter') || (style as any).webkitBackdropFilter;
            if (backdropFilter) {
              el.style.backdropFilter = 'none';
              (el.style as any).webkitBackdropFilter = 'none';
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`MissUTech_Ticket_${ticketData.ticketId}.pdf`);
      if (onDownloadComplete) onDownloadComplete();
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && autoDownload && ticketData && !isGenerating) {
      // Small delay to ensure DOM is ready for capture
      const timer = setTimeout(() => {
        handleDownloadPDF();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoDownload, ticketData]);

  if (!ticketData) return null;

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'from-fire-main/20 to-fire-main/5';
      case 'earth': return 'from-earth-main/20 to-earth-main/5';
      case 'water': return 'from-water-main/20 to-water-main/5';
      case 'air': return 'from-royal-gold/20 to-royal-gold/5';
      default: return 'from-white/10 to-transparent';
    }
  };

  const getElementBorder = (element: string) => {
    switch (element) {
      case 'fire': return 'border-fire-main/30';
      case 'earth': return 'border-earth-main/30';
      case 'water': return 'border-water-main/30';
      case 'air': return 'border-royal-gold/30';
      default: return 'border-white/10';
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8",
      !isOpen && "pointer-events-none"
    )}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-pointer"
      />

      {/* Ticket Container */}
      <motion.div
        ref={ticketRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.9, y: isOpen ? 0 : 20 }}
        className="relative w-full max-w-4xl bg-rich-black border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-white transition-colors z-20"
        >
          <X size={24} />
        </button>

        {/* Left Side: Main Info */}
        <div className={cn(
          "flex-grow p-8 md:p-12 relative overflow-hidden bg-gradient-to-br",
          getElementColor(ticketData.element)
        )}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
             <Crown size={400} className="rotate-12" />
          </div>

          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-4">
              <Crown className="w-8 h-8 text-royal-gold" />
              <div className="h-px w-12 bg-royal-gold/30"></div>
              <span className="text-[10px] uppercase tracking-[0.5em] text-white font-black">Official Event Ticket</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tighter leading-none">
                {ticketData.event.split(' ')[0]} <br/>
                <span className="gold-text-glow">{ticketData.event.split(' ').slice(1).join(' ')}</span>
              </h2>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  getElementBorder(ticketData.element),
                  ticketData.element === 'fire' ? 'text-fire-main' : 
                  ticketData.element === 'earth' ? 'text-earth-main' : 
                  ticketData.element === 'water' ? 'text-water-main' : 'text-royal-gold'
                )}>
                  {ticketData.tier}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-royal-gold">
                  <User size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-black">Guest Name</span>
                </div>
                <p className="text-lg font-serif text-white">{ticketData.userName}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-royal-gold">
                  <Calendar size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-black">Date & Time</span>
                </div>
                <p className="text-lg font-serif text-white">{ticketData.date}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-royal-gold">
                  <MapPin size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-black">Venue</span>
                </div>
                <p className="text-lg font-serif text-white">{ticketData.venue}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-royal-gold">
                  <Crown size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-black">Confirmation #</span>
                </div>
                <p className="text-lg font-serif text-white">{ticketData.purchaseId || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-royal-gold">
                  <Crown size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-black">Ticket ID</span>
                </div>
                <p className="text-lg font-serif text-white">{ticketData.ticketId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: QR & Stub */}
        <div className="w-full md:w-72 bg-white/5 border-t md:border-t-0 md:border-l border-white/10 p-8 flex flex-col items-center justify-center space-y-8 relative">
          {/* Perforation Line (Visual) */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px border-l border-dashed border-white/20 -translate-x-px"></div>
          
          <div className="w-full aspect-square bg-white p-4 rounded-2xl flex items-center justify-center shadow-2xl">
            <QRCodeCanvas value={ticketData.ticketId} size={160} />
          </div>

          <div className="text-center space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white font-black">Scan at Entrance</p>
            <p className="text-xs text-royal-gold font-mono">{ticketData.ticketId}</p>
          </div>

          <button 
            className="w-full py-4 bg-royal-gold text-rich-black font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:bg-white transition-all rounded-xl disabled:opacity-50"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF
              </>
            )}
          </button>

          <p className="text-[8px] text-white uppercase tracking-widest text-center leading-loose">
            Non-transferable • Valid ID Required <br/>
            © Miss UTech Ja. 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};
