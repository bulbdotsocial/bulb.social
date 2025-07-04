import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Explore as ExploreIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import PWAInstallPrompt from './PWAInstallPrompt';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
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
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: 'cursive',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #E4405F, #405DE6, #833AB4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          💡 Bulb
        </Typography>
      </Box>
      
      {/* Search on mobile */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Paper
          component="form"
          sx={{
            p: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#fafafa',
            border: '1px solid #dbdbdb',
            borderRadius: 8,
          }}
          elevation={0}
        >
          <SearchIcon sx={{ color: '#8e8e8e', mr: 1 }} />
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
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
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
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
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{
                fontFamily: 'cursive',
                fontWeight: 'bold',
                color: 'text.primary',
                background: 'linear-gradient(45deg, #E4405F, #405DE6, #833AB4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              💡 Bulb
            </Typography>
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
                bgcolor: '#fafafa',
                border: '1px solid #dbdbdb',
                borderRadius: 8,
                '&:focus-within': {
                  borderColor: '#8e8e8e',
                },
              }}
              elevation={0}
            >
              <SearchIcon sx={{ color: '#8e8e8e', mr: 1 }} />
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
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
            <Avatar
              onClick={() => handleNavigation('/profile')}
              sx={{
                width: 28,
                height: 28,
                bgcolor: location.pathname === '/profile' ? 'primary.main' : 'text.secondary',
                cursor: 'pointer',
                border: location.pathname === '/profile' ? '2px solid' : 'none',
                borderColor: 'primary.main',
              }}
            >
              U
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

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
