import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, Upload, CheckCircle2, AlertCircle, Copy, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user, login } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    transactionRef: ''
  });

  const bankDetails = {
    accountNumber: "401501358",
    accountName: "UTech Marketing Seminar",
    accountType: "Savings Account",
    bankBranch: "VM UTech Branch"
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || items.length === 0) return;
    if (!formData.name || !formData.email || !formData.transactionRef) {
      setError("Please provide your name, email, and transaction reference.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // Create a single purchase record for the entire cart
      await addDoc(collection(db, 'ticketPurchases'), {
        userId: user.uid,
        userName: formData.name,
        userEmail: formData.email,
        transactionRef: formData.transactionRef,
        items: items.map(item => ({
          tierName: item.tierName,
          quantity: item.quantity,
          price: item.price,
          element: item.element
        })),
        totalAmount: total,
        status: 'pending',
        screenshotUrl: downloadUrl,
        timestamp: serverTimestamp()
      });

      setUploadSuccess(true);
      setTimeout(() => {
        clearCart();
        setIsCheckoutOpen(false);
        setUploadSuccess(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError("Failed to complete purchase. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex justify-end"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-rich-black border-l border-white/10 h-full flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-royal-gold/10 rounded-full flex items-center justify-center text-royal-gold">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-white">Your Cart</h2>
                    <p className="text-[10px] uppercase tracking-widest text-white">{items.length} Items Selected</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-white hover:text-royal-gold transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-100">
                    <ShoppingCart size={48} />
                    <p className="uppercase tracking-[0.2em] text-xs">Your cart is empty</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="group relative bg-white/5 border border-white/5 p-6 rounded-2xl transition-all hover:bg-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-royal-gold font-black mb-1 block">Ticket</span>
                          <h3 className="text-lg font-serif text-white">{item.tierName}</h3>
                          <p className="text-xs text-white uppercase tracking-widest">{item.price}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-white hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 bg-black/40 rounded-full p-1 border border-white/5">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-white">Subtotal</p>
                          <p className="text-sm font-bold text-white">${(item.priceValue * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-8 border-t border-white/5 bg-black/40 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-[0.3em] text-white">Total Amount</span>
                    <span className="text-2xl font-serif text-royal-gold">${total.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (!user) login();
                      else setIsCheckoutOpen(true);
                    }}
                    className="w-full py-6 bg-royal-gold text-rich-black font-black text-xs tracking-[0.4em] uppercase hover:bg-white transition-all rounded-full flex items-center justify-center gap-4 group"
                  >
                    PROCEED TO CHECKOUT <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-rich-black/95 backdrop-blur-xl" onClick={() => !isUploading && setIsCheckoutOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-rich-black border border-white/10 w-full max-w-2xl relative z-10 overflow-hidden rounded-3xl"
            >
              <div className="p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-royal-gold font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">Checkout</span>
                    <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tighter">Complete Your <span className="gold-text-glow">Order</span></h2>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} disabled={isUploading} className="text-white hover:text-royal-gold transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-widest text-royal-gold font-bold">Your Information</p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white mb-2 block">Full Name</label>
                          <input 
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter your full name"
                            className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:border-royal-gold outline-none transition-all rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white mb-2 block">Email Address</label>
                          <input 
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter your email"
                            className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:border-royal-gold outline-none transition-all rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white mb-2 block">Transaction Reference #</label>
                          <input 
                            type="text"
                            value={formData.transactionRef}
                            onChange={(e) => setFormData(prev => ({ ...prev, transactionRef: e.target.value.toUpperCase() }))}
                            placeholder="e.g. ABC123XYZ"
                            className="w-full bg-white/5 border border-white/10 p-4 text-sm text-white focus:border-royal-gold outline-none transition-all rounded-xl"
                          />
                          <p className="text-[9px] text-white mt-2 uppercase tracking-widest">Found on your bank's confirmation screen</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                      <p className="text-[10px] uppercase tracking-widest text-royal-gold font-bold">Transfer Details</p>
                      <div className="space-y-4">
                        {[
                          { label: "Account Number", value: bankDetails.accountNumber },
                          { label: "Account Name", value: bankDetails.accountName },
                          { label: "Bank/Branch", value: bankDetails.bankBranch }
                        ].map((detail, i) => (
                          <div key={i} className="flex justify-between items-center group">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-white">{detail.label}</p>
                              <p className="text-sm text-white font-mono">{detail.value}</p>
                            </div>
                            <button onClick={() => handleCopy(detail.value)} className="p-2 text-white hover:text-royal-gold transition-colors">
                              <Copy size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                      <p className="text-[10px] uppercase tracking-widest text-royal-gold font-bold">Order Summary</p>
                      <div className="space-y-3">
                        {items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs uppercase tracking-widest">
                            <span className="text-white">{item.quantity}x {item.tierName}</span>
                            <span className="text-white">${(item.priceValue * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Total</span>
                          <span className="text-xl font-serif text-royal-gold">${total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {uploadSuccess ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                          <CheckCircle2 size={32} className="text-emerald-500" />
                          <p className="text-xs text-white uppercase tracking-widest">Order Submitted!</p>
                        </div>
                      ) : (
                        <>
                          <input 
                            type="file" 
                            id="receipt-upload"
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button 
                            onClick={() => document.getElementById('receipt-upload')?.click()}
                            disabled={isUploading}
                            className={cn(
                              "w-full py-10 border-2 border-dashed border-white/10 hover:border-royal-gold/50 transition-all flex flex-col items-center justify-center gap-4 group rounded-2xl",
                              isUploading && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {isUploading ? (
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-gold"></div>
                            ) : (
                              <>
                                <Upload size={32} className="text-white group-hover:text-royal-gold transition-colors" />
                                <div className="text-center">
                                  <p className="text-xs font-black tracking-[0.3em] uppercase text-white">Upload Receipt</p>
                                  <p className="text-[10px] text-white uppercase tracking-widest mt-1">JPG, PNG up to 5MB</p>
                                </div>
                              </>
                            )}
                          </button>
                        </>
                      )}
                      {error && (
                        <div className="flex items-center gap-2 text-red-500 text-[10px] uppercase tracking-widest justify-center">
                          <AlertCircle size={14} />
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
