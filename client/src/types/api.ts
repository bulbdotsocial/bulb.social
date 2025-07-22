/**
 * Types pour les réponses API et les services
 */

export interface UploadResponse {
  message: string;
  cid: string;
}

export interface CreatePostResponse {
  message: string;
  orbit_hash: string;
  db_address: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IPFSUploadResponse {
  hash: string;
  size: number;
  url: string;
}
