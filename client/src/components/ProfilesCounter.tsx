import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  AccountCircle as ProfileIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useBulbFactory } from '../hooks/useBulbFactory';
import { BULB_FACTORY_CONFIG, FLOW_TESTNET } from '../config/contract';

interface ProfilesCounterProps {
  variant?: 'card' | 'compact';
}

const ProfilesCounter: React.FC<ProfilesCounterProps> = ({ variant = 'card' }) => {
  const { profilesCount, allProfiles, isLoading, error, refetch } = useBulbFactory();

  const handleExplorerClick = () => {
    const explorerUrl = `${FLOW_TESTNET.blockExplorers.default.url}/address/${BULB_FACTORY_CONFIG.address}`;
    window.open(explorerUrl, '_blank');
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ProfileIcon color="primary" />
        <Typography variant="body2" color="text.secondary">
          Profiles:
        </Typography>
        {isLoading ? (
          <CircularProgress size={16} />
        ) : error ? (
          <Typography variant="body2" color="error">
            Error
          </Typography>
        ) : (
          <Typography variant="body2" fontWeight="bold">
            {profilesCount?.toString() || '0'}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
      elevation={0}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProfileIcon color="primary" />
            Bulb Profiles
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View on Explorer">
              <IconButton size="small" onClick={handleExplorerClick}>
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => refetch()} disabled={isLoading}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Profiles Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Total Profiles:
            </Typography>
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <Chip
                label={profilesCount?.toString() || '0'}
                color="primary"
                size="small"
                sx={{ fontWeight: 'bold', minWidth: 60 }}
              />
            )}
          </Box>

          {/* Active Profiles */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Active Profiles:
            </Typography>
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <Chip
                label={allProfiles.length.toString()}
                color="secondary"
                size="small"
                sx={{ fontWeight: 'bold', minWidth: 60 }}
              />
            )}
          </Box>

          {/* Contract Info */}
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Contract Address:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                wordBreak: 'break-all',
                display: 'block',
                bgcolor: 'background.default',
                p: 0.5,
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {BULB_FACTORY_CONFIG.address}
            </Typography>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 0.5 }}>
              Network:
            </Typography>
            <Chip
              label={`${FLOW_TESTNET.name} (${FLOW_TESTNET.id})`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfilesCounter;
