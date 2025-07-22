/**
 * Service pour les interactions avec IPFS
 */

import { BaseAPIService } from './api';
import { IPFSUploadResponse } from '../types';

export interface IPFSPinResponse {
  hash: string;
  size: number;
  timestamp: string;
}

export interface IPFSFileInfo {
  hash: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export class IPFSService extends BaseAPIService {
  private readonly endpoints = {
    upload: '/api/v0/upload',
    pin: '/api/v0/pin',
    unpin: '/api/v0/unpin',
    list: '/api/v0/list',
    info: (hash: string) => `/api/v0/info/${hash}`,
  };

  private readonly ipfsGateway = 'https://ipfs.io/ipfs/';

  /**
   * Upload un fichier vers IPFS
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<IPFSUploadResponse> {
    return this.upload<IPFSUploadResponse>(
      this.endpoints.upload,
      file,
      undefined,
      onProgress
    );
  }

  /**
   * Upload multiple fichiers vers IPFS
   */
  async uploadMultipleFiles(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<IPFSUploadResponse[]> {
    const results: IPFSUploadResponse[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileProgress = (progress: number) => {
        const totalProgress = ((i * 100) + progress) / files.length;
        onProgress?.(totalProgress);
      };
      
      const result = await this.uploadFile(file, fileProgress);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Pin un hash IPFS
   */
  async pinHash(hash: string): Promise<IPFSPinResponse> {
    return this.post<IPFSPinResponse>(this.endpoints.pin, { hash });
  }

  /**
   * Unpin un hash IPFS
   */
  async unpinHash(hash: string): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>(
      this.endpoints.unpin,
      { hash }
    );
  }

  /**
   * Liste les fichiers pinnés
   */
  async listPinnedFiles(): Promise<IPFSFileInfo[]> {
    const response = await this.get<{ files: IPFSFileInfo[] }>(this.endpoints.list);
    return response.files || [];
  }

  /**
   * Récupère les informations d'un fichier IPFS
   */
  async getFileInfo(hash: string): Promise<IPFSFileInfo> {
    return this.get<IPFSFileInfo>(this.endpoints.info(hash));
  }

  /**
   * Génère l'URL publique d'un fichier IPFS
   */
  getPublicUrl(hash: string): string {
    return `${this.ipfsGateway}${hash}`;
  }

  /**
   * Vérifie si un hash IPFS est accessible
   */
  async isHashAccessible(hash: string): Promise<boolean> {
    try {
      const response = await fetch(this.getPublicUrl(hash), {
        method: 'HEAD',
        mode: 'cors',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Télécharge un fichier depuis IPFS
   */
  async downloadFile(hash: string, filename?: string): Promise<Blob> {
    const response = await fetch(this.getPublicUrl(hash), {
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Si un nom de fichier est fourni, déclencher le téléchargement
    if (filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    return blob;
  }

  /**
   * Upload et pin un fichier en une seule opération
   */
  async uploadAndPin(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<IPFSUploadResponse & { pinned: boolean }> {
    // Upload le fichier
    const uploadResult = await this.uploadFile(file, (progress) => {
      onProgress?.(progress * 0.8); // 80% pour l'upload
    });
    
    try {
      // Pin le hash
      await this.pinHash(uploadResult.hash);
      onProgress?.(100);
      
      return {
        ...uploadResult,
        pinned: true,
      };
    } catch (error) {
      console.warn('Failed to pin file, but upload succeeded:', error);
      onProgress?.(100);
      
      return {
        ...uploadResult,
        pinned: false,
      };
    }
  }

  /**
   * Prévisualise un fichier image depuis IPFS
   */
  getImagePreviewUrl(hash: string, size?: 'small' | 'medium' | 'large'): string {
    const baseUrl = this.getPublicUrl(hash);
    
    // Ajouter des paramètres de redimensionnement si disponibles
    if (size) {
      const sizeMap = {
        small: '150',
        medium: '400',
        large: '800',
      };
      
      // Note: Ceci dépend du gateway IPFS utilisé
      // Certains gateways supportent le redimensionnement automatique
      return `${baseUrl}?w=${sizeMap[size]}`;
    }
    
    return baseUrl;
  }

  /**
   * Valide qu'un hash IPFS est bien formé
   */
  isValidIPFSHash(hash: string): boolean {
    // Hash IPFS v0 (commence par Qm)
    const v0Pattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    
    // Hash IPFS v1 (commence par bafy ou autre multibase)
    const v1Pattern = /^ba[a-z0-9]{56,}$/;
    
    return v0Pattern.test(hash) || v1Pattern.test(hash);
  }
}

// Instance singleton du service
export const ipfsService = new IPFSService();
