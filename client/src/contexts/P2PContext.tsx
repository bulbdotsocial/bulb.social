import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import { createHelia, type Helia } from 'helia';
import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';

// Type definitions for OrbitDB (since it doesn't have TypeScript types)
interface OrbitDB {
  id: string;
  stop: () => Promise<void>;
}

interface P2PContextType {
  helia: Helia | null;
  orbitdb: OrbitDB | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  peersCount: number;
}

const P2PContext = createContext<P2PContextType>({
  helia: null,
  orbitdb: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  peersCount: 0,
});

export { P2PContext, type P2PContextType };

interface P2PProviderProps {
  children: ReactNode;
}

export const P2PProvider: React.FC<P2PProviderProps> = ({ children }) => {
  const [helia, setHelia] = useState<Helia | null>(null);
  const [orbitdb, setOrbitdb] = useState<OrbitDB | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peersCount, setPeersCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const initP2P = async () => {
      if (isConnecting || helia) return;

      setIsConnecting(true);
      setError(null);

      try {
        console.log('🚀 Initializing Helia node...');

        // Create libp2p node with browser-compatible transports
        const libp2p = await createLibp2p({
          addresses: {
            listen: []
          },
          transports: [
            webSockets()
          ],
          connectionEncryption: [noise()],
          streamMuxers: [yamux()]
        });

        // Create Helia instance
        const heliaInstance = await createHelia({
          libp2p,
          start: true
        });

        if (!mounted) return;

        console.log('✅ Helia node created:', heliaInstance.libp2p.peerId.toString());
        setHelia(heliaInstance);

        // Import OrbitDB dynamically to avoid build issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { createOrbitDB } = await import('@orbitdb/core') as any;

        // Create OrbitDB instance
        console.log('🌌 Initializing OrbitDB...');
        const orbitdbInstance = await createOrbitDB({
          ipfs: heliaInstance,
          id: 'bulb-social-' + Date.now(), // Unique instance ID
        });

        if (!mounted) return;

        console.log('✅ OrbitDB created:', orbitdbInstance.id);
        setOrbitdb(orbitdbInstance);
        setIsConnected(true);

        // Listen for peer connections
        heliaInstance.libp2p.addEventListener('peer:connect', (event) => {
          console.log('🤝 Peer connected:', event.detail.toString());
          setPeersCount(heliaInstance.libp2p.getPeers().length);
        });

        heliaInstance.libp2p.addEventListener('peer:disconnect', (event) => {
          console.log('👋 Peer disconnected:', event.detail.toString());
          setPeersCount(heliaInstance.libp2p.getPeers().length);
        });

        // Update peers count initially
        setPeersCount(heliaInstance.libp2p.getPeers().length);

      } catch (err) {
        console.error('❌ Failed to initialize P2P:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize P2P');
        }
      } finally {
        if (mounted) {
          setIsConnecting(false);
        }
      }
    };

    initP2P();

    return () => {
      mounted = false;
      // Cleanup will be handled by the cleanup effect below
    };
  }, [isConnecting, helia]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (helia) {
        console.log('🧹 Cleaning up Helia node...');
        helia.stop().catch(console.error);
      }
      if (orbitdb) {
        console.log('🧹 Cleaning up OrbitDB...');
        orbitdb.stop().catch(console.error);
      }
    };
  }, [helia, orbitdb]);

  const value: P2PContextType = {
    helia,
    orbitdb,
    isConnecting,
    isConnected,
    error,
    peersCount,
  };

  return (
    <P2PContext.Provider value={value}>
      {children}
    </P2PContext.Provider>
  );
};

export default P2PProvider;
