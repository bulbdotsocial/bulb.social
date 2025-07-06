import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useENS } from '../hooks/useENS';
import { useBulbFactory } from '../hooks/useBulbFactory';
import { useProfileContract } from '../hooks/useProfileContract';
import type { Address } from 'viem';
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
  const ensUpdatedRef = useRef(false);
  const fetchedAddressRef = useRef<string | null>(null);

  // Get ENS data for the user's wallet address
  const ensData = useENS(address);

  // Get profile contract data
  const { checkUserProfile } = useBulbFactory();
  const [profileContractAddress, setProfileContractAddress] = useState<Address | null>(null);
  const { profileInfo } = useProfileContract(profileContractAddress);

  // Check for profile contract when address changes
  useEffect(() => {
    const checkProfile = async () => {
      if (address) {
        try {
          const { hasProfile, profileAddress } = await checkUserProfile(address as Address);
          if (hasProfile && profileAddress) {
            setProfileContractAddress(profileAddress);
          } else {
            setProfileContractAddress(null);
          }
        } catch (error) {
          console.error('Error checking profile for address:', address, error);
          setProfileContractAddress(null);
        }
      }
    };

    checkProfile();
  }, [address, checkUserProfile]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!address) {
        setError('No address provided');
        setLoading(false);
        return;
      }

      // Prevent duplicate fetches for the same address
      if (fetchedAddressRef.current === address) {
        console.log('Skipping duplicate fetch for address:', address);
        return;
      }

      console.log('Fetching profile for address:', address);

      try {
        setLoading(true);
        setError(null);
        ensUpdatedRef.current = false; // Reset ENS update flag for new address
        fetchedAddressRef.current = address; // Mark this address as being fetched

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
          // Transform API data to UI format, prioritizing contract data
          const transformedData: UserProfileData = {
            address: profileItem.value.address,
            username: profileInfo?.username || (address ? `user_${address.slice(0, 6)}` : 'unknown_user'),
            fullName: ensData.name || profileItem.value.address.slice(0, 8),
            bio: profileInfo?.description || profileItem.value.description || '🌐 Web3 enthusiast\n💡 Building on Flow blockchain\n🚀 Sharing the journey',
            website: 'bulb.social',
            postsCount: apiData.filter(item => item.value.address.toLowerCase() === address.toLowerCase()).length,
            followersCount: Math.floor(Math.random() * 1000) + 100, // Mock data for now
            followingCount: Math.floor(Math.random() * 500) + 50, // Mock data for now
            avatarUrl: profileInfo?.profilePicture ? `https://ipfs.io/ipfs/${profileInfo.profilePicture}` : ensData.avatar || undefined,
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
        fetchedAddressRef.current = null; // Reset on error to allow retry
        // Fallback to mock data for development
        setProfileData({
          address: address!,
          username: profileInfo?.username || (address ? `user_${address.slice(0, 6)}` : 'unknown_user'),
          fullName: ensData.name || (address ? address.slice(0, 8) : 'Unknown User'),
          bio: profileInfo?.description || '🌐 Web3 enthusiast\n💡 Building on Flow blockchain\n🚀 Sharing the journey',
          website: 'bulb.social',
          postsCount: 24,
          followersCount: 847,
          followingCount: 156,
          avatarUrl: profileInfo?.profilePicture ? `https://ipfs.io/ipfs/${profileInfo.profilePicture}` : ensData.avatar || undefined,
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

  // Update profile data with contract profile information when available
  useEffect(() => {
    if (profileData && profileInfo) {
      setProfileData(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          username: profileInfo.username || prev.username,
          bio: profileInfo.description || prev.bio,
          avatarUrl: profileInfo.profilePicture ? `https://ipfs.io/ipfs/${profileInfo.profilePicture}` : prev.avatarUrl,
        };
      });
    }
  }, [profileData, profileInfo]);

  // Update profile data with ENS information when available
  useEffect(() => {
    if (profileData && ensData && !ensData.isLoading && !ensUpdatedRef.current) {
      // Only update if the current username is still the auto-generated one
      const isAutoGeneratedUsername = profileData.username.startsWith('user_');

      if (isAutoGeneratedUsername || ensData.name || ensData.avatar) {
        setProfileData(prev => {
          if (!prev) return null;

          return {
            ...prev,
            username: ensData.displayName || prev.username,
            fullName: ensData.name || prev.fullName,
            avatarUrl: ensData.avatar || prev.avatarUrl,
          };
        });
        ensUpdatedRef.current = true; // Mark as updated to prevent further updates
      }
    }
  }, [profileData, ensData]);

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

  // Memoize PostGrid to prevent unnecessary re-renders that could cause extra IPFS requests
  const PostGrid = useMemo(() => {
    return ({ posts }: { posts: Post[] }) => (
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
                onError={(e) => {
                  // Fallback for failed IPFS loads
                  const target = e.target as HTMLImageElement;
                  if (target.src !== 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop') {
                    target.src = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop';
                  }
                }}
              />
            </Card>
          </Box>
        ))}
      </Box>
    );
  }, []);

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
        <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            centered
            sx={(theme) => ({
              backgroundColor: 'transparent',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '1px',
                color: 'text.secondary',
                backgroundColor: 'transparent',
                '&.Mui-selected': {
                  color: 'text.primary',
                  backgroundColor: 'transparent',
                },
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light'
                    ? 'rgba(0,0,0,0.04)'
                    : 'rgba(255,255,255,0.04)',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'text.primary',
                height: 1,
                bottom: 0,
              },
            })}
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
