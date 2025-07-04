import React from 'react';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Stack,
  IconButton,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const { login } = useLogin({
    onComplete: () => {
      // Redirect to home page after successful login
      navigate('/');
    },
  });
  const { authenticated } = usePrivy();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);

  const features = [
    {
      icon: <WalletIcon />,
      title: 'Multi-Chain Support',
      description: 'Connect with any wallet across Base, Polygon, Arbitrum, and more'
    },
    {
      icon: <SecurityIcon />,
      title: 'Secure & Private',
      description: 'Your keys, your data. Built with privacy and security first'
    },
    {
      icon: <SpeedIcon />,
      title: 'Instant Connection',
      description: 'Get started in seconds with embedded wallets or your existing wallet'
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <Card
          sx={{
            boxShadow: { xs: 'none', sm: '0 8px 32px rgba(0,0,0,0.1)' },
            border: { xs: 'none', sm: '1px solid' },
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent
            sx={{
              p: { xs: 3, sm: 5 },
              textAlign: 'center',
            }}
          >
            {/* Logo and Title */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'cursive',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #E4405F, #405DE6, #833AB4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                }}
              >
                💡 Bulb
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                Welcome to Web3 Social
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Share ideas, connect with creators, and own your content in the decentralized future
              </Typography>
            </Box>

            {/* Login Button */}
            <Box sx={{ mb: 4 }}>
              <Button
                onClick={login}
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #E4405F, #405DE6)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #C13584, #405DE6)',
                  },
                  mb: 2,
                }}
              >
                Connect Wallet to Continue
              </Button>
              <Typography variant="caption" color="text.secondary">
                New to Web3? We'll create a wallet for you automatically
              </Typography>
            </Box>

            {/* Features */}
            <Stack spacing={3}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    textAlign: 'left',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      bgcolor: 'primary.50',
                      p: 1,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            {/* Footer */}
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Bottom Text */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Powered by{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'primary.main', fontWeight: 600 }}
            >
              Privy
            </Typography>{' '}
            for secure Web3 authentication
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
