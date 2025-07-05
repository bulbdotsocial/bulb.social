import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogout, usePrivy } from '@privy-io/react-auth';
import { useLogo } from '../hooks/useLogo';
import { useENS } from '../hooks/useENS';
import { useThemeMode } from '../contexts/ThemeContext';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Container,
  Avatar,
  InputBase,
  Paper,
  Divider,
  Skeleton,
  Menu,
  MenuItem,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
} from '@mui/material';
import ProfilesCounter from './ProfilesCounter';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Explore as ExploreIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  PhotoLibrary as PhotoLibraryIcon,
  CameraAlt as CameraAltIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PWAInstallPrompt from './PWAInstallPrompt';
import Camera from './Camera';
import CropSelector from './CropSelector';

interface LayoutProps {
  children: React.ReactNode;
}

interface PostData {
  cid: string;
  description: string;
  address: string;
  tags: string[];
  createdAt: string;
}

interface UploadResponse {
  message: string;
  cid: string;
}

interface CreatePostResponse {
  message: string;
  orbit_hash: string;
  db_address: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cropSelectorOpen, setCropSelectorOpen] = useState(false);
  const [rawImageFile, setRawImageFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [tags, settags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useLogout();
  const { user } = usePrivy();
  const { logoSrc } = useLogo();
  const { mode, toggleTheme } = useThemeMode();
  
  // Update PWA theme color based on current theme
  useEffect(() => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      // Use Instagram-like colors: pink for dark mode, white for light mode
      const themeColor = mode === 'dark' ? '#E4405F' : '#FFFFFF';
      themeColorMeta.setAttribute('content', themeColor);
    }
  }, [mode]);

  // Get ENS data for the user's wallet address
  const address = user?.wallet?.address;
  const ensData = useENS(address);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Navigate to login page after logout
    navigate('/login');
    if (isMobile) {
      setDrawerOpen(false);
    }
    // Close user menu if open
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleNavigation('/profile');
    setAnchorEl(null);
  };

  // SpeedDial handlers
  const handleCameraCapture = () => {
    setCameraOpen(true);
    setSpeedDialOpen(false);
  };

  // Handle camera photo capture
  const handleCameraPhoto = (imageBlob: Blob) => {
    // Convert blob to file
    const file = new File([imageBlob], 'camera-photo.jpg', { type: 'image/jpeg' });
    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setUploadDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoLibrary = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        setRawImageFile(file);
        setCropSelectorOpen(true);
      }
    };
    input.click();
  };

  const handleCropConfirm = (croppedFile: File, previewUrl: string) => {
    setSelectedImage(croppedFile);
    setImagePreview(previewUrl);
    setUploadDialogOpen(true);
  };

  const handleCropCancel = () => {
    setCropSelectorOpen(false);
    setRawImageFile(null);
  };

  const handlePostSubmit = async () => {
    if (!selectedImage || !description.trim()) return;
    
    if (!address) {
      setUploadError('No wallet address found. Please connect your wallet.');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Stage 1: Upload image to get IPFS CID
      const formData = new FormData();
      formData.append('file', selectedImage);
      
      const uploadResponse = await fetch('https://api.bulb.social/api/v0/upload-pic', {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      const uploadResult: UploadResponse = await uploadResponse.json();
      const cid = uploadResult.cid;
      
      if (!cid) {
        throw new Error('No CID returned from image upload');
      }
      
      // Stage 2: Create post with metadata
      const postData: PostData = {
        cid: cid,
        description: description.trim(),
        address: address,
        tags: tags.split(' ').filter(tag => tag.trim().startsWith('#')),
        createdAt: new Date().toISOString(),
      };
      
      const createPostResponse = await fetch('https://api.bulb.social/api/v0/create-post', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!createPostResponse.ok) {
        throw new Error(`Post creation failed: ${createPostResponse.statusText}`);
      }
      
      const createPostResult: CreatePostResponse = await createPostResponse.json();
      console.log('Post created successfully:', createPostResult);
      
      // Reset form and close dialog
      setSelectedImage(null);
      setImagePreview(null);
      setDescription('');
      settags('');
      setUploadDialogOpen(false);
      
      // TODO: Show success message or refresh feed
      
    } catch (error) {
      console.error('Error uploading post:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload post');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDialogClose = () => {
    setUploadDialogOpen(false);
    setCameraOpen(false);
    setSelectedImage(null);
    setImagePreview(null);
    setDescription('');
    settags('');
    setUploadError(null);
    setIsUploading(false);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Explore', icon: <ExploreIcon />, path: '/explore' },
    { text: 'Activity', icon: <FavoriteBorderIcon />, path: '/activity' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const drawer = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        bgcolor: 'background.paper',
      }}
      role="presentation"
      onClick={handleDrawerToggle}
    >
      {/* Search on mobile */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Paper
          component="form"
          sx={{
            p: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'light' ? '#fafafa' : 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
          }}
          elevation={0}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            sx={{ 
              ml: 1, 
              flex: 1, 
              fontSize: '0.875rem',
              color: 'text.primary',
            }}
            placeholder="Search"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Paper>
      </Box>

      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              cursor: 'pointer',
              py: 1.5,
              px: 3,
              '&:hover': {
                bgcolor: 'action.hover',
              },
              bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
            }}
          >
            <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
                fontSize: '1rem',
              }}
            />
          </ListItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        {/* Theme toggle option */}
        <ListItem 
          onClick={toggleTheme}
          sx={{
            cursor: 'pointer',
            py: 1.5,
            px: 3,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText 
            primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            primaryTypographyProps={{
              fontWeight: 400,
              fontSize: '1rem',
            }}
          />
        </ListItem>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Logout option */}
        <ListItem 
          onClick={handleLogout}
          sx={{
            cursor: 'pointer',
            py: 1.5,
            px: 3,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'text.primary', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 400,
              fontSize: '1rem',
            }}
          />
        </ListItem>
      </List>
      
      {/* Profiles Counter */}
      <Box sx={{ px: 2, pb: 2, mt: 'auto' }}>
        <ProfilesCounter variant="card" />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          // Force transparent background with !important - increased transparency
          bgcolor: `${theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.75)' 
            : 'rgba(18, 18, 18, 0.75)'} !important`,
          backgroundColor: `${theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.75)' 
            : 'rgba(18, 18, 18, 0.75)'} !important`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.mode === 'light' 
            ? 'rgba(219, 219, 219, 0.4)' 
            : 'rgba(51, 51, 51, 0.4)'}`,
          boxShadow: 'none',
        }}
        elevation={0}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          {/* Left side - Menu button on mobile, Logo on desktop */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.6,
                },
              }}
              onClick={() => handleNavigation('/')}
            >
              <img 
                src={logoSrc} 
                alt="Bulb" 
                style={{ 
                  height: '28px', 
                  width: 'auto'
                }} 
              />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  fontSize: '2rem',
                  fontFamily: '"Funnel Display", cursive',
                }}
              >
                Bulb
              </Typography>
            </Box>
          </Box>

          {/* Center - Search bar on desktop */}
          {!isMobile && (
            <Paper
              component="form"
              sx={{
                p: '2px 16px',
                display: 'flex',
                alignItems: 'center',
                width: 268,
                bgcolor: theme.palette.mode === 'light' ? '#fafafa' : 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                '&:focus-within': {
                  borderColor: theme.palette.text.secondary,
                },
              }}
              elevation={0}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase
                sx={{ 
                  ml: 1, 
                  flex: 1, 
                  fontSize: '0.875rem',
                  color: 'text.primary',
                }}
                placeholder="Search"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Paper>
          )}

          {/* Right side - Action buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <>
                <IconButton 
                  color="inherit" 
                  aria-label="home"
                  onClick={() => handleNavigation('/')}
                  sx={{
                    color: location.pathname === '/' ? 'primary.main' : 'inherit',
                  }}
                >
                  <HomeIcon />
                </IconButton>
                <IconButton 
                  color="inherit" 
                  aria-label="explore"
                  onClick={() => handleNavigation('/explore')}
                  sx={{
                    color: location.pathname === '/explore' ? 'primary.main' : 'inherit',
                  }}
                >
                  <ExploreIcon />
                </IconButton>
                <IconButton 
                  color="inherit" 
                  aria-label="activity"
                  onClick={() => handleNavigation('/activity')}
                  sx={{
                    color: location.pathname === '/activity' ? 'primary.main' : 'inherit',
                  }}
                >
                  <FavoriteBorderIcon />
                </IconButton>
              </>
            )}
            
            {/* Theme toggle button */}
            <IconButton 
              color="inherit" 
              aria-label="toggle theme"
              onClick={toggleTheme}
              sx={{
                color: 'text.primary',
              }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            {ensData.isLoading ? (
              <Skeleton
                variant="circular"
                width={28}
                height={28}
                sx={{ bgcolor: 'action.hover' }}
              />
            ) : (
              <Avatar
                onClick={isMobile ? () => handleNavigation('/profile') : handleUserMenuOpen}
                src={ensData.avatar || undefined}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: location.pathname === '/profile' ? 'primary.main' : 'text.secondary',
                  cursor: 'pointer',
                  border: location.pathname === '/profile' ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  fontSize: '0.75rem',
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
        </Toolbar>
      </AppBar>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
          '& .MuiPaper-root': {
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            minWidth: 180,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon sx={{ color: 'text.primary' }}>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={toggleTheme}>
          <ListItemIcon sx={{ color: 'text.primary' }}>
            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Disconnect" />
        </MenuItem>
      </Menu>

      <Drawer
        variant={isMobile ? 'temporary' : 'temporary'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: '64px', // Height of AppBar
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            py: 0,
            px: 0,
            maxWidth: 'none !important',
          }}
        >
          {children}
        </Container>
      </Box>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Global SpeedDial for creating posts */}
      <SpeedDial
        ariaLabel="Create post options"
        sx={{
          position: 'fixed',
          bottom: { xs: 80, sm: 32 },
          right: { xs: 16, sm: 32 },
          '& .MuiSpeedDial-fab': {
            bgcolor: 'primary.main',
            width: 64,
            height: 64,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          },
          '& .MuiSpeedDialIcon-root': {
            transform: 'scale(1.2)', // Scale the icon to match larger button
          },
          '& .MuiSpeedDialIcon-icon': {
            fontSize: '1.5rem',
          },
          '& .MuiSpeedDialIcon-openIcon': {
            fontSize: '1.5rem',
          },
        }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
      >
        <SpeedDialAction
          icon={<PhotoLibraryIcon />}
          tooltipTitle="Photo Library"
          onClick={handlePhotoLibrary}
          sx={{
            '& .MuiSpeedDialAction-fab': {
              bgcolor: 'background.paper',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem',
            },
          }}
        />
        <SpeedDialAction
          icon={<CameraAltIcon />}
          tooltipTitle="Camera"
          onClick={handleCameraCapture}
          sx={{
            '& .MuiSpeedDialAction-fab': {
              bgcolor: 'background.paper',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            },
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem',
            },
          }}
        />
      </SpeedDial>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Create New Post</Typography>
          <IconButton onClick={handleDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 1 }}>
          {/* Error Message */}
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Card sx={{ maxWidth: 400, mx: 'auto' }}>
                <CardMedia
                  component="img"
                  image={imagePreview}
                  alt="Selected image"
                  sx={{
                    maxHeight: 400,
                    objectFit: 'contain',
                  }}
                />
              </Card>
            </Box>
          )}

          {/* Description Input */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Write a caption..."
            placeholder="Share what's on your mind..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
            disabled={isUploading}
          />

          {/* tags Input */}
          <TextField
            fullWidth
            label="tags"
            placeholder="#innovation #technology #bulb"
            value={tags}
            onChange={(e) => settags(e.target.value)}
            variant="outlined"
            helperText="Add tags to reach more people"
            disabled={isUploading}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleDialogClose} color="inherit" disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handlePostSubmit}
            variant="contained"
            disabled={!selectedImage || !description.trim() || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            {isUploading ? 'Uploading...' : 'Share Post'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Camera Component */}
      <Camera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraPhoto}
      />

      {/* Crop Selector Component */}
      <CropSelector
        open={cropSelectorOpen}
        onClose={handleCropCancel}
        onCropConfirm={handleCropConfirm}
        imageFile={rawImageFile}
      />
    </Box>
  );
};

export default Layout;
