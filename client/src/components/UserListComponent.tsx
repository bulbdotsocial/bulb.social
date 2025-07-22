import React, { memo, useMemo } from 'react';
import { Box, List, ListItem, Skeleton } from '@mui/material';
import UserDisplayComponent from './UserDisplayComponent';
import type { UserDisplayComponentProps } from './UserDisplayComponent';

export interface UserListItem {
  address: string;
  [key: string]: any; // Additional data that might be passed
}

interface UserListComponentProps {
  users: UserListItem[];
  userDisplayProps?: Partial<Omit<UserDisplayComponentProps, 'address'>>;
  isLoading?: boolean;
  skeletonCount?: number;
  onUserClick?: (address: string) => void;
  showDividers?: boolean;
  dense?: boolean;
  maxHeight?: number;
  virtualizeThreshold?: number;
}

const UserListSkeleton: React.FC<{ count: number; dense: boolean }> = memo(({ count, dense }) => (
  <List dense={dense}>
    {Array.from({ length: count }, (_, index) => (
      <ListItem key={`skeleton-${index}`} sx={{ py: dense ? 0.5 : 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        </Box>
      </ListItem>
    ))}
  </List>
));

UserListSkeleton.displayName = 'UserListSkeleton';

const UserListComponent: React.FC<UserListComponentProps> = memo(({
  users,
  userDisplayProps = {},
  isLoading = false,
  skeletonCount = 5,
  onUserClick,
  showDividers = false,
  dense = false,
  maxHeight,
  virtualizeThreshold = 100,
}) => {
  const mergedUserDisplayProps = useMemo(() => ({
    linkToProfile: !onUserClick, // Default to profile link if no custom click handler
    ...userDisplayProps,
  }), [userDisplayProps, onUserClick]);

  // Loading state
  if (isLoading) {
    return <UserListSkeleton count={skeletonCount} dense={dense} />;
  }

  // Empty state
  if (!users || users.length === 0) {
    return null;
  }

  // For large lists, we might want to implement virtualization
  // For now, we'll just render all items with a scroll container
  const shouldVirtualize = users.length > virtualizeThreshold;
  
  if (shouldVirtualize) {
    console.info(`UserListComponent: Large list detected (${users.length} items). Consider implementing virtualization for better performance.`);
  }

  return (
    <Box
      sx={{
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        overflow: maxHeight ? 'auto' : 'visible',
      }}
    >
      <List 
        dense={dense}
        sx={{
          '& .MuiListItem-root': showDividers ? {
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': {
              borderBottom: 'none',
            },
          } : {},
        }}
      >
        {users.map(({ address, ...userData }) => (
          <ListItem 
            key={address}
            sx={{ 
              py: dense ? 0.5 : 1,
              px: 1,
            }}
          >
            <UserDisplayComponent
              address={address}
              onClick={onUserClick}
              {...mergedUserDisplayProps}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
});

UserListComponent.displayName = 'UserListComponent';

export default UserListComponent;
