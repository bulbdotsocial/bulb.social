import { useState } from 'react';
import { createWalletClient, custom, type Address, type Hex } from 'viem';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { BULB_FACTORY_CONFIG, FLOW_TESTNET } from '../config/contract';
import { BULB_PROFILE_ABI } from '../config/profileContract';

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
        console.log('🔍 Getting wallet client...');
        console.log('Available wallets:', wallets.length);
        console.log('User wallet address:', user?.wallet?.address);

        // Try to get Privy wallet first
        const privyWallet = wallets.find(wallet =>
            wallet.address.toLowerCase() === user?.wallet?.address?.toLowerCase()
        );

        if (privyWallet && privyWallet.getEthereumProvider) {
            try {
                console.log('🔄 Trying Privy wallet provider...');
                const provider = await privyWallet.getEthereumProvider();
                console.log('✅ Privy provider obtained:', !!provider);

                const walletClient = createWalletClient({
                    chain: FLOW_TESTNET,
                    transport: custom(provider),
                });

                console.log('✅ Privy wallet client created successfully');
                return {
                    client: walletClient,
                    account: privyWallet.address as Address
                };
            } catch (error) {
                console.warn('❌ Failed to get Privy wallet provider, falling back to MetaMask:', error);
            }
        } else {
            console.log('⚠️ No suitable Privy wallet found, falling back to MetaMask');
        }

        // Fallback to MetaMask if Privy fails or not available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof (window as any).ethereum === 'undefined') {
            console.error('❌ No wallet provider available');
            throw new Error('No wallet provider available. Please install MetaMask or use a supported wallet.');
        }

        console.log('🔄 Using MetaMask fallback...');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const provider = (window as any).ethereum;
        const walletClient = createWalletClient({
            chain: FLOW_TESTNET,
            transport: custom(provider),
        });

        // Request account access for MetaMask
        const [account] = await walletClient.requestAddresses();
        console.log('✅ MetaMask wallet client created successfully');
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
            console.log('🚀 Starting contract write execution...');
            console.log('Contract:', contractAddress);
            console.log('Function:', functionName);
            console.log('Args:', args);
            console.log('User address:', userAddress);

            setIsLoading(true);
            setError(null);

            const { client: walletClient, account } = await getWalletClient();

            if (account.toLowerCase() !== userAddress.toLowerCase()) {
                throw new Error('Connected wallet does not match the current user');
            }

            // Try to switch to Flow testnet for both Privy and MetaMask
            try {
                console.log('🔄 Attempting network switch...');
                // Get the provider from either Privy or MetaMask
                const privyWallet = wallets.find(wallet =>
                    wallet.address.toLowerCase() === userAddress.toLowerCase()
                );

                let provider;
                if (privyWallet && privyWallet.getEthereumProvider) {
                    provider = await privyWallet.getEthereumProvider();
                    console.log('📡 Using Privy provider for network switch');
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    provider = (window as any).ethereum;
                    console.log('📡 Using MetaMask provider for network switch');
                }

                if (provider && provider.request) {
                    await switchToFlowTestnet(provider);
                }
            } catch (networkError) {
                console.warn('⚠️ Network switch failed, continuing with current network:', networkError);
            }

            console.log('📝 Writing to contract...');
            // Write to contract
            const hash = await walletClient.writeContract({
                address: contractAddress,
                abi,
                functionName,
                args,
                account,
            });

            console.log('✅ Transaction submitted successfully! Hash:', hash);
            return hash;
        } catch (error) {
            console.error('❌ Contract write execution failed:', error);

            // Amélioration de la gestion d'erreur
            let errorMessage = `Failed to execute ${functionName}`;

            if (error instanceof Error) {
                if (error.message.includes("Can't find variable: Buffer")) {
                    errorMessage = 'Browser compatibility issue. Please refresh the page and try again.';
                } else if (error.message.includes('User rejected')) {
                    errorMessage = 'Transaction was rejected by user.';
                } else if (error.message.includes('insufficient funds')) {
                    errorMessage = 'Insufficient funds for transaction.';
                } else if (error.message.includes('execution reverted')) {
                    errorMessage = 'Transaction failed: Smart contract execution reverted.';
                } else {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);
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
        console.log('Update profile called with:', { profileContractAddress, params, userAddress });

        // Validate parameters
        if (!params.username || params.username.trim().length === 0) {
            throw new Error('Username is required');
        }

        if (params.username.length > 50) {
            throw new Error('Username too long (max 50 characters)');
        }

        if (params.description && params.description.length > 500) {
            throw new Error('Description too long (max 500 characters)');
        }

        // Call the individual profile contract's updateProfile function
        return executeContractWrite(
            profileContractAddress,
            BULB_PROFILE_ABI,
            'updateProfile',
            [
                params.username || '',
                params.profilePicture || '',
                params.description || ''
            ],
            userAddress
        );
    };

    return {
        createProfile,
        updateProfile,
        executeContractWrite,
        isLoading,
        error,
    };
};
