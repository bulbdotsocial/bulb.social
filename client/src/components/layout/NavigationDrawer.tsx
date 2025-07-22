/**
 * Composant de navigation latérale
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Paper,
  InputBase,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Explore as ExploreIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigation: (path: string) => void;
  onLogout: () => void;
  onThemeToggle: () => void;
  themeMode: string;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  onClose,
  onNavigation,
  onLogout,
  onThemeToggle,
  themeMode,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

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
      onClick={onClose}
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
            onClick={() => onNavigation(item.path)}
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
          onClick={onThemeToggle}
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
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText
            primary={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            primaryTypographyProps={{
              fontWeight: 400,
              fontSize: '1rem',
            }}
          />
        </ListItem>

        <Divider sx={{ my: 1 }} />

        {/* Logout option */}
        <ListItem
          onClick={onLogout}
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
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          top: isMobile ? 0 : 64,
          height: isMobile ? '100%' : 'calc(100% - 64px)',
          bgcolor: 'background.paper',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default NavigationDrawer;
