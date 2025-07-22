# TODO - Simplification et Optimisation du Code Client

## 🏗️ Architecture et Structure

### 1. Centraliser les Types et Interfaces

**Fichiers impactés :**

- `src/types/index.ts` (nouveau)
- `src/components/Layout.tsx` (lignes 63-82)
- `src/components/InstagramFeed.tsx` (lignes 28-45)
- `src/components/ProfilePage.tsx` (lignes 36-47)

**Description :** Créer un fichier central pour toutes les interfaces TypeScript réutilisées (Post, ProfileData, ENSData, etc.) pour éliminer la duplication et améliorer la maintenance.

**Bénéfices :** Réduction de duplication, typage cohérent, maintenance simplifiée.

---

### 2. Découper le Composant Layout (880 lignes)

**Fichiers impactés :**

- `src/components/Layout.tsx` (lignes 1-880) → Refactoring complet
- `src/components/AppBar/AppBar.tsx` (nouveau)
- `src/components/Navigation/Navigation.tsx` (nouveau)
- `src/components/PostCreation/PostCreation.tsx` (nouveau)
- `src/components/UserMenu/UserMenu.tsx` (nouveau)

**Description :** Diviser le composant Layout monolithique en plusieurs sous-composants spécialisés pour améliorer la lisibilité et la réutilisabilité.

**Bénéfices :** Code plus lisible, composants réutilisables, maintenance facilitée, meilleure séparation des responsabilités.

---

### 3. Consolider la Configuration des Thèmes

**Fichiers impactés :**

- `src/theme.ts` (suppression)
- `src/contexts/ThemeContext.tsx` (lignes 35-125)
- `src/hooks/useThemeMode.ts` (suppression - intégrer dans le contexte)

**Description :** Fusionner la configuration statique du thème avec le contexte thématique pour éviter la duplication et centraliser la logique.

**Bénéfices :** Configuration unifiée, élimination de duplication, logique centralisée.

## 🔧 Hooks et Logique Métier

### 4. Créer un Hook Composite pour les Contrats

**Fichiers impactés :**

- `src/hooks/useContractIntegration.ts` (nouveau)
- `src/hooks/useBulbFactory.ts` (lignes 1-50)
- `src/hooks/useProfileContract.ts` (lignes 1-80)
- `src/hooks/useWalletContract.ts` (lignes 1-60)
- `src/components/ProfilePage.tsx` (lignes 65-85)

**Description :** Créer un hook composite qui encapsule toute la logique d'interaction avec les contrats pour simplifier l'utilisation dans les composants.

**Bénéfices :** API simplifiée, logique centralisée, réduction de la complexité dans les composants.

---

### 5. Optimiser les Appels ENS avec Cache

**Fichiers impactés :**

- `src/hooks/useENS.ts` (lignes 40-80)
- `src/utils/ensCache.ts` (nouveau)

**Description :** Ajouter un système de cache pour les résolutions ENS afin d'éviter les appels répétitifs pour les mêmes adresses.

**Bénéfices :** Performance améliorée, réduction des appels réseau, UX plus fluide.

---

### 6. Contextualiser la Gestion des Posts

**Fichiers impactés :**

- `src/contexts/PostContext.tsx` (nouveau)
- `src/hooks/usePosts.ts` (nouveau)
- `src/components/InstagramFeed.tsx` (lignes 61-120)
- `src/components/Layout.tsx` (lignes 207-285)

**Description :** Créer un contexte global pour la gestion des posts avec actions (création, récupération, mise à jour) pour éviter la duplication de logique.

**Bénéfices :** État partagé, éviter re-fetch, cohérence des données.

---

## 🎯 API et Services

### 7. Créer un Service API Centralisé

**Fichiers impactés :**

- `src/services/api.ts` (nouveau)
- `src/services/ipfs.ts` (nouveau)
- `src/components/Layout.tsx` (lignes 215-270)
- `src/components/InstagramFeed.tsx` (lignes 85-130)

**Description :** Centraliser tous les appels API dans des services dédiés avec gestion d'erreurs uniformisée et retry logic.

**Bénéfices :** Code DRY, gestion d'erreurs cohérente, testabilité améliorée.

---

### 8. Implémenter un Sistema de Gestion d'Erreurs Global

**Fichiers impactés :**

- `src/contexts/ErrorContext.tsx` (nouveau)
- `src/hooks/useErrorHandler.ts` (nouveau)
- `src/components/ErrorBoundary.tsx` (nouveau)
- `src/components/Layout.tsx` (lignes 280-285)
- `src/components/InstagramFeed.tsx` (lignes 63, 130-140)

**Description :** Créer un système global de gestion d'erreurs avec toast notifications et error boundaries.

**Bénéfices :** UX améliorée, gestion cohérente des erreurs, debugging facilité.

---

## 🚀 Performance et Optimisation

### 9. Optimiser les Renders avec React.memo et useMemo

**Fichiers impactés :**

- `src/components/ProfileUser.tsx` (wrapping complet)
- `src/components/InstagramFeed.tsx` (lignes 200-300)
- `src/components/ProfilePage.tsx` (lignes 150-250)

