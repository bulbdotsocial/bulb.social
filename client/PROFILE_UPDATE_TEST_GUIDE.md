# Guide de Test - Mise à Jour de Profil

## Fonctionnalités Corrigées

### 1. Bouton "Edit Profile"

✅ **CORRIGÉ** : Le bouton "Edit Profile" ouvre maintenant la boîte de dialogue de mise à jour du profil

### 2. Mise à Jour du Profil

✅ **CORRIGÉ** : Les mises à jour de profil (nom d'utilisateur, image de profil, description) prennent maintenant effet

## Comment Tester

### Prérequis

1. Avoir un wallet connecté (Privy ou MetaMask)
2. Être connecté au réseau Flow Testnet
3. Avoir un profil exclusif créé

### Test du Bouton "Edit Profile"

1. **Accéder à la page de profil** :
   - Connectez votre wallet
   - Naviguez vers la page de profil

2. **Vérifier la disponibilité du bouton** :
   - Si vous n'avez pas de profil exclusif : vous verrez "Create Exclusive Profile"
   - Si vous avez un profil exclusif : vous verrez "Edit Profile"

3. **Cliquer sur "Edit Profile"** :
   - Le bouton doit ouvrir la boîte de dialogue de mise à jour
   - La boîte de dialogue doit pré-remplir les données actuelles

### Test de la Mise à Jour du Profil

1. **Ouvrir la boîte de dialogue de mise à jour** :
   - Cliquez sur "Edit Profile"
   - Vérifiez que les champs sont pré-remplis avec les données actuelles

2. **Modifier les informations** :
   - **Nom d'utilisateur** : Changez le nom d'utilisateur (minimum 3 caractères, alphanumériques + _ et -)
   - **Image de profil** : Ajoutez un hash IPFS (optionnel) comme `QmYourImageHash`
   - **Description** : Modifiez la description (minimum 10 caractères)

3. **Valider les changements** :
   - Le bouton "Update Profile" doit être activé seulement si des changements sont détectés
   - Cliquez sur "Update Profile"
   - Approuvez la transaction dans votre wallet

4. **Vérifier la mise à jour** :
   - Après confirmation de la transaction, la boîte de dialogue se ferme
   - Les nouvelles données doivent apparaître sur la page de profil
   - Les changements sont persistants (rechargez la page pour vérifier)

### Gestion des Erreurs

1. **Réseau incorrect** :
   - L'application tente automatiquement de basculer vers Flow Testnet
   - Si cela échoue, changez manuellement de réseau

2. **Validation des données** :
   - Nom d'utilisateur trop court (< 3 caractères) : erreur affichée
   - Nom d'utilisateur invalide (caractères spéciaux) : erreur affichée
   - Description trop courte (< 10 caractères) : erreur affichée

3. **Transaction rejetée** :
   - Message d'erreur approprié affiché
   - Possibilité de réessayer

## Détails Techniques Corrigés

### 1. ABI du Contrat de Profil

- Ajout de `BULB_PROFILE_ABI` pour interagir avec les contrats de profil individuels
- Inclusion des fonctions `updateProfile` et `getProfileInfo`

### 2. Hook useWalletContract

- Implémentation complète de la fonction `updateProfile`
- Validation des paramètres côté client
- Utilisation de l'ABI correct pour les contrats de profil

### 3. Hook useProfileContract

- Nouveau hook pour récupérer les données de profil depuis le contrat
- Gestion du cache et de l'état de chargement
- Fonction de rafraîchissement pour mettre à jour les données

### 4. ProfilePage.tsx

- Intégration du `useProfileContract` pour afficher les vraies données
- Récupération de l'adresse du contrat de profil
- Passage correct des props à `UpdateProfileDialog`
- Rafraîchissement des données après mise à jour

### 5. UpdateProfileDialog.tsx

- Réception de l'adresse du contrat de profil
- Validation et soumission des mises à jour
- Gestion des états d'erreur et de chargement

## Notes Importantes

1. **Fonds requis** : Assurez-vous d'avoir du FLOW Testnet pour les frais de transaction
2. **Permissions** : Seul le créateur du profil peut le mettre à jour
3. **Limites** :
   - Nom d'utilisateur : 50 caractères max
   - Description : 500 caractères max
4. **IPFS** : L'image de profil doit être un hash IPFS valide (optionnel)

## Dépannage

### Le bouton "Edit Profile" n'apparaît pas

- Vérifiez que vous avez un profil exclusif créé
- Vérifiez que votre wallet est connecté
- Rechargez la page

### La mise à jour échoue

- Vérifiez votre connexion réseau
- Assurez-vous d'être sur Flow Testnet
- Vérifiez que vous avez suffisamment de fonds
- Vérifiez les limites de caractères

### Les données ne se mettent pas à jour

- Attendez quelques secondes pour la confirmation de la transaction
- Rechargez la page si nécessaire
- Vérifiez dans l'explorateur de blocs que la transaction a été confirmée
