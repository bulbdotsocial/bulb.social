import { useContext } from 'react';
import { P2PContext, type P2PContextType } from '../contexts/P2PContext';

export const useP2P = (): P2PContextType => {
  const context = useContext(P2PContext);
  if (!context) {
    throw new Error('useP2P must be used within a P2PProvider');
  }
  return context;
};
