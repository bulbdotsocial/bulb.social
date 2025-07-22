/**
 * Hook composite pour toutes les interactions avec les contrats
 * Centralise et simplifie l'API pour les composants
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { type Address } from 'viem';

// Import des hooks existants
import { useBulbFactory } from './useBulbFactory';
import { useProfileContract } from './useProfileContract';
import { useWalletContract } from './useWalletContract';
import { useENS } from './useENS';

export interface UserProfile {
  address: Address;
  ensName?: string;
  ensAvatar?: string;
  hasProfile: boolean;
  profileAddress?: Address | null;
  contractProfile?: {
    username: string;
    profilePicture: string;
    description: string;
    createdAt: bigint;
    updatedAt: bigint;
  };
}

export interface ContractIntegrationState {
  // Données utilisateur
  currentUser: UserProfile | null;
  
  // États globaux
  isLoading: boolean;
  error: string | null;
  
  // Statistiques
  totalProfiles: bigint | null;
  allProfileAddresses: Address[];
  
  // Actions
  createProfile: (params: {
    username: string;
    profilePicture: string;
    description: string;
  }) => Promise<boolean>;
  
  updateProfile: (params: {
    username?: string;
    profilePicture?: string;
    description?: string;
  }) => Promise<boolean>;
  
  getUserProfile: (address: Address) => Promise<UserProfile | null>;
  refreshUserProfile: () => void;
  
  // Utilitaires
  checkHasProfile: (address: Address) => Promise<boolean>;
  getProfileByAddress: (address: Address) => Promise<UserProfile | null>;
}

export const useContractIntegration = (): ContractIntegrationState => {
  const { user } = usePrivy();
  const userAddress = user?.wallet?.address as Address | undefined;
  
  // States locaux
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks existants
  const factoryData = useBulbFactory();
  const { checkHasProfile, getProfileAddress } = useBulbFactory();
  const walletContract = useWalletContract();
  const ensData = useENS(userAddress);
  
  // Profile contract pour l'utilisateur actuel
  const [userProfileAddress, setUserProfileAddress] = useState<Address | null>(null);
  const userProfileContract = useProfileContract(userProfileAddress);
  
  /**
   * Charge le profil complet d'un utilisateur (ENS + Contract)
   */
  const loadUserProfile = useCallback(async (address: Address): Promise<UserProfile | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier si l'utilisateur a un profil contract
      const hasProfile = await checkHasProfile(address);
      let profileAddress: Address | null = null;
      let contractProfile = undefined;
      
      if (hasProfile) {
        profileAddress = await getProfileAddress(address);
        
        if (profileAddress) {
          // Charger les données du contrat de profil
          // Note: Ceci nécessitera une refactorisation du useProfileContract
          // pour permettre le chargement programmatique
        }
      }
      
      // Données ENS (déjà chargées par le hook useENS pour l'utilisateur actuel)
      const ensName = address === userAddress ? ensData?.name : undefined;
      const ensAvatar = address === userAddress ? ensData?.avatar : undefined;
      
      const profile: UserProfile = {
        address,
        ensName,
        ensAvatar,
        hasProfile,
        profileAddress,
        contractProfile,
      };
      
      return profile;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkHasProfile, getProfileAddress, userAddress, ensData]);
  
  /**
   * Met à jour le profil de l'utilisateur actuel
   */
  const refreshUserProfile = useCallback(async () => {
    if (!userAddress) return;
    
    const profile = await loadUserProfile(userAddress);
    setCurrentUser(profile);
  }, [userAddress, loadUserProfile]);
  
  /**
   * Charge le profil de l'utilisateur actuel au montage et quand l'adresse change
   */
  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);
  
  /**
   * Met à jour l'adresse du contrat de profil quand nécessaire
   */
  useEffect(() => {
    const updateProfileAddress = async () => {
      if (userAddress && currentUser?.hasProfile) {
        const profileAddress = await getProfileAddress(userAddress);
        setUserProfileAddress(profileAddress);
      } else {
        setUserProfileAddress(null);
      }
    };
    
    updateProfileAddress();
  }, [userAddress, currentUser?.hasProfile, getProfileAddress]);
  
  /**
   * Met à jour le profil contractuel quand les données changent
   */
  useEffect(() => {
    if (userProfileContract.profileInfo && currentUser) {
      setCurrentUser(prev => prev ? {
        ...prev,
        contractProfile: userProfileContract.profileInfo,
      } : null);
    }
  }, [userProfileContract.profileInfo, currentUser]);
  
  /**
   * Actions de création de profil
   */
  const createProfile = useCallback(async (params: {
    username: string;
    profilePicture: string;
    description: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await walletContract.createProfile(params);
      
      if (success) {
        // Rafraîchir le profil après création
        await refreshUserProfile();
      }
      
      return success;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletContract, refreshUserProfile]);
  
  /**
   * Actions de mise à jour de profil
   */
  const updateProfile = useCallback(async (params: {
    username?: string;
    profilePicture?: string;
    description?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!userProfileAddress) {
        throw new Error('No profile address found');
      }
      
      const success = await walletContract.updateProfile(userProfileAddress, params);
      
      if (success) {
        // Rafraîchir le profil après mise à jour
        await refreshUserProfile();
      }
      
      return success;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletContract, userProfileAddress, refreshUserProfile]);
  
  /**
   * États combinés de chargement et d'erreur
   */
  const combinedLoading = isLoading || factoryData.isLoading || userProfileContract.isLoading || walletContract.isLoading;
  const combinedError = error || factoryData.error || userProfileContract.error || walletContract.error;
  
  /**
   * Valeur de retour mémorisée
   */
  return useMemo(() => ({
    // Données utilisateur
    currentUser,
    
    // États
    isLoading: combinedLoading,
    error: combinedError,
    
    // Statistiques
    totalProfiles: factoryData.profilesCount,
    allProfileAddresses: factoryData.allProfiles,
    
    // Actions
    createProfile,
    updateProfile,
    getUserProfile: loadUserProfile,
    refreshUserProfile,
    
    // Utilitaires
    checkHasProfile,
    getProfileByAddress: loadUserProfile,
  }), [
    currentUser,
    combinedLoading,
    combinedError,
    factoryData.profilesCount,
    factoryData.allProfiles,
    createProfile,
    updateProfile,
    loadUserProfile,
    refreshUserProfile,
    checkHasProfile,
  ]);
};
