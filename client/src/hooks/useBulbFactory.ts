import { useState, useEffect, useCallback, useRef } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { BULB_FACTORY_CONFIG, FLOW_TESTNET } from '../config/contract';

// Create a public client for reading from the contract
const publicClient = createPublicClient({
  chain: FLOW_TESTNET,
  transport: http(),
});

// Global cache with timestamp for invalidation
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface ProfileCacheEntry {
  hasProfile: boolean;
  profileAddress: Address | null;
  timestamp: number;
}

const contractCache = new Map<string, CacheEntry>();
const profileCheckCache = new Map<string, ProfileCacheEntry>();
const CACHE_TTL = 60000; // 60 seconds cache for better UX
const PROFILE_CACHE_TTL = 300000; // 5 minutes cache for profile checks (they change less frequently)

// Global state to prevent multiple simultaneous fetches
let globalFetchPromise: Promise<{ profilesCount: bigint; allProfiles: Address[] }> | null = null;
const activeProfileChecks = new Map<string, Promise<ProfileCacheEntry>>();

// Debounce helper
const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export interface BulbFactoryData {
  profilesCount: bigint | null;
  allProfiles: Address[];
  isLoading: boolean;
  error: string | null;
}

// Helper functions for caching
const getCachedData = (key: string, ttl: number = CACHE_TTL) => {
  const cached = contractCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: unknown) => {
  contractCache.set(key, { data, timestamp: Date.now() });
};

const getCachedProfile = (userAddress: string): ProfileCacheEntry | null => {
  const cached = profileCheckCache.get(userAddress.toLowerCase());
  if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_TTL) {
    return cached;
  }
  return null;
};

const setCachedProfile = (userAddress: string, profileData: Omit<ProfileCacheEntry, 'timestamp'>) => {
  profileCheckCache.set(userAddress.toLowerCase(), {
    ...profileData,
    timestamp: Date.now(),
  });
};

// Global contract data fetching function to prevent multiple simultaneous calls
const fetchGlobalContractData = async (force = false): Promise<{ profilesCount: bigint; allProfiles: Address[] }> => {
  // Check cache first unless forced
  if (!force) {
    const cachedProfilesCount = getCachedData('profilesCount') as bigint | null;
    const cachedAllProfiles = getCachedData('allProfiles') as Address[] | null;
    
    if (cachedProfilesCount !== null && cachedAllProfiles !== null) {
      return {
        profilesCount: cachedProfilesCount,
        allProfiles: cachedAllProfiles,
      };
    }
  }

  // If there's already a fetch in progress, wait for it
  if (globalFetchPromise) {
    return globalFetchPromise;
  }

  globalFetchPromise = (async () => {
    try {
      console.log('Fetching contract data from Flow testnet...');
      
      // Batch both requests together to reduce RPC calls
      const [profilesCount, allProfiles] = await Promise.all([
        publicClient.readContract({
          address: BULB_FACTORY_CONFIG.address,
          abi: BULB_FACTORY_CONFIG.abi,
          functionName: 'getProfilesCount',
        }) as Promise<bigint>,
        publicClient.readContract({
          address: BULB_FACTORY_CONFIG.address,
          abi: BULB_FACTORY_CONFIG.abi,
          functionName: 'getAllProfiles',
        }) as Promise<Address[]>
      ]);

      // Cache the results
      setCachedData('profilesCount', profilesCount);
      setCachedData('allProfiles', allProfiles);

      console.log('Contract data fetched and cached:', { 
        profilesCount: profilesCount.toString(), 
        allProfiles: allProfiles.length 
      });

      return { profilesCount, allProfiles };
    } catch (error) {
      console.error('Error fetching contract data:', error);
      throw error;
    } finally {
      globalFetchPromise = null;
    }
  })();

  return globalFetchPromise;
};

