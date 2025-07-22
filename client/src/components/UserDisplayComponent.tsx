import React, { memo } from 'react';
import { Avatar, Typography, Box, Skeleton, Tooltip } from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserData, type UseUserDataOptions } from '../hooks/useUserData';

export interface UserDisplayComponentProps {
  address: string;
  showFullAddress?: boolean;
  avatarSize?: number;
  typography?: 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
  showAvatar?: boolean;
  showVerification?: boolean;
  linkToProfile?: boolean;
  variant?: 'ens-only' | 'contract-only' | 'full';
  className?: string;
  onClick?: (address: string) => void;
}

const UserDisplayComponent: React.FC<UserDisplayComponentProps> = memo(({
  address,
  showFullAddress = false,
  avatarSize = 32,
  typography = 'body2',
  showAvatar = true,
  showVerification = true,
  linkToProfile = false,
  variant = 'full',
  className,
  onClick,
}) => {
  const navigate = useNavigate();

  // Configure data fetching based on variant
  const userDataOptions: UseUserDataOptions = React.useMemo(() => {
    switch (variant) {
      case 'ens-only':
        return { includeContractData: false, includeENSData: true };
      case 'contract-only':
        return { includeContractData: true, includeENSData: false };
      case 'full':
      default:
        return { includeContractData: true, includeENSData: true };
    }
  }, [variant]);

  const userData = useUserData(address, userDataOptions);

  const handleProfileClick = React.useCallback(() => {
    if (onClick) {
      onClick(address);
    } else if (linkToProfile) {
      navigate(`/profile/${address}`);
    }
  }, [onClick, linkToProfile, navigate, address]);

  // Loading state
  if (userData.isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} className={className}>
        {showAvatar && (
          <Skeleton variant="circular" width={avatarSize} height={avatarSize} />
        )}
        <Skeleton variant="text" width={120} height={20} />
      </Box>
    );
  }

  // Error state (fallback to minimal display)
  if (userData.error) {
    console.warn('UserDisplayComponent error:', userData.error);
  }

  const isClickable = !!(onClick || linkToProfile);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': isClickable ? {
          opacity: 0.8,
        } : {},
      }}
      onClick={isClickable ? handleProfileClick : undefined}
      className={className}
    >
      {/* Avatar */}
      {showAvatar && (
        <Avatar
          src={userData.avatarSrc}
          sx={{
            width: avatarSize,
            height: avatarSize,
            fontSize: `${avatarSize / 2.5}px`,
            bgcolor: 'primary.main',
          }}
        >
          {!userData.avatarSrc && userData.displayName && (
            userData.displayName.startsWith('0x')
              ? userData.displayName.slice(2, 4).toUpperCase()
              : userData.displayName.charAt(0).toUpperCase()
          )}
        </Avatar>
      )}

      {/* Name and verification badges */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant={typography}
          sx={{
            fontWeight: userData.isFromContract || userData.ensName ? 600 : 400,
            color: userData.isFromContract || userData.ensName ? 'text.primary' : 'text.secondary',
          }}
        >
          {showFullAddress && !userData.isFromContract && !userData.ensName
            ? address
            : userData.displayName
          }
        </Typography>

        {/* ENS Verification Badge */}
        {showVerification && userData.isENSVerified && (
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

        {/* Contract Profile Badge */}
        {showVerification && userData.isFromContract && (
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

      {/* Full address when name is available */}
      {userData.ensName && showFullAddress && (
        <Typography variant="caption" color="text.secondary">
          ({address.slice(0, 6)}...{address.slice(-4)})
        </Typography>
      )}
    </Box>
  );
});

UserDisplayComponent.displayName = 'UserDisplayComponent';

export default UserDisplayComponent;
