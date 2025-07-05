// Test script pour valider l'intégration Privy + MetaMask
// À exécuter dans la console du navigateur pour débugger

console.log('🧪 Test de l\'intégration Wallet');

// Test 1: Vérifier la présence de Privy
try {
    const privyExists = typeof window.Privy !== 'undefined';
    console.log('✅ Privy disponible:', privyExists);
} catch (e) {
    console.log('❌ Erreur Privy:', e);
}

// Test 2: Vérifier MetaMask
try {
    const metamaskExists = typeof window.ethereum !== 'undefined';
    console.log('✅ MetaMask disponible:', metamaskExists);
    if (window.ethereum) {
        console.log('   - Provider:', window.ethereum.isMetaMask ? 'MetaMask' : 'Autre');
    }
} catch (e) {
    console.log('❌ Erreur MetaMask:', e);
}

// Test 3: Vérifier la configuration des chaînes
try {
    const flowTestnetConfig = {
        chainId: 0x221,
        chainName: 'Flow Testnet',
        rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
    };
    console.log('✅ Configuration Flow Testnet:', flowTestnetConfig);
} catch (e) {
    console.log('❌ Erreur configuration:', e);
}

// Test 4: Fonction pour tester la connexion wallet
window.testWalletConnection = async () => {
    console.log('🔗 Test de connexion wallet...');

    try {
        // Test avec MetaMask si disponible
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('✅ Comptes MetaMask:', accounts);

            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log('✅ Chaîne actuelle:', parseInt(chainId, 16));
        }
    } catch (e) {
        console.log('❌ Erreur connexion:', e);
    }
};

// Test 5: Fonction pour tester le changement de réseau
window.testNetworkSwitch = async () => {
    console.log('🔄 Test changement vers Flow Testnet...');

    try {
        if (window.ethereum) {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x221' }],
            });
            console.log('✅ Changement de réseau réussi');
        }
    } catch (e) {
        if (e.code === 4902) {
            console.log('⚠️ Réseau non ajouté, tentative d\'ajout...');
            try {
                await window.ethereum.request({
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
                console.log('✅ Réseau ajouté avec succès');
            } catch (addError) {
                console.log('❌ Erreur ajout réseau:', addError);
            }
        } else {
            console.log('❌ Erreur changement réseau:', e);
        }
    }
};

console.log('');
console.log('🚀 Commandes disponibles:');
console.log('  - testWalletConnection() : Tester la connexion wallet');
console.log('  - testNetworkSwitch() : Tester le changement vers Flow Testnet');
console.log('');
console.log('💡 Utilisez ces commandes pour débugger votre intégration wallet');
