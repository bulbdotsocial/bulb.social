/**
 * Constantes partagées de l'application
 */

// URLs et endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Tailles d'images
export const IMAGE_SIZES = {
  AVATAR: {
    width: 150,
    height: 150,
  },
  POST_THUMBNAIL: {
    width: 400,
    height: 400,
  },
  POST_LARGE: {
    width: 1080,
    height: 1080,
  },
} as const;

// Limites de l'application
export const LIMITS = {
  BIO_MAX_LENGTH: 500,
  USERNAME_MAX_LENGTH: 30,
  USERNAME_MIN_LENGTH: 3,
  DESCRIPTION_MAX_LENGTH: 2200,
  TAGS_MAX_COUNT: 10,
  POSTS_PER_PAGE: 20,
} as const;

// Patterns regex
export const PATTERNS = {
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  ENS_NAME: /^[a-z0-9-]+\.eth$/,
  HASHTAG: /#[\w]+/g,
  MENTION: /@[\w]+/g,
} as const;

// Configurations PWA
export const PWA_CONFIG = {
  INSTALL_PROMPT_DELAY: 3000, // 3 secondes
  UPDATE_CHECK_INTERVAL: 60000, // 1 minute
} as const;

// Timeouts et délais
export const TIMEOUTS = {
  TOAST_DURATION: 4000,
  SEARCH_DEBOUNCE: 300,
  AUTO_SAVE_DELAY: 2000,
  REQUEST_TIMEOUT: 30000,
} as const;

// Clés de stockage local
export const STORAGE_KEYS = {
  THEME: 'bulb-theme',
  WALLET_CONNECTED: 'bulb-wallet-connected',
  LAST_SEEN_POSTS: 'bulb-last-seen-posts',
  DRAFT_POST: 'bulb-draft-post',
  USER_PREFERENCES: 'bulb-user-preferences',
} as const;

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion réseau',
  UNAUTHORIZED: 'Vous devez être connecté pour effectuer cette action',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires',
  NOT_FOUND: 'Ressource introuvable',
  VALIDATION_ERROR: 'Données invalides',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux',
  INVALID_FILE_TYPE: 'Type de fichier non supporté',
  UPLOAD_FAILED: 'Échec de l\'upload',
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  PROFILE_CREATED: 'Profil créé avec succès',
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
  POST_CREATED: 'Post publié avec succès',
  POST_DELETED: 'Post supprimé avec succès',
  FILE_UPLOADED: 'Fichier uploadé avec succès',
} as const;

// Configuration des réseaux blockchain
export const NETWORKS = {
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  },
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  },
} as const;

// Types d'événements analytics
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  POST_CREATED: 'post_created',
  POST_LIKED: 'post_liked',
  PROFILE_UPDATED: 'profile_updated',
  WALLET_CONNECTED: 'wallet_connected',
  SEARCH_PERFORMED: 'search_performed',
} as const;
