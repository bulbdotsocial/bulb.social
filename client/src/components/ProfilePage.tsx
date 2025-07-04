import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
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
} from '@mui/material';
import {
  Settings as SettingsIcon,
  GridOn as GridOnIcon,
  BookmarkBorder as BookmarkIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';

interface ProfileData {
  username: string;
  fullName: string;
  bio: string;
  website: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
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

  // User data from Privy with fallbacks
  const profileData: ProfileData = {
    username: user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'web3_user',
    fullName: user?.email?.address || user?.wallet?.address?.slice(0, 8) || 'Web3 User',
    bio: '🚀 Web3 Innovation Platform\n💡 Sharing ideas that change the world\n🌟 Building the future of social media',
    website: 'bulb.social',
    postsCount: 42,
    followersCount: 1247,
    followingCount: 324,
    isVerified: true,
  };

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
      <Box
        sx={{
          maxWidth: 935,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 4 },
        }}
      >
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
            <Avatar
              sx={{
                width: { xs: 80, sm: 150 },
                height: { xs: 80, sm: 150 },
                bgcolor: 'primary.main',
                fontSize: { xs: '2rem', sm: '4rem' },
                fontWeight: 'bold',
                mb: { xs: 1, sm: 0 },
              }}
            >
              {user?.wallet?.address ? user.wallet.address.slice(2, 4).toUpperCase() : 
               user?.email?.address ? user.email.address.charAt(0).toUpperCase() : 'BC'}
            </Avatar>
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
              {profileData.isVerified && (
                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                    fontSize: '1.2rem',
                  }}
                >
                  ✓
                </Box>
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
                <Box sx={{ mb: 1 }}>
                  <Chip
                    icon={<WalletIcon />}
                    label={`${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      fontSize: '0.75rem',
                      '& .MuiChip-icon': {
                        fontSize: '1rem',
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
                top: 0,
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
    </Box>
  );
};

export default ProfilePage;
