import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Alert,
    TextField,
    Stack,
    CircularProgress,
} from '@mui/material';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletContract } from '../hooks/useWalletContract';

const TestCreateProfile: React.FC = () => {
    const { user, authenticated } = usePrivy();
    const { createProfile, isLoading, error } = useWalletContract();
    const [formData, setFormData] = useState({
        username: 'TestUser' + Date.now().toString().slice(-4),
        profilePicture: '',
        description: 'Test profile created to validate wallet integration'
    });
    const [success, setSuccess] = useState<string | null>(null);

    const handleTest = async () => {
        if (!user?.wallet?.address) {
            alert('Please connect your wallet first');
            return;
        }

        try {
            setSuccess(null);
            console.log('🧪 Starting test profile creation...');

            const txHash = await createProfile(formData, user.wallet.address as `0x${string}`);

            setSuccess(`✅ Profile created successfully! Transaction: ${txHash}`);
            console.log('✅ Test successful:', txHash);
        } catch (error) {
            console.error('❌ Test failed:', error);
        }
    };

    if (!authenticated) {
        return (
            <Card sx={{ m: 2, p: 2 }}>
                <CardContent>
                    <Typography variant="h6" color="error">
                        Please log in to test profile creation
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ m: 2, p: 2 }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    🧪 Test Profile Creation (Buffer Fix)
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    User: {user?.wallet?.address}
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                    <TextField
                        label="Username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        size="small"
                    />
                    <TextField
                        label="Profile Picture (IPFS Hash)"
                        value={formData.profilePicture}
                        onChange={(e) => setFormData(prev => ({ ...prev, profilePicture: e.target.value }))}
                        size="small"
                        placeholder="Optional"
                    />
                    <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        multiline
                        rows={2}
                        size="small"
                    />
                </Stack>

                <Button
                    variant="contained"
                    onClick={handleTest}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    sx={{ mb: 2 }}
                >
                    {isLoading ? 'Creating Profile...' : 'Test Create Profile'}
                </Button>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Error:</strong> {error}
                        </Typography>
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            {success}
                        </Typography>
                    </Alert>
                )}

                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Debug Information:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        • Buffer available: {typeof window !== 'undefined' && (window as any).Buffer ? '✅' : '❌'}<br />
                        • User authenticated: {authenticated ? '✅' : '❌'}<br />
                        • Wallet address: {user?.wallet?.address || 'None'}<br />
                        • Loading state: {isLoading ? '🔄' : '⭕'}<br />
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default TestCreateProfile;
