# Rapport de Refactoring et d'Optimisation - Dossier Client

## 🎯 Objectif

Améliorer la qualité du code, la maintenabilité et les performances de l'application client en factorisant le code dupliqué, optimisant l'architecture et réorganisant les composants.

---

## 📁 1. FACTORISATION DES COMPOSANTS UTILISATEUR

### 1.1 Fusion des composants ENSUser et ProfileUser

**Problème** : Code dupliqué entre `ENSUser.tsx` et `ProfileUser.tsx` avec des logiques similaires
**Impact** : Fichiers `src/components/ENSUser.tsx` et `src/components/ProfileUser.tsx`
**Lignes concernées** :

- ENSUser.tsx : lignes 1-131
- ProfileUser.tsx : lignes 1-226

**Tâche** : Créer un composant unifié `UserDisplayComponent.tsx` qui :

- Combine la logique de récupération ENS et contract profile
- Standardise les props entre les deux composants
- Utilise une interface commune pour les props
- Implémente un système de priorité d'affichage : Contract > ENS > Wallet address

### 1.2 Extraction d'un hook métier useUserData

**Problème** : Logique de gestion des données utilisateur répétée dans plusieurs composants
**Impact** : Fichiers `src/components/ProfilePage.tsx`, `src/components/UserProfilePage.tsx`, `src/components/ProfileUser.tsx`
**Lignes concernées** :

- ProfilePage.tsx : lignes 74-128 (logique de récupération de profil)
- UserProfilePage.tsx : lignes 71-100 (logique similaire)
- ProfileUser.tsx : lignes 35-85 (logique de priorité des données)

**Tâche** : Créer `src/hooks/useUserData.ts` qui :

- Centralise la logique de récupération des données utilisateur (ENS + Contract)
- Gère le cache et l'état de chargement
- Retourne un objet standardisé avec les données utilisateur
- Évite la duplication de logique entre composants

---

## � 2. OPTIMISATION DES STYLES ET THÈME

### 2.1 Extraction des styles MUI redondants

**Problème** : Styles MUI dupliqués dans plusieurs composants
**Impact** : Fichiers `src/components/ProfilePage.tsx`, `src/components/UserProfilePage.tsx`
**Lignes concernées** :

- ProfilePage.tsx : lignes 550-595 (styles des onglets)
- UserProfilePage.tsx : lignes 720-750 (styles identiques des onglets)
- ProfilePage.tsx : lignes 296-340 (styles du header de profil)
- UserProfilePage.tsx : lignes 440-480 (styles similaires du header)

**Tâche** : Créer `src/theme/profileStyles.ts` qui :

- Exporte des objets de styles réutilisables pour les composants de profil
- Définit des constantes pour les breakpoints et dimensions
- Centralise les styles des onglets, headers et grilles de posts

### 2.2 Optimisation du ThemeContext

**Problème** : Composants de thème dispersés et logique de hook dupliquée
**Impact** : Fichiers `src/contexts/ThemeContext.tsx`, `src/hooks/useThemeMode.ts`
**Lignes concernées** :

- ThemeContext.tsx : lignes 1-150 (contexte complet)
- useThemeMode.ts : lignes 1-20 (hook redondant)

**Tâche** : Consolidation du système de thème :

- Fusionner useThemeMode.ts dans ThemeContext.tsx
- Optimiser les re-renders en mémorisant les valeurs du contexte
- Ajouter des types TypeScript plus stricts pour les couleurs personnalisées

---

## 🔄 3. REFACTORING DES HOOKS

### 3.1 Optimisation du hook useENS

**Problème** : Logique de cache inefficace et code dupliqué
**Impact** : Fichier `src/hooks/useENS.ts`
**Lignes concernées** : lignes 80-159 (hook useENSBatch)

**Tâche** : Refactoriser useENS :

- Implémenter un système de cache global plus performant
- Fusionner useENS et useENSBatch en une seule solution
- Ajouter un système de debounce pour éviter les appels multiples
- Optimiser les appels réseau en groupant les requêtes

### 3.2 Simplification des hooks de profil

