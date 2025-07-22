/**
 * Service pour la gestion des posts
 */

import { BaseAPIService } from './api';
import { PostData, PaginatedResponse, CreatePostResponse, APIResponse } from '../types';

export class PostService extends BaseAPIService {
  private readonly endpoints = {
    posts: '/api/v0/posts',
    createPost: '/api/v0/create-post',
    userPosts: (address: string) => `/api/v0/posts/user/${address}`,
    postById: (cid: string) => `/api/v0/posts/${cid}`,
    likePost: (cid: string) => `/api/v0/posts/${cid}/like`,
    uploadImage: '/api/v0/upload-pic',
  };

  /**
   * Récupère les posts avec pagination
   */
  async getPosts(page = 1, limit = 20): Promise<PaginatedResponse<PostData>> {
    return this.get<PaginatedResponse<PostData>>(
      `${this.endpoints.posts}?page=${page}&limit=${limit}`
    );
  }

  /**
   * Récupère les posts d'un utilisateur
   */
  async getUserPosts(userAddress: string): Promise<PostData[]> {
    const response = await this.get<APIResponse<PostData[]>>(
      this.endpoints.userPosts(userAddress)
    );
    
    return response.data || [];
  }

  /**
   * Récupère un post par son CID
   */
  async getPostByCid(cid: string): Promise<PostData | null> {
    try {
      const response = await this.get<APIResponse<PostData>>(
        this.endpoints.postById(cid)
      );
      return response.data || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Upload une image et récupère le CID IPFS
   */
  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ cid: string; message: string }> {
    return this.upload(this.endpoints.uploadImage, file, undefined, onProgress);
  }

  /**
   * Crée un nouveau post
   */
  async createPost(postData: PostData): Promise<CreatePostResponse> {
    return this.post<CreatePostResponse>(this.endpoints.createPost, postData);
  }

  /**
   * Like/Unlike un post
   */
  async likePost(cid: string): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>(
      this.endpoints.likePost(cid)
    );
  }

  /**
   * Supprime un post
   */
  async deletePost(cid: string): Promise<{ success: boolean; message: string }> {
    return this.delete<{ success: boolean; message: string }>(
      this.endpoints.postById(cid)
    );
  }

  /**
   * Recherche de posts par hashtag
   */
  async searchPostsByTag(tag: string, page = 1, limit = 20): Promise<PaginatedResponse<PostData>> {
    return this.get<PaginatedResponse<PostData>>(
      `${this.endpoints.posts}/search?tag=${encodeURIComponent(tag)}&page=${page}&limit=${limit}`
    );
  }

  /**
   * Recherche de posts par description
   */
  async searchPosts(query: string, page = 1, limit = 20): Promise<PaginatedResponse<PostData>> {
    return this.get<PaginatedResponse<PostData>>(
      `${this.endpoints.posts}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  }

  /**
   * Récupère les posts tendances
   */
  async getTrendingPosts(limit = 10): Promise<PostData[]> {
    const response = await this.get<APIResponse<PostData[]>>(
      `${this.endpoints.posts}/trending?limit=${limit}`
    );
    
    return response.data || [];
  }

  /**
   * Récupère les statistiques d'un post
   */
  async getPostStats(cid: string): Promise<{
    likes: number;
    comments: number;
    shares: number;
    views: number;
  }> {
    return this.get<{
      likes: number;
      comments: number;
      shares: number;
      views: number;
    }>(`${this.endpoints.postById(cid)}/stats`);
  }
}

// Instance singleton du service
export const postService = new PostService();
