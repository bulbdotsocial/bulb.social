import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useENS } from '../hooks/useENS';
import P2PDebugCard from './P2PDebugCard';
import {
  Box,
  Avatar,
  Typography,
  Button,
  Card,
  CardMedia,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  GridOn as GridOnIcon,
  BookmarkBorder as BookmarkIcon,
  AccountBalanceWallet as WalletIcon,
  Verified as VerifiedIcon,
  // ContentCopy as CopyIcon,
} from '@mui/icons-material';

interface ProfileData {
  username: string;
  fullName: string;
  bio: string;
  website: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  avatarUrl?: string;
}

interface Post {
  id: number;
  imageUrl: string;
  likes: number;
  comments: number;
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);
  const { user } = usePrivy();
  
  // Get ENS data for the user's wallet address
  const walletAddress = user?.wallet?.address;
  const ensData = useENS(walletAddress);

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  // User data from Privy with ENS fallbacks
  const profileData: ProfileData = {
    username: ensData.displayName || 'web3_user',
    fullName: ensData.name || user?.email?.address || user?.wallet?.address?.slice(0, 8) || 'Web3 User',
    bio: '🚀 Web3 Innovation Platform\n💡 Sharing ideas that change the world\n🌟 Building the future of social media',
    website: 'bulb.social',
    postsCount: 42,
    followersCount: 1247,
    followingCount: 324,
  };

  // Check if user is verified (has ENS domain)
  const isENSVerified = ensData.name && ensData.name.endsWith('.eth');

  // Mock posts data
  const userPosts: Post[] = [
    {
      id: 1,
      imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
      likes: 127,
      comments: 8,
    },
    {
      id: 2,
      imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
      likes: 89,
      comments: 12,
    },
    {
      id: 3,
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop',
      likes: 234,
      comments: 15,
    },
    {
      id: 4,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=300&fit=crop',
      likes: 156,
      comments: 23,
    },
    {
      id: 5,
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=300&fit=crop',
      likes: 98,
      comments: 7,
    },
    {
      id: 6,
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop',
      likes: 312,
      comments: 28,
    },
  ];

  const savedPosts: Post[] = [
    {
      id: 7,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      likes: 445,
      comments: 19,
    },
    {
      id: 8,
      imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=300&fit=crop',
      likes: 223,
      comments: 14,
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const PostGrid: React.FC<{ posts: Post[] }> = ({ posts }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.25, sm: 0.5 } }}>
      {posts.map((post) => (
        <Box
          key={post.id}
          sx={{
            width: 'calc(33.333% - 4px)',
            aspectRatio: '1/1',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          <Card
            sx={{
              width: '100%',
              height: '100%',
            }}
            elevation={0}
          >
            <CardMedia
              component="img"
              image={post.imageUrl}
              alt={`Post ${post.id}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Card>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 4,
      }}
    >
      {/* Main Container with Sidebar Layout */}
      <Box
        sx={{
          maxWidth: 1200, // Increased to accommodate sidebar
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 4 },
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {/* Main Content */}
        <Box sx={{ flex: 1, maxWidth: { lg: 935 } }}>
          {/* Profile Header */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 2, sm: 4 },
            mb: 4,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
          }}
        >
          {/* Avatar */}
          <Box sx={{ textAlign: 'center' }}>
            {ensData.isLoading ? (
              <Skeleton
                variant="circular"
                sx={{
                  width: { xs: 80, sm: 150 },
                  height: { xs: 80, sm: 150 },
                  mb: { xs: 1, sm: 0 },
                }}
              />
            ) : (
              <Avatar
                src={ensData.avatar || undefined}
                sx={{
                  width: { xs: 80, sm: 150 },
                  height: { xs: 80, sm: 150 },
                  bgcolor: 'primary.main',
                  fontSize: { xs: '2rem', sm: '4rem' },
                  fontWeight: 'bold',
                  mb: { xs: 1, sm: 0 },
                }}
              >
                {!ensData.avatar && (
                  ensData.displayName.startsWith('0x') 
                    ? ensData.displayName.slice(2, 4).toUpperCase()
                    : ensData.displayName.charAt(0).toUpperCase()
                )}
              </Avatar>
            )}
          </Box>

          {/* Profile Info */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            {/* Username and Actions */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                justifyContent: { xs: 'center', sm: 'flex-start' },
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 300,
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                }}
              >
                {profileData.username}
              </Typography>
              {isENSVerified && (
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
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      bgcolor: 'primary.main', // Use app's primary color (Instagram pink)
                      color: 'white',
                      ml: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      flexShrink: 0, // Prevent badge from shrinking
                      cursor: 'help',
                    }}
                  >
                    <VerifiedIcon
                      sx={{
                        fontSize: '16px',
                        color: 'white',
                      }}
                    />
                  </Box>
                </Tooltip>
              )}
              <Button
                variant="outlined"
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'text.secondary',
                  },
                }}
              >
                Edit profile
              </Button>
              <IconButton size="small">
                <SettingsIcon />
              </IconButton>
            </Box>

            {/* Stats */}
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 3, sm: 4 },
                mb: 2,
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {profileData.postsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  posts
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatCount(profileData.followersCount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  followers
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatCount(profileData.followingCount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  following
                </Typography>
              </Box>
            </Box>

            {/* Bio */}
            <Box sx={{ maxWidth: { xs: '100%', sm: 400 } }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: '0.875rem',
                }}
              >
                {profileData.fullName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line',
                  lineHeight: 1.4,
                  mb: 1,
                }}
              >
                {profileData.bio}
              </Typography>
              
              {/* Wallet Information */}
              {user?.wallet?.address && (
                <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {ensData.name && (
                    <Chip
                      label={ensData.name}
                      variant="outlined"
                      size="small"
                      color="primary"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <Chip
                    icon={<WalletIcon />}
                    label={ensData.displayName.startsWith('0x') ? ensData.displayName : `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`}
                    variant="outlined"
                    size="small"
                    onClick={handleCopyAddress}
                    sx={{
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      '& .MuiChip-icon': {
                        fontSize: '1rem',
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                </Box>
              )}
              
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                component="a"
                href={`https://${profileData.website}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profileData.website}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Mobile Stats Bar */}
        {isMobile && (
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                py: 1,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {profileData.postsCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  posts
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatCount(profileData.followersCount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  followers
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatCount(profileData.followingCount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  following
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>
        )}

        {/* Tabs */}
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '1px',
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'text.primary',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'text.primary',
                height: 1,
                bottom: 0,
              },
            }}
          >
            <Tab
              icon={<GridOnIcon fontSize="small" />}
              label="POSTS"
              sx={{ gap: 0.5 }}
            />
            <Tab
              icon={<BookmarkIcon fontSize="small" />}
              label="SAVED"
              sx={{ gap: 0.5 }}
            />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ mt: 2 }}>
          {currentTab === 0 && <PostGrid posts={userPosts} />}
          {currentTab === 1 && <PostGrid posts={savedPosts} />}
        </Box>
        </Box>

        {/* Sidebar */}
        <Box 
          sx={{ 
            width: { lg: 300 }, 
            display: { xs: 'block', lg: 'block' },
            mt: { xs: 4, lg: 0 }
          }}
        >
          {/* Trending Tags Placeholder */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
              Trending Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['#innovation', '#web3', '#blockchain', '#ai', '#startup'].map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  clickable
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* P2P Debug Card */}
          <P2PDebugCard />
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
