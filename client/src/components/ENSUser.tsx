import React from 'react';
import { Avatar, Typography, Box, Skeleton, Tooltip } from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useENS } from '../hooks/useENS';

interface ENSUserProps {
  address: string;
  showFullAddress?: boolean;
  avatarSize?: number;
  typography?: 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
  showAvatar?: boolean;
  showVerification?: boolean;
  linkToProfile?: boolean;
}

const ENSUser: React.FC<ENSUserProps> = ({
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

  // Check if user is verified (has ENS domain)
  const isENSVerified = ensData.name && ensData.name.endsWith('.eth');

  const handleProfileClick = () => {
    if (linkToProfile) {
      navigate(`/profile/${address}`);
    }
  };

  if (ensData.isLoading) {
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
          src={ensData.avatar || undefined}
          sx={{
            width: avatarSize,
            height: avatarSize,
            fontSize: `${avatarSize / 2.5}px`,
            bgcolor: 'primary.main',
          }}
        >
          {!ensData.avatar && ensData.displayName && (
            ensData.displayName.startsWith('0x') 
              ? ensData.displayName.slice(2, 4).toUpperCase()
              : ensData.displayName.charAt(0).toUpperCase()
          )}
        </Avatar>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant={typography}
          sx={{
            fontWeight: ensData.name ? 600 : 400,
            color: ensData.name ? 'text.primary' : 'text.secondary',
          }}
        >
          {showFullAddress && !ensData.name ? address : ensData.displayName}
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
      </Box>
      {ensData.name && showFullAddress && (
        <Typography variant="caption" color="text.secondary">
          ({address.slice(0, 6)}...{address.slice(-4)})
        </Typography>
      )}
    </Box>
  );
};

export default ENSUser;
