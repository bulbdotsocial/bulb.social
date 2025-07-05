import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  AccountCircle as ProfileIcon,
  MonetizationOn as MonetizeIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { usePrivy } from '@privy-io/react-auth';
import { useENS } from '../hooks/useENS';
import { useBulbFactory, invalidateProfileCache } from '../hooks/useBulbFactory';
import { useContractWrite, type CreateProfileParams } from '../hooks/useContractWrite';

interface CreateProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (profileAddress: string) => void;
}

const CreateProfileDialog: React.FC<CreateProfileDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { user } = usePrivy();
  const userAddress = user?.wallet?.address;
  const ensData = useENS(userAddress);
  const { checkUserProfile, refetch } = useBulbFactory();
  const { createProfile, isLoading, error } = useContractWrite();

  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CreateProfileParams>({
    username: '',
    profilePicture: '',
    description: '',
  });
  const [validationErrors, setValidationErrors] = useState<Partial<CreateProfileParams>>({});
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  const steps = ['Profile Check', 'Profile Details', 'Monetization Setup'];

  // Auto-fill username with ENS name if available
  useEffect(() => {
    if (ensData.name && !formData.username) {
      setFormData(prev => ({
        ...prev,
        username: ensData.name || '',
      }));
    }
  }, [ensData.name, formData.username]);

  // Check if user already has a profile
  useEffect(() => {
    const checkProfile = async () => {
      if (userAddress && open) {
        setCheckingProfile(true);
        try {
          const { hasProfile } = await checkUserProfile(userAddress as `0x${string}`);
          setHasExistingProfile(hasProfile);
          if (!hasProfile) {
            setActiveStep(1); // Skip to profile details if no existing profile
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        } finally {
          setCheckingProfile(false);
        }
      }
    };

    checkProfile();
  }, [userAddress, open, checkUserProfile]);

  const validateForm = (): boolean => {
    const errors: Partial<CreateProfileParams> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscore, and dash';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 1 && !validateForm()) {
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateForm() || !userAddress) return;

    try {
      const txHash = await createProfile(formData, userAddress as `0x${string}`);
      console.log('Profile created with transaction:', txHash);
      
      // Invalidate the profile cache for this user to ensure fresh data
      invalidateProfileCache(userAddress);
      
      // Refresh the profiles data
      await refetch();
      
      if (onSuccess) {
        onSuccess(txHash);
      }
      
      handleClose();
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      username: ensData.name || '',
      profilePicture: '',
      description: '',
    });
    setValidationErrors({});
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {checkingProfile ? (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Checking existing profile...</Typography>
              </>
            ) : hasExistingProfile ? (
              <>
                <WarningIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Profile Already Exists
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  You already have a profile on the Bulb network. Each wallet can only have one profile.
                </Typography>
                <Button variant="outlined" onClick={handleClose}>
                  Close
                </Button>
              </>
            ) : (
              <>
                <ProfileIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Create Your Monetized Profile
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Set up your private profile to start monetizing your content creation on Bulb.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
                  <Chip label="Content Monetization" color="primary" size="small" />
                  <Chip label="Private Profile" color="secondary" size="small" />
                  <Chip label="On-Chain" color="success" size="small" />
                </Box>
              </>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Profile Information
            </Typography>
            
            {/* ENS Info */}
            {ensData.name && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>ENS Detected:</strong> {ensData.name}
                  <br />
                  Your username has been auto-filled with your ENS name.
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                {formData.username.slice(0, 2).toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  error={!!validationErrors.username}
                  helperText={validationErrors.username || 'This will be your unique identifier on Bulb'}
                  placeholder={ensData.name || 'Enter your username'}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Profile Picture (IPFS Hash - Optional)"
                  value={formData.profilePicture}
                  onChange={(e) => setFormData(prev => ({ ...prev, profilePicture: e.target.value }))}
                  placeholder="QmHash... or leave empty"
                  helperText="IPFS hash of your profile picture"
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              error={!!validationErrors.description}
              helperText={validationErrors.description || 'Describe yourself and what content you create'}
              placeholder="Tell the world about yourself and your content..."
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Monetization Setup
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MonetizeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Content Monetization</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Your profile will be created on-chain, enabling you to:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <li><Typography variant="body2">Set up subscription tiers for premium content</Typography></li>
                  <li><Typography variant="body2">Receive payments directly to your wallet</Typography></li>
                  <li><Typography variant="body2">Track earnings and subscriber metrics</Typography></li>
                  <li><Typography variant="body2">Control access to your exclusive content</Typography></li>
                </Box>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Transaction Required:</strong> Creating your profile requires a blockchain transaction on Flow testnet. 
                Make sure you have some FLOW tokens for gas fees.
              </Typography>
            </Alert>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Profile Summary:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {formData.username.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2"><strong>@{formData.username}</strong></Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formData.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProfileIcon color="primary" />
          Create Monetized Profile
        </Box>
      </DialogTitle>

      <DialogContent>
        {!hasExistingProfile && !checkingProfile && (
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        {!hasExistingProfile && !checkingProfile && (
          <>
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            
            {activeStep > 0 && activeStep < steps.length - 1 && (
              <Button onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
            )}
            
            {activeStep === 0 && !hasExistingProfile ? (
              <Button onClick={handleNext} variant="contained">
                Get Started
              </Button>
            ) : activeStep < steps.length - 1 ? (
              <Button onClick={handleNext} variant="contained">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <CheckIcon />}
              >
                {isLoading ? 'Creating Profile...' : 'Create Profile'}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateProfileDialog;
