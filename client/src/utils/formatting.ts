/**
 * Fonctions utilitaires pour le formatage de données
 */

/**
 * Formate un nombre en notation compacte (1.2K, 3.4M, etc.)
 */
export const formatCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  }
  
  if (count < 1000000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  
  if (count < 1000000000) {
    return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  
  return (count / 1000000000).toFixed(1).replace('.0', '') + 'B';
};

/**
 * Formate une date en format relatif (il y a 2h, hier, etc.)
 */
export const formatDate = (date: string | Date): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'à l\'instant';
  }
  
  if (diffMinutes < 60) {
    return `il y a ${diffMinutes}min`;
  }
  
  if (diffHours < 24) {
    return `il y a ${diffHours}h`;
  }
  
  if (diffDays === 1) {
    return 'hier';
  }
  
  if (diffDays < 7) {
    return `il y a ${diffDays}j`;
  }
  
  // Pour les dates plus anciennes, afficher la date complète
  return targetDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Formate un nom d'utilisateur en tronquant si nécessaire
 */
export const formatUsername = (username: string, maxLength: number = 20): string => {
  if (username.length <= maxLength) {
    return username;
  }
  
  return username.substring(0, maxLength - 3) + '...';
};

/**
 * Formate une adresse Ethereum en version courte
 */
export const formatAddress = (address: string, startLength: number = 6, endLength: number = 4): string => {
  if (address.length <= startLength + endLength) {
    return address;
  }
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Formate une taille de fichier en notation lisible
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Vérifie si une chaîne est une adresse Ethereum valide
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
