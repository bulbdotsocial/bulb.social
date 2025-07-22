/**
 * Fichier d'index pour tous les services API
 */

export { BaseAPIService, APIError } from './api';
export { PostService, postService } from './postService';
export { IPFSService, ipfsService } from './ipfsService';

// Types de service
export type { RequestConfig } from './api';
export type { IPFSPinResponse, IPFSFileInfo } from './ipfsService';
