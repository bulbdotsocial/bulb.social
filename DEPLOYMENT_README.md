# Script de déploiement bulb.social

Ce dossier contient tous les fichiers nécessaires pour déployer l'application bulb.social sur un VPS.

## Fichiers créés

1. **`deploy.sh`** - Script principal de déploiement
2. **`docker-compose.production.yml`** - Configuration Docker Compose pour la production
3. **`client/Dockerfile`** - Image Docker pour le client React
4. **`client/nginx.conf`** - Configuration Nginx pour servir le client React

## Architecture de déploiement

L'application est déployée avec les services suivants :

- **Client React** (port 80) - Interface utilisateur servie par Nginx
- **Serveur Go** (port 8081) - API backend
- **IPFS/Kubo** (ports 5001, 8080, 4001) - Stockage décentralisé
- **OrbitDB** (port 3000) - Base de données décentralisée

## Utilisation

### Prérequis

1. **Configuration SSH** : Assurez-vous que votre clé SSH est configurée dans `~/.ssh/config` :

   ```
   Host vps.2.paris.srv.network
       HostName vps.2.paris.srv.network
       User ubuntu
       IdentityFile ~/.ssh/your-private-key
   ```

2. **VPS** : Docker et Docker Compose doivent être installés sur le VPS.

### Déploiement

1. **Rendre le script exécutable** :

   ```bash
   chmod +x deploy.sh
   ```

2. **Lancer le script** :

   ```bash
   ./deploy.sh
   ```

3. **Choisir une option** :
   - Option 1 : Déploiement complet (recommandé pour la première fois)
   - Option 2 : Mettre à jour le code seulement
   - Option 3 : Redémarrer les services
   - Option 4 : Vérifier le statut des services
   - Option 5 : Afficher les logs en temps réel
   - Option 6 : Arrêter tous les services

### Accès à l'application

Après un déploiement réussi, l'application sera accessible sur :

- **Application principale** : <http://vps.2.paris.srv.network>
- **API Backend** : <http://vps.2.paris.srv.network:8081>
- **IPFS Gateway** : <http://vps.2.paris.srv.network:8080>

## Fonctionnalités du script

### Déploiement complet

- Vérifie la connexion SSH
- Clone ou met à jour le repository Git
- Arrête les services existants
- Construit les nouvelles images Docker
- Lance tous les services
- Vérifie le statut des services

### Sécurité

- Utilise des images Docker isolées
- Configuration Nginx sécurisée avec headers de sécurité
- Gestion des erreurs robuste
- Logs détaillés pour le debugging

### Monitoring

- Vérification automatique du statut des services
- Affichage des logs en temps réel
- Tests de connectivité automatiques

## Dépannage

### Problèmes de connexion SSH

```bash
# Tester la connexion SSH
ssh ubuntu@vps.2.paris.srv.network

# Vérifier la configuration SSH
cat ~/.ssh/config
```

### Problèmes Docker

```bash
# Se connecter au VPS et vérifier Docker
ssh ubuntu@vps.2.paris.srv.network
docker --version
docker-compose --version
```

### Vérifier les logs

```bash
# Utiliser l'option 5 du script ou se connecter directement
ssh ubuntu@vps.2.paris.srv.network
cd /home/ubuntu/bulb
docker-compose -f docker-compose.production.yml logs
```

### Ports utilisés

- 80 : Client React (Nginx)
- 8081 : Serveur Go
- 5001 : IPFS API
- 8080 : IPFS Gateway
- 4001 : IPFS Swarm
- 3000 : OrbitDB

## Structure des fichiers sur le VPS

```
/home/ubuntu/bulb/
├── client/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── [autres fichiers client]
├── server/
│   ├── Dockerfile
│   ├── data/ (volume IPFS)
│   └── [autres fichiers serveur]
├── docker-compose.production.yml
└── [autres fichiers du projet]
```
