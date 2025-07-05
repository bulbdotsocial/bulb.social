# Privy + MetaMask Wallet Integration

Cette mise à jour permet à votre application de fonctionner avec les wallets Privy (embarqués) et MetaMask de manière transparente.

## 🔧 Améliorations apportées

### 1. Hook unifié de wallet (`useWalletContract`)

- **Localisation**: `src/hooks/useWalletContract.ts`
- **Fonctionnalité**: Détecte automatiquement le type de wallet (Privy ou MetaMask) et utilise le provider approprié
- **Fallback intelligent**: Essaie d'abord Privy, puis MetaMask en cas d'échec

### 2. Mise à jour de la configuration Privy

- **Localisation**: `src/main.tsx`
- **Ajout**: Flow Testnet dans les chaînes supportées
- **Bénéfice**: Les utilisateurs peuvent maintenant utiliser Flow Testnet avec Privy

### 3. Composant de mise à jour de profil

- **Localisation**: `src/components/UpdateProfileDialog.tsx`
- **Fonctionnalité**: Interface utilisateur pour modifier les profils existants
- **Validation**: Validation des formulaires en temps réel

## 🚀 Comment utiliser

### Création de profil (fonctionnel)

```typescript
import { useContractWrite } from '../hooks/useContractWrite';

const { createProfile, isLoading, error } = useContractWrite();

// Utilisation
await createProfile({
  username: 'mon_nom',
  profilePicture: 'QmHash...',
  description: 'Ma description'
}, userAddress);
```

### Mise à jour de profil (nécessite l'ABI du contrat de profil)

```typescript
import { useWalletContract } from '../hooks/useWalletContract';

const { updateProfile, isLoading, error } = useWalletContract();

// Une fois l'ABI disponible:
await updateProfile(profileContractAddress, {
  username: 'nouveau_nom',
  description: 'Nouvelle description'
}, userAddress);
```

## 🔍 Types de wallets supportés

### Privy Wallets

- ✅ Wallets embarqués Privy
- ✅ Wallets externes connectés via Privy
- ✅ Gestion automatique des providers

### MetaMask

- ✅ Extension browser MetaMask
- ✅ MetaMask Mobile
- ✅ Changement automatique de réseau

## 🔄 Flux de fonctionnement

1. **Détection du wallet**: Le hook vérifie d'abord si un wallet Privy est disponible
2. **Provider Privy**: Si disponible, utilise le provider Ethereum de Privy
3. **Fallback MetaMask**: Si Privy échoue, utilise MetaMask
4. **Changement de réseau**: Tente automatiquement de passer sur Flow Testnet
5. **Exécution**: Exécute la transaction sur le bon réseau

## 📝 Exemple d'intégration

Voir `src/components/ProfileUpdateExample.tsx` pour un exemple complet d'utilisation.

## ⚠️ Points d'attention

### 1. ABI de contrat de profil manquant

Le contrat factory crée des contrats de profil individuels, mais nous n'avons pas encore l'ABI de ces contrats. Une fois disponible, vous pourrez:

- Mettre à jour les profils existants
- Lire les données de profil directement depuis la blockchain

### 2. Adresse de contrat de profil

Pour la mise à jour, vous devez obtenir l'adresse du contrat de profil de l'utilisateur:

```typescript
const { getProfile } = useBulbFactory();
const profileAddress = await getProfile(userAddress);
```

### 3. Gestion des erreurs

Les hooks gèrent automatiquement:

- Erreurs de connexion wallet
- Échecs de changement de réseau
- Erreurs de transaction

## 🔮 Prochaines étapes

1. **Obtenir l'ABI du contrat de profil** pour activer les mises à jour
2. **Implémenter la lecture de profil** depuis la blockchain
3. **Ajouter des notifications** pour les transactions réussies/échouées
4. **Cache des données** pour améliorer les performances

## 🐛 Débogage

### Logs utiles

```javascript
// Vérifier le type de wallet détecté
console.log('Privy wallets:', wallets);
console.log('User wallet:', user?.wallet);

// Vérifier les providers
const privyWallet = wallets[0];
if (privyWallet) {
  const provider = await privyWallet.getEthereumProvider();
  console.log('Privy provider:', provider);
}
```

### Erreurs communes

- **"No wallet provider available"**: Ni Privy ni MetaMask ne sont disponibles
- **"Connected wallet does not match"**: L'adresse du wallet ne correspond pas à l'utilisateur Privy
- **"Profile contract address not available"**: L'ABI du contrat de profil n'est pas encore implémenté

## 💡 Conseils

1. **Testez avec les deux types de wallets** pour vous assurer de la compatibilité
2. **Gérez les états de chargement** pour une meilleure UX
3. **Implémentez des notifications** pour informer l'utilisateur du statut des transactions
4. **Ajoutez une validation robuste** des formulaires avant de soumettre les transactions
