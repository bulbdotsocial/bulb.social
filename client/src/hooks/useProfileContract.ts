import { useState, useEffect } from 'react';
import { createPublicClient, http, type Address } from 'viem';
import { FLOW_TESTNET } from '../config/contract';
import { BULB_PROFILE_ABI } from '../config/profileContract';

const publicClient = createPublicClient({
    chain: FLOW_TESTNET,
    transport: http(),
});

export interface ProfileInfo {
    username: string;
    profilePicture: string;
    description: string;
    createdAt: bigint;
    updatedAt: bigint;
}

export const useProfileContract = (profileAddress: Address | null) => {
    const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfileInfo = async (address: Address) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await publicClient.readContract({
                address: address,
                abi: BULB_PROFILE_ABI,
                functionName: 'getProfileInfo',
            }) as [string, string, string, bigint, bigint];

            const [username, profilePicture, description, createdAt, updatedAt] = result;

            setProfileInfo({
                username,
                profilePicture,
                description,
                createdAt,
                updatedAt,
            });
        } catch (err) {
            console.error('Error fetching profile info:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch profile info');
            setProfileInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshProfile = () => {
        if (profileAddress) {
            fetchProfileInfo(profileAddress);
        }
    };

    useEffect(() => {
        if (profileAddress) {
            fetchProfileInfo(profileAddress);
        } else {
            setProfileInfo(null);
            setError(null);
        }
    }, [profileAddress]);

    return {
        profileInfo,
        isLoading,
        error,
        refreshProfile,
    };
};
