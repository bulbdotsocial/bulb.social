import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Chip,
    Divider,
    Stack,
} from '@mui/material';
import {
    BugReport as BugIcon,
    AccountBalanceWallet as WalletIcon,
    NetworkCheck as NetworkIcon,
} from '@mui/icons-material';
import { usePrivy, useWallets } from '@privy-io/react-auth';

const WalletDebugComponent: React.FC = () => {
    const { user, authenticated, ready } = usePrivy();
    const { wallets } = useWallets();
    const [testResults, setTestResults] = useState<string[]>([]);

    const addTestResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };

    const testMetaMaskConnection = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (window as any).ethereum === 'undefined') {
                addTestResult('❌ MetaMask non disponible');
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const accounts = await (window as any).ethereum.request({
                method: 'eth_requestAccounts'
            });
            addTestResult(`✅ MetaMask connecté: ${accounts[0]}`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const chainId = await (window as any).ethereum.request({
                method: 'eth_chainId'
            });
            addTestResult(`📍 Chaîne actuelle: ${parseInt(chainId, 16)} (0x${parseInt(chainId, 16).toString(16)})`);
        } catch (error) {
            addTestResult(`❌ Erreur MetaMask: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    const testPrivyWallets = async () => {
        try {
            if (wallets.length === 0) {
                addTestResult('⚠️ Aucun wallet Privy trouvé');
                return;
            }

            for (const wallet of wallets) {
                addTestResult(`✅ Wallet Privy trouvé: ${wallet.address}`);
                addTestResult(`   - Type: ${wallet.walletClientType}`);
                addTestResult(`   - Chaînes supportées: ${wallet.chainId ? wallet.chainId : 'Non spécifié'}`);

                if (wallet.getEthereumProvider) {
                    try {
                        const provider = await wallet.getEthereumProvider();
                        addTestResult(`   - Provider Ethereum: Disponible`);
                        console.log('Privy provider:', provider);
                    } catch (error) {
                        addTestResult(`   - Provider Ethereum: Erreur (${error instanceof Error ? error.message : 'Erreur inconnue'})`);
                    }
                } else {
                    addTestResult(`   - Provider Ethereum: Non disponible`);
                }
            }
        } catch (error) {
            addTestResult(`❌ Erreur Privy: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    const testFlowNetwork = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (window as any).ethereum === 'undefined') {
                addTestResult('❌ Aucun provider Ethereum disponible');
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const provider = (window as any).ethereum;

            try {
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x221' }], // Flow Testnet
                });
                addTestResult('✅ Changement vers Flow Testnet réussi');
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    addTestResult('⚠️ Flow Testnet non configuré, tentative d\'ajout...');
                    try {
                        await provider.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x221',
                                chainName: 'Flow Testnet',
                                rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
                                nativeCurrency: {
                                    name: 'Flow',
                                    symbol: 'FLOW',
                                    decimals: 18,
                                },
                                blockExplorerUrls: ['https://evm-testnet.flowscan.io'],
                            }],
                        });
                        addTestResult('✅ Flow Testnet ajouté avec succès');
                    } catch (addError) {
                        addTestResult(`❌ Erreur ajout Flow Testnet: ${addError instanceof Error ? addError.message : 'Erreur inconnue'}`);
                    }
                } else {
                    addTestResult(`❌ Erreur changement réseau: ${switchError.message || 'Erreur inconnue'}`);
                }
            }
        } catch (error) {
            addTestResult(`❌ Erreur test réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <Card sx={{ m: 2, p: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BugIcon color="primary" />
                    <Typography variant="h6">
                        Débogage Intégration Wallet
                    </Typography>
                </Box>

                {/* État Privy */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        État Privy
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip
                            label={`Ready: ${ready}`}
                            color={ready ? 'success' : 'default'}
                            size="small"
                        />
                        <Chip
                            label={`Authenticated: ${authenticated}`}
                            color={authenticated ? 'success' : 'default'}
                            size="small"
                        />
                        <Chip
                            label={`Wallets: ${wallets.length}`}
                            color={wallets.length > 0 ? 'success' : 'default'}
                            size="small"
                        />
                    </Stack>
                    {user?.wallet?.address && (
                        <Typography variant="body2" color="text.secondary">
                            Adresse utilisateur: {user.wallet.address}
                        </Typography>
                    )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Boutons de test */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Tests
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        <Button
                            variant="outlined"
                            startIcon={<WalletIcon />}
                            onClick={testMetaMaskConnection}
                            size="small"
                        >
                            Test MetaMask
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<WalletIcon />}
                            onClick={testPrivyWallets}
                            size="small"
                            disabled={!ready || wallets.length === 0}
                        >
                            Test Privy
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<NetworkIcon />}
                            onClick={testFlowNetwork}
                            size="small"
                        >
                            Test Flow Network
                        </Button>
                        <Button
                            variant="text"
                            onClick={clearResults}
                            size="small"
                            color="secondary"
                        >
                            Effacer
                        </Button>
                    </Stack>
                </Box>

                {/* Résultats des tests */}
                {testResults.length > 0 && (
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Résultats des tests
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: 'grey.100',
                                borderRadius: 1,
                                p: 2,
                                maxHeight: 300,
                                overflow: 'auto',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                            }}
                        >
                            {testResults.map((result, index) => (
                                <Typography
                                    key={index}
                                    variant="body2"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        color: result.includes('❌') ? 'error.main' :
                                            result.includes('⚠️') ? 'warning.main' :
                                                result.includes('✅') ? 'success.main' : 'text.primary'
                                    }}
                                >
                                    {result}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Ce composant est destiné au débogage. Retirez-le en production.
                    </Typography>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default WalletDebugComponent;
