import React from 'react';
import { Avatar, Typography, Box, Skeleton } from '@mui/material';
import { useENS } from '../hooks/useENS';

interface ENSUserProps {
  address: string;
  showFullAddress?: boolean;
  avatarSize?: number;
  typography?: 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
  showAvatar?: boolean;
}

const ENSUser: React.FC<ENSUserProps> = ({
  address,
  showFullAddress = false,
  avatarSize = 32,
  typography = 'body2',
  showAvatar = true,
}) => {
  const ensData = useENS(address);

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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          {!ensData.avatar && (
            ensData.displayName.startsWith('0x') 
              ? ensData.displayName.slice(2, 4).toUpperCase()
              : ensData.displayName.charAt(0).toUpperCase()
          )}
        </Avatar>
      )}
      <Typography
        variant={typography}
        sx={{
          fontWeight: ensData.name ? 600 : 400,
          color: ensData.name ? 'text.primary' : 'text.secondary',
        }}
      >
        {showFullAddress && !ensData.name ? address : ensData.displayName}
      </Typography>
      {ensData.name && showFullAddress && (
        <Typography variant="caption" color="text.secondary">
          ({address.slice(0, 6)}...{address.slice(-4)})
        </Typography>
      )}
    </Box>
  );
};

export default ENSUser;
