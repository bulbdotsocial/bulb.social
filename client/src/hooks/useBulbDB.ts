import { useState, useEffect } from 'react';
import { useP2P } from './useP2P';

// Define the OrbitDB address for the Bulb social posts database
const BULB_DB_ADDRESS = '/orbitdb/zdpuAr4P2gGQRgeKcC6NNBCLFzMnEAJgnFZX7s5MATDEqn65x';

interface BulbPost {
  imageCid: string;
  description: string;
  walletAddress: string;
  hashtags: string[];
  createdAt: string;
  _id?: string;
}

interface OrbitDocument {
  key: string;
  value: BulbPost;
  hash: string;
  address: string;
}

interface BulbDatabase {
  add(doc: BulbPost): Promise<string>;
  all(): Promise<OrbitDocument[]>;
  address: string;
}

export const useBulbDB = () => {
  const { orbitdb, isConnected } = useP2P();
  const [database, setDatabase] = useState<BulbDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<BulbPost[]>([]);

  // Initialize or open the database
  useEffect(() => {
    if (!orbitdb || !isConnected) return;

    const initDatabase = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🌌 Opening Bulb database:', BULB_DB_ADDRESS);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = await (orbitdb as any).open(BULB_DB_ADDRESS, {
          type: 'documents',
          AccessController: 'orbitdb',
          create: true,
        });

        console.log('✅ Bulb database opened:', db.address);
        setDatabase(db);

        // Load existing posts
        await loadPosts(db);

        // Listen for new posts
        db.events.on('update', async () => {
          console.log('🔄 Database updated, reloading posts...');
          await loadPosts(db);
        });

      } catch (err) {
        console.error('❌ Failed to open Bulb database:', err);
        setError(err instanceof Error ? err.message : 'Failed to open database');
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();
  }, [orbitdb, isConnected]);

  // Load posts from the database
  const loadPosts = async (db: BulbDatabase) => {
    try {
      const docs = await db.all();
      const postsData = docs.map(doc => ({
        ...doc.value,
        _id: doc.key,
      }));
      
      // Sort by creation date (newest first)
      postsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log('📄 Loaded posts from database:', postsData.length);
      setPosts(postsData);
    } catch (err) {
      console.error('❌ Failed to load posts:', err);
    }
  };

  // Add a new post to the database
  const addPost = async (post: Omit<BulbPost, '_id'>) => {
    if (!database) {
      throw new Error('Database not initialized');
    }

    try {
      console.log('📝 Adding post to database:', post);
      const hash = await database.add(post);
      console.log('✅ Post added with hash:', hash);
      
      // Reload posts to get the latest data
      await loadPosts(database);
      
      return hash;
    } catch (err) {
      console.error('❌ Failed to add post:', err);
      throw err;
    }
  };

  return {
    database,
    posts,
    isLoading,
    error,
    addPost,
    isReady: database !== null && isConnected,
  };
};
