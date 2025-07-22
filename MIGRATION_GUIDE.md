# Migration Guide - Refactoring Bulb.social Client

## 🎯 Objectif de la Migration

Cette migration vise à moderniser et optimiser le code client en utilisant les nouveaux composants, hooks et services créés lors du refactoring.

## 📁 Structure des Nouveaux Modules

### Types Centralisés

```
src/types/
├── index.ts          # Exports principaux
├── user.ts           # Types utilisateur
├── post.ts           # Types de posts
├── api.ts            # Types API
└── components.ts     # Types de composants
```

### Hooks Optimisés

```
src/hooks/
├── useUserData.ts                      # Données utilisateur unifiées
├── useOptimizedContractIntegration.ts  # Contrats optimisés
├── useResponsive.ts                    # Responsive design
├── useENSOptimized.ts                  # ENS avec cache
├── useFormState.ts                     # Gestion de formulaires
└── usePosts.ts                         # Gestion des posts
```

### Composants UI Réutilisables

```
src/components/ui/
├── index.ts          # Exports
├── Button.tsx        # Boutons optimisés
├── Card.tsx          # Cartes avec variants
└── Input.tsx         # Inputs avec validation
```

### Services Centralisés

```
src/services/
├── index.ts          # Exports
├── api.ts            # Client API
├── postService.ts    # Service posts
└── ipfsService.ts    # Service IPFS
```

## 🔄 Plan de Migration

### Phase 1: Migration des Imports (TERMINÉE)

Les nouveaux imports sont disponibles :

```typescript
// Anciens imports
import { useENS } from '../hooks/useENS';
import { useBulbFactory } from '../hooks/useBulbFactory';

// Nouveaux imports recommandés
import { useUserData } from '../hooks/useUserData';
import { useOptimizedContractIntegration } from '../hooks/useOptimizedContractIntegration';
import { Button, Card, Input } from '../components/ui';
import { postService, apiService } from '../services';
```

### Phase 2: Migration des Composants Utilisateur

#### 2.1 Remplacer ENSUser et ProfileUser

**Avant:**

```tsx
import ENSUser from './ENSUser';
import ProfileUser from './ProfileUser';

// Dans le code
<ENSUser address={address} showAvatar linkToProfile />
<ProfileUser address={address} showVerification />
```

**Après:**

```tsx
import UserDisplayComponent from './UserDisplayComponent';

// Dans le code
<UserDisplayComponent 
  address={address} 
  showAvatar 
  linkToProfile 
  variant="full" 
/>
```

#### 2.2 Migration des Listes d'Utilisateurs

**Avant:**

```tsx
{users.map(user => (
  <ENSUser key={user.address} address={user.address} />
))}
```

**Après:**

```tsx
import UserListComponent from './UserListComponent';

<UserListComponent 
  users={users}
  userDisplayProps={{ showVerification: true }}
  onUserClick={handleUserClick}
/>
```

### Phase 3: Migration des Hooks

#### 3.1 Remplacement du Hook de Données Utilisateur

**Avant:**

```tsx
const ensData = useENS(address);
const { checkUserProfile } = useBulbFactory();
const { profileInfo } = useProfileContract(profileAddress);

// Logique manuelle de priorité des données...
```

**Après:**

```tsx
const userData = useUserData(address, {
  includeContractData: true,
  includeENSData: true,
});

// Toute la logique est centralisée dans le hook
const { displayName, avatarSrc, isFromContract, isLoading } = userData;
```

#### 3.2 Migration vers le Hook de Contrats Optimisé

**Avant:**

```tsx
const factoryData = useBulbFactory();
const walletContract = useWalletContract();
const ensData = useENS(userAddress);

// États et logique dispersés...
```

**Après:**

```tsx
const {
  currentUser,
  createProfile,
  updateProfile,
  batchLoadProfiles,
  isLoading,
  error
} = useOptimizedContractIntegration();
```

### Phase 4: Migration des Services

#### 4.1 Centralisation des Appels API

**Avant:**

```tsx
// Appels directs dispersés dans les composants
fetch('/api/posts')
  .then(res => res.json())
  .then(setPosts);
```

**Après:**

```tsx
import { postService } from '../services';

// Dans le composant
const { data: posts, isLoading, error } = usePosts();

// Ou pour des actions
const handleCreatePost = async (postData) => {
  await postService.createPost(postData);
};
```

### Phase 5: Migration de l'UI

#### 5.1 Remplacement des Boutons MUI

