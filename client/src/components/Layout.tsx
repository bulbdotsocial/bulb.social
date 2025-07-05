import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Explore as ExploreIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import PWAInstallPrompt from './PWAInstallPrompt';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useLogout();
  const { user } = usePrivy();
  const { logoSrc } = useLogo();
  const { mode, toggleTheme } = useThemeMode();
  
  // Get ENS data for the user's wallet address
  const walletAddress = user?.wallet?.address;
  const ensData = useENS(walletAddress);

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
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img 
            src={logoSrc} 
            alt="Bulb" 
            style={{ 
              height: '48px', 
              width: 'auto'
            }} 
          />
          <Typography 
            variant="h6" 
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
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          // Force transparent background with !important
          bgcolor: `${theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(18, 18, 18, 0.9)'} !important`,
          backgroundColor: `${theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(18, 18, 18, 0.9)'} !important`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.mode === 'light' 
            ? 'rgba(219, 219, 219, 0.5)' 
            : 'rgba(51, 51, 51, 0.5)'}`,
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            
            <IconButton 
              color="primary" 
              aria-label="add post"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                width: 32,
                height: 32,
              }}
            >
              <AddIcon fontSize="small" />
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
    </Box>
  );
};

export default Layout;
