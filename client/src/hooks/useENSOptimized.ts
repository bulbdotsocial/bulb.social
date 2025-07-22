/**
 * Hook ENS optimisé avec cache intelligent et traitement par batch
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { mainnet } from 'viem/chains';
import { ensCache, type ENSCacheEntry } from '../utils/ensCache';
import { formatAddress } from '../utils/formatting';

export interface ENSData {
  name: string | null;
  avatar: string | null;
  displayName: string;
  isLoading: boolean;
  error: string | null;
}

// Client public pour les requêtes ENS
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

/**
 * Résout les données ENS pour une adresse donnée
 */
const resolveENSData = async (address: string): Promise<ENSCacheEntry> => {
  try {
    const normalizedAddress = address.toLowerCase() as Address;
    
    // Tentative de résolution du nom ENS
    const ensName = await publicClient.getEnsName({
      address: normalizedAddress,
    });

    let avatar = null;
    if (ensName) {
      try {
        // Récupération de l'avatar si le nom ENS existe
        avatar = await publicClient.getEnsAvatar({
          name: ensName,
        });
      } catch (avatarError) {
        console.warn('Could not fetch ENS avatar for', ensName, ':', avatarError);
      }
    }

    const displayName = ensName || formatAddress(address);

    return {
      name: ensName,
      avatar,
      displayName,
      timestamp: Date.now(),
      isValid: true,
    };
  } catch (error) {
    console.error('ENS resolution error for', address, ':', error);
    
    // Retourner une entrée par défaut en cas d'erreur
    return {
      name: null,
      avatar: null,
      displayName: formatAddress(address),
      timestamp: Date.now(),
      isValid: true, // Marquer comme valide pour éviter les re-tentatives immédiates
    };
  }
};

/**
 * Hook principal pour une seule adresse
 */