**Problème** : Logique répétitive entre useBulbFactory et useProfileContract
**Impact** : Fichiers `src/hooks/useBulbFactory.ts`, `src/hooks/useProfileContract.ts`
**Lignes concernées** :

- useBulbFactory.ts : lignes 1-200 (système de cache complexe)
- useProfileContract.ts : lignes 1-70 (logique de fetch similaire)

**Tâche** : Créer `src/hooks/useProfileManager.ts` qui :

- Centralise toute la logique de gestion des profils
- Unifie les systèmes de cache
- Simplifie l'API pour les composants consommateurs
- Gère les états de chargement de façon cohérente

---

## 🏗️ 4. RÉORGANISATION ARCHITECTURALE

### 4.1 Création d'un dossier utils/

**Problème** : Fonctions utilitaires dispersées dans les composants
**Impact** : Fichiers `src/components/ProfilePage.tsx`, `src/components/UserProfilePage.tsx`
**Lignes concernées** :

- ProfilePage.tsx : lignes 175-185 (fonction formatCount)
- UserProfilePage.tsx : lignes 290-300 (fonction formatCount identique)
- Layout.tsx : lignes 200-250 (fonctions de gestion d'upload)

**Tâche** : Créer `src/utils/` avec :

- `formatting.ts` : fonctions formatCount, formatDate, etc.
- `imageUtils.ts` : logique de gestion des images et uploads
- `constants.ts` : constantes partagées (API_URL, tailles d'images, etc.)

### 4.2 Extraction de types TypeScript communs

**Problème** : Interfaces dupliquées dans plusieurs fichiers
**Impact** : Fichiers `src/components/ProfilePage.tsx`, `src/components/UserProfilePage.tsx`, `src/components/Layout.tsx`
**Lignes concernées** :

- ProfilePage.tsx : lignes 30-50 (interfaces ProfileData, Post)
- UserProfilePage.tsx : lignes 30-65 (interfaces similaires)
- Layout.tsx : lignes 60-80 (interfaces PostData, UploadResponse)

**Tâche** : Créer `src/types/` avec :

- `profile.ts` : interfaces pour les données de profil
- `post.ts` : interfaces pour les posts et médias
- `api.ts` : interfaces pour les réponses API
- `user.ts` : interfaces pour les données utilisateur

### 4.3 Composants de grille de posts réutilisables

**Problème** : Composant PostGrid dupliqué dans ProfilePage et UserProfilePage
**Impact** : Fichiers `src/components/ProfilePage.tsx`, `src/components/UserProfilePage.tsx`
**Lignes concernées** :

- ProfilePage.tsx : lignes 180-230 (composant PostGrid)
- UserProfilePage.tsx : lignes 300-350 (composant PostGrid identique)

**Tâche** : Créer `src/components/common/PostGrid.tsx` :

- Extraire la logique commune de grille de posts
- Rendre le composant configurable (taille, espacement, etc.)
- Ajouter le support pour différents types de posts
- Gérer les états de chargement et erreurs

---

## 🚀 5. OPTIMISATIONS DE PERFORMANCE

### 5.1 Mémorisation des composants coûteux

**Problème** : Re-renders inutiles de composants lourds
**Impact** : Fichiers `src/components/Layout.tsx`, `src/components/ProfilePage.tsx`
**Lignes concernées** :

- Layout.tsx : lignes 400-500 (composant Layout complet)
- ProfilePage.tsx : lignes 200-400 (section de profil)

**Tâche** : Optimisation avec React.memo et useMemo :

- Mémoriser les composants Layout et sections de profil
- Optimiser les callbacks avec useCallback
- Réduire les re-renders des listes de posts

### 5.2 Lazy loading des composants de dialogue

**Problème** : Composants de dialogue chargés même quand non utilisés
**Impact** : Fichiers `src/components/CreateProfileDialog.tsx`, `src/components/UpdateProfileDialog.tsx`, `src/components/CropSelector.tsx`
**Lignes concernées** : Fichiers complets (lignes 1-fin)

**Tâche** : Implémenter le lazy loading :

- Utiliser React.lazy() pour les dialogues
- Ajouter des Suspense boundaries appropriés
- Créer un système de chargement différé pour les composants lourds

### 5.3 Optimisation des imports MUI

**Problème** : Imports complets de MUI impactant la taille du bundle
**Impact** : Tous les fichiers composants
**Lignes concernées** : Lignes d'imports dans tous les fichiers

**Tâche** : Optimiser les imports MUI :

- Remplacer les imports complets par des imports spécifiques
- Utiliser tree-shaking pour réduire la taille du bundle
- Configurer Vite pour une meilleure optimisation des dépendances

---

## 📦 6. GESTION D'ÉTAT AMÉLIORÉE

### 6.1 Context pour les données de profil globales

**Problème** : États de profil gérés localement dans chaque composant
**Impact** : Fichiers `src/components/ProfilePage.tsx`, `src/components/UserProfilePage.tsx`
**Lignes concernées** :

- ProfilePage.tsx : lignes 54-80 (états locaux de profil)
- UserProfilePage.tsx : lignes 71-90 (états similaires)

**Tâche** : Créer `src/contexts/ProfileContext.tsx` :

- Centraliser la gestion des états de profil
- Permettre le partage de données entre composants
- Optimiser les appels API en évitant les doublons

### 6.2 Gestionnaire d'erreurs centralisé

**Problème** : Gestion d'erreurs dispersée et incohérente
**Impact** : Multiple fichiers avec logique d'erreur similaire
**Lignes concernées** : Blocs try-catch dispersés dans tous les composants

**Tâche** : Créer un système d'erreurs centralisé :

- Hook useErrorHandler pour une gestion cohérente
- ErrorBoundary components pour capturer les erreurs
- Système de notifications toast pour les erreurs utilisateur

---

## 📝 7. AMÉLIORATION DE LA LISIBILITÉ

### 7.1 Séparation des logiques métier et UI

**Problème** : Logique métier mélangée avec les composants UI
**Impact** : Fichier `src/components/Layout.tsx`
**Lignes concernées** : lignes 180-300 (logique d'upload dans le composant UI)

**Tâche** : Extraire la logique métier :

- Créer des hooks métier séparés pour upload, navigation, etc.
- Garder les composants focalisés sur l'affichage
- Améliorer la testabilité du code

### 7.2 Documentation et typage renforcé

**Problème** : Manque de documentation et types any en plusieurs endroits
**Impact** : Ensemble du projet
**Lignes concernées** : Variables et fonctions sans types stricts

**Tâche** : Renforcer le typage :

- Ajouter des JSDoc comments pour les fonctions complexes
- Éliminer les types any et unknown
- Créer des types d'union plus précis pour les props

---

## 🎯 PRIORITÉS DE MISE EN ŒUVRE

### Phase 1 (Impact élevé, effort modéré)

1. Fusion des composants ENSUser/ProfileUser
2. Extraction des styles MUI redondants
3. Création du dossier utils/ avec fonctions communes

### Phase 2 (Impact élevé, effort élevé)

4. Refactoring des hooks useENS et profil
5. Création des types TypeScript communs
6. Optimisation des imports MUI

### Phase 3 (Impact modéré, effort modéré)

7. Lazy loading des composants de dialogue
8. Context pour les données de profil
9. Mémorisation des composants coûteux

### Phase 4 (Impact modéré, effort faible)

10. Gestionnaire d'erreurs centralisé
11. Documentation et typage renforcé
12. Séparation des logiques métier et UI

---

## 📊 BÉNÉFICES ATTENDUS

- **Performance** : Réduction de 30-40% de la taille du bundle
- **Maintenabilité** : Réduction de 50% du code dupliqué
- **DX (Developer Experience)** : Types plus stricts, erreurs plus claires
- **UX (User Experience)** : Chargements plus rapides, moins de bugs
- **Testabilité** : Logique métier séparée, composants plus simples

---

*Ce rapport identifie les principales améliorations possibles pour le code client. Chaque tâche peut être implémentée de façon incrémentale sans casser les fonctionnalités existantes.*

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

---

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

### 8. Implémenter un Système de Gestion d'Erreurs Global

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
