/**
 * Cache optimisé pour les résolutions ENS
 */

import { formatAddress } from './formatting';

export interface ENSCacheEntry {
  name: string | null;
  avatar: string | null;
  displayName: string;
  timestamp: number;
  isValid: boolean;
}

class ENSCache {
  private cache = new Map<string, ENSCacheEntry>();
  private pendingRequests = new Map<string, Promise<ENSCacheEntry>>();
  
  // Configuration du cache
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly BATCH_SIZE = 10;
  private readonly DEBOUNCE_DELAY = 300;
  
  // Debounce timer
  private debounceTimer: NodeJS.Timeout | null = null;
  private pendingBatchRequests = new Set<string>();

  /**
   * Nettoie les entrées expirées du cache
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Évite que le cache devienne trop volumineux
   */
  private evictOldestEntries(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;
    
    // Trier par timestamp et supprimer les plus anciennes
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toDelete = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Vérifie si une entrée est valide et non expirée
   */
  private isEntryValid(entry: ENSCacheEntry): boolean {
    const now = Date.now();
    return entry.isValid && (now - entry.timestamp) < this.CACHE_TTL;
  }

  /**
   * Crée une entrée ENS par défaut pour une adresse
   */
  private createDefaultEntry(address: string): ENSCacheEntry {
    return {
      name: null,
      avatar: null,
      displayName: formatAddress(address),
      timestamp: Date.now(),
      isValid: true,
    };
  }

  /**
   * Récupère une entrée du cache
   */
  get(address: string): ENSCacheEntry | null {
    if (!address) return null;
    
    const normalizedAddress = address.toLowerCase();
    const entry = this.cache.get(normalizedAddress);
    
    if (!entry) return null;
    
    if (this.isEntryValid(entry)) {
      return entry;
    }
    
    // Supprimer l'entrée expirée
    this.cache.delete(normalizedAddress);
    return null;
  }

  /**
   * Met une entrée dans le cache
   */
  set(address: string, entry: ENSCacheEntry): void {
    if (!address) return;
    
    const normalizedAddress = address.toLowerCase();
    this.cache.set(normalizedAddress, entry);
    
    // Nettoyage périodique
    if (this.cache.size % 100 === 0) {
      this.cleanExpiredEntries();
      this.evictOldestEntries();
    }
  }

  /**
   * Vérifie si une adresse est en cours de résolution
   */
  isPending(address: string): boolean {
    const normalizedAddress = address.toLowerCase();
    return this.pendingRequests.has(normalizedAddress);
  }

  /**
   * Récupère une promesse de résolution en cours
   */
  getPendingRequest(address: string): Promise<ENSCacheEntry> | null {
    const normalizedAddress = address.toLowerCase();
    return this.pendingRequests.get(normalizedAddress) || null;
  }

  /**
   * Enregistre une promesse de résolution
   */
  setPendingRequest(address: string, promise: Promise<ENSCacheEntry>): void {
    const normalizedAddress = address.toLowerCase();
    this.pendingRequests.set(normalizedAddress, promise);
    
    // Nettoyer quand la promesse se résout
    promise.finally(() => {
      this.pendingRequests.delete(normalizedAddress);
    });
  }

  /**
   * Ajoute une adresse à la file d'attente pour le traitement par batch
   */
  addToBatch(address: string): void {
    if (!address) return;
    
    const normalizedAddress = address.toLowerCase();
    this.pendingBatchRequests.add(normalizedAddress);
    
    // Debounce le traitement du batch
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.processBatch();
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Traite un batch d'adresses
   */
  private async processBatch(): Promise<void> {
    if (this.pendingBatchRequests.size === 0) return;
    
    const addresses = Array.from(this.pendingBatchRequests);
    this.pendingBatchRequests.clear();
    
    // Traiter par chunks pour éviter la surcharge
    const chunks = this.chunkArray(addresses, this.BATCH_SIZE);
    
    for (const chunk of chunks) {
      try {
        await this.processBatchChunk(chunk);
      } catch (error) {
        console.error('Error processing ENS batch chunk:', error);
      }
    }
  }

  /**
   * Traite un chunk d'adresses
   */
  private async processBatchChunk(addresses: string[]): Promise<void> {
    // Cette méthode sera implémentée dans useENS.ts
    // car elle nécessite l'accès au publicClient
    console.log('Processing batch chunk:', addresses);
  }

  /**
   * Divise un tableau en chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Récupère toutes les entrées du cache
   */
  getAll(): Map<string, ENSCacheEntry> {
    this.cleanExpiredEntries();
    return new Map(this.cache);
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.pendingBatchRequests.clear();
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Récupère les statistiques du cache
   */
  getStats(): {
    size: number;
    pendingRequests: number;
    pendingBatchRequests: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      pendingBatchRequests: this.pendingBatchRequests.size,
      hitRate: 0, // À implémenter si nécessaire
    };
  }
}

// Instance singleton du cache
export const ensCache = new ENSCache();
