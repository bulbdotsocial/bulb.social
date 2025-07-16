#!/bin/bash

# =============================================================================
# Script de déploiement pour bulb.social
# =============================================================================

set -e  # Arrêter le script en cas d'erreur

# Configuration
VPS_HOST="vps.2.zurich.srv.network"
IDENTITY_KEY="$HOME/.ssh/vps.2.zurich.srv.network.key"  # Chemin vers votre clé SSH
VPS_USER="ubuntu"
REPO_URL="https://github.com/bulbdotsocial/bulb.social.git"
REPO_BRANCH="main"
REMOTE_DIR="/home/ubuntu/bulb"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier la connexion SSH
check_ssh_connection() {
    log_info "Vérification de la connexion SSH vers $VPS_HOST..."
    if ssh -i "$IDENTITY_KEY" -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" >/dev/null 2>&1; then
        log_success "Connexion SSH établie avec succès"
    else
        log_error "Impossible de se connecter en SSH. Vérifiez votre configuration SSH et votre clé d'identité."
        log_error "Clé utilisée: $IDENTITY_KEY"
        exit 1
    fi
}

# Mettre à jour le repository sur le VPS
update_repository() {
    log_info "Mise à jour du repository sur le VPS..."
    
    ssh -i "$IDENTITY_KEY" "$VPS_USER@$VPS_HOST" << 'EOF'
        set -e
        
        # Vérifier si le répertoire existe
        if [ ! -d "/home/ubuntu/bulb" ]; then
            echo "Clonage du repository..."
            cd /home/ubuntu
            git clone https://github.com/bulbdotsocial/bulb.social.git bulb
        else
            echo "Mise à jour du repository existant..."
            cd /home/ubuntu/bulb
            git fetch origin
            git reset --hard origin/main
            git clean -fd
        fi
        
        cd /home/ubuntu/bulb
        echo "Repository mis à jour sur la branche: $(git branch --show-current)"
        echo "Dernier commit: $(git log -1 --oneline)"
EOF
    
    log_success "Repository mis à jour avec succès"
}

# Arrêter les services existants
stop_services() {
    log_info "Arrêt des services existants..."
    
    ssh -i "$IDENTITY_KEY" "$VPS_USER@$VPS_HOST" << 'EOF'
        cd /home/ubuntu/bulb
        
        # Arrêter les containers s'ils existent
        if [ -f "docker-compose.production.yml" ]; then
            docker compose -f docker-compose.production.yml down --remove-orphans || true
        fi
        
        # Nettoyer les containers orphelins
        docker container prune -f || true
EOF
    
    log_success "Services arrêtés"
}

# Construire et déployer les images Docker
build_and_deploy() {
    log_info "Construction et déploiement des images Docker..."
    
    ssh -i "$IDENTITY_KEY" "$VPS_USER@$VPS_HOST" << 'EOF'
        cd /home/ubuntu/bulb
        
        # Vérifier que Docker est disponible
        if ! command -v docker &> /dev/null; then
            echo "Docker n'est pas installé sur le VPS"
            exit 1
        fi
        
        if ! docker compose version &> /dev/null; then
            echo "Docker Compose n'est pas installé sur le VPS"
            exit 1
        fi
        
        # Créer le répertoire data pour IPFS s'il n'existe pas
        mkdir -p server/data
        
        # Construire et lancer les services
        echo "Construction des images Docker..."
        docker compose -f docker-compose.production.yml build --no-cache
        
        echo "Lancement des services..."
        docker compose -f docker-compose.production.yml up -d
        
        # Attendre que les services démarrent
        echo "Attente du démarrage des services..."
        sleep 30
        
        # Vérifier l'état des services
        echo "État des services:"
        docker compose -f docker-compose.production.yml ps
EOF
    
    log_success "Services déployés avec succès"
}

# Vérifier le statut des services
check_services() {
    log_info "Vérification du statut des services..."
    
    ssh -i "$IDENTITY_KEY" "$VPS_USER@$VPS_HOST" << 'EOF'
        cd /home/ubuntu/bulb
        
        echo "=== État des containers ==="
        docker compose -f docker-compose.production.yml ps
        
        echo -e "\n=== Logs récents du client React ==="
        docker compose -f docker-compose.production.yml logs --tail=10 client
        
        echo -e "\n=== Logs récents du serveur Go ==="
        docker compose -f docker-compose.production.yml logs --tail=10 go-server
        
        echo -e "\n=== Test de connectivité ==="
        echo "Client React (port 80):"
        curl -s -o /dev/null -w "%{http_code}\n" http://localhost:80 || echo "Service non accessible"
        
        echo "Serveur Go (port 8081):"
        curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081 || echo "Service non accessible"
        
        echo "IPFS API (port 5001):"
        curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5001/api/v0/version || echo "Service non accessible"
EOF
    
    log_success "Vérification terminée"
}

