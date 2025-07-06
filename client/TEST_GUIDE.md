# 🧪 Guide de Test - Correction Buffer/Wallet

## ✅ Corrections apportées

1. **Polyfill Buffer** ajouté dans `src/polyfills.ts`
2. **Configuration Vite** mise à jour avec les polyfills Node.js
3. **Logs de débogage** ajoutés dans `useWalletContract`
4. **Gestion d'erreurs** améliorée
5. **Composant de test** créé

## 🔧 Étapes pour tester

### 1. Vérifier l'environnement

```bash
# Le serveur doit être démarré avec:
npm run dev
```

### 2. Ouvrir la console navigateur

- F12 → Console
- Vérifier qu'il n'y a pas d'erreurs au chargement

### 3. Vérifier les polyfills

Dans la console, taper:

```javascript
console.log('Buffer available:', typeof Buffer !== 'undefined');
console.log('Global Buffer:', typeof window.Buffer !== 'undefined');
```

### 4. Tester avec le composant de test

Ajouter temporairement dans votre app (ex: `App.tsx`):

```tsx
import TestCreateProfile from './components/TestCreateProfile';

// Dans le JSX
<TestCreateProfile />
```

### 5. Tester la création de profil

1. **Se connecter** avec Privy ou MetaMask
2. **Cliquer** sur "Test Create Profile"
3. **Observer** les logs dans la console
4. **Vérifier** que la transaction passe

## 📊 Logs attendus

### Logs de succès

```
🔍 Getting wallet client...
Available wallets: 1
User wallet address: 0x...
🔄 Trying Privy wallet provider...
✅ Privy provider obtained: true
✅ Privy wallet client created successfully
🚀 Starting contract write execution...
Contract: 0xe68C1C1B6316507410FA5fC4E0Ab0400eECE30a1
Function: createProfile
Args: ["TestUser1234", "", "Test profile..."]
User address: 0x...
🔄 Attempting network switch...
📡 Using Privy provider for network switch
📝 Writing to contract...
✅ Transaction submitted successfully! Hash: 0x...
```

### Si erreur Buffer persistante

```
❌ Contract write execution failed: Can't find variable: Buffer
```

→ **Action**: Vérifier que les polyfills sont chargés

## 🔄 Solutions alternatives si le problème persiste

### Option 1: Forcer le polyfill global

Ajouter dans `index.html`:

```html
<script>
  if (typeof global === 'undefined') {
    var global = globalThis;
  }
</script>
```

### Option 2: Utiliser un CDN pour Buffer

Ajouter dans `index.html`:

```html
<script src="https://unpkg.com/buffer@6.0.3/index.js"></script>
```

### Option 3: Configuration Vite alternative

Dans `vite.config.ts`:

```typescript
define: {
  global: 'globalThis',
  'process.env': {}
},
resolve: {
  alias: {
    buffer: 'buffer',
    process: 'process/browser',
    stream: 'stream-browserify',
    util: 'util'
  }
}
```

## 🎯 Résultats attendus

✅ **Succès**: Transaction créée sans erreur Buffer
✅ **Logs clairs**: Messages de débogage visibles
✅ **Fallback**: Si Privy échoue, MetaMask prend le relais
✅ **Erreurs gérées**: Messages d'erreur compréhensibles

## 🚨 Problèmes potentiels

### 1. Buffer toujours pas défini

- Vérifier l'ordre des imports dans `main.tsx`
- Le polyfill doit être le premier import

### 2. Erreur de réseau

- Vérifier que Flow Testnet est configuré
- Vérifier que l'utilisateur a des tokens FLOW

### 3. Privy/MetaMask conflit

- Déconnecter puis reconnecter le wallet
- Vider le cache du navigateur

## 📞 Support

Si le problème persiste:

1. **Copier les logs** de la console
2. **Noter** quel wallet est utilisé (Privy/MetaMask)
3. **Vérifier** la version de viem et des dépendances
4. **Tester** sur un autre navigateur

---

**🎉 Une fois que ça marche, vous pouvez retirer le composant de test et utiliser la création de profil normale !**
