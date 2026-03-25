import React, { createContext, useContext, useState, useEffect } from 'react';

interface RevealContextType {
  isRevealed: boolean;
  setIsRevealed: (value: boolean) => void;
}

const RevealContext = createContext<RevealContextType | undefined>(undefined);

export const RevealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <RevealContext.Provider value={{ isRevealed, setIsRevealed }}>
      {children}
    </RevealContext.Provider>
  );
};

export const useReveal = () => {
  const context = useContext(RevealContext);
  if (context === undefined) {
    throw new Error('useReveal must be used within a RevealProvider');
  }
  return context;
};
