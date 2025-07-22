/**
 * Utilitaires pour la gestion des images et uploads
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

/**
 * Valide un fichier image
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Format de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.'
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Le fichier est trop volumineux. Maximum 10MB.'
    };
  }
  
  return { valid: true };
};

/**
 * Crée une URL de prévisualisation pour un fichier
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Libère une URL de prévisualisation
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Redimensionne une image en canvas
 */
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dessiner l'image redimensionnée
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Erreur lors du redimensionnement'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
    img.src = createPreviewUrl(file);
  });
};

/**
 * Convertit un fichier en base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extrait les métadonnées d'une image
 */
export const getImageMetadata = (file: File): Promise<{
  width: number;
  height: number;
  aspectRatio: number;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });
    };
    
    img.onerror = () => reject(new Error('Impossible de lire les métadonnées'));
    img.src = createPreviewUrl(file);
  });
};

/**
 * Génère un nom de fichier unique
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  
  return `${timestamp}_${randomString}.${extension}`;
};
