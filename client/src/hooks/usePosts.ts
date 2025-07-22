/**
 * Hook simplifié pour l'utilisation du contexte des posts
 * Extrait la logique métier des composants
 */

import { useCallback, useMemo } from 'react';
import { usePostContext } from '../contexts/PostContext';
import { PostData } from '../types';
import { postService } from '../services';

export interface UsePostsResult {
  // Données
  posts: PostData[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  refreshPosts: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  createPost: (postData: Omit<PostData, 'createdAt'>) => Promise<boolean>;
  deletePost: (cid: string) => Promise<boolean>;
  likePost: (cid: string) => Promise<boolean>;
  
  // Utilitaires
  getPostByCid: (cid: string) => PostData | undefined;
}

export interface UseUserPostsResult {
  // Données
  posts: PostData[];
  isLoading: boolean;
  error: string | null;
  postCount: number;
  
  // Actions
  refreshUserPosts: (address: string) => Promise<void>;
  
  // Utilitaires
  hasPost: (cid: string) => boolean;
}

/**
 * Hook principal pour la gestion des posts globaux
 */
export const usePosts = (): UsePostsResult => {
  const context = usePostContext();
  
  return useMemo(() => ({
    // Données
    posts: context.posts,
    isLoading: context.isLoading,
    isLoadingMore: context.isLoadingMore,
    error: context.error,
    hasMore: context.hasMore,
    
    // Actions
    refreshPosts: context.refreshPosts,
    loadMorePosts: context.loadMorePosts,
    createPost: context.createPost,
    deletePost: context.deletePost,
    likePost: context.likePost,
    
    // Utilitaires
    getPostByCid: context.getPostByCid,
  }), [context]);
};

/**
 * Hook pour la gestion des posts d'un utilisateur spécifique
 */
export const useUserPosts = (userAddress?: string): UseUserPostsResult => {
  const context = usePostContext();
  
  const userPosts = useMemo(() => {
    if (!userAddress) return [];
    return context.userPosts[userAddress.toLowerCase()] || [];
  }, [context.userPosts, userAddress]);
  
  const refreshUserPosts = useCallback(async (address: string) => {
    await context.fetchUserPosts(address, true);
  }, [context]);
  
  const hasPost = useCallback((cid: string) => {
    return userPosts.some(post => post.cid === cid);
  }, [userPosts]);
  
  const postCount = useMemo(() => {
    return userAddress ? context.getUserPostCount(userAddress) : 0;
  }, [context, userAddress]);
  
  return useMemo(() => ({
    // Données
    posts: userPosts,
    isLoading: context.isLoading,
    error: context.error,
    postCount,
    
    // Actions
    refreshUserPosts,
    
    // Utilitaires
    hasPost,
  }), [userPosts, context.isLoading, context.error, postCount, refreshUserPosts, hasPost]);
};

/**
 * Hook pour l'upload d'images et création de posts
 */
export const usePostCreation = () => {
  const { createPost } = usePostContext();
  
  const uploadAndCreatePost = useCallback(async (
    file: File,
    description: string,
    tags: string[],
    userAddress: string,
    onProgress?: (progress: number) => void
  ): Promise<boolean> => {
    try {
      // Upload de l'image
      onProgress?.(10);
      const uploadResult = await postService.uploadImage(file, (progress) => {
        onProgress?.(10 + (progress * 0.6)); // 10-70%
      });
      
      onProgress?.(70);
      
      // Création du post
      const postData: Omit<PostData, 'createdAt'> = {
        cid: uploadResult.cid,
        description: description.trim(),
        address: userAddress,
        tags: tags.filter(tag => tag.trim().length > 0),
      };
      
      onProgress?.(80);
      const success = await createPost(postData);
      onProgress?.(100);
      
      return success;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    }
  }, [createPost]);
  
  return {
    uploadAndCreatePost,
  };
};

/**
 * Hook pour la recherche et filtrage de posts
 */
export const usePostSearch = () => {
  const searchPosts = useCallback(async (
    query: string,
    type: 'description' | 'tag' = 'description',
    page = 1,
    limit = 20
  ) => {
    try {
      if (type === 'tag') {
        return await postService.searchPostsByTag(query, page, limit);
      } else {
        return await postService.searchPosts(query, page, limit);
      }
    } catch (error) {
      console.error('Error searching posts:', error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      };
    }
  }, []);
  
  const getTrendingPosts = useCallback(async (limit = 10) => {
    try {
      return await postService.getTrendingPosts(limit);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      return [];
    }
  }, []);
  
  return {
    searchPosts,
    getTrendingPosts,
  };
};
  const { likePost, deletePost, getPostByCid } = usePostContext();
  
  const post = getPostByCid(cid);
  
  const like = async () => {
    return await likePost(cid);
  };
  
  const remove = async () => {
    return await deletePost(cid);
  };
  
  return {
    post,
    like,
    delete: remove,
  };
};
