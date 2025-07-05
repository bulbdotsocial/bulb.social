import { useState } from 'react';
import { createWalletClient, custom, type Address, type Hex } from 'viem';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { BULB_FACTORY_CONFIG, FLOW_TESTNET } from '../config/contract';

export interface CreateProfileParams {
    username: string;
    profilePicture: string;
    description: string;
}

export interface UpdateProfileParams {
    username?: string;
    profilePicture?: string;
    description?: string;
}

export const useWalletContract = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = usePrivy();
    const { wallets } = useWallets();

    const getWalletClient = async (): Promise<{ client: any; account: Address }> => {
        // Try to get Privy wallet first
        const privyWallet = wallets.find(wallet =>
            wallet.address.toLowerCase() === user?.wallet?.address?.toLowerCase()
        );

        if (privyWallet && privyWallet.getEthereumProvider) {
            try {
                const provider = await privyWallet.getEthereumProvider();
                const walletClient = createWalletClient({
                    chain: FLOW_TESTNET,
                    transport: custom(provider),
                });
                return {
                    client: walletClient,
                    account: privyWallet.address as Address
                };
            } catch (error) {
                console.warn('Failed to get Privy wallet provider, falling back to MetaMask:', error);
            }
        }

        // Fallback to MetaMask if Privy fails or not available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof (window as any).ethereum === 'undefined') {
            throw new Error('No wallet provider available. Please install MetaMask or use a supported wallet.');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const provider = (window as any).ethereum;
        const walletClient = createWalletClient({
            chain: FLOW_TESTNET,
            transport: custom(provider),
        });

        // Request account access for MetaMask
        const [account] = await walletClient.requestAddresses();
        return { client: walletClient, account };
    };

    const switchToFlowTestnet = async (provider: any) => {
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${FLOW_TESTNET.id.toString(16)}` }],
            });
        } catch (switchError: any) {
            // If the chain is not added, add it
            if (switchError.code === 4902) {
                await provider.request({
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
    };

    const executeContractWrite = async (
        contractAddress: Address,
        abi: any,
        functionName: string,
        args: any[],
        userAddress: Address
    ): Promise<Hex> => {
        try {
            setIsLoading(true);
            setError(null);

            const { client: walletClient, account } = await getWalletClient();

            if (account.toLowerCase() !== userAddress.toLowerCase()) {
                throw new Error('Connected wallet does not match the current user');
            }

            // Try to switch to Flow testnet for both Privy and MetaMask
            try {
                // Get the provider from either Privy or MetaMask
                const privyWallet = wallets.find(wallet =>
                    wallet.address.toLowerCase() === userAddress.toLowerCase()
                );

                let provider;
                if (privyWallet && privyWallet.getEthereumProvider) {
                    provider = await privyWallet.getEthereumProvider();
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    provider = (window as any).ethereum;
                }

                if (provider && provider.request) {
                    await switchToFlowTestnet(provider);
                }
            } catch (networkError) {
                console.warn('Network switch failed, continuing with current network:', networkError);
            }

            // Write to contract
            const hash = await walletClient.writeContract({
                address: contractAddress,
                abi,
                functionName,
                args,
                account,
            });

            console.log('Transaction hash:', hash);
            return hash;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to execute ${functionName}`;
            setError(errorMessage);
            console.error(`Error executing ${functionName}:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const createProfile = async (params: CreateProfileParams, userAddress: Address) => {
        return executeContractWrite(
            BULB_FACTORY_CONFIG.address,
            BULB_FACTORY_CONFIG.abi,
            'createProfile',
            [params.username, params.profilePicture, params.description],
            userAddress
        );
    };

    const updateProfile = async (
        profileContractAddress: Address,
        params: UpdateProfileParams,
        userAddress: Address
    ) => {
        // This would be used with the individual profile contract
        // For now, we'll implement a placeholder that shows the structure
        console.log('Update profile called with:', { profileContractAddress, params, userAddress });

        // Once you have the individual profile contract ABI, you can use:
        // return executeContractWrite(
        //   profileContractAddress,
        //   PROFILE_CONTRACT_ABI,
        //   'updateProfile',
        //   [params.username, params.profilePicture, params.description],
        //   userAddress
        // );

        throw new Error('Profile update functionality requires the individual profile contract ABI');
    };

    return {
        createProfile,
        updateProfile,
        executeContractWrite,
        isLoading,
        error,
    };
};
