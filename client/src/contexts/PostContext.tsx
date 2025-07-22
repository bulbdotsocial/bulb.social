/**
 * Context global pour la gestion des posts
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { PostData, APIResponse, PaginatedResponse } from '../types';
import { API_BASE_URL, LIMITS } from '../utils';

export interface PostContextState {
  // Données
  posts: PostData[];
  userPosts: Record<string, PostData[]>; // Posts par utilisateur
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  
  // Actions
  fetchPosts: (refresh?: boolean) => Promise<void>;
  fetchUserPosts: (userAddress: string, refresh?: boolean) => Promise<void>;
  createPost: (postData: Omit<PostData, 'createdAt'>) => Promise<boolean>;
  deletePost: (cid: string) => Promise<boolean>;
  likePost: (cid: string) => Promise<boolean>;
  refreshPosts: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  
  // Utilitaires
  getPostByCid: (cid: string) => PostData | undefined;
  getUserPostCount: (userAddress: string) => number;
  clearCache: () => void;
}

const PostContext = createContext<PostContextState | undefined>(undefined);

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
};

interface PostProviderProps {
  children: React.ReactNode;
}

export const PostProvider: React.FC<PostProviderProps> = ({ children }) => {
  // États locaux
  const [posts, setPosts] = useState<PostData[]>([]);
  const [userPosts, setUserPosts] = useState<Record<string, PostData[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Cache pour éviter les requêtes répétitives
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupère les posts de manière paginée
   */
  const fetchPosts = useCallback(async (refresh = false) => {
    const now = Date.now();
    
    // Éviter les requêtes trop fréquentes sauf si refresh explicite
    if (!refresh && (now - lastFetchTime) < CACHE_DURATION && posts.length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const page = refresh ? 1 : currentPage;
      const response = await fetch(
        `${API_BASE_URL}/api/v0/posts?page=${page}&limit=${LIMITS.POSTS_PER_PAGE}`,
        {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data: PaginatedResponse<PostData> = await response.json();
      
      if (refresh) {
        setPosts(data.items);
        setCurrentPage(1);
      } else {
        setPosts(prev => [...prev, ...data.items]);
      }
      
      setHasMore(data.hasNext);
      setCurrentPage(prev => refresh ? 2 : prev + 1);
      setLastFetchTime(now);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(errorMessage);
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, lastFetchTime, posts.length]);

  /**
   * Récupère les posts d'un utilisateur spécifique
   */
  const fetchUserPosts = useCallback(async (userAddress: string, refresh = false) => {
    if (!userAddress) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/api/v0/posts/user/${userAddress}`,
        {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user posts: ${response.statusText}`);
      }

      const data: APIResponse<PostData[]> = await response.json();
      
      if (data.success && data.data) {
        setUserPosts(prev => ({
          ...prev,
          [userAddress.toLowerCase()]: data.data || [],
        }));
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user posts';
      setError(errorMessage);
      console.error('Error fetching user posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crée un nouveau post
   */
  const createPost = useCallback(async (postData: Omit<PostData, 'createdAt'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newPost: PostData = {
        ...postData,
        createdAt: new Date().toISOString(),
      };
      
      const response = await fetch(`${API_BASE_URL}/api/v0/create-post`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Ajouter le post au début de la liste
      setPosts(prev => [newPost, ...prev]);
      
      // Ajouter aux posts de l'utilisateur
      const userAddress = postData.address.toLowerCase();
      setUserPosts(prev => ({
        ...prev,
        [userAddress]: [newPost, ...(prev[userAddress] || [])],
      }));
      
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      console.error('Error creating post:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Supprime un post
   */
  const deletePost = useCallback(async (cid: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/v0/posts/${cid}`, {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`);
      }
      
      // Supprimer de la liste principale
      setPosts(prev => prev.filter(post => post.cid !== cid));
      
      // Supprimer des posts utilisateur
      setUserPosts(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(userAddress => {
          updated[userAddress] = updated[userAddress].filter(post => post.cid !== cid);
        });
        return updated;
      });
      
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      setError(errorMessage);
      console.error('Error deleting post:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Like/Unlike un post
   */
  const likePost = useCallback(async (cid: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v0/posts/${cid}/like`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Failed to like post: ${response.statusText}`);
      }

      // Mettre à jour le post dans la liste (simulation)
      const updatePost = (post: PostData) => {
        if (post.cid === cid) {
          return {
            ...post,
            likes: (post.likes || 0) + 1,
          };
        }
        return post;
      };

      setPosts(prev => prev.map(updatePost));
      
      setUserPosts(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(userAddress => {
          updated[userAddress] = updated[userAddress].map(updatePost);
        });
        return updated;
      });
      
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like post';
      setError(errorMessage);
      console.error('Error liking post:', err);
      return false;
    }
  }, []);

  /**
   * Rafraîchit la liste des posts
   */
  const refreshPosts = useCallback(async () => {
    await fetchPosts(true);
  }, [fetchPosts]);

  /**
   * Charge plus de posts (pagination)
   */
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    
    setIsLoadingMore(true);
    await fetchPosts(false);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, isLoading, fetchPosts]);

  /**
   * Trouve un post par son CID
   */
  const getPostByCid = useCallback((cid: string): PostData | undefined => {
    return posts.find(post => post.cid === cid);
  }, [posts]);

  /**
   * Compte les posts d'un utilisateur
   */
  const getUserPostCount = useCallback((userAddress: string): number => {
    const userPstsList = userPosts[userAddress.toLowerCase()];
    return userPstsList ? userPstsList.length : 0;
  }, [userPosts]);

  /**
   * Vide le cache
   */
  const clearCache = useCallback(() => {
    setPosts([]);
    setUserPosts({});
    setCurrentPage(1);
    setHasMore(true);
    setLastFetchTime(0);
    setError(null);
  }, []);

  // Charger les posts initialement
  useEffect(() => {
    fetchPosts(true);
  }, []);

  // Valeur du contexte mémorisée
  const contextValue = useMemo(() => ({
    // Données
    posts,
    userPosts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    currentPage,
    
    // Actions
    fetchPosts,
    fetchUserPosts,
    createPost,
    deletePost,
    likePost,
    refreshPosts,
    loadMorePosts,
    
    // Utilitaires
    getPostByCid,
    getUserPostCount,
    clearCache,
  }), [
    posts,
    userPosts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    currentPage,
    fetchPosts,
    fetchUserPosts,
    createPost,
    deletePost,
    likePost,
    refreshPosts,
    loadMorePosts,
    getPostByCid,
    getUserPostCount,
    clearCache,
  ]);

  return (
    <PostContext.Provider value={contextValue}>
      {children}
    </PostContext.Provider>
  );
};
