import { useState } from 'react';
import { createWalletClient, custom, type Address } from 'viem';
import { BULB_FACTORY_CONFIG, FLOW_TESTNET } from '../config/contract';

export interface CreateProfileParams {
  username: string;
  profilePicture: string;
  description: string;
}

export const useContractWrite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async (params: CreateProfileParams, userAddress: Address) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if MetaMask is available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Create wallet client
      const walletClient = createWalletClient({
        chain: FLOW_TESTNET,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transport: custom((window as any).ethereum),
      });

      // Request account access
      const [account] = await walletClient.requestAddresses();

      if (account.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Connected wallet does not match the current user');
      }

      // Switch to Flow testnet if needed
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${FLOW_TESTNET.id.toString(16)}` }],
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (switchError: any) {
        // If the chain is not added, add it
        if (switchError.code === 4902) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${FLOW_TESTNET.id.toString(16)}`,
              chainName: FLOW_TESTNET.name,
              rpcUrls: [FLOW_TESTNET.rpcUrls.default.http[0]],
              nativeCurrency: FLOW_TESTNET.nativeCurrency,
              blockExplorerUrls: [FLOW_TESTNET.blockExplorers.default.url],
            }],
          });
        } else {
          throw switchError;
        }
      }

      // Write to contract
      const hash = await walletClient.writeContract({
        address: BULB_FACTORY_CONFIG.address,
        abi: BULB_FACTORY_CONFIG.abi,
        functionName: 'createProfile',
        args: [params.username, params.profilePicture, params.description],
        account,
      });

      console.log('Transaction hash:', hash);
      return hash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      setError(errorMessage);
      console.error('Error creating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createProfile,
    isLoading,
    error,
  };
};
