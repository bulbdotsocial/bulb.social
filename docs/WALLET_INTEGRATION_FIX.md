# Unified Wallet Integration: Privy + MetaMask

This documentation details the actual integration of Privy and MetaMask wallets in Bulb.social, based on the code in the `client` folder. It is developer- and AI-oriented, illustrated with examples from React hooks and components.

---

## 🔧 Features and Improvements

### 1. Unified Wallet Hook (`useWalletContract`)

- **Location**: `client/src/hooks/useWalletContract.ts`
- **Automatic detection**: Privy priority, MetaMask fallback
- **Smart provider**: Uses the correct provider depending on the connected wallet
- **Error handling**: Smooth transitions, clear messages
- **Multi-chain support**: Flow Testnet configured

### 2. Improved Privy Configuration

- **Location**: `client/src/main.tsx`
- **Added Flow Testnet** to supported chains
- **Full support** for Privy transactions

### 3. Profile Creation and Update Components

- **`CreateProfileDialog.tsx`**: Profile creation, validation, error handling
- **`UpdateProfileDialog.tsx`**: Profile update, validation, error handling
- **`ProfileUpdateExample.tsx`**: Integration example
- **`TestCreateProfile.tsx`**: Automated profile creation test

---

## 🚀 Usage Examples

### Profile Creation

```tsx
import { useWalletContract } from '../hooks/useWalletContract';

const { createProfile, isLoading, error } = useWalletContract();

await createProfile({
  username: 'my_name',
  profilePicture: 'QmHash...',
  description: 'My description'
}, user.wallet.address);
```

**Component:**

```tsx
<CreateProfileDialog open={open} onClose={handleClose} onSuccess={handleSuccess} />
```

### Profile Update

```tsx
import { useWalletContract } from '../hooks/useWalletContract';

const { updateProfile, isLoading, error } = useWalletContract();

await updateProfile(profileContractAddress, {
  username: 'new_name',
  profilePicture: 'QmHash...',
  description: 'New description'
}, user.wallet.address);
```

**Component:**

```tsx
<UpdateProfileDialog
  open={updateProfileOpen}
  onClose={() => setUpdateProfileOpen(false)}
  onSuccess={() => {
    refreshProfile();
    checkProfile();
  }}
  currentProfile={profileData}
  profileContractAddress={profileContractAddress}
/>
```

---

## 🔍 Supported Wallet Types

### Privy

- Embedded Privy wallet
- External wallet connected via Privy
- Automatic provider

### MetaMask

- MetaMask browser extension
- MetaMask Mobile
- Automatic network switching

---

## 🔄 Flux de fonctionnement

1. Détection du wallet : Priorité Privy, fallback MetaMask
2. Provider : Utilisation du provider Ethereum adapté
3. Changement de réseau : Switch automatique vers Flow Testnet
4. Exécution : Transaction sur le bon réseau
5. Gestion d'erreur : Messages explicites, fallback, validation

---

## 📝 Exemple d'intégration complète

Voir `client/src/components/ProfileUpdateExample.tsx` pour un flux réel.

---

## ⚠️ Points d'attention

### 1. ABI du contrat de profil

- L'ABI du contrat individuel est requis pour la mise à jour.
- Localisation : `client/src/config/profileContract.ts`
- Fonction : `updateProfile`, `getProfileInfo`, event `ProfileUpdated`

### 2. Adresse du contrat de profil

Obtenue via le hook factory :

```tsx
const { getProfile } = useBulbFactory();
const profileAddress = await getProfile(user.wallet.address);
```

### 3. Validation et gestion d'erreur

- Validation côté client (username, description, etc.)
- Gestion automatique des erreurs de wallet, réseau, transaction
- Affichage des messages dans les composants

---

## 🔮 Prochaines étapes

1. Étendre l'ABI du contrat de profil pour de nouvelles fonctionnalités
2. Implémenter la lecture et la mise à jour avancée du profil
3. Ajouter des notifications UX pour les transactions
4. Optimiser le cache des hooks pour la performance

---

## 🐛 Débogage et logs utiles

```tsx
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

- "No wallet provider available" : Ni Privy ni MetaMask ne sont disponibles
- "Connected wallet does not match" : L'adresse du wallet ne correspond pas à l'utilisateur Privy
- "Profile contract address not available" : L'ABI du contrat de profil n'est pas encore implémenté

---

## 💡 Conseils pratiques

1. Testez avec Privy ET MetaMask pour garantir la compatibilité
2. Gérez les états de chargement pour une meilleure UX
3. Implémentez des notifications pour informer l'utilisateur
4. Ajoutez une validation robuste des formulaires
5. Utilisez les hooks pour centraliser la logique contractuelle

---

## 📦 Références de code

- `client/src/hooks/useWalletContract.ts`
- `client/src/hooks/useBulbFactory.ts`
- `client/src/hooks/useProfileContract.ts`
- `client/src/components/CreateProfileDialog.tsx`
- `client/src/components/UpdateProfileDialog.tsx`
- `client/src/components/ProfileUpdateExample.tsx`
- `client/src/components/TestCreateProfile.tsx`
- `client/src/components/ProfilesCounter.tsx`

---

Pour toute extension, créez un nouveau composant ou hook dans `client/src`, documentez-le dans le dossier `docs`, et connectez-le via props/context.
