import { useState, useEffect, useMemo } from 'react';
import { useENS } from './useENS';
import { useBulbFactory } from './useBulbFactory';
import { useProfileContract } from './useProfileContract';
import type { Address } from 'viem';

export interface UserData {
  displayName: string;
  avatarSrc?: string;
  username?: string;
  bio?: string;
  profilePicture?: string;
  isFromContract: boolean;
  isENSVerified: boolean;
  hasProfile: boolean;
  isLoading: boolean;
  error?: string;
  ensName?: string;
  walletAddress: string;
}

export interface UseUserDataOptions {
  includeContractData?: boolean;
  includeENSData?: boolean;
  enableCaching?: boolean;
}

const DEFAULT_OPTIONS: UseUserDataOptions = {
  includeContractData: true,
  includeENSData: true,
  enableCaching: true,
};

export function useUserData(
  address: string,
  options: UseUserDataOptions = DEFAULT_OPTIONS
): UserData {
  const [profileContractAddress, setProfileContractAddress] = useState<Address | null>(null);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const [error, setError] = useState<string>();

  const { checkUserProfile } = useBulbFactory();
  const ensData = useENS(address, { enabled: options.includeENSData });
  const { profileInfo } = useProfileContract(profileContractAddress, {
    enabled: options.includeContractData && !!profileContractAddress,
  });

  // Check for profile contract
  useEffect(() => {
    if (!options.includeContractData || !address || hasCheckedProfile) return;

    const checkProfile = async () => {
      try {
        setError(undefined);
        const { hasProfile, profileAddress } = await checkUserProfile(address as Address);
        if (hasProfile && profileAddress) {
          setProfileContractAddress(profileAddress);
        }
      } catch (err) {
        console.error('Error checking profile for address:', address, err);
        setError(err instanceof Error ? err.message : 'Failed to check user profile');
      } finally {
        setHasCheckedProfile(true);
      }
    };

    checkProfile();
  }, [address, checkUserProfile, hasCheckedProfile, options.includeContractData]);

  // Compute derived data with priority system
  const userData = useMemo((): UserData => {
    const contractUsername = profileInfo?.username;
    const contractBio = profileInfo?.bio;
    const contractProfilePicture = profileInfo?.profilePicture;

    // Username priority: contract -> ENS -> shortened address
    let displayName: string;
    if (contractUsername?.trim()) {
      displayName = contractUsername;
    } else if (ensData.name) {
      displayName = ensData.displayName;
    } else {
      displayName = `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    // Avatar priority: contract IPFS -> ENS avatar -> undefined
    let avatarSrc: string | undefined;
    if (contractProfilePicture?.trim()) {
      // Handle IPFS hashes
      if (contractProfilePicture.startsWith('Qm') || contractProfilePicture.startsWith('baf')) {
        avatarSrc = `https://ipfs.io/ipfs/${contractProfilePicture}`;
      } else {
        avatarSrc = contractProfilePicture;
      }
    } else {
      avatarSrc = ensData.avatar || undefined;
    }

    const isFromContract = !!contractUsername?.trim();
    const isENSVerified = !!(ensData.name && ensData.name.endsWith('.eth'));
    const hasProfile = !!profileContractAddress;
    const isLoading = (options.includeENSData && ensData.isLoading) || 
                     (options.includeContractData && !hasCheckedProfile);

    return {
      displayName,
      avatarSrc,
      username: contractUsername || ensData.name,
      bio: contractBio,
      profilePicture: contractProfilePicture,
      isFromContract,
      isENSVerified,
      hasProfile,
      isLoading,
      error,
      ensName: ensData.name,
      walletAddress: address,
    };
  }, [
    profileInfo,
    ensData,
    address,
    profileContractAddress,
    hasCheckedProfile,
    error,
    options.includeENSData,
    options.includeContractData,
  ]);

  return userData;
}

export default useUserData;
