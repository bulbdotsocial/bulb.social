/**
 * Configuration de base du thème de l'application
 */

import { ThemeOptions } from '@mui/material/styles';

// Couleurs communes aux deux modes
export const commonColors = {
  primary: {
    main: '#E4405F', // Instagram pink/red
    light: '#F56040',
    dark: '#C13584',
  },
  secondary: {
    main: '#405DE6', // Instagram blue
    light: '#5B51D8',
    dark: '#833AB4',
  },
  gradient: {
    instagram: 'linear-gradient(45deg, #F56040, #E4405F, #C13584, #833AB4, #405DE6)',
    primary: 'linear-gradient(45deg, #E4405F, #C13584)',
    secondary: 'linear-gradient(45deg, #405DE6, #833AB4)',
  },
};

// Typographie commune
export const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: 18, // Base font size augmentée pour la lisibilité
  h1: {
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2,
  },
  h2: {
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.3,
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.75rem',
    lineHeight: 1.3,
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.1rem',
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.4,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.3,
  },
  button: {
    fontWeight: 600,
    fontSize: '1rem',
    textTransform: 'none' as const,
  },
};

// Breakpoints
export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// Espacements et dimensions
export const spacing = 8; // 8px comme unité de base

export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  rounded: 50,
};

// Ombres
export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  elevated: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  float: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  none: 'none',
};

// Configuration Z-index
export const zIndex = {
  drawer: 1200,
  appBar: 1300,
  modal: 1400,
  snackbar: 1500,
  tooltip: 1600,
};