**Avant:**

```tsx
<Button 
  variant="contained" 
  color="primary"
  disabled={loading}
>
  {loading ? <CircularProgress size={20} /> : 'Create Post'}
</Button>
```

**Après:**

```tsx
import { Button } from '../components/ui';

<Button 
  variant="primary"
  loading={loading}
  loadingText="Creating..."
>
  Create Post
</Button>
```

#### 5.2 Migration des Cartes

**Avant:**

```tsx
<Card sx={{ p: 2, mb: 2 }}>
  <CardHeader title="User Profile" />
  <CardContent>
    {/* Contenu */}
  </CardContent>
  <CardActions>
    <Button>Edit</Button>
  </CardActions>
</Card>
```

**Après:**

```tsx
import { ContentCard, Button } from '../components/ui';

<ContentCard
  title="User Profile"
  variant="elevated"
  primaryAction={<Button variant="outline">Edit</Button>}
>
  {/* Contenu */}
</ContentCard>
```

## 📋 Checklist de Migration par Fichier

### Composants à Migrer (Priorité Haute)

- [ ] `src/components/ProfilePage.tsx`
  - [ ] Remplacer `useENS` par `useUserData`
  - [ ] Utiliser `ContentCard` pour les sections
  - [ ] Migrer vers les nouveaux `Button`

- [ ] `src/components/UserProfilePage.tsx`
  - [ ] Utiliser `UserDisplayComponent`
  - [ ] Migrer la logique de profil vers `useOptimizedContractIntegration`

- [ ] `src/components/PostsList.tsx`
  - [ ] Utiliser `usePosts` pour la gestion d'état
  - [ ] Intégrer `UserDisplayComponent` pour les auteurs

- [ ] `src/components/CreatePost.tsx`
  - [ ] Utiliser `useFormState` pour la validation
  - [ ] Migrer vers les nouveaux `Input` et `Button`

### Composants de Layout

- [ ] `src/components/Layout.tsx` (Déjà créé)
  - [x] Utiliser la nouvelle structure modulaire
  - [ ] Intégrer `useResponsive` pour l'adaptabilité

### Pages Principales

- [ ] `src/App.tsx`
  - [ ] Migrer vers les nouveaux contextes
  - [ ] Utiliser `ErrorContext` pour la gestion d'erreurs

- [ ] Pages de routage
  - [ ] Intégrer `useOptimizedContractIntegration`
  - [ ] Utiliser les nouveaux composants UI

## 🚀 Script de Migration Automatique

### Utilitaire de Remplacement d'Imports

```bash
# Script pour remplacer les imports (à exécuter dans le dossier client)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e "s|import ENSUser from.*|import UserDisplayComponent from '../components/UserDisplayComponent';|g" \
  -e "s|import ProfileUser from.*|import UserDisplayComponent from '../components/UserDisplayComponent';|g"
```

### Validation des Migrations

```bash
# Vérifier les imports obsolètes
grep -r "import.*ENSUser\|import.*ProfileUser" src/
grep -r "useBulbFactory\|useProfileContract" src/ --include="*.tsx"
```

## 🧪 Tests de Migration

### Points de Validation

1. **Fonctionnalité des Profils**
   - [ ] Affichage correct des données ENS
   - [ ] Affichage correct des données de contrat
   - [ ] Priorité correcte (Contract > ENS > Wallet)

2. **Performance**
   - [ ] Pas de re-renders inutiles
   - [ ] Cache fonctionnel pour les données ENS
   - [ ] Chargement optimisé des listes d'utilisateurs

3. **UX/UI**
   - [ ] Responsive design fonctionnel
   - [ ] Animations et transitions fluides
   - [ ] États de chargement cohérents

## 📈 Métriques de Succès

- **Réduction du code dupliqué**: ~60% de réduction attendue
- **Performance de chargement**: 30% d'amélioration
- **Maintenabilité**: Score de lisibilité amélioré
- **Bundle size**: Réduction de 15-20%

## 🔧 Outils de Développement

### Extensions VS Code Recommandées

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### Configuration ESLint Mise à Jour

```json
{
  "rules": {
    "no-unused-imports": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal"],
      "pathGroups": [
        {
          "pattern": "../components/ui/**",
          "group": "internal",
          "position": "before"
        }
      ]
    }]
  }
}
```

---

**Note**: Cette migration doit être effectuée progressivement, composant par composant, en validant chaque étape pour maintenir la stabilité de l'application.
