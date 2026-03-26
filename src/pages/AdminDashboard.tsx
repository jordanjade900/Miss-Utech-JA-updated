import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, getDoc, writeBatch, limit, where, getDocs, setDoc } from 'firebase/firestore';
import { CheckCircle2, XCircle, Clock, Search, Shield, Ticket, QrCode, ExternalLink, User, Mail, DollarSign, Database, Plus, RefreshCcw, Copy, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import emailjs from '@emailjs/browser';

import { QRScanner } from '../components/QRScanner';

export const AdminDashboard = () => {
  const { user, isAdmin, login, loading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);
  const [coronationInventory, setCoronationInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'pending' | 'issued' | 'scanner' | 'inventory' | 'manual' | 'access'>((searchParams.get('tab') as any) || 'pending');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['pending', 'issued', 'scanner', 'inventory', 'manual', 'access'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    setSearchParams({ tab });
  };

  const [adminEmails, setAdminEmails] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !isValidEmail(newAdminEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsAddingAdmin(true);
    try {
      // 1. Add to adminEmails collection
      const adminEmailRef = doc(db, 'adminEmails', newAdminEmail.toLowerCase());
      await setDoc(adminEmailRef, {
        email: newAdminEmail.toLowerCase(),
        addedBy: user?.uid,
        addedAt: serverTimestamp()
      });

      // 2. Check if user already exists and update their role
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', newAdminEmail.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          role: 'admin'
        });
      }

      setNewAdminEmail('');
      alert(`Access granted to ${newAdminEmail}`);
    } catch (err) {
      console.error("Add Admin Error:", err);
      alert(err instanceof Error ? err.message : "Failed to add admin.");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (email === 'jordanjade900@gmail.com') {
      alert("Cannot remove the primary admin.");
      return;
    }

    if (!confirm(`Are you sure you want to remove admin access for ${email}?`)) return;

    try {
      // 1. Remove from adminEmails
      await deleteDoc(doc(db, 'adminEmails', email));

      // 2. Update user role if they exist
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          role: 'user'
        });
      }

      alert(`Access removed for ${email}`);
    } catch (err) {
      console.error("Remove Admin Error:", err);
      alert("Failed to remove admin.");
    }
  };

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const [manualGuest, setManualGuest] = useState({ name: '', email: '', tier: 'General/Grand Stand', transactionRef: '' });
  const [isIssuingManual, setIsIssuingManual] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const handleManualIssue = async () => {
    if (!manualGuest.name || !manualGuest.email || !manualGuest.tier) {
      alert("Please fill in all guest details.");
      return;
    }

    setIsIssuingManual(true);
    try {
      const normalizedTier = manualGuest.tier.toLowerCase();
      const availableTicket = coronationInventory.find(t => 
        t.status === 'available' && t.tier.toLowerCase().includes(normalizedTier)
      );

      if (!availableTicket) {
        throw new Error(`No available tickets found for tier: ${manualGuest.tier}`);
      }

      const ticketId = availableTicket.code;
      const batch = writeBatch(db);

      // 1. Update Inventory
      const coronationRef = doc(db, 'coronationTickets', availableTicket.id);
      batch.update(coronationRef, {
        status: 'assigned',
        assignedTo: 'MANUAL_ISSUE',
        assignedEmail: manualGuest.email,
        assignedAt: serverTimestamp(),
        transactionRef: manualGuest.transactionRef || 'MANUAL_ISSUE'
      });

      // 2. Create Issued Ticket
      const eventName = manualGuest.tier.includes('Talent') ? 'Talent Showcase' : 'Grand Coronation';
      const eventDate = manualGuest.tier.includes('Talent') ? 'March 19, 2026' : 'March 27, 2026';
      const eventVenue = manualGuest.tier.includes('Talent') ? 'LT 48, UTech Ja.' : 'Alfred Sangster Auditorium';
      
      const ticketRef = doc(collection(db, 'issuedTickets'));
      batch.set(ticketRef, {
        userId: 'MANUAL_ISSUE',
        userName: manualGuest.name,
        userEmail: manualGuest.email,
        event: eventName,
        tier: manualGuest.tier,
        price: 0,
        date: eventDate,
        venue: eventVenue,
        ticketId: ticketId,
        element: manualGuest.tier.includes('VIP') ? 'air' : (manualGuest.tier.includes('Talent') ? 'fire' : 'earth'),
        scanned: false,
        timestamp: serverTimestamp(),
        isManual: true,
        transactionRef: manualGuest.transactionRef || 'MANUAL_ISSUE'
      });

      await batch.commit();

      // 3. Send Email
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_5jthk3n';
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_yqgrdal';
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '4AE0-fLLc78dQXOv6';

      if (SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY) {
        const emailParams = {
          to_name: manualGuest.name,
          to_email: manualGuest.email,
          user_email: manualGuest.email,
          email: manualGuest.email,
          confirmation_number: `MANUAL-${Date.now()}`,
          ticket_code: ticketId,
          qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketId}`,
          event_name: eventName,
          event_date: eventDate,
          event_time: '7:00 PM',
          event_venue: eventVenue,
          ticket_tier: manualGuest.tier,
          reply_to: 'noreply@missutech.com'
        };

        await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY);
        alert(`Success! Ticket ${ticketId} has been issued and emailed to ${manualGuest.email}`);
      } else {
        alert(`Ticket ${ticketId} issued successfully, but EmailJS is not configured to send the confirmation.`);
      }

      setManualGuest({ name: '', email: '', tier: 'VIP (Sponsored)', transactionRef: '' });
    } catch (err) {
      console.error("Manual Issue Error:", err);
      alert(err instanceof Error ? err.message : "Failed to issue ticket.");
    } finally {
      setIsIssuingManual(false);
    }
  };
  const [scanId, setScanId] = useState('');
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scannerMode, setScannerMode] = useState<'manual' | 'camera'>('manual');

  useEffect(() => {
    if (!isAdmin) return;

    const qPurchases = query(collection(db, 'ticketPurchases'));
    const unsubscribePurchases = onSnapshot(qPurchases, (snapshot) => {
      try {
        setPurchases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("AdminDashboard: Error in onSnapshot (purchases):", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'ticketPurchases');
    });

    const qTickets = query(collection(db, 'issuedTickets'));
    const unsubscribeTickets = onSnapshot(qTickets, (snapshot) => {
      try {
        setIssuedTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } catch (err) {
        console.error("AdminDashboard: Error in onSnapshot (tickets):", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'issuedTickets');
    });

    const qInventory = query(collection(db, 'coronationTickets'));
    const unsubscribeInventory = onSnapshot(qInventory, (snapshot) => {
      try {
        const sortedInventory = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a: any, b: any) => a.code.localeCompare(b.code));
        setCoronationInventory(sortedInventory);
      } catch (err) {
        console.error("AdminDashboard: Error in onSnapshot (inventory):", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'coronationTickets');
    });

    const qAdminEmails = query(collection(db, 'adminEmails'));
    const unsubscribeAdminEmails = onSnapshot(qAdminEmails, (snapshot) => {
      try {
        setAdminEmails(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("AdminDashboard: Error in onSnapshot (adminEmails):", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'adminEmails');
    });

    const qAdminUsers = query(collection(db, 'users'), where('role', '==', 'admin'));
    const unsubscribeAdminUsers = onSnapshot(qAdminUsers, (snapshot) => {
      try {
        setAdminUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("AdminDashboard: Error in onSnapshot (adminUsers):", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => {
      unsubscribePurchases();
      unsubscribeTickets();
      unsubscribeInventory();
      unsubscribeAdminEmails();
      unsubscribeAdminUsers();
    };
  }, [isAdmin]);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (purchase: any) => {
    if (processingId) return;
    setProcessingId(purchase.id);
    console.log("Starting approval for purchase:", purchase.id);

    try {
      const itemsToProcess = purchase.items || [{
        tierName: purchase.tierName,
        quantity: 1,
        price: purchase.price,
        element: purchase.tierName.includes('VIP') ? 'air' : (purchase.tierName.includes('Talent') ? 'fire' : 'earth')
      }];

      console.log("Items to process:", itemsToProcess);
      const batch = writeBatch(db);
      let currentInventory = [...coronationInventory];
      const ticketsToEmail: any[] = [];

      console.log("Inventory size:", currentInventory.length);
      if (currentInventory.length === 0) {
        const error = new Error("Coronation inventory is empty! Please initialize inventory first.");
        alert(error.message);
        setProcessingId(null);
        return;
      }

      for (const item of itemsToProcess) {
        for (let q = 0; q < item.quantity; q++) {
          const rawTier = item.tierName || purchase.tierName || 'General Admission';
          const isTalent = rawTier.toLowerCase().includes('talent');
          let ticketId = '';

          // Normalize tier names for matching
          const normalizedRawTier = rawTier.replace(/\(TEST\)/i, '').trim().toLowerCase();
          console.log(`Searching for ticket matching: "${normalizedRawTier}" (Original: "${rawTier}")`);
          
          const availableTicket = currentInventory.find(t => {
            if (t.status !== 'available') return false;
            const normalizedInventoryTier = t.tier.toLowerCase();
            
            // Direct match
            if (normalizedInventoryTier === normalizedRawTier) return true;
            
            // Special cases (more flexible)
            if (normalizedRawTier.includes('vip') && normalizedInventoryTier.includes('vip')) return true;
            if (normalizedRawTier.includes('student') && normalizedInventoryTier.includes('student')) return true;
            if (normalizedRawTier.includes('presold') && normalizedInventoryTier.includes('presold')) return true;
            if (normalizedRawTier.includes('gate') && normalizedInventoryTier.includes('gate')) return true;
            if (normalizedRawTier.includes('talent') && normalizedInventoryTier.includes('talent')) return true;
            
            // Fallback for General Admission if it's not a specific tier
            if (normalizedRawTier.includes('general') && (normalizedInventoryTier.includes('presold') || normalizedInventoryTier.includes('gate') || normalizedInventoryTier.includes('talent'))) return true;
            
            return false;
          });

          if (availableTicket) {
            ticketId = availableTicket.code;
            console.log("Found ticket in inventory:", ticketId, "for tier:", availableTicket.tier);
            
            // Mark as assigned in local copy
            availableTicket.status = 'assigned';
            
            const coronationRef = doc(db, 'coronationTickets', availableTicket.id);
            batch.update(coronationRef, {
              status: 'assigned',
              assignedTo: purchase.userId,
              assignedEmail: purchase.userEmail,
              assignedAt: serverTimestamp(),
              transactionRef: purchase.transactionRef || 'ONLINE_PURCHASE',
              screenshotUrl: purchase.screenshotUrl || null
            });
          } else if (isTalent) {
            // Fallback for Talent if not in inventory
            ticketId = `MUT-TAL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            console.log("Generated Talent ticket ID (fallback):", ticketId);
          } else {
            console.error("No matching ticket found for tier:", rawTier, "Normalized:", normalizedRawTier);
            const error = new Error(`No available ${rawTier} tickets in inventory! Please check your inventory for ${normalizedRawTier}. Available tiers: ${Array.from(new Set(currentInventory.map(t => t.tier))).join(', ')}`);
            alert(error.message);
            handleFirestoreError(error, OperationType.WRITE, 'coronationTickets');
            setProcessingId(null);
            return;
          }

          const eventName = rawTier.includes('Talent') ? 'Talent Showcase' : 'Grand Coronation';
          const eventDate = rawTier.includes('Talent') ? 'March 19, 2026' : 'March 27, 2026';
          const eventVenue = rawTier.includes('Talent') ? 'LT 48, UTech Ja.' : 'Alfred Sangster Auditorium';
          const eventTime = '7:00 PM';

          ticketsToEmail.push({
            ticketId,
            eventName,
            eventDate,
            eventVenue,
            eventTime,
            tier: rawTier
          });

          const ticketRef = doc(collection(db, 'issuedTickets'));
          batch.set(ticketRef, {
            userId: purchase.userId,
            purchaseId: purchase.id,
            userName: purchase.userName,
            userEmail: purchase.userEmail,
            event: eventName,
            tier: rawTier,
            price: item.price || purchase.price || 0,
            date: eventDate,
            venue: eventVenue,
            ticketId: ticketId,
            element: item.element || (rawTier.includes('VIP') ? 'air' : (rawTier.includes('Talent') ? 'fire' : 'earth')),
            scanned: false,
            isTest: purchase.isTest || false,
            timestamp: serverTimestamp()
          });
        }
      }

      const purchaseRef = doc(db, 'ticketPurchases', purchase.id);
      batch.update(purchaseRef, { status: 'verified' });

      console.log("Committing batch...");
      await batch.commit();
      console.log("Batch committed successfully.");

      // Send Emails via EmailJS
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_5jthk3n';
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_yqgrdal';
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '4AE0-fLLc78dQXOv6';

      console.log("EmailJS Config:", { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY: PUBLIC_KEY ? 'Present' : 'Missing' });

      if (!purchase.userEmail) {
        console.error("Recipient email is missing!", purchase);
        alert("Tickets issued, but cannot send email: Recipient email address is missing.");
        return;
      }

      if (SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY) {
        let successCount = 0;
        for (const ticket of ticketsToEmail) {
          const emailParams = {
            to_name: purchase.userName || 'Valued Guest',
            to_email: purchase.userEmail,
            user_email: purchase.userEmail,
            email: purchase.userEmail,
            confirmation_number: purchase.id,
            order_number: purchase.id,
            purchase_id: purchase.id,
            order_id: purchase.id,
            ticket_code: ticket.ticketId,
            qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticketId}`,
            event_name: ticket.eventName,
            event_date: ticket.eventDate,
            event_time: ticket.eventTime,
            event_venue: ticket.eventVenue,
            ticket_tier: ticket.tier,
            reply_to: 'noreply@missutech.com'
          };

          console.log("Sending email with params:", emailParams);

          try {
            await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY);
            successCount++;
          } catch (emailErr) {
            console.error("Failed to send email for ticket:", ticket.ticketId, emailErr);
          }
        }
        alert(`Success! Tickets issued and ${successCount} confirmation email(s) sent to ${purchase.userEmail}`);
      } else {
        console.warn("EmailJS credentials missing, skipping emails.");
        alert("Tickets issued successfully, but EmailJS is not configured.");
      }

    } catch (err) {
      console.error("Approval Error:", err);
      alert("Error during approval: " + (err instanceof Error ? err.message : String(err)));
      handleFirestoreError(err, OperationType.WRITE, 'issuedTickets');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (purchaseId: string) => {
    try {
      await updateDoc(doc(db, 'ticketPurchases', purchaseId), {
        status: 'rejected'
      });
    } catch (err) {
      console.error("Rejection error:", err);
    }
  };

  const handleScan = async (id?: string) => {
    const targetId = id || scanId;
    if (!targetId) return;
    setScanResult(null);
    
    // Check issuedTickets first
    const ticket = issuedTickets.find(t => t.ticketId === targetId);
    if (ticket) {
      if (ticket.scanned) {
        setScanResult({ status: 'already_used', ticket });
      } else {
        setScanResult({ status: 'valid', ticket });
        // Mark as scanned in issuedTickets
        await updateDoc(doc(db, 'issuedTickets', ticket.id), {
          scanned: true,
          scannedAt: serverTimestamp()
        });

        // Also update coronationTickets if it's a coronation code
        const coronationTicket = coronationInventory.find(t => t.code === targetId);
        if (coronationTicket) {
          await updateDoc(doc(db, 'coronationTickets', coronationTicket.id), {
            status: 'scanned',
            scannedAt: serverTimestamp()
          });
        }
      }
    } else {
      // Check coronationTickets directly (in case it was assigned but not yet in issuedTickets, though unlikely)
      const coronationTicket = coronationInventory.find(t => t.code === targetId);
      if (coronationTicket) {
        if (coronationTicket.status === 'scanned') {
          setScanResult({ status: 'already_used', ticket: { userName: coronationTicket.assignedEmail, tier: coronationTicket.tier, scannedAt: coronationTicket.scannedAt } });
        } else if (coronationTicket.status === 'assigned') {
          setScanResult({ status: 'valid', ticket: { userName: coronationTicket.assignedEmail, tier: coronationTicket.tier } });
          await updateDoc(doc(db, 'coronationTickets', coronationTicket.id), {
            status: 'scanned',
            scannedAt: serverTimestamp()
          });
        } else {
          setScanResult({ status: 'invalid', message: 'Ticket is available but not assigned to anyone.' });
        }
      } else {
        setScanResult({ status: 'invalid' });
      }
    }
  };

  const [isInitializing, setIsInitializing] = useState(false);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);

  const addTestTicket = async (tierName: string) => {
    if (isAddingTest) return;
    setIsAddingTest(true);
    try {
      const code = `TEST-COR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      await addDoc(collection(db, 'coronationTickets'), {
        code,
        status: 'available',
        tier: tierName,
        timestamp: serverTimestamp(),
        isTest: true,
        transactionRef: 'TEST_DATA'
      });
      alert(`Test ticket added for tier: ${tierName}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'coronationTickets');
    } finally {
      setIsAddingTest(false);
    }
  };

  const createTestPurchase = async () => {
    if (isCreatingTest || !user) return;
    setIsCreatingTest(true);
    try {
      await addDoc(collection(db, 'ticketPurchases'), {
        userId: user.uid,
        userName: user.displayName || 'Test User',
        userEmail: user.email || 'test@example.com',
        status: 'pending',
        transactionRef: 'TEST-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        screenshotUrl: 'https://picsum.photos/seed/test/400/600',
        timestamp: serverTimestamp(),
        isTest: true,
        items: [{
          tierName: 'General/Grand Stand',
          quantity: 1,
          price: 2000,
          element: 'earth'
        }],
        totalAmount: 2000
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'ticketPurchases');
    } finally {
      setIsCreatingTest(false);
    }
  };

  const initializeInventory = async () => {
    if (isInitializing) return;
    
    console.log("Initializing inventory... Current count:", coronationInventory.length);
    setIsInitializing(true);
    
    try {
      // If resetting, we need to delete existing ones first
      if (coronationInventory.length > 0) {
        console.log("Deleting existing tickets...");
        const batchSize = 400; // Use a smaller batch size to be safe
        const chunks = [];
        for (let i = 0; i < coronationInventory.length; i += batchSize) {
          chunks.push(coronationInventory.slice(i, i + batchSize));
        }
        
        for (const chunk of chunks) {
          const deleteBatch = writeBatch(db);
          chunk.forEach(t => {
            deleteBatch.delete(doc(db, 'coronationTickets', t.id));
          });
          await deleteBatch.commit();
        }
        console.log("Existing tickets deleted.");
      }

      console.log("Generating new tickets...");
      const batch = writeBatch(db);
      
      const tiers = [
        { name: 'General/Grand Stand', count: 250 }
      ];

      let ticketIndex = 0;
      for (const tier of tiers) {
        const prefix = tier.name.toLowerCase().includes('talent') ? 'TAL' : 'COR';
        for (let i = 0; i < tier.count; i++) {
          const code = `MUT-${prefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${ticketIndex.toString().padStart(3, '0')}`;
          const docRef = doc(collection(db, 'coronationTickets'));
          batch.set(docRef, {
            code,
            status: 'available',
            tier: tier.name,
            timestamp: serverTimestamp()
          });
          ticketIndex++;
        }
      }
      
      await batch.commit();
      console.log("New tickets generated successfully.");
      alert("Inventory successfully reinitialized with 250 new codes!");
    } catch (err) {
      console.error("Inventory initialization error:", err);
      handleFirestoreError(err, OperationType.WRITE, 'coronationTickets');
      alert("Error reinitializing inventory: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsInitializing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-md">
          <div className="relative inline-block">
            <Shield size={80} className="text-red-500/20 mx-auto" />
            <Shield size={40} className="text-red-500 absolute inset-0 m-auto" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-serif text-white">Access Denied</h1>
            <p className="text-white/60 uppercase tracking-widest text-[10px] font-black">Administrative privileges required to view this page.</p>
          </div>
          
          {!user ? (
            <div className="pt-4">
              <button
                onClick={login}
                className="w-full px-8 py-4 bg-royal-gold text-rich-black font-black text-xs tracking-[0.3em] uppercase hover:bg-white transition-colors"
              >
                Login as Admin
              </button>
              <p className="mt-4 text-[10px] text-white/40 uppercase tracking-widest">
                Please sign in with an authorized administrator account.
              </p>
            </div>
          ) : (
            <div className="pt-4">
              <p className="text-royal-gold text-xs font-bold tracking-widest mb-4">
                Logged in as: {user.email}
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-8 py-4 border border-white/10 text-white font-black text-xs tracking-[0.3em] uppercase hover:bg-white/5 transition-colors"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich-black pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-royal-gold">
              <Shield size={20} />
              <span className="uppercase tracking-[0.4em] text-[10px] font-black">Admin Command Center</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tighter">
              TICKET <span className="gold-text-glow">MANAGEMENT</span>
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <button
              onClick={createTestPurchase}
              disabled={isCreatingTest}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={14} />
              {isCreatingTest ? 'Creating...' : 'Create Test Purchase'}
            </button>

            {/* Desktop Tabs - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-full">
              {[
                { id: 'pending', label: 'Pending', icon: Clock },
                { id: 'issued', label: 'Issued', icon: Ticket },
                { id: 'manual', label: 'Manual', icon: Plus },
                { id: 'scanner', label: 'Scanner', icon: QrCode },
                { id: 'inventory', label: 'Inventory', icon: Database },
                { id: 'access', label: 'Access', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id 
                      ? "bg-royal-gold text-rich-black shadow-lg shadow-royal-gold/20" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {activeTab === 'pending' && (
            <div className="space-y-6">
              {purchases.filter(p => p.status === 'pending').length === 0 ? (
                <div className="bg-white/5 border border-white/10 p-20 text-center rounded-[2rem]">
                  <CheckCircle2 size={48} className="text-white/10 mx-auto mb-6" />
                  <p className="text-white uppercase tracking-widest text-xs">No pending requests at this time.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {purchases.filter(p => p.status === 'pending').map((p) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8"
                    >
                      <div className="flex items-center gap-6 flex-grow">
                        <div className="w-16 h-16 bg-royal-gold/10 rounded-full flex items-center justify-center text-royal-gold">
                          <User size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-serif text-white">{p.userName}</h3>
                          <p className="text-[10px] text-white uppercase tracking-widest">{p.userEmail}</p>
                          {p.transactionRef && (
                            <div className="flex items-center gap-2 mt-1 group/ref">
                              <span className="text-[9px] text-white uppercase tracking-widest">Ref:</span>
                              <span className="text-[10px] text-royal-gold font-mono font-bold tracking-wider">{p.transactionRef}</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(p.transactionRef);
                                  // Optional: Add a temporary success state
                                }}
                                className="opacity-0 group-hover/ref:opacity-100 p-1 text-white hover:text-royal-gold transition-all"
                                title="Copy Reference"
                              >
                                <Copy size={10} />
                              </button>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-4 mt-2">
                            {p.items ? (
                              p.items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                                  <span className="text-[10px] text-royal-gold font-black uppercase tracking-widest">{item.quantity}x {item.tierName}</span>
                                </div>
                              ))
                            ) : (
                              <>
                                <span className="text-[10px] text-royal-gold font-black uppercase tracking-widest">{p.tierName}</span>
                                <span className="text-[10px] text-white font-black uppercase tracking-widest">{p.price}</span>
                              </>
                            )}
                            {p.totalAmount && (
                              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Total: ${p.totalAmount.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setSelectedScreenshot(p.screenshotUrl)}
                          className="px-6 py-4 border border-white/10 text-white hover:text-white hover:border-white/30 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        >
                          <ExternalLink size={14} />
                          View Receipt
                        </button>
                        <button 
                          onClick={() => handleReject(p.id)}
                          className="p-4 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <XCircle size={24} />
                        </button>
                        <button 
                          onClick={() => handleApprove(p)}
                          disabled={processingId === p.id}
                          className="px-8 py-4 bg-emerald-500 text-white font-black text-[10px] tracking-[0.3em] uppercase hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                        >
                          {processingId === p.id ? 'Processing...' : 'Approve'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'issued' && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.3em] text-white border-b border-white/5">
                      <th className="pb-6 font-black">Guest</th>
                      <th className="pb-6 font-black">Ticket ID</th>
                      <th className="pb-6 font-black">Event</th>
                      <th className="pb-6 font-black">Tier</th>
                      <th className="pb-6 font-black">Status</th>
                      <th className="pb-6 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {issuedTickets.map((t) => (
                      <tr key={t.id} className="text-xs text-white">
                        <td className="py-6">
                          <p className="text-white font-bold">{t.userName}</p>
                          <p className="text-[10px] text-white">{t.userEmail}</p>
                        </td>
                        <td className="py-6 font-mono text-royal-gold">{t.ticketId}</td>
                        <td className="py-6 uppercase tracking-widest">{t.event}</td>
                        <td className="py-6 uppercase tracking-widest">{t.tier}</td>
                        <td className="py-6">
                          {t.scanned ? (
                            <span className="px-3 py-1 bg-white/10 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Scanned</span>
                          ) : (
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest">Active</span>
                          )}
                        </td>
                        <td className="py-6 text-right">
                          <button 
                            onClick={async () => {
                              if (confirm(`Delete ticket ${t.ticketId} for ${t.userName}?`)) {
                                try {
                                  await deleteDoc(doc(db, 'issuedTickets', t.id));
                                  alert("Ticket deleted.");
                                } catch (err) {
                                  console.error("Error deleting ticket:", err);
                                  alert("Failed to delete ticket.");
                                }
                              }
                            }}
                            className="p-2 text-white hover:text-red-500 transition-all"
                            title="Delete Ticket"
                          >
                            <XCircle size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="max-w-2xl mx-auto w-full space-y-12">
              <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] space-y-8">
                <div className="w-24 h-24 bg-royal-gold/10 rounded-full flex items-center justify-center text-royal-gold mx-auto">
                  <Plus size={48} />
                </div>
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-serif text-white">Manual Ticket Issue</h2>
                  <p className="text-white text-xs uppercase tracking-widest leading-loose">
                    Directly issue a ticket to a sponsor or guest. They will receive their ticket via email immediately.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white ml-4">Guest Name</label>
                    <input 
                      type="text"
                      value={manualGuest.name}
                      onChange={(e) => setManualGuest({ ...manualGuest, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-black/40 border border-white/10 px-8 py-6 text-sm tracking-widest text-white focus:outline-none focus:border-royal-gold transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white ml-4">Guest Email</label>
                    <input 
                      type="email"
                      value={manualGuest.email}
                      onChange={(e) => setManualGuest({ ...manualGuest, email: e.target.value })}
                      placeholder="e.g. guest@example.com"
                      className="w-full bg-black/40 border border-white/10 px-8 py-6 text-sm tracking-widest text-white focus:outline-none focus:border-royal-gold transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white ml-4">Ticket Tier</label>
                    <select 
                      value={manualGuest.tier}
                      onChange={(e) => setManualGuest({ ...manualGuest, tier: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 px-8 py-6 text-sm tracking-widest text-white focus:outline-none focus:border-royal-gold transition-all appearance-none"
                    >
                      {['General/Grand Stand'].map(tier => (
                        <option key={tier} value={tier} className="bg-rich-black">{tier}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white ml-4">Transaction Ref (Optional)</label>
                    <input 
                      type="text"
                      value={manualGuest.transactionRef}
                      onChange={(e) => setManualGuest({ ...manualGuest, transactionRef: e.target.value })}
                      placeholder="e.g. CASH-001 or BANK-REF"
                      className="w-full bg-black/40 border border-white/10 px-8 py-6 text-sm tracking-widest text-white focus:outline-none focus:border-royal-gold transition-all"
                    />
                  </div>

                  <button 
                    onClick={handleManualIssue}
                    disabled={isIssuingManual}
                    className="w-full py-6 bg-royal-gold text-rich-black font-black text-xs tracking-[0.4em] uppercase hover:bg-gold-bright transition-all disabled:opacity-50"
                  >
                    {isIssuingManual ? 'ISSUING TICKET...' : 'ISSUE & EMAIL TICKET'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scanner' && (
            <div className="max-w-2xl mx-auto w-full space-y-12">
              <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] space-y-8 text-center">
                <div className="w-24 h-24 bg-royal-gold/10 rounded-full flex items-center justify-center text-royal-gold mx-auto">
                  <QrCode size={48} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-serif text-white">Ticket Scanner</h2>
                  <p className="text-white text-xs uppercase tracking-widest leading-loose">
                    {scannerMode === 'camera' ? 'Point your camera at the QR code on the guest\'s ticket.' : 'Enter the Ticket ID manually to verify entry.'}
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setScannerMode('manual')}
                    className={cn(
                      "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                      scannerMode === 'manual' ? "bg-royal-gold text-rich-black" : "text-white border border-white/10"
                    )}
                  >
                    Manual Entry
                  </button>
                  <button 
                    onClick={() => setScannerMode('camera')}
                    className={cn(
                      "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                      scannerMode === 'camera' ? "bg-royal-gold text-rich-black" : "text-white border border-white/10"
                    )}
                  >
                    Camera Scan
                  </button>
                </div>

                {scannerMode === 'camera' ? (
                  <div className="pt-4">
                    <QRScanner 
                      onScanSuccess={(decodedText) => {
                        setScanId(decodedText);
                        handleScan(decodedText);
                        setScannerMode('manual'); // Switch back to manual to show result clearly
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <input 
                      type="text"
                      value={scanId}
                      onChange={(e) => setScanId(e.target.value.toUpperCase())}
                      placeholder="ENTER TICKET ID (e.g. MUT-XXXX)"
                      className="flex-grow bg-black/40 border border-white/10 px-8 py-6 text-sm font-mono tracking-widest text-white focus:outline-none focus:border-royal-gold transition-all"
                    />
                    <button 
                      onClick={() => handleScan()}
                      className="px-10 bg-royal-gold text-rich-black font-black text-xs tracking-[0.3em] uppercase hover:bg-gold-bright transition-all"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "p-12 rounded-[3rem] border text-center space-y-6",
                      scanResult.status === 'valid' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" :
                      scanResult.status === 'already_used' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                      "bg-red-500/10 border-red-500/30 text-red-500"
                    )}
                  >
                    {scanResult.status === 'valid' && (
                      <>
                        <CheckCircle2 size={64} className="mx-auto" />
                        <div className="space-y-2">
                          <h3 className="text-3xl font-serif">Access Granted</h3>
                          <p className="text-xs uppercase tracking-widest font-bold">{scanResult.ticket.userName} • {scanResult.ticket.tier}</p>
                        </div>
                      </>
                    )}
                    {scanResult.status === 'already_used' && (
                      <>
                        <Clock size={64} className="mx-auto" />
                        <div className="space-y-2">
                          <h3 className="text-3xl font-serif">Already Scanned</h3>
                          <p className="text-xs uppercase tracking-widest font-bold">Ticket was used at {new Date(scanResult.ticket.scannedAt?.toDate()).toLocaleTimeString()}</p>
                        </div>
                      </>
                    )}
                    {scanResult.status === 'invalid' && (
                      <>
                        <XCircle size={64} className="mx-auto" />
                        <div className="space-y-2">
                          <h3 className="text-3xl font-serif">Invalid Ticket</h3>
                          <p className="text-xs uppercase tracking-widest font-bold">This ID does not exist in our system.</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="max-w-4xl mx-auto w-full space-y-12">
              <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] space-y-8">
                <div className="w-24 h-24 bg-royal-gold/10 rounded-full flex items-center justify-center text-royal-gold mx-auto">
                  <Shield size={48} />
                </div>
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-serif text-white">Manage Admin Access</h2>
                  <p className="text-white text-xs uppercase tracking-widest leading-loose">
                    Grant or revoke administrative privileges by email address.
                  </p>
                </div>

                <div className="flex gap-4">
                  <input 
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Enter email to grant access"
                    className="flex-grow bg-black/40 border border-white/10 px-8 py-6 text-sm tracking-widest text-white focus:outline-none focus:border-royal-gold transition-all"
                  />
                  <button 
                    onClick={handleAddAdmin}
                    disabled={isAddingAdmin}
                    className="px-12 bg-royal-gold text-rich-black font-black text-xs tracking-[0.4em] uppercase hover:bg-gold-bright transition-all disabled:opacity-50"
                  >
                    {isAddingAdmin ? 'ADDING...' : 'GRANT ACCESS'}
                  </button>
                </div>

                <div className="space-y-8 pt-8">
                  <div className="space-y-4">
                    <h3 className="text-royal-gold uppercase tracking-[0.3em] text-[10px] font-black">Active Admin Emails</h3>
                    <div className="grid gap-4">
                      {adminEmails.length === 0 ? (
                        <p className="text-white/40 text-[10px] uppercase tracking-widest italic">No additional admins added.</p>
                      ) : (
                        adminEmails.map((admin) => (
                          <div key={admin.id} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Mail size={16} className="text-royal-gold" />
                              <span className="text-white text-xs tracking-widest">{admin.email}</span>
                            </div>
                            <button 
                              onClick={() => handleRemoveAdmin(admin.email)}
                              className="text-white/40 hover:text-red-500 transition-all"
                              title="Revoke Access"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-royal-gold uppercase tracking-[0.3em] text-[10px] font-black">Users with Admin Role</h3>
                    <div className="grid gap-4">
                      {adminUsers.map((admin) => (
                        <div key={admin.id} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <User size={16} className="text-royal-gold" />
                            <div>
                              <p className="text-white text-xs tracking-widest font-bold">{admin.displayName || 'Unnamed User'}</p>
                              <p className="text-white/60 text-[10px] tracking-widest">{admin.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-royal-gold/10 text-royal-gold rounded-full text-[8px] font-black uppercase tracking-widest">Active Admin</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white/5 border border-white/10 p-12 rounded-[3rem]">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-3xl font-serif text-white">Coronation Inventory</h2>
                  <p className="text-white text-xs uppercase tracking-widest leading-loose">
                    Manage the 250 pre-generated codes for the Grand Coronation.
                  </p>
                  <div className="flex gap-8 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-serif text-white">{coronationInventory.length}</p>
                      <p className="text-[8px] text-white uppercase tracking-widest">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-serif text-emerald-500">{coronationInventory.filter(t => t.status === 'available').length}</p>
                      <p className="text-[8px] text-white uppercase tracking-widest">Available</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-serif text-royal-gold">{coronationInventory.filter(t => t.status === 'assigned').length}</p>
                      <p className="text-[8px] text-white uppercase tracking-widest">Assigned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-serif text-white">{coronationInventory.filter(t => t.status === 'scanned').length}</p>
                      <p className="text-[8px] text-white uppercase tracking-widest">Scanned</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 items-center md:items-end">
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input 
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Search code, email or ref..."
                      className="w-full bg-black/40 border border-white/10 pl-12 pr-6 py-4 rounded-full text-xs text-white focus:outline-none focus:border-royal-gold transition-all"
                    />
                  </div>
                  <button 
                    onClick={initializeInventory}
                    disabled={isInitializing}
                    className={cn(
                      "px-10 py-5 bg-royal-gold text-rich-black font-black text-xs tracking-[0.3em] uppercase hover:bg-white transition-all rounded-full flex items-center gap-3",
                      isInitializing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isInitializing ? (
                      <>
                        <RefreshCcw size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {coronationInventory.length === 0 ? <Plus size={16} /> : <RefreshCcw size={16} />}
                        {coronationInventory.length === 0 ? 'Initialize 250 Codes' : 'Reset & Reinitialize'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tier Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {['General/Grand Stand'].map(tier => {
                  const total = coronationInventory.filter(t => t.tier === tier).length;
                  const available = coronationInventory.filter(t => t.tier === tier && t.status === 'available').length;
                  const assigned = coronationInventory.filter(t => t.tier === tier && t.status === 'assigned').length;
                  const scanned = coronationInventory.filter(t => t.tier === tier && t.status === 'scanned').length;
                  
                  return (
                    <motion.div 
                      key={tier}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6"
                    >
                      <div className="space-y-1">
                        <p className="text-[10px] text-white uppercase tracking-[0.2em] font-black">{tier}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <h4 className="text-4xl font-serif text-white">{available}</h4>
                            <span className="text-xs text-white uppercase tracking-widest">Available</span>
                          </div>
                          <button 
                            onClick={() => addTestTicket(tier)}
                            disabled={isAddingTest}
                            className="text-[8px] text-royal-gold hover:text-white uppercase tracking-widest font-black transition-colors disabled:opacity-50"
                          >
                            + Add Test
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest">
                          <span className="text-white">Utilization</span>
                          <span className="text-royal-gold">{total > 0 ? Math.round(((total - available) / total) * 100) : 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-royal-gold transition-all duration-1000"
                            style={{ width: total > 0 ? `${((total - available) / total) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div>
                          <p className="text-xl font-serif text-white">{assigned}</p>
                          <p className="text-[8px] text-white uppercase tracking-widest">Assigned</p>
                        </div>
                        <div>
                          <p className="text-xl font-serif text-white">{scanned}</p>
                          <p className="text-[8px] text-white uppercase tracking-widest">Scanned</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.3em] text-white border-b border-white/5">
                      <th className="pb-6 font-black">Code</th>
                      <th className="pb-6 font-black">Tier</th>
                      <th className="pb-6 font-black">Status</th>
                      <th className="pb-6 font-black">Assigned To</th>
                      <th className="pb-6 font-black">Transaction Ref</th>
                      <th className="pb-6 font-black">Screenshot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {coronationInventory
                      .filter(t => {
                        const search = inventorySearch.toLowerCase();
                        return (
                          t.code.toLowerCase().includes(search) ||
                          (t.assignedEmail || '').toLowerCase().includes(search) ||
                          (t.transactionRef || '').toLowerCase().includes(search)
                        );
                      })
                      .slice(0, 100).map((t) => (
                      <tr key={t.id} className="text-xs text-white">
                        <td className="py-6 font-mono text-royal-gold">{t.code}</td>
                        <td className="py-6 uppercase tracking-widest">{t.tier}</td>
                        <td className="py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                            t.status === 'available' ? "bg-emerald-500/10 text-emerald-500" :
                            t.status === 'assigned' ? "bg-royal-gold/10 text-royal-gold" :
                            "bg-white/10 text-white"
                          )}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-6">
                          {t.assignedEmail || '-'}
                        </td>
                        <td className="py-6 font-mono text-white/60">
                          {t.transactionRef || '-'}
                        </td>
                        <td className="py-6">
                          {t.screenshotUrl ? (
                            <div 
                              onClick={() => setSelectedScreenshot(t.screenshotUrl)}
                              className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-royal-gold transition-all group relative"
                            >
                              <img 
                                src={t.screenshotUrl} 
                                alt="Receipt" 
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <ExternalLink size={12} className="text-white" />
                              </div>
                            </div>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {coronationInventory.length > 50 && (
                  <p className="text-center py-6 text-[10px] text-white uppercase tracking-widest">Showing first 50 of {coronationInventory.length} codes</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedScreenshot(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedScreenshot(null)}
                className="absolute -top-12 right-0 text-white hover:text-royal-gold transition-colors flex items-center gap-2 uppercase tracking-widest text-xs font-black"
              >
                Close <XCircle size={24} />
              </button>
              <div className="w-full h-full overflow-auto rounded-2xl border border-white/10 shadow-2xl">
                <img 
                  src={selectedScreenshot} 
                  alt="Payment Receipt" 
                  className="w-full h-auto block"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
