import { useState, useEffect, useCallback, useMemo } from 'react';
import { postService } from '../services';
import type { Post, PostFormData } from '../types';
import { useErrorContext } from '../contexts/ErrorContext';

interface UsePostsOptions {
  autoFetch?: boolean;
  refreshInterval?: number;
  cacheKey?: string;
}

interface UsePostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  createPost: (postData: PostFormData) => Promise<boolean>;
  updatePost: (postId: string, postData: Partial<PostFormData>) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  likePost: (postId: string) => Promise<boolean>;
  clearError: () => void;
}

// Cache global pour les posts
const postsCache = new Map<string, {
  data: Post[];
  timestamp: number;
  expiry: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_PAGE_SIZE = 20;

export function usePostsOptimized(options: UsePostsOptions = {}): UsePostsReturn {
  const {
    autoFetch = true,
    refreshInterval = 0,
    cacheKey = 'default',
  } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const { showError } = useErrorContext();

  // Check cache
  const getCachedPosts = useCallback((): Post[] | null => {
    const cached = postsCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }, [cacheKey]);

  // Update cache
  const updateCache = useCallback((newPosts: Post[]) => {
    postsCache.set(cacheKey, {
      data: newPosts,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_TTL,
    });
  }, [cacheKey]);

  // Transform API data to Post type
  const transformApiData = useCallback((apiData: any[]): Post[] => {
    return apiData.map((item: any) => ({
      id: item.hash || `post-${Date.now()}-${Math.random()}`,
      hash: item.hash,
      cid: item.value?.cid || item.cid,
      address: item.value?.address || item.address,
      description: item.value?.description || item.description || '',
      created_at: item.value?.created_at || item.created_at || new Date().toISOString(),
      tags: item.value?.tags || item.tags || [],
      private: item.value?.private || item.private || false,
      imageUrl: item.value?.cid ? `https://ipfs.io/ipfs/${item.value.cid}` : '',
      
      // Mock data for social features (to be implemented)
      likes: Math.floor(Math.random() * 100),
      isLiked: false,
      comments: Math.floor(Math.random() * 20),
      timeAgo: getTimeAgo(item.value?.created_at || item.created_at),
    }));
  }, []);

  // Time formatting utility
  const getTimeAgo = useCallback((dateString: string): string => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return `${diffInSeconds}s`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
      return `${Math.floor(diffInSeconds / 604800)}w`;
    } catch {
      return 'Unknown';
    }
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache for first page
      if (pageNum === 1 && !append) {
        const cached = getCachedPosts();
        if (cached) {
          setPosts(cached);
          setIsLoading(false);
          return;
        }
      }

      const response = await postService.getPosts({
        page: pageNum,
        limit: DEFAULT_PAGE_SIZE,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch posts');
      }

      const transformedPosts = transformApiData(response.data);
      
      if (append) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
        updateCache(transformedPosts);
      }

      setHasMore(transformedPosts.length === DEFAULT_PAGE_SIZE);
      setPage(pageNum);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getCachedPosts, updateCache, transformApiData, showError]);

  // Refresh posts
  const refresh = useCallback(async () => {
    postsCache.delete(cacheKey); // Clear cache
    await fetchPosts(1, false);
  }, [fetchPosts, cacheKey]);

  // Load more posts
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPosts(page + 1, true);
  }, [fetchPosts, page, hasMore, isLoading]);

  // Create post
  const createPost = useCallback(async (postData: PostFormData): Promise<boolean> => {
    try {
      setError(null);
      const response = await postService.createPost(postData);
      
      if (response.success) {
        // Refresh posts to include new post
        await refresh();
        return true;
      } else {
        throw new Error(response.error || 'Failed to create post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    }
  }, [refresh, showError]);

  // Update post
  const updatePost = useCallback(async (postId: string, postData: Partial<PostFormData>): Promise<boolean> => {
    try {
      setError(null);
      const response = await postService.updatePost(postId, postData);
      
      if (response.success) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, ...postData, updated_at: new Date().toISOString() }
            : post
        ));
        return true;
      } else {
        throw new Error(response.error || 'Failed to update post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    }
  }, [showError]);

  // Delete post
  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await postService.deletePost(postId);
      
      if (response.success) {
        // Remove from local state
        setPosts(prev => prev.filter(post => post.id !== postId));
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    }
  }, [showError]);

  // Like post (mock implementation)
  const likePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      ));

      // TODO: Implement actual like API call
      // const response = await postService.likePost(postId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like post';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPosts(1, false);
    }
  }, [autoFetch, fetchPosts]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, refresh]);

  // Computed values
  const isEmpty = useMemo(() => posts.length === 0, [posts.length]);

  return {
    posts,
    isLoading,
    error,
    isEmpty,
    hasMore,
    refresh,
    loadMore,
    createPost,
    updatePost,
    deletePost,
    likePost,
    clearError,
  };
}

export default usePostsOptimized;