# Afficher les logs en temps réel
show_logs() {
    log_info "Affichage des logs en temps réel..."
    log_warning "Appuyez sur Ctrl+C pour arrêter l'affichage des logs"
    
    ssh -i "$IDENTITY_KEY" "$VPS_USER@$VPS_HOST" << 'EOF'
        cd /home/ubuntu/bulb
        docker compose -f docker-compose.production.yml logs -f
EOF
}

# Menu principal
show_menu() {
    echo ""
    echo "=== Script de déploiement bulb.social ==="
    echo "1. Déploiement complet (recommandé)"
    echo "2. Mettre à jour le code seulement"
    echo "3. Redémarrer les services"
    echo "4. Vérifier le statut des services"
    echo "5. Afficher les logs"
    echo "6. Arrêter tous les services"
    echo "7. Quitter"
    echo ""
    read -p "Choisissez une option (1-7): " choice
}

# Fonctions pour chaque option du menu
full_deployment() {
    log_info "=== DÉPLOIEMENT COMPLET ==="
    check_ssh_connection
    update_repository
    stop_services
    build_and_deploy
    check_services
    log_success "=== DÉPLOIEMENT TERMINÉ ==="
    echo ""
    log_info "L'application est accessible sur:"
    log_info "- Client React: http://$VPS_HOST"
    log_info "- Serveur Go: http://$VPS_HOST:8081"
    log_info "- IPFS Gateway: http://$VPS_HOST:8080"
}

update_code_only() {
    log_info "=== MISE À JOUR DU CODE ==="
    check_ssh_connection
    update_repository
    log_success "=== CODE MIS À JOUR ==="
}

restart_services() {
    log_info "=== REDÉMARRAGE DES SERVICES ==="
    check_ssh_connection
    stop_services
    build_and_deploy
    check_services
    log_success "=== SERVICES REDÉMARRÉS ==="
}

stop_all_services() {
    log_info "=== ARRÊT DE TOUS LES SERVICES ==="
    check_ssh_connection
    stop_services
    log_success "=== TOUS LES SERVICES ARRÊTÉS ==="
}

# Boucle principale
main() {
    while true; do
        show_menu
        case $choice in
            1)
                full_deployment
                ;;
            2)
                update_code_only
                ;;
            3)
                restart_services
                ;;
            4)
                check_ssh_connection
                check_services
                ;;
            5)
                check_ssh_connection
                show_logs
                ;;
            6)
                stop_all_services
                ;;
            7)
                log_info "Au revoir!"
                exit 0
                ;;
            *)
                log_error "Option invalide. Veuillez choisir entre 1 et 7."
                ;;
        esac
        
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
    done
}

# Vérifier les prérequis locaux
check_prerequisites() {
    if ! command -v ssh &> /dev/null; then
        log_error "SSH n'est pas installé sur cette machine"
        exit 1
    fi
    
    # Vérifier que la clé SSH existe
    if [ ! -f "$IDENTITY_KEY" ]; then
        log_error "Clé SSH non trouvée: $IDENTITY_KEY"
        log_info "Veuillez vérifier le chemin de votre clé SSH dans la variable IDENTITY_KEY"
        exit 1
    fi
    
    # Vérifier les permissions de la clé SSH
    if [ "$(stat -f %Mp%Lp "$IDENTITY_KEY" 2>/dev/null)" != "0600" ]; then
        log_warning "Permissions incorrectes pour la clé SSH. Application des bonnes permissions..."
        chmod 600 "$IDENTITY_KEY"
    fi
    
    # Test de connexion SSH
    if ! ssh -i "$IDENTITY_KEY" -o ConnectTimeout=5 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'Test'" >/dev/null 2>&1; then
        log_warning "Impossible de se connecter automatiquement avec la clé SSH."
        log_info "Clé utilisée: $IDENTITY_KEY"
        log_info "Assurez-vous que cette clé est autorisée sur le serveur"
    fi
}

# Point d'entrée du script
echo "=== Script de déploiement bulb.social ==="
echo "VPS: $VPS_HOST"
echo "Utilisateur SSH: $VPS_USER"
echo "Clé SSH: $IDENTITY_KEY"
echo "Repository: $REPO_URL"
echo "Branche: $REPO_BRANCH"
echo ""

check_prerequisites
main
