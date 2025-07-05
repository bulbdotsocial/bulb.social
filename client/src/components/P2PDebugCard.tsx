import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Divider,
  Alert,
} from '@mui/material';
import {
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useP2P } from '../hooks/useP2P';
import { useBulbDB } from '../hooks/useBulbDB';

const P2PDebugCard: React.FC = () => {
  const { helia, orbitdb, isConnecting, isConnected, error, peersCount, connectionStage, logs } = useP2P();
  const { database, posts, isLoading: isDBLoading, error: dbError, isReady } = useBulbDB();
  const [expanded, setExpanded] = useState(false);
  const [connectionTime, setConnectionTime] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  // Debug log to ensure component is rendering
  console.log('🔍 P2PDebugCard rendering:', { isConnecting, isConnected, error });

  useEffect(() => {
    if (isConnected && !connectionTime) {
      setConnectionTime(Date.now() - startTime);
    }
  }, [isConnected, connectionTime, startTime]);

  const getStatusColor = () => {
    if (error) return 'error';
    if (isConnecting) return 'warning';
    if (isConnected) return 'success';
    return 'default';
  };

  const getStatusIcon = () => {
    if (error) return <CloudOffIcon />;
    if (isConnecting) return <RefreshIcon className="animate-spin" />;
    if (isConnected) return <CloudIcon />;
    return <CloudOffIcon />;
  };

  const getStatusText = () => {
    if (error) return 'Connection Failed';
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ mb: 2, border: '2px solid', borderColor: 'primary.main' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: 'primary.main' }}>
            🌐 P2P Network Status
          </Typography>
          <IconButton size="small" onClick={handleToggleExpanded}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Main Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip
            icon={getStatusIcon()}
            label={getStatusText()}
            color={getStatusColor()}
            size="small"
            variant="outlined"
          />
          {peersCount > 0 && (
            <Chip
              icon={<GroupIcon />}
              label={`${peersCount} peer${peersCount !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {/* Connection Progress */}
        {isConnecting && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {connectionStage}: Initializing IPFS node and OrbitDB...
            </Typography>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.75rem' }}>
            {error}
          </Alert>
        )}

        {/* Expanded Details */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 1 }} />
          
          {/* IPFS/Helia Status */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              IPFS Node (Helia)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip
                label={helia ? 'Active' : 'Inactive'}
                size="small"
                color={helia ? 'success' : 'default'}
                variant="outlined"
              />
              {helia && (
                <Chip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={`Node: ${(helia as any).libp2p?.peerId?.toString()?.slice(0, 12) || 'Unknown'}...`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
            {connectionTime && (
              <Typography variant="caption" color="text.secondary">
                Connected in {(connectionTime / 1000).toFixed(1)}s
              </Typography>
            )}
          </Box>

          {/* OrbitDB Status */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              OrbitDB
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip
                label={orbitdb ? 'Active' : 'Inactive'}
                size="small"
                color={orbitdb ? 'success' : 'default'}
                variant="outlined"
              />
              {orbitdb && (
                <Chip
                  label={`ID: ${orbitdb.id.slice(0, 12)}...`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
            {dbError && (
              <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem' }}>
                DB Error: {dbError}
              </Alert>
            )}
          </Box>

          {/* Bulb Database Status */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Bulb Posts Database
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip
                icon={<StorageIcon />}
                label={isReady ? 'Ready' : isDBLoading ? 'Loading...' : 'Not Ready'}
                size="small"
                color={isReady ? 'success' : isDBLoading ? 'warning' : 'default'}
                variant="outlined"
              />
              <Chip
                label={`${posts.length} posts`}
                size="small"
                variant="outlined"
              />
            </Box>
            {database && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Address: {database.address}
              </Typography>
            )}
          </Box>

          {/* Network Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Network Info
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Target DB: /orbitdb/zdpuAr4P2gGQRgeKcC6NNBCLFzMnEAJgnFZX7s5MATDEqn65x
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Status: {isConnected ? 'Connected to P2P network' : connectionStage}
            </Typography>
          </Box>

          {/* Connection Logs */}
          {logs.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Connection Log
              </Typography>
              <Box 
                sx={{ 
                  maxHeight: 120, 
                  overflow: 'auto', 
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  fontSize: '0.7rem',
                  fontFamily: 'monospace'
                }}
              >
                {logs.slice(-10).map((log, index) => (
                  <Typography 
                    key={index} 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      lineHeight: 1.2,
                      color: log.includes('❌') ? 'error.main' : 
                             log.includes('✅') ? 'success.main' : 
                             log.includes('🚀') ? 'primary.main' : 'text.secondary',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem'
                    }}
                  >
                    {log}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default P2PDebugCard;
