/**
 * Styles réutilisables pour les composants de profil
 */

import { SxProps, Theme } from '@mui/material/styles';

// Styles pour les onglets de profil
export const profileTabsStyles: SxProps<Theme> = {
  '& .MuiTabs-root': {
    borderBottom: 1,
    borderColor: 'divider',
    minHeight: 48,
  },
  '& .MuiTab-root': {
    minHeight: 48,
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
    color: 'text.secondary',
    '&.Mui-selected': {
      color: 'text.primary',
    },
  },
  '& .MuiTabs-indicator': {
    height: 1,
    backgroundColor: 'primary.main',
  },
};

// Styles pour les grilles de posts
export const postGridStyles: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: { xs: 1, sm: 2 },
  mt: 2,
  '& .post-item': {
    aspectRatio: '1 / 1',
    borderRadius: 1,
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative',
    '&:hover': {
      '& .overlay': {
        opacity: 1,
      },
    },
  },
  '& .overlay': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bgcolor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    color: 'white',
  },
};

// Styles pour le header de profil
export const profileHeaderStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 2, sm: 4 },
  alignItems: { xs: 'center', sm: 'flex-start' },
  mb: 4,
  p: { xs: 2, sm: 3 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
};

// Styles pour l'avatar de profil
export const profileAvatarStyles: SxProps<Theme> = {
  width: { xs: 120, sm: 150 },
  height: { xs: 120, sm: 150 },
  border: '3px solid',
  borderColor: 'primary.main',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
};

// Styles pour les statistiques de profil
export const profileStatsStyles: SxProps<Theme> = {
  display: 'flex',
  gap: { xs: 2, sm: 4 },
  justifyContent: 'center',
  mt: 2,
  '& .stat-item': {
    textAlign: 'center',
    '& .count': {
      fontSize: { xs: '1.2rem', sm: '1.5rem' },
      fontWeight: 700,
      color: 'text.primary',
    },
    '& .label': {
      fontSize: '0.875rem',
      color: 'text.secondary',
      fontWeight: 500,
    },
  },
};

// Styles pour les boutons d'action de profil
export const profileActionButtonStyles: SxProps<Theme> = {
  mt: 2,
  px: 3,
  py: 1,
  borderRadius: 1,
  fontWeight: 600,
  fontSize: '0.875rem',
  textTransform: 'none',
  minWidth: 100,
};

// Styles pour la bio de profil
export const profileBioStyles: SxProps<Theme> = {
  mt: 1,
  color: 'text.primary',
  fontSize: '1rem',
  lineHeight: 1.4,
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
};

// Styles pour les dialogs de profil
export const profileDialogStyles: SxProps<Theme> = {
  '& .MuiDialog-paper': {
    borderRadius: 2,
    minWidth: { xs: '90vw', sm: 400 },
    maxWidth: 500,
  },
  '& .MuiDialogTitle-root': {
    textAlign: 'center',
    fontWeight: 600,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  '& .MuiDialogContent-root': {
    pt: 3,
  },
  '& .MuiDialogActions-root': {
    px: 3,
    pb: 3,
    gap: 1,
  },
};

// Styles pour les skeleton loaders
export const skeletonStyles = {
  avatar: {
    width: { xs: 120, sm: 150 },
    height: { xs: 120, sm: 150 },
    borderRadius: '50%',
  },
  text: {
    width: '100%',
    height: 20,
    borderRadius: 1,
  },
  post: {
    aspectRatio: '1 / 1',
    borderRadius: 1,
  },
};

// Breakpoints pour le responsive design
export const profileBreakpoints = {
  mobile: 'xs',
  tablet: 'sm',
  desktop: 'md',
  large: 'lg',
} as const;

// Dimensions pour les composants de profil
export const profileDimensions = {
  avatar: {
    small: 40,
    medium: 80,
    large: 150,
  },
  postThumbnail: {
    small: 100,
    medium: 200,
    large: 400,
  },
} as const;
