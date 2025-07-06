import React, { useState, useEffect } from 'react';
import {
  Button,
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extend Navigator interface to include standalone property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const hasUserDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (already installed)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsAppInstalled(true);
        return true;
      }

      // Check if running as installed PWA
      if (window.navigator.standalone === true) {
        setIsAppInstalled(true);
        return true;
      }

      return false;
    };

    // Don't show prompt if already installed or previously dismissed
    if (checkIfInstalled() || hasUserDismissed) {
      return;
    }

    // Show prompt immediately on first load (for testing/demo purposes)
    const timer = setTimeout(() => {
      setShowInstallPrompt(true);
    }, 2000); // Show after 2 seconds to allow page to load

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update the prompt to show if not already showing and not dismissed
      if (!hasUserDismissed) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsAppInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      // Clear the dismissed flag since app is now installed
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); // Empty dependency array is fine here as we want this to run only once

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Use the deferred prompt if available
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } else {
      // Fallback: Show instructions for manual installation
      alert(
        'To install this app:\n\n' +
        'On Chrome/Edge (Android/Desktop):\n' +
        '1. Look for the install icon in the address bar\n' +
        '2. Or use the browser menu → "Install app"\n\n' +
        'On Safari (iOS):\n' +
        '1. Tap the Share button\n' +
        '2. Scroll down and tap "Add to Home Screen"'
      );
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    // Remember that user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallPrompt || isAppInstalled) {
    return null;
  }

  return (
    <Snackbar
      open={showInstallPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        mb: 2,
        '& .MuiSnackbar-root': {
          backgroundColor: 'transparent',
        }
      }}
    >
      <Alert
        severity="info"
        sx={(theme) => ({
          width: '100%',
          alignItems: 'center',
          bgcolor: theme.palette.mode === 'light' ? 'primary.main' : '#2e2e2e',
          color: '#ffffff',
          border: 'none',
          borderRadius: 2,
          opacity: 1,
          boxShadow: theme.palette.mode === 'light'
            ? '0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.6)',
          '& .MuiAlert-icon': {
            color: '#ffffff',
          },
          '& .MuiAlert-message': {
            width: '100%',
            color: '#ffffff',
            fontWeight: 500,
          },
        })}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              onClick={handleInstallClick}
              startIcon={<InstallIcon />}
              sx={{
                color: '#ffffff',
                borderColor: '#ffffff',
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
              variant="outlined"
            >
              Install
            </Button>
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{ color: '#ffffff' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            Install Bulb App
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#ffffff' }}>
            Add to your home screen for the best experience
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default PWAInstallPrompt;
