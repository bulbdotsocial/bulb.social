/**
 * Layout principal refactorisé utilisant des sous-composants
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout, usePrivy } from '@privy-io/react-auth';
import { useLogo } from '../hooks/useLogo';
import { useENS } from '../hooks/useENS';
import { useThemeMode } from '../contexts/ThemeContext';
import {
  Box,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import { LayoutProps } from '../types';

// Sous-composants refactorisés
import AppBarComponent from './layout/AppBarComponent';
import NavigationDrawer from './layout/NavigationDrawer';
import UserMenu from './layout/UserMenu';
import PostCreation from './post/PostCreation';

// Composants existants (à intégrer progressivement)
import PWAInstallPrompt from './PWAInstallPrompt';
import Camera from './Camera';
import CropSelector from './CropSelector';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // États de l'interface utilisateur
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cropSelectorOpen, setCropSelectorOpen] = useState(false);
  const [rawImageFile, setRawImageFile] = useState<File | null>(null);

  // Hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { user } = usePrivy();
  const { logoSrc } = useLogo();
  const { mode, toggleTheme } = useThemeMode();

  // Get ENS data for the user's wallet address
  const address = user?.wallet?.address;
  const ensData = useENS(address);

  // Update PWA theme color based on current theme
  useEffect(() => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      const themeColor = mode === 'dark' ? '#E4405F' : '#FFFFFF';
      themeColorMeta.setAttribute('content', themeColor);
    }
  }, [mode]);

  // Handlers pour l'interface utilisateur
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
    navigate('/login');
    if (isMobile) {
      setDrawerOpen(false);
    }
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

  // Handlers pour les composants média (Camera, Crop)
  const handleCameraPhoto = (imageBlob: Blob) => {
    const file = new File([imageBlob], 'camera-photo.jpg', { type: 'image/jpeg' });
    // Logic pour traiter la photo de la caméra
    // TODO: Intégrer avec PostCreation
  };

  const handleCropConfirm = (croppedFile: File, previewUrl: string) => {
    // Logic pour traiter l'image croppée
    // TODO: Intégrer avec PostCreation
  };

  const handleCropCancel = () => {
    setCropSelectorOpen(false);
    setRawImageFile(null);
  };

  const handlePostCreated = () => {
    // Callback quand un post est créé avec succès
    // TODO: Rafraîchir le feed ou montrer un message de succès
    console.log('Post created successfully');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBarComponent
        onDrawerToggle={handleDrawerToggle}
        onUserMenuOpen={handleUserMenuOpen}
        logoSrc={logoSrc}
        userAddress={address}
        ensData={ensData}
      />

      {/* Navigation Drawer */}
      <NavigationDrawer
        open={drawerOpen}
        onClose={handleDrawerToggle}
        onNavigation={handleNavigation}
        onLogout={handleLogout}
        onThemeToggle={toggleTheme}
        themeMode={mode}
      />

      {/* User Menu */}
      <UserMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        onThemeToggle={toggleTheme}
        userAddress={address}
        ensData={ensData}
        themeMode={mode}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px', // AppBar height
          pl: !isMobile && drawerOpen ? '250px' : 0,
          transition: theme.transitions.create(['margin', 'padding'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            py: 2,
            px: { xs: 1, sm: 2 },
          }}
        >
          {children}
        </Container>
      </Box>

      {/* Post Creation SpeedDial */}
      <PostCreation
        userAddress={address}
        onPostCreated={handlePostCreated}
      />

      {/* Composants existants à garder pour l'instant */}
      <PWAInstallPrompt />
      
      <Camera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraPhoto}
      />
      
      {rawImageFile && (
        <CropSelector
          open={cropSelectorOpen}
          onClose={handleCropCancel}
          imageFile={rawImageFile}
          onCropComplete={handleCropConfirm}
        />
      )}
    </Box>
  );
};

export default Layout;
