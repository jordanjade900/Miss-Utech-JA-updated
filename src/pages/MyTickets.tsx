import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, writeBatch, doc, getDocs } from 'firebase/firestore';
import { Ticket, Crown, Calendar, MapPin, Download, Eye, Info, RefreshCcw, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { TicketPreview } from '../components/TicketPreview';

export const MyTickets = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<any[]>([]);
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAutoDownloading, setIsAutoDownloading] = useState(false);
  const [hasAutoDownloaded, setHasAutoDownloaded] = useState(false);

  // Admin Clear Data States
  const [isClearingMine, setIsClearingMine] = useState(false);
  const [isClearingTest, setIsClearingTest] = useState(false);
  const [confirmClearMine, setConfirmClearMine] = useState(false);
  const [confirmClearTest, setConfirmClearTest] = useState(false);

  const clearMyTickets = async () => {
    if (isClearingMine || !user) return;
    if (!confirmClearMine) {
      setConfirmClearMine(true);
      setTimeout(() => setConfirmClearMine(false), 3000);
      return;
    }
    
    setIsClearingMine(true);
    try {
      const batch = writeBatch(db);
      
      const qIssued = query(collection(db, 'issuedTickets'), where('userId', '==', user.uid));
      const issuedSnap = await getDocs(qIssued);
      issuedSnap.forEach(doc => batch.delete(doc.ref));
      
      const qPurchases = query(collection(db, 'ticketPurchases'), where('userId', '==', user.uid));
      const purchasesSnap = await getDocs(qPurchases);
      purchasesSnap.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();
      setConfirmClearMine(false);
    } catch (err) {
      console.error("Error clearing my tickets:", err);
    } finally {
      setIsClearingMine(false);
    }
  };

  const clearTestData = async () => {
    if (isClearingTest) return;
    if (!confirmClearTest) {
      setConfirmClearTest(true);
      setTimeout(() => setConfirmClearTest(false), 3000);
      return;
    }
    
    setIsClearingTest(true);
    try {
      const batch = writeBatch(db);
      
      const qCoronation = query(collection(db, 'coronationTickets'), where('isTest', '==', true));
      const coronationSnap = await getDocs(qCoronation);
      coronationSnap.forEach(doc => batch.delete(doc.ref));
      
      const qIssued = query(collection(db, 'issuedTickets'), where('isTest', '==', true));
      const issuedSnap = await getDocs(qIssued);
      issuedSnap.forEach(doc => batch.delete(doc.ref));
      
      const qPurchases = query(collection(db, 'ticketPurchases'), where('isTest', '==', true));
      const purchasesSnap = await getDocs(qPurchases);
      purchasesSnap.forEach(doc => batch.delete(doc.ref));
      
      await batch.commit();
      setConfirmClearTest(false);
    } catch (err) {
      console.error("Error clearing test data:", err);
    } finally {
      setIsClearingTest(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Listen for issued tickets
    const ticketsQuery = query(collection(db, 'issuedTickets'), where('userId', '==', user.uid));
    const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
      try {
        const loadedTickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(loadedTickets);
        
        // Check for auto-download parameter
        const shouldAutoDownload = searchParams.get('autoDownload') === 'true';
        if (shouldAutoDownload && loadedTickets.length > 0 && !hasAutoDownloaded) {
          setHasAutoDownloaded(true);
          handleDownloadTicket(loadedTickets[0]);
          
          // Clean up URL parameter
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('autoDownload');
          setSearchParams(newParams, { replace: true });
        }
      } catch (err) {
        console.error("MyTickets: Error in onSnapshot:", err);
      }
    }, (error) => {
      console.error("MyTickets: Firestore error in onSnapshot:", error);
    });

    // Listen for pending purchases
    const purchasesQuery = query(
      collection(db, 'ticketPurchases'), 
      where('userId', '==', user.uid)
    );
    const unsubscribePurchases = onSnapshot(purchasesQuery, (snapshot) => {
      const loadedPurchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by timestamp descending
      loadedPurchases.sort((a: any, b: any) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setPendingPurchases(loadedPurchases);
      setLoading(false);
    });

    return () => {
      unsubscribeTickets();
      unsubscribePurchases();
    };
  }, [user, searchParams]);

  const handleDownloadTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsAutoDownloading(true);
    setIsPreviewOpen(true);
  };

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsAutoDownloading(false);
    setIsPreviewOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <Crown size={64} className="text-royal-gold mx-auto opacity-100" />
          <h1 className="text-4xl font-serif text-white">Please Login</h1>
          <p className="text-white uppercase tracking-widest text-xs">Login to view your tickets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich-black pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-royal-gold">
                <Ticket size={20} />
                <span className="uppercase tracking-[0.4em] text-[10px] font-black">Your Collection</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tighter">
                MY <span className="gold-text-glow">TICKETS</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {isAdmin && (
                <>
                  <button 
                    onClick={clearMyTickets}
                    disabled={isClearingMine}
                    className={cn(
                      "px-6 py-3 border rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      confirmClearMine 
                        ? "bg-red-500 border-red-500 text-white" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    <RefreshCcw size={14} className={cn(isClearingMine && "animate-spin")} />
                    {isClearingMine ? 'Clearing...' : confirmClearMine ? 'Click to Confirm' : 'Clear My Tickets'}
                  </button>

                  <button 
                    onClick={clearTestData}
                    disabled={isClearingTest}
                    className={cn(
                      "px-6 py-3 border rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      confirmClearTest 
                        ? "bg-red-500 border-red-500 text-white" 
                        : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                    )}
                  >
                    <XCircle size={14} className={cn(isClearingTest && "animate-spin")} />
                    {isClearingTest ? 'Clearing...' : confirmClearTest ? 'Click to Confirm' : 'Clear Test Data'}
                  </button>
                </>
              )}

              {tickets.length > 1 && (
                <button 
                  onClick={() => {
                    // Download first one and show message
                    handleDownloadTicket(tickets[0]);
                    alert("Downloading your first ticket. Please download the others individually using the buttons below.");
                  }}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-rich-black transition-all flex items-center gap-3 rounded-full"
                >
                  <Download size={14} />
                  Download All
                </button>
              )}
            </div>
          </div>

        {isAutoDownloading && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] bg-royal-gold text-rich-black px-6 py-3 rounded-full font-black text-[10px] tracking-[0.2em] uppercase shadow-2xl flex items-center gap-3 animate-bounce">
            <Download size={14} className="animate-pulse" />
            Preparing your ticket download...
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold"></div>
          </div>
        ) : (
          <div className="space-y-24">
            {/* Pending Purchases Section */}
            {pendingPurchases.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-grow bg-white/5"></div>
                  <h2 className="text-xl font-serif text-white uppercase tracking-[0.3em]">Pending Verification</h2>
                  <div className="h-px flex-grow bg-white/5"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pendingPurchases.map((purchase) => (
                    <motion.div
                      key={purchase.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className={cn(
                            "text-[10px] uppercase tracking-[0.3em] font-black px-2 py-1 rounded",
                            purchase.status === 'pending' ? 'bg-royal-gold/10 text-royal-gold' :
                            purchase.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-red-500/10 text-red-500'
                          )}>
                            {purchase.status}
                          </span>
                          <h3 className="text-xl font-serif text-white mt-2">Order #{purchase.id.slice(-6).toUpperCase()}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-white">Total</p>
                          <p className="text-lg font-serif text-royal-gold">${purchase.totalAmount?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {purchase.items?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-[10px] uppercase tracking-widest text-white">
                            <span>{item.quantity}x {item.tierName}</span>
                            <span>${(item.priceValue * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest text-white">Reference</span>
                          <span className="text-xs font-mono text-white">{purchase.transactionRef}</span>
                        </div>
                        {purchase.screenshotUrl && (
                          <a 
                            href={purchase.screenshotUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:text-white hover:bg-white/10 transition-all rounded-xl"
                          >
                            <Eye size={14} />
                            View Receipt
                          </a>
                        )}
                        {purchase.status === 'rejected' && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-[10px] text-red-500 uppercase tracking-widest leading-relaxed">
                              This payment was rejected. Please contact support or try again with a valid receipt.
                            </p>
                          </div>
                        )}
                      </div>

                      {purchase.status === 'pending' && (
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-royal-gold/5 rounded-full blur-2xl group-hover:bg-royal-gold/10 transition-all"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Issued Tickets Section */}
            <div className="space-y-8">
              {pendingPurchases.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="h-px flex-grow bg-white/5"></div>
                  <h2 className="text-xl font-serif text-white uppercase tracking-[0.3em]">Verified Tickets</h2>
                  <div className="h-px flex-grow bg-white/5"></div>
                </div>
              )}
              
              {tickets.length === 0 ? (
                <div className="bg-white/5 border border-white/10 p-20 text-center rounded-[3rem] space-y-8">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white">
                    <Ticket size={40} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-serif text-white">No Verified Tickets</h3>
                    <p className="text-white text-xs uppercase tracking-widest leading-loose max-w-md mx-auto">
                      {pendingPurchases.length > 0 
                        ? "Your tickets will appear here once your payment is verified."
                        : "You haven't purchased any tickets yet."}
                    </p>
                  </div>
                  {pendingPurchases.length === 0 && (
                    <a 
                      href="/#tickets" 
                      className="inline-block px-10 py-5 bg-royal-gold text-rich-black font-black text-xs tracking-[0.3em] uppercase hover:bg-white transition-all rounded-full"
                    >
                      Browse Tickets
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tickets.map((ticket, idx) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "group relative bg-white/5 border border-white/10 p-8 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/10",
                        ticket.element === 'fire' ? 'hover:border-fire-main/30' : 
                        ticket.element === 'earth' ? 'hover:border-earth-main/30' : 
                        'hover:border-royal-gold/30'
                      )}
                    >
                      <div className="flex justify-between items-start mb-12">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] uppercase tracking-[0.3em] font-black",
                              ticket.element === 'fire' ? 'text-fire-main' : 
                              ticket.element === 'earth' ? 'text-earth-main' : 'text-royal-gold'
                            )}>{ticket.tier}</span>
                            <span className="text-[10px] text-white font-black tracking-widest">• ORDER #{ticket.purchaseId?.slice(-6).toUpperCase() || 'N/A'}</span>
                          </div>
                          <h3 className="text-2xl font-serif text-white">{ticket.event}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white group-hover:text-royal-gold transition-colors">
                          <Crown size={20} />
                        </div>
                      </div>

                      <div className="space-y-4 mb-12">
                        <div className="flex items-center gap-3 text-white">
                          <Calendar size={14} />
                          <span className="text-[10px] uppercase tracking-widest font-bold">{ticket.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                          <MapPin size={14} />
                          <span className="text-[10px] uppercase tracking-widest font-bold">{ticket.venue}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleDownloadTicket(ticket)}
                          className="flex-grow py-4 bg-royal-gold text-rich-black font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={14} />
                          Download Ticket
                        </button>
                        <button 
                          className="p-4 bg-white/5 border border-white/10 text-white hover:text-royal-gold transition-all"
                          onClick={() => handleViewTicket(ticket)}
                          title="View Ticket"
                        >
                          <Eye size={16} />
                        </button>
                      </div>

                      {ticket.scanned && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white">Used</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-4 p-6 bg-royal-gold/5 border border-royal-gold/20 rounded-[2rem]">
          <Info size={20} className="text-royal-gold shrink-0 mt-1" />
          <div className="space-y-2">
            <p className="text-xs text-white font-bold uppercase tracking-widest">Verification Process</p>
            <p className="text-xs text-white leading-relaxed uppercase tracking-widest">
              Tickets appear here once your bank transfer has been verified by our team. This usually takes 24-48 hours. If your ticket hasn't appeared after 48 hours, please contact support.
            </p>
          </div>
        </div>
      </div>

      <TicketPreview 
        isOpen={isPreviewOpen} 
        onClose={() => {
          setIsPreviewOpen(false);
          setIsAutoDownloading(false);
        }} 
        ticketData={selectedTicket}
        autoDownload={isAutoDownloading}
        onDownloadComplete={() => {
          if (isAutoDownloading) {
            setIsPreviewOpen(false);
            setIsAutoDownloading(false);
          }
        }}
      />
    </div>
  );
};
