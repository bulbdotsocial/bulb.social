import React, { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useENS } from '../hooks/useENS';
import { useBulbFactory } from '../hooks/useBulbFactory';
import { useProfileContract } from '../hooks/useProfileContract';
import CreateProfileDialog from './CreateProfileDialog';
import UpdateProfileDialog from './UpdateProfileDialog';
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
  CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  GridOn as GridOnIcon,
  BookmarkBorder as BookmarkIcon,
  AccountBalanceWallet as WalletIcon,
  Verified as VerifiedIcon,
  Star as ExclusiveIcon,
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
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [updateProfileOpen, setUpdateProfileOpen] = useState(false);
  const { user } = usePrivy();

  // Get ENS data for the user's wallet address
  const walletAddress = user?.wallet?.address;
  const ensData = useENS(walletAddress);

  // Check if user has an exclusive profile
  const { checkUserProfile } = useBulbFactory();
  const [hasExclusiveProfile, setHasExclusiveProfile] = useState<boolean | null>(null);
  const [profileContractAddress, setProfileContractAddress] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // User posts state
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Get profile data from contract
  const { profileInfo, refreshProfile } = useProfileContract(
    profileContractAddress as `0x${string}` | null
  );

  // Check for exclusive profile on mount and when wallet changes
  const checkProfile = useCallback(async () => {
    if (walletAddress) {
      setCheckingProfile(true);
      try {
        const { hasProfile, profileAddress } = await checkUserProfile(walletAddress as `0x${string}`);
        setHasExclusiveProfile(hasProfile);
        setProfileContractAddress(profileAddress);
      } catch (error) {
        console.error('Error checking exclusive profile:', error);
        setHasExclusiveProfile(false);
        setProfileContractAddress(null);
      } finally {
        setCheckingProfile(false);
      }
    } else {
      setHasExclusiveProfile(null);
      setProfileContractAddress(null);
    }
  }, [walletAddress, checkUserProfile]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

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

  // User data from Privy with ENS fallbacks, prioritizing contract data when available
  const profileData: ProfileData = {
    username: profileInfo?.username || ensData.displayName || 'web3_user',
    fullName: ensData.name || user?.email?.address || user?.wallet?.address?.slice(0, 8) || 'Web3 User',
    bio: profileInfo?.description || '🚀 Web3 Innovation Platform\n💡 Sharing ideas that change the world\n🌟 Building the future of social media',
    website: 'bulb.social',
    postsCount: 42,
    followersCount: 1247,
    followingCount: 324,
  };

  // Check if user is verified (has ENS domain)
  const isENSVerified = ensData.name && ensData.name.endsWith('.eth');

  // Fetch user's posts from API
  const fetchUserPosts = useCallback(async () => {
    if (!walletAddress) return;

    setLoadingPosts(true);
    try {
      const response = await fetch(`https://api.bulb.social/api/v0/profile/${walletAddress}`);
      if (response.ok) {
        const data = await response.json();

        // Transform API data to posts format
        const posts: Post[] = data
          .filter((item: any) =>
            item.value.address.toLowerCase() === walletAddress.toLowerCase() &&
            !item.value.private
          )
          .map((item: any, index: number) => ({
            id: index + 1,
            imageUrl: `https://ipfs.io/ipfs/${item.value.cid}`,
            likes: Math.floor(Math.random() * 200) + 10,
            comments: Math.floor(Math.random() * 50) + 1,
          }));

        setUserPosts(posts);
      } else {
        // Fallback to empty array if API fails
        setUserPosts([]);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [walletAddress]);

  // Fetch posts when wallet address changes
  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const savedPosts: Post[] = [];

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
          bgcolor: 'background.default',
          position: 'relative',
          zIndex: 1,
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
                  color: 'text.primary',
                  opacity: 1,
                  textShadow: 'none',
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
              {/* Profile Action Button */}
              {checkingProfile ? (
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  startIcon={<CircularProgress size={16} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: 'divider',
                    color: 'text.primary',
                  }}
                >
                  Checking...
                </Button>
              ) : hasExclusiveProfile === false ? (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setCreateProfileOpen(true)}
                  startIcon={<ExclusiveIcon />}
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
                  Create Exclusive Profile
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setUpdateProfileOpen(true)}
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
                  Edit Profile
                </Button>
              )}
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
            <Box sx={{
              maxWidth: { xs: '100%', sm: 400 },
              bgcolor: 'background.default',
              p: 0,
            }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  opacity: 1,
                }}
              >
                {profileData.fullName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line',
                  lineHeight: 1.4,
                  color: 'text.primary',
                  opacity: 1,
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
                // backgroundColor: 'text.primary',
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
            <Tab
              icon={<BookmarkIcon fontSize="small" />}
              label="SAVED"
              sx={{ gap: 0.5 }}
            />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ mt: 2 }}>
          {currentTab === 0 && (
            loadingPosts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : userPosts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No Posts Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When you share photos, they will appear on your profile.
                </Typography>
              </Box>
            ) : (
              <PostGrid posts={userPosts} />
            )
          )}
          {currentTab === 1 && (
            savedPosts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No Saved Posts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Save posts to view them here.
                </Typography>
              </Box>
            ) : (
              <PostGrid posts={savedPosts} />
            )
          )}
        </Box>
      </Box>

      {/* Create Exclusive Profile Dialog */}
      <CreateProfileDialog
        open={createProfileOpen}
        onClose={() => setCreateProfileOpen(false)}
        onSuccess={(profileAddress) => {
          console.log('Exclusive profile created at:', profileAddress);
          setHasExclusiveProfile(true);
          setCreateProfileOpen(false);
          // Refresh profile check to ensure cache is updated
          checkProfile();
        }}
      />

      {/* Update Profile Dialog */}
      <UpdateProfileDialog
        open={updateProfileOpen}
        onClose={() => setUpdateProfileOpen(false)}
        onSuccess={() => {
          console.log('Profile updated successfully');
          setUpdateProfileOpen(false);
          // Refresh profile data from the contract
          refreshProfile();
          // Refresh profile check to update any cached data
          checkProfile();
        }}
        currentProfile={{
          username: profileData.username,
          profilePicture: profileInfo?.profilePicture || '',
          description: profileData.bio,
        }}
        profileContractAddress={profileContractAddress as `0x${string}` | undefined}
      />
    </Box>
  );
};

export default ProfilePage;