**Description :** Ajouter React.memo sur les composants enfants et useMemo pour les calculs coûteux afin d'éviter les re-renders inutiles.

**Bénéfices :** Performance améliorée, UX plus fluide, réduction CPU.

---

### 10. Implémenter le Lazy Loading pour les Images

**Fichiers impactés :**

- `src/components/LazyImage.tsx` (nouveau)
- `src/components/InstagramFeed.tsx` (lignes 280-320)
- `src/components/ProfilePage.tsx` (lignes 400-450)

**Description :** Créer un composant LazyImage pour le chargement progressif des images avec placeholder et intersection observer.

**Bénéfices :** Performance réseau améliorée, chargement plus rapide, meilleure UX.

---

### 11. Optimiser le State Management Local

**Fichiers impactés :**

- `src/hooks/useFormState.ts` (nouveau)
- `src/components/UpdateProfileDialog.tsx` (lignes 51-56)
- `src/components/CreateProfileDialog.tsx` (lignes 30-50)

**Description :** Créer un hook réutilisable pour la gestion des formulaires avec validation intégrée.

**Bénéfices :** Code réutilisable, validation cohérente, logique centralisée.

---

## 🎨 UI/UX et Composants

### 12. Créer des Composants UI Réutilisables

**Fichiers impactés :**

- `src/components/ui/Button.tsx` (nouveau)
- `src/components/ui/Card.tsx` (nouveau)
- `src/components/ui/Avatar.tsx` (nouveau)
- Tous les composants utilisant Material-UI directement

**Description :** Créer une bibliothèque de composants UI custom qui wrappent Material-UI avec notre design system.

**Bénéfices :** Cohérence visuelle, customisation facilitée, maintenance simplifiée.

---

### 13. Optimiser la Gestion des Variables d'Environnement

**Fichiers impactés :**

- `src/config/env.ts` (nouveau)
- `src/components/Layout.tsx` (ligne 58)
- `src/main.tsx` (lignes 15-25)

**Description :** Centraliser et typer toutes les variables d'environnement avec validation au runtime.

**Bénéfices :** Type safety, validation centralisée, configuration claire.

---

### 14. Améliorer la Responsivité Mobile

**Fichiers impactés :**

- `src/hooks/useBreakpoints.ts` (nouveau)
- `src/components/Layout.tsx` (lignes 350-450)
- `src/components/InstagramFeed.tsx` (lignes 320-368)

**Description :** Créer des hooks et composants optimisés pour mobile avec gestes tactiles et navigation adaptée.

**Bénéfices :** UX mobile améliorée, performance sur mobile, accessibilité.

---

## 🔍 Code Quality et Maintenance

### 15. Standardiser les Conventions de Nommage

**Fichiers impactés :**

- `src/components/Layout.tsx` (ligne 99 - `settags` → `setTags`)
- Tous les fichiers avec incohérences de nommage

**Description :** Uniformiser le nommage des variables, fonctions et composants selon les conventions React/TypeScript.

**Bénéfices :** Code plus lisible, maintenance facilitée, cohérence du projet.

---

### 16. Éliminer le Code Mort et les TODOs

**Fichiers impactés :**

- `src/components/Layout.tsx` (ligne 266 - TODO comment)
- `src/components/ProfilePage.tsx` (imports non utilisés)
- Recherche globale des TODOs et code commenté

**Description :** Nettoyer le code en supprimant les parties inutilisées et en résolvant les TODOs pendants.

**Bénéfices :** Code plus propre, bundle size réduit, clarté améliorée.

---

### 17. Ajouter des Tests Unitaires

**Fichiers impactés :**

- `src/components/__tests__/` (nouveau dossier)
- `src/hooks/__tests__/` (nouveau dossier)
- `src/utils/__tests__/` (nouveau dossier)

**Description :** Créer une suite de tests pour les composants et hooks critiques avec Jest et React Testing Library.

**Bénéfices :** Fiabilité améliorée, refactoring sécurisé, documentation vivante.

---

## 📊 Priorisation des Tâches

### 🔥 Priorité Haute (Impact immédiat)

- Tâche 2: Découper le composant Layout
- Tâche 1: Centraliser les types
- Tâche 7: Service API centralisé
- Tâche 15: Conventions de nommage

### 🟡 Priorité Moyenne (Amélioration significative)

- Tâche 4: Hook composite contrats
- Tâche 6: Contexte posts
- Tâche 3: Configuration thèmes
- Tâche 9: Optimisation renders

### 🟢 Priorité Basse (Amélioration long terme)

- Tâche 12: Composants UI réutilisables
- Tâche 17: Tests unitaires
- Tâche 14: Responsivité mobile
- Tâche 10: Lazy loading images

---

**Note :** Ce plan de refactoring vise à améliorer la maintenabilité, les performances et l'expérience développeur tout en conservant la fonctionnalité existante. Chaque tâche peut être implémentée de manière incrémentale sans casser le code existant.
