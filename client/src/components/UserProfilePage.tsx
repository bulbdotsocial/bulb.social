import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useENS } from '../hooks/useENS';
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
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  GridOn as GridOnIcon,
  AccountBalanceWallet as WalletIcon,
  Verified as VerifiedIcon,
  PersonAdd as FollowIcon,
} from '@mui/icons-material';

// API Response interfaces
interface ApiProfileValue {
  cid: string;
  description: string;
  address: string;
  created_at: string;
  tags: string[];
  private: boolean;
}

interface ApiProfileItem {
  hash: string;
  key: string;
  value: ApiProfileValue;
}

// UI interfaces
interface UserProfileData {
  address: string;
  username: string;
  fullName: string;
  bio: string;
  website: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  avatarUrl?: string;
  posts: Post[];
}

interface Post {
  id: number;
  imageUrl: string;
  likes: number;
  comments: number;
}

const UserProfilePage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get ENS data for the user's wallet address
  const ensData = useENS(address);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!address) {
        setError('No address provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://api.bulb.social/api/v0/profile/${address}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const apiData: ApiProfileItem[] = await response.json();
        console.log('API Response:', apiData);

        // Find the profile data for this address
        const profileItem = apiData.find(item => 
          item.value.address.toLowerCase() === address.toLowerCase()
        );

        if (profileItem) {
          // Transform API data to UI format
          const transformedData: UserProfileData = {
            address: profileItem.value.address,
            username: address ? `user_${address.slice(0, 6)}` : 'unknown_user',
            fullName: profileItem.value.address.slice(0, 8),
            bio: profileItem.value.description || '🌐 Web3 enthusiast\n💡 Building on Flow blockchain\n🚀 Sharing the journey',
            website: 'bulb.social',
            postsCount: apiData.filter(item => item.value.address.toLowerCase() === address.toLowerCase()).length,
            followersCount: Math.floor(Math.random() * 1000) + 100, // Mock data for now
            followingCount: Math.floor(Math.random() * 500) + 50, // Mock data for now
            posts: [], // We'll populate this from the API data
          };

          // Transform API items to posts if they have images
          const posts: Post[] = apiData
            .filter(item => item.value.address.toLowerCase() === address.toLowerCase())
            .map((item, index) => ({
              id: index + 1,
              imageUrl: `https://gateway.pinata.cloud/ipfs/${item.value.cid}`, // Assuming CID is for images
              likes: Math.floor(Math.random() * 200) + 10, // Mock likes
              comments: Math.floor(Math.random() * 50) + 1, // Mock comments
            }));

          transformedData.posts = posts.length > 0 ? posts : [
            // Fallback posts if no images found
            {
              id: 1,
              imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
              likes: 87,
              comments: 5,
            },
            {
              id: 2,
              imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
              likes: 64,
              comments: 8,
            },
          ];

          setProfileData(transformedData);
        } else {
          throw new Error('Profile not found for this address');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        // Fallback to mock data for development
        setProfileData({
          address: address!,
          username: address ? `user_${address.slice(0, 6)}` : 'unknown_user',
          fullName: address ? address.slice(0, 8) : 'Unknown User',
          bio: '🌐 Web3 enthusiast\n💡 Building on Flow blockchain\n🚀 Sharing the journey',
          website: 'bulb.social',
          postsCount: 24,
          followersCount: 847,
          followingCount: 156,
          posts: [
            {
              id: 1,
              imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
              likes: 87,
              comments: 5,
            },
            {
              id: 2,
              imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
              likes: 64,
              comments: 8,
            },
            {
              id: 3,
              imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop',
              likes: 156,
              comments: 12,
            },
            {
              id: 4,
              imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=300&fit=crop',
              likes: 123,
              comments: 15,
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [address]); // Remove ensData dependencies to avoid re-running when ENS loads

  // Update profile data with ENS information when available
  useEffect(() => {
    if (profileData && ensData && !ensData.isLoading) {
      setProfileData(prev => prev ? {
        ...prev,
        username: ensData.displayName || prev.username,
        fullName: ensData.name || prev.fullName,
        avatarUrl: ensData.avatar || prev.avatarUrl,
      } : null);
    }
  }, [ensData, profileData]);

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

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

  // Check if user is verified (has ENS domain)
  const isENSVerified = ensData.name && ensData.name.endsWith('.eth');

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

  if (loading) {
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
          {/* Loading skeleton */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, sm: 4 },
              mb: 4,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
            }}
          >
            <Skeleton
              variant="circular"
              sx={{
                width: { xs: 80, sm: 150 },
                height: { xs: 80, sm: 150 },
              }}
            />
            <Box sx={{ flex: 1, width: '100%' }}>
              <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2, maxWidth: 300 }} />
              <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                <Skeleton variant="text" sx={{ width: 60 }} />
                <Skeleton variant="text" sx={{ width: 80 }} />
                <Skeleton variant="text" sx={{ width: 70 }} />
              </Box>
              <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1, maxWidth: 200 }} />
              <Skeleton variant="text" sx={{ fontSize: '0.875rem', maxWidth: 400 }} />
              <Skeleton variant="text" sx={{ fontSize: '0.875rem', maxWidth: 350 }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error || !profileData) {
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
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'User profile not found'}
          </Alert>
        </Box>
      </Box>
    );
  }

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
                src={ensData.avatar || profileData.avatarUrl || undefined}
                sx={{
                  width: { xs: 80, sm: 150 },
                  height: { xs: 80, sm: 150 },
                  bgcolor: 'primary.main',
                  fontSize: { xs: '2rem', sm: '4rem' },
                  fontWeight: 'bold',
                  mb: { xs: 1, sm: 0 },
                }}
              >
                {!ensData.avatar && !profileData.avatarUrl && ensData.displayName && (
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
                      bgcolor: 'primary.main',
                      color: 'white',
                      ml: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      flexShrink: 0,
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
              {/* Follow Button */}
              <Button
                variant="contained"
                size="small"
                startIcon={<FollowIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #6B7280, #374151)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4B5563, #1F2937)',
                  },
                }}
              >
                Follow
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
              {address && (
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
                    label={ensData.displayName && ensData.displayName.startsWith('0x') ? ensData.displayName : `${address.slice(0, 6)}...${address.slice(-4)}`}
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
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ mt: 2 }}>
          {currentTab === 0 && <PostGrid posts={profileData.posts} />}
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfilePage;
