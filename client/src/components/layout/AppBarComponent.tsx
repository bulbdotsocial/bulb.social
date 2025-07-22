/**
 * Composant AppBar de l'application
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Avatar,
  InputBase,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
// Types importés depuis le dossier types centralisé

interface AppBarComponentProps {
  onDrawerToggle: () => void;
  onUserMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  logoSrc?: string;
  userAddress?: string;
  ensData?: { name?: string; avatar?: string };
}

const AppBarComponent: React.FC<AppBarComponentProps> = ({
  onDrawerToggle,
  onUserMenuOpen,
  logoSrc,
  userAddress,
  ensData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
        {/* Left side - Menu and Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onDrawerToggle}
              sx={{ mr: 2, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box
            onClick={() => window.location.href = '/'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              ml: isMobile ? 0 : 2,
            }}
          >
            {logoSrc && (
              <img
                src={logoSrc}
                alt="Bulb Social"
                style={{
                  height: 32,
                  marginRight: 8,
                }}
              />
            )}
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '1.5rem',
                fontFamily: 'Instagram Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              Bulb Social
            </Typography>
          </Box>
        </Box>

        {/* Center - Search (desktop only) */}
        {!isMobile && (
          <Paper
            component="form"
            sx={{
              p: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              width: 300,
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
        )}

        {/* Right side - User Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={onUserMenuOpen}
            sx={{ p: 0.5 }}
          >
            <Avatar
              src={ensData?.avatar}
              sx={{
                width: 32,
                height: 32,
                border: '2px solid transparent',
                '&:hover': {
                  border: `2px solid ${theme.palette.primary.main}`,
                },
              }}
            >
              {ensData?.name ? ensData.name[0].toUpperCase() : '?'}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
