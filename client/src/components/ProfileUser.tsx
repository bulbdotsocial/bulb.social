import React, { useMemo } from 'react';
import { Avatar, Typography, Box, Skeleton, Tooltip } from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useENS } from '../hooks/useENS';
import { useBulbFactory } from '../hooks/useBulbFactory';
import { useProfileContract } from '../hooks/useProfileContract';
import type { Address } from 'viem';

interface ProfileUserProps {
    address: string;
    showFullAddress?: boolean;
    avatarSize?: number;
    typography?: 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
    showAvatar?: boolean;
    showVerification?: boolean;
    linkToProfile?: boolean;
}

const ProfileUser: React.FC<ProfileUserProps> = ({
    address,
    showFullAddress = false,
    avatarSize = 32,
    typography = 'body2',
    showAvatar = true,
    showVerification = true,
    linkToProfile = false,
}) => {
    const ensData = useENS(address);
    const navigate = useNavigate();
    const { checkUserProfile } = useBulbFactory();

    // Get profile contract address
    const [profileContractAddress, setProfileContractAddress] = React.useState<Address | null>(null);
    const [hasCheckedProfile, setHasCheckedProfile] = React.useState(false);

    // Get profile info from contract
    const { profileInfo } = useProfileContract(profileContractAddress);

    // Check for profile contract on mount
    React.useEffect(() => {
        const checkProfile = async () => {
            if (address && !hasCheckedProfile) {
                try {
                    const { hasProfile, profileAddress } = await checkUserProfile(address as Address);
                    if (hasProfile && profileAddress) {
                        setProfileContractAddress(profileAddress);
                    }
                } catch (error) {
                    console.error('Error checking profile for address:', address, error);
                } finally {
                    setHasCheckedProfile(true);
                }
            }
        };

        checkProfile();
    }, [address, checkUserProfile, hasCheckedProfile]);

    // Prioritize contract profile data, then ENS, then wallet
    const displayData = useMemo(() => {
        const contractUsername = profileInfo?.username;
        const contractProfilePicture = profileInfo?.profilePicture;

        // Username priority: contract -> ENS -> shortened address
        let displayName: string;
        if (contractUsername) {
            displayName = contractUsername;
        } else if (ensData.name) {
            displayName = ensData.displayName;
        } else {
            displayName = showFullAddress ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;
        }

        // Avatar priority: contract IPFS -> ENS avatar -> generated avatar
        let avatarSrc: string | undefined;
        if (contractProfilePicture && contractProfilePicture.trim()) {
            // If it looks like an IPFS hash, construct the URL
            if (contractProfilePicture.startsWith('Qm') || contractProfilePicture.startsWith('baf')) {
                avatarSrc = `https://ipfs.io/ipfs/${contractProfilePicture}`;
            } else {
                avatarSrc = contractProfilePicture;
            }
        } else {
            avatarSrc = ensData.avatar || undefined;
        }

        return {
            displayName,
            avatarSrc,
            isFromContract: !!contractUsername,
        };
    }, [profileInfo, ensData, address, showFullAddress]);

    // Check if user is verified (has ENS domain)
    const isENSVerified = ensData.name && ensData.name.endsWith('.eth');

    const handleProfileClick = () => {
        if (linkToProfile) {
            navigate(`/profile/${address}`);
        }
    };

    if (ensData.isLoading || !hasCheckedProfile) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {showAvatar && (
                    <Skeleton variant="circular" width={avatarSize} height={avatarSize} />
                )}
                <Skeleton variant="text" width={120} height={20} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: linkToProfile ? 'pointer' : 'default',
                '&:hover': linkToProfile ? {
                    opacity: 0.8,
                } : {},
            }}
            onClick={handleProfileClick}
        >
            {showAvatar && (
                <Avatar
                    src={displayData.avatarSrc || undefined}
                    sx={{
                        width: avatarSize,
                        height: avatarSize,
                        fontSize: `${avatarSize / 2.5}px`,
                        bgcolor: 'primary.main',
                    }}
                >
                    {!displayData.avatarSrc && displayData.displayName && (
                        displayData.displayName.startsWith('0x')
                            ? displayData.displayName.slice(2, 4).toUpperCase()
                            : displayData.displayName.charAt(0).toUpperCase()
                    )}
                </Avatar>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                    variant={typography}
                    sx={{
                        fontWeight: displayData.isFromContract || ensData.name ? 600 : 400,
                        color: displayData.isFromContract || ensData.name ? 'text.primary' : 'text.secondary',
                    }}
                >
                    {displayData.displayName}
                </Typography>
                {showVerification && isENSVerified && (
                    <Tooltip
                        title="Verified ENS domain owner"
                        placement="top"
                        arrow
                    >
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                color: 'white',
                                ml: 0.5,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                flexShrink: 0,
                                cursor: 'help',
                            }}
                        >
                            <VerifiedIcon
                                sx={{
                                    fontSize: '12px',
                                    color: 'white',
                                }}
                            />
                        </Box>
                    </Tooltip>
                )}
                {/* Show a small indicator for contract profiles */}
                {showVerification && displayData.isFromContract && (
                    <Tooltip
                        title="Profile configured via Bulb"
                        placement="top"
                        arrow
                    >
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                bgcolor: 'secondary.main',
                                color: 'white',
                                ml: 0.25,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                flexShrink: 0,
                                cursor: 'help',
                            }}
                        >
                            <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>
                                B
                            </Typography>
                        </Box>
                    </Tooltip>
                )}
            </Box>
            {ensData.name && showFullAddress && (
                <Typography variant="caption" color="text.secondary">
                    ({address.slice(0, 6)}...{address.slice(-4)})
                </Typography>
            )}
        </Box>
    );
};

export default ProfileUser;
