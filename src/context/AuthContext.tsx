import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: 'admin' | 'user' | null;
  isAdmin: boolean;
  isAdminModeActive: boolean;
  setIsAdminModeActive: (active: boolean) => void;
  login: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [isAdminModeActive, setIsAdminModeActive] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            const isAdminEmail = firebaseUser.email === 'jordanjade900@gmail.com';
            let finalRole: 'admin' | 'user' = isAdminEmail ? 'admin' : 'user';
            
            if (!isAdminEmail && firebaseUser.email) {
              const adminEmailRef = doc(db, 'adminEmails', firebaseUser.email);
              const adminEmailDoc = await getDoc(adminEmailRef);
              if (adminEmailDoc.exists()) {
                finalRole = 'admin';
              }
            }

            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: finalRole
            };
            await setDoc(userRef, newUser);
            setRole(finalRole);
          } else {
            const userData = userDoc.data();
            const currentRole = userData?.role || 'user';
            setRole(currentRole);
            
            // Re-check adminEmails just in case their role in users is stale
            if (currentRole !== 'admin' && firebaseUser.email) {
              const adminEmailRef = doc(db, 'adminEmails', firebaseUser.email);
              const adminEmailDoc = await getDoc(adminEmailRef);
              if (adminEmailDoc.exists()) {
                setRole('admin');
                // Update their role in users collection
                await updateDoc(userRef, { role: 'admin' });
              }
            }
          }
        } else {
          setRole(null);
          setIsAdminModeActive(false);
        }
      } catch (err) {
        console.error("AuthContext: Error in onAuthStateChanged:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  };

  const logout = async () => {
    setIsAdminModeActive(false);
    await signOut(auth);
  };

  const isAdmin = role === 'admin' && isAdminModeActive;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      role, 
      isAdmin, 
      isAdminModeActive, 
      setIsAdminModeActive, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