// Global profile checking function with caching and deduplication
const checkUserProfileGlobal = async (userAddress: Address): Promise<{ hasProfile: boolean; profileAddress: Address | null }> => {
  const addressKey = userAddress.toLowerCase();
  
  // Check cache first
  const cachedProfile = getCachedProfile(addressKey);
  if (cachedProfile) {
    console.log('Profile check served from cache for:', userAddress);
    return {
      hasProfile: cachedProfile.hasProfile,
      profileAddress: cachedProfile.profileAddress,
    };
  }

  // Check if there's already a request in progress for this address
  if (activeProfileChecks.has(addressKey)) {
    console.log('Profile check already in progress for:', userAddress);
    const result = await activeProfileChecks.get(addressKey)!;
    return {
      hasProfile: result.hasProfile,
      profileAddress: result.profileAddress,
    };
  }

  // Start new profile check
  console.log('Starting new profile check for:', userAddress);
  const checkPromise = (async (): Promise<ProfileCacheEntry> => {
    try {
      const hasProfile = await publicClient.readContract({
        address: BULB_FACTORY_CONFIG.address,
        abi: BULB_FACTORY_CONFIG.abi,
        functionName: 'hasProfile',
        args: [userAddress],
      }) as boolean;

      let profileAddress: Address | null = null;
      if (hasProfile) {
        profileAddress = await publicClient.readContract({
          address: BULB_FACTORY_CONFIG.address,
          abi: BULB_FACTORY_CONFIG.abi,
          functionName: 'getProfile',
          args: [userAddress],
        }) as Address;
      }

      const result = { hasProfile, profileAddress, timestamp: Date.now() };
      
      // Cache the result
      setCachedProfile(addressKey, { hasProfile, profileAddress });
      
      console.log('Profile check completed and cached for:', userAddress, result);
      return result;
    } catch (error) {
      console.error('Error checking user profile:', error);
      throw error;
    } finally {
      activeProfileChecks.delete(addressKey);
    }
  })();

  activeProfileChecks.set(addressKey, checkPromise);
  const result = await checkPromise;
  
  return {
    hasProfile: result.hasProfile,
    profileAddress: result.profileAddress,
  };
};

export const useBulbFactory = () => {
  const [data, setData] = useState<BulbFactoryData>({
    profilesCount: null,
    allProfiles: [],
    isLoading: false, // Start with false to prevent initial loading flicker
    error: null,
  });

  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchContractData = useCallback(async (force = false) => {
    // Clear any pending fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    try {
      if (!isMountedRef.current) return;
      
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await fetchGlobalContractData(force);

      if (!isMountedRef.current) return;

      setData({
        profilesCount: result.profilesCount,
        allProfiles: result.allProfiles,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error('Error fetching contract data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contract data',
      }));
    }
  }, []);

  // Debounced version to prevent rapid successive calls
  const debouncedFetch = useCallback(
    (force: boolean = false) => {
      const debouncedFunction = debounce((forceParam: boolean) => fetchContractData(forceParam), 1000);
      debouncedFunction(force);
    },
    [fetchContractData]
  );

  const checkUserProfile = useCallback(
    async (userAddress: Address): Promise<{ hasProfile: boolean; profileAddress: Address | null }> => {
      return checkUserProfileGlobal(userAddress);
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    
    // Load from cache immediately if available
    const cachedProfilesCount = getCachedData('profilesCount') as bigint | null;
    const cachedAllProfiles = getCachedData('allProfiles') as Address[] | null;
    
    if (cachedProfilesCount !== null && cachedAllProfiles !== null) {
      setData({
        profilesCount: cachedProfilesCount,
        allProfiles: cachedAllProfiles,
        isLoading: false,
        error: null,
      });
    } else {
      // Only fetch if no cache available
      fetchContractData();
    }

    return () => {
      isMountedRef.current = false;
      // Clear timeout on unmount only if still set
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [fetchContractData]);

  return {
    ...data,
    refetch: fetchContractData,
    debouncedRefetch: debouncedFetch,
    checkUserProfile,
  };
};

// Export cache management functions for debugging/manual cache invalidation
export const clearContractCache = () => {
  contractCache.clear();
  profileCheckCache.clear();
  console.log('Contract cache cleared');
};

export const invalidateProfileCache = (userAddress?: string) => {
  if (userAddress) {
    profileCheckCache.delete(userAddress.toLowerCase());
    console.log('Profile cache invalidated for:', userAddress);
  } else {
    profileCheckCache.clear();
    console.log('All profile caches cleared');
  }
};
