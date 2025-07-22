/**
 * Menu utilisateur avec options de profil et déconnexion
 */

import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { formatAddress } from '../../utils';

interface UserMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  onThemeToggle: () => void;
  userAddress?: string;
  ensData?: { name?: string; avatar?: string };
  themeMode: string;
}

const UserMenu: React.FC<UserMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onProfileClick,
  onLogout,
  onThemeToggle,
  userAddress,
  ensData,
  themeMode,
}) => {
  const displayName = ensData?.name || (userAddress ? formatAddress(userAddress) : 'Unknown');

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 200,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* User Info Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={ensData?.avatar}
            sx={{ width: 40, height: 40 }}
          >
            {ensData?.name ? ensData.name[0].toUpperCase() : '?'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {displayName}
            </Typography>
            {ensData?.name && userAddress && (
              <Typography variant="caption" color="text.secondary">
                {formatAddress(userAddress)}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <MenuItem onClick={onProfileClick} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </MenuItem>

      <MenuItem onClick={() => {/* TODO: Settings */}} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </MenuItem>

      <Divider />

      <MenuItem onClick={onThemeToggle} sx={{ py: 1.5 }}>
        <ListItemIcon>
          {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </ListItemIcon>
        <ListItemText primary={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
      </MenuItem>

      <Divider />

      <MenuItem onClick={onLogout} sx={{ py: 1.5, color: 'error.main' }}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;
