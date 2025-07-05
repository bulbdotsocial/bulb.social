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
    Avatar,
    Card,
    CardContent,
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { usePrivy } from '@privy-io/react-auth';
import { useENS } from '../hooks/useENS';
import { useWalletContract, type UpdateProfileParams } from '../hooks/useWalletContract';
import { type Address } from 'viem';

interface UpdateProfileDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    currentProfile?: {
        username: string;
        profilePicture: string;
        description: string;
    };
    profileContractAddress?: Address;
}

const UpdateProfileDialog: React.FC<UpdateProfileDialogProps> = ({
    open,
    onClose,
    onSuccess,
    currentProfile,
    profileContractAddress,
}) => {
    const { user } = usePrivy();
    const userAddress = user?.wallet?.address;
    const ensData = useENS(userAddress);
    const { updateProfile, isLoading, error } = useWalletContract();

    // Form state
    const [formData, setFormData] = useState<UpdateProfileParams>({
        username: currentProfile?.username || '',
        profilePicture: currentProfile?.profilePicture || '',
        description: currentProfile?.description || '',
    });
    const [validationErrors, setValidationErrors] = useState<Partial<UpdateProfileParams>>({});

    // Reset form when dialog opens or current profile changes
    useEffect(() => {
        if (open && currentProfile) {
            setFormData({
                username: currentProfile.username,
                profilePicture: currentProfile.profilePicture,
                description: currentProfile.description,
            });
            setValidationErrors({});
        }
    }, [open, currentProfile]);

    const validateForm = (): boolean => {
        const errors: Partial<UpdateProfileParams> = {};

        if (formData.username && formData.username.trim()) {
            if (formData.username.length < 3) {
                errors.username = 'Username must be at least 3 characters';
            } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
                errors.username = 'Username can only contain letters, numbers, underscore, and dash';
            }
        }

        if (formData.description && formData.description.trim() && formData.description.length < 10) {
            errors.description = 'Description must be at least 10 characters';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !userAddress || !profileContractAddress) {
            if (!profileContractAddress) {
                setValidationErrors({ username: 'Profile contract address not available' });
            }
            return;
        }

        try {
            const txHash = await updateProfile(
                profileContractAddress,
                formData,
                userAddress as `0x${string}`
            );
            console.log('Profile updated with transaction:', txHash);

            if (onSuccess) {
                onSuccess();
            }

            handleClose();
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            username: currentProfile?.username || '',
            profilePicture: currentProfile?.profilePicture || '',
            description: currentProfile?.description || '',
        });
        setValidationErrors({});
        onClose();
    };

    const hasChanges = () => {
        return (
            formData.username !== currentProfile?.username ||
            formData.profilePicture !== currentProfile?.profilePicture ||
            formData.description !== currentProfile?.description
        );
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '400px' }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon color="primary" />
                    Update Profile
                </Box>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!profileContractAddress && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Profile contract address not available. Profile update functionality is currently limited.
                    </Alert>
                )}

                <Box sx={{ py: 2 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Profile Information
                    </Typography>

                    {/* ENS Info */}
                    {ensData.name && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>ENS Detected:</strong> {ensData.name}
                            </Typography>
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                            {(formData.username || 'U').slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                fullWidth
                                label="Username"
                                value={formData.username || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                error={!!validationErrors.username}
                                helperText={validationErrors.username || 'Update your username'}
                                placeholder="Enter your username"
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Profile Picture (IPFS Hash - Optional)"
                                value={formData.profilePicture || ''}
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
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        error={!!validationErrors.description}
                        helperText={validationErrors.description || 'Update your description'}
                        placeholder="Tell the world about yourself and your content..."
                    />

                    {/* Changes Preview */}
                    {hasChanges() && (
                        <Card sx={{ mt: 3 }}>
                            <CardContent>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                                    Changes Preview:
                                </Typography>
                                {formData.username !== currentProfile?.username && (
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>Username:</strong> {currentProfile?.username} → {formData.username}
                                    </Typography>
                                )}
                                {formData.profilePicture !== currentProfile?.profilePicture && (
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                        <strong>Profile Picture:</strong> {currentProfile?.profilePicture || 'None'} → {formData.profilePicture || 'None'}
                                    </Typography>
                                )}
                                {formData.description !== currentProfile?.description && (
                                    <Typography variant="body2">
                                        <strong>Description:</strong> Updated
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>
                    Cancel
                </Button>

                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isLoading || !hasChanges() || !profileContractAddress}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                    {isLoading ? 'Updating Profile...' : 'Update Profile'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateProfileDialog;
