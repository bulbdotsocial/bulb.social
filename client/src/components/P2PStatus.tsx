import React from 'react';
import { Box, Typography, Chip, Tooltip, CircularProgress } from '@mui/material';
import { Cloud as CloudIcon, CloudOff as CloudOffIcon, Group as GroupIcon } from '@mui/icons-material';
import { useP2P } from '../hooks/useP2P';

const P2PStatus: React.FC = () => {
  const { isConnecting, isConnected, error, peersCount } = useP2P();

  if (isConnecting) {
    return (
      <Tooltip title="Connecting to P2P network..." placement="bottom">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            Connecting...
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  if (error) {
    return (
      <Tooltip title={`P2P Error: ${error}`} placement="bottom">
        <Chip
          icon={<CloudOffIcon />}
          label="Offline"
          size="small"
          color="error"
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      </Tooltip>
    );
  }

  if (isConnected) {
    return (
      <Tooltip title="Connected to decentralized network" placement="bottom">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<CloudIcon />}
            label="P2P"
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          {peersCount > 0 && (
            <Chip
              icon={<GroupIcon />}
              label={`${peersCount} peer${peersCount !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
      </Tooltip>
    );
  }

  return null;
};

export default P2PStatus;
