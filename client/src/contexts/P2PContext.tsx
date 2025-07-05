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
  connectionStage: string;
  logs: string[];
}

const P2PContext = createContext<P2PContextType>({
  helia: null,
  orbitdb: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  peersCount: 0,
  connectionStage: 'Idle',
  logs: [],
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
  const [connectionStage, setConnectionStage] = useState('Idle');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    let mounted = true;

    const initP2P = async () => {
      if (isConnecting || helia) return;

      setIsConnecting(true);
      setError(null);
      setConnectionStage('Initializing');
      addLog('🚀 Starting P2P initialization...');

      try {
        addLog('📡 Creating libp2p node...');
        setConnectionStage('Creating libp2p');

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

        addLog('🌐 Creating Helia node...');
        setConnectionStage('Creating Helia');

        // Create Helia instance
        const heliaInstance = await createHelia({
          libp2p,
          start: true
        });

        if (!mounted) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addLog(`✅ Helia node created: ${(heliaInstance as any).libp2p?.peerId?.toString()?.slice(0, 12) || 'Unknown'}`);
        setHelia(heliaInstance);
        setConnectionStage('Initializing OrbitDB');

        // Test IPFS file retrieval for debugging
        try {
          addLog('🔍 Testing local IPFS capabilities...');
          
          // Import UnixFS for file operations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { unixfs } = await import('@helia/unixfs') as any;
          const fs = unixfs(heliaInstance);
          
          // First, let's test adding content locally and then retrieving it
          addLog('📝 Testing local add/get cycle...');
          const testContent = new TextEncoder().encode('Hello from Helia local node!');
          const addedCid = await fs.addBytes(testContent);
          addLog(`📦 Added test content with CID: ${addedCid.toString()}`);
          
          // Now retrieve it back
          const chunks = [];
          for await (const chunk of fs.cat(addedCid)) {
            chunks.push(chunk);
          }
          
          const retrievedContent = new TextDecoder().decode(chunks[0]);
          addLog(`📄 Retrieved content: "${retrievedContent}"`);
          
          // Test network connectivity by trying to get peer info
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const libp2pNode = (heliaInstance as any).libp2p;
          const peerId = libp2pNode?.peerId?.toString() || 'Unknown';
          const multiaddrs = libp2pNode?.getMultiaddrs?.() || [];
          
          addLog(`🆔 Peer ID: ${peerId.slice(0, 20)}...`);
          addLog(`🌐 Listening on ${multiaddrs.length} addresses`);
          
          // Log multiaddresses for debugging
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          multiaddrs.forEach((addr: any, index: number) => {
            console.log(`Address ${index + 1}:`, addr.toString());
          });
          
          // Now try to fetch the external file (this will likely fail in browser context)
          addLog('🌍 Attempting to fetch external IPFS content...');
          const externalCid = 'QmVxyMB1S9j6Lhd2KfvZkw6WYLQeW3eLEDq3HPjXW1PHdU';
          
          // Set a timeout for the external fetch
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout after 10 seconds')), 10000)
          );
          
          const fetchPromise = (async () => {
            const externalChunks = [];
            for await (const chunk of fs.cat(externalCid)) {
              externalChunks.push(chunk);
            }
            return externalChunks;
          })();
          
          try {
            const externalChunks = await Promise.race([fetchPromise, timeoutPromise]) as Uint8Array[];
            const totalLength = externalChunks.reduce((acc: number, chunk: Uint8Array) => acc + chunk.length, 0);
            const uint8Array = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of externalChunks) {
              uint8Array.set(chunk, offset);
              offset += chunk.length;
            }
            
            const base64 = btoa(String.fromCharCode(...uint8Array));
            console.log('📄 External IPFS File Base64:', base64);
            addLog(`📄 External IPFS file retrieved! Base64 length: ${base64.length}`);
          } catch (externalError) {
            addLog(`⚠️ External IPFS fetch failed (expected in browser): ${externalError instanceof Error ? externalError.message : 'Unknown error'}`);
            console.log('ℹ️ This is normal - browsers need peers with WebSocket/WebRTC support to fetch external content');
          }
          
        } catch (ipfsError) {
          console.warn('⚠️ IPFS test failed:', ipfsError);
          addLog(`⚠️ IPFS test failed: ${ipfsError instanceof Error ? ipfsError.message : 'Unknown error'}`);
        }

        // Import OrbitDB dynamically to avoid build issues
        addLog('🌌 Loading OrbitDB...');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { createOrbitDB } = await import('@orbitdb/core') as any;

        // Create OrbitDB instance
        addLog('🗄️ Creating OrbitDB instance...');
        const orbitdbInstance = await createOrbitDB({
          ipfs: heliaInstance,
        //   id: 'bulb-social-' + Date.now(), // Unique instance ID
        });

        const db = await orbitdbInstance.open("/orbitdb/zdpuAr4P2gGQRgeKcC6NNBCLFzMnEAJgnFZX7s5MATDEqn65x");
        console.log('OrbitDB opened:', db);
        addLog(`🗄️ OrbitDB opened: ${db}`);

        if (!mounted) return;

        addLog(`✅ OrbitDB created: ${orbitdbInstance.id.slice(0, 12)}...`);
        setOrbitdb(orbitdbInstance);
        setIsConnected(true);
        setConnectionStage('Connected');
        addLog('🎉 P2P initialization complete!');

        // Listen for peer connections
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (heliaInstance as any).libp2p?.addEventListener('peer:connect', (event: any) => {
          addLog(`🤝 Peer connected: ${event.detail.toString().slice(0, 12)}...`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setPeersCount((heliaInstance as any).libp2p?.getPeers()?.length || 0);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (heliaInstance as any).libp2p?.addEventListener('peer:disconnect', (event: any) => {
          addLog(`👋 Peer disconnected: ${event.detail.toString().slice(0, 12)}...`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setPeersCount((heliaInstance as any).libp2p?.getPeers()?.length || 0);
        });

        // Update peers count initially
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPeersCount((heliaInstance as any).libp2p?.getPeers()?.length || 0);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize P2P';
        addLog(`❌ P2P initialization failed: ${errorMessage}`);
        if (mounted) {
          setError(errorMessage);
          setConnectionStage('Failed');
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
    connectionStage,
    logs,
  };

  return (
    <P2PContext.Provider value={value}>
      {children}
    </P2PContext.Provider>
  );
};

export default P2PProvider;
