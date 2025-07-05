import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import UpdateProfileDialog from './UpdateProfileDialog';
import { usePrivy } from '@privy-io/react-auth';

// Example component showing how to integrate the UpdateProfileDialog
const ProfileUpdateExample: React.FC = () => {
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const { user } = usePrivy();

    // Mock current profile data - replace with actual profile data from your state/API
    const currentProfile = {
        username: user?.wallet?.address?.slice(0, 8) || 'web3_user',
        profilePicture: '',
        description: 'Web3 enthusiast and content creator on Bulb.social',
    };

    // Mock profile contract address - replace with actual address from your profile lookup
    const profileContractAddress = undefined; // Will be available after profile contract ABI is implemented

    const handleUpdateSuccess = () => {
        console.log('Profile updated successfully!');
        // Here you would typically:
        // 1. Refresh profile data
        // 2. Show success notification
        // 3. Update local state
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Current Profile Management
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Username:</strong> {currentProfile.username}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Description:</strong> {currentProfile.description}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Profile Picture:</strong> {currentProfile.profilePicture || 'None'}
                </Typography>
            </Box>

            <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setUpdateDialogOpen(true)}
                disabled={!user?.wallet?.address}
            >
                Update Profile
            </Button>

            <UpdateProfileDialog
                open={updateDialogOpen}
                onClose={() => setUpdateDialogOpen(false)}
                onSuccess={handleUpdateSuccess}
                currentProfile={currentProfile}
                profileContractAddress={profileContractAddress}
            />
        </Box>
    );
};

export default ProfileUpdateExample;