export const useENS = (address: string | undefined): ENSData => {
  const [ensData, setEnsData] = useState<ENSData>({
    name: null,
    avatar: null,
    displayName: '',
    isLoading: false,
    error: null,
  });

  const memoizedAddress = useMemo(() => address?.toLowerCase(), [address]);

  useEffect(() => {
    if (!memoizedAddress) {
      setEnsData({
        name: null,
        avatar: null,
        displayName: '',
        isLoading: false,
        error: null,
      });
      return;
    }

    // Vérifier le cache
    const cachedEntry = ensCache.get(memoizedAddress);
    if (cachedEntry) {
      setEnsData({
        name: cachedEntry.name,
        avatar: cachedEntry.avatar,
        displayName: cachedEntry.displayName,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Vérifier si une requête est déjà en cours
    const pendingRequest = ensCache.getPendingRequest(memoizedAddress);
    if (pendingRequest) {
      setEnsData(prev => ({ ...prev, isLoading: true }));
      
      pendingRequest
        .then(entry => {
          setEnsData({
            name: entry.name,
            avatar: entry.avatar,
            displayName: entry.displayName,
            isLoading: false,
            error: null,
          });
        })
        .catch(error => {
          setEnsData(prev => ({
            ...prev,
            isLoading: false,
            error: error.message || 'ENS resolution failed',
          }));
        });
      return;
    }

    // Démarrer une nouvelle résolution
    setEnsData(prev => ({ ...prev, isLoading: true, error: null }));

    const resolutionPromise = resolveENSData(memoizedAddress)
      .then(entry => {
        ensCache.set(memoizedAddress, entry);
        setEnsData({
          name: entry.name,
          avatar: entry.avatar,
          displayName: entry.displayName,
          isLoading: false,
          error: null,
        });
        return entry;
      })
      .catch(error => {
        const errorMessage = error.message || 'ENS resolution failed';
        setEnsData(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      });

    ensCache.setPendingRequest(memoizedAddress, resolutionPromise);
  }, [memoizedAddress]);

  return ensData;
};

/**
 * Hook pour plusieurs adresses avec traitement par batch
 */
export const useENSBatch = (addresses: string[]): Record<string, ENSData> => {
  const [ensDataMap, setEnsDataMap] = useState<Record<string, ENSData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const memoizedAddresses = useMemo(() => 
    addresses.map(addr => addr?.toLowerCase()).filter(Boolean),
    [addresses]
  );

  const processAddresses = useCallback(async (addrs: string[]) => {
    if (addrs.length === 0) return;

    setIsLoading(true);
    const newDataMap: Record<string, ENSData> = {};

    // Séparer les adresses cachées et non-cachées
    const uncachedAddresses: string[] = [];
    
    for (const addr of addrs) {
      const cached = ensCache.get(addr);
      if (cached) {
        newDataMap[addr] = {
          name: cached.name,
          avatar: cached.avatar,
          displayName: cached.displayName,
          isLoading: false,
          error: null,
        };
      } else {
        uncachedAddresses.push(addr);
        newDataMap[addr] = {
          name: null,
          avatar: null,
          displayName: formatAddress(addr),
          isLoading: true,
          error: null,
        };
      }
    }

    // Mettre à jour l'état avec les données cachées
    setEnsDataMap(prev => ({ ...prev, ...newDataMap }));

    // Traiter les adresses non-cachées
    if (uncachedAddresses.length > 0) {
      try {
        const resolutionPromises = uncachedAddresses.map(async (addr) => {
          // Éviter les requêtes en doublon
          const existingPromise = ensCache.getPendingRequest(addr);
          if (existingPromise) {
            return existingPromise;
          }

          const promise = resolveENSData(addr);
          ensCache.setPendingRequest(addr, promise);
          return promise;
        });

        const results = await Promise.allSettled(resolutionPromises);
        
        results.forEach((result, index) => {
          const addr = uncachedAddresses[index];
          
          if (result.status === 'fulfilled') {
            const entry = result.value;
            ensCache.set(addr, entry);
            
            setEnsDataMap(prev => ({
              ...prev,
              [addr]: {
                name: entry.name,
                avatar: entry.avatar,
                displayName: entry.displayName,
                isLoading: false,
                error: null,
              },
            }));
          } else {
            console.error(`ENS resolution failed for ${addr}:`, result.reason);
            
            setEnsDataMap(prev => ({
              ...prev,
              [addr]: {
                name: null,
                avatar: null,
                displayName: formatAddress(addr),
                isLoading: false,
                error: result.reason?.message || 'ENS resolution failed',
              },
            }));
          }
        });
      } catch (error) {
        console.error('Batch ENS resolution error:', error);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    processAddresses(memoizedAddresses);
  }, [memoizedAddresses, processAddresses]);

  return ensDataMap;
};

/**
 * Hook pour précharger des adresses ENS
 */
export const useENSPreload = () => {
  const preloadAddress = useCallback((address: string) => {
    if (!address) return;
    
    const normalizedAddress = address.toLowerCase();
    
    // Si déjà en cache, ne rien faire
    if (ensCache.get(normalizedAddress)) {
      return;
    }
    
    // Si déjà en cours de résolution, ne rien faire
    if (ensCache.isPending(normalizedAddress)) {
      return;
    }
    
    // Ajouter au batch pour traitement différé
    ensCache.addToBatch(normalizedAddress);
  }, []);

  const preloadAddresses = useCallback((addresses: string[]) => {
    addresses.forEach(preloadAddress);
  }, [preloadAddress]);

  return {
    preloadAddress,
    preloadAddresses,
  };
};

/**
 * Hook utilitaire pour les statistiques de cache
 */
export const useENSCacheStats = () => {
  const [stats, setStats] = useState(ensCache.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(ensCache.getStats());
    }, 5000); // Mettre à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const clearCache = useCallback(() => {
    ensCache.clear();
    setStats(ensCache.getStats());
  }, []);

  return {
    ...stats,
    clearCache,
  };
};
