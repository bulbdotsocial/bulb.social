import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

interface ENSData {
  name: string | null;
  avatar: string | null;
  displayName: string;
  isLoading: boolean;
  error: string | null;
}

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const useENS = (address: string | undefined): ENSData => {
  const [ensData, setEnsData] = useState<ENSData>({
    name: null,
    avatar: null,
    displayName: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '',
    isLoading: !!address,
    error: null,
  });

  useEffect(() => {
    if (!address) {
      setEnsData({
        name: null,
        avatar: null,
        displayName: '',
        isLoading: false,
        error: null,
      });
      return;
    }

    const fetchENSData = async () => {
      try {
        setEnsData(prev => ({ ...prev, isLoading: true, error: null }));

        // Try to resolve ENS name from address
        const ensName = await publicClient.getEnsName({
          address: address as `0x${string}`,
        });

        let avatar = null;
        if (ensName) {
          try {
            // Try to get avatar if ENS name exists
            avatar = await publicClient.getEnsAvatar({
              name: ensName,
            });
          } catch (avatarError) {
            console.warn('Could not fetch ENS avatar:', avatarError);
          }
        }

        // Create display name
        const displayName = ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;

        setEnsData({
          name: ensName,
          avatar,
          displayName,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('ENS resolution error:', error);
        setEnsData({
          name: null,
          avatar: null,
          displayName: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '',
          isLoading: false,
          error: error instanceof Error ? error.message : 'ENS resolution failed',
        });
      }
    };

    fetchENSData();
  }, [address]);

  return ensData;
};

// Hook for caching multiple ENS lookups
export const useENSBatch = (addresses: string[]): Record<string, ENSData> => {
  const [ensCache, setEnsCache] = useState<Record<string, ENSData>>({});

  useEffect(() => {
    const fetchBatchENS = async () => {
      const newCache: Record<string, ENSData> = {};

      for (const address of addresses) {
        if (!address || ensCache[address]) {
          // Use existing cache if available
          if (ensCache[address]) {
            newCache[address] = ensCache[address];
          }
          continue;
        }

        // Set loading state
        newCache[address] = {
          name: null,
          avatar: null,
          displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
          isLoading: true,
          error: null,
        };

        try {
          const ensName = await publicClient.getEnsName({
            address: address as `0x${string}`,
          });

          let avatar = null;
          if (ensName) {
            try {
              avatar = await publicClient.getEnsAvatar({
                name: ensName,
              });
            } catch (avatarError) {
              console.warn('Could not fetch ENS avatar for', ensName, avatarError);
            }
          }

          newCache[address] = {
            name: ensName,
            avatar,
            displayName: ensName || `${address.slice(0, 6)}...${address.slice(-4)}`,
            isLoading: false,
            error: null,
          };
        } catch (error) {
          console.error('ENS resolution error for', address, error);
          newCache[address] = {
            name: null,
            avatar: null,
            displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
            isLoading: false,
            error: error instanceof Error ? error.message : 'ENS resolution failed',
          };
        }
      }

      setEnsCache(prev => ({ ...prev, ...newCache }));
    };

    if (addresses.length > 0) {
      fetchBatchENS();
    }
  }, [addresses, ensCache]);

  return ensCache;
};
