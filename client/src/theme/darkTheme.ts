/**
 * Configuration spécifique au mode dark
 */

import { ThemeOptions } from '@mui/material/styles';
import { commonColors, typography, breakpoints, borderRadius, shadows } from './baseTheme';

export const darkTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    ...commonColors,
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    divider: '#333333',
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  typography,
  breakpoints,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderBottom: '1px solid #333333',
          boxShadow: shadows.none,
          color: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: shadows.none,
          border: '1px solid #333333',
          borderRadius: borderRadius.medium,
          marginBottom: 24,
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: borderRadius.small,
          fontSize: '1rem',
        },
        contained: {
          boxShadow: shadows.none,
          '&:hover': {
            boxShadow: shadows.card,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: shadows.elevated,
          '&:hover': {
            boxShadow: shadows.float,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
        },
        elevation1: {
          boxShadow: shadows.card,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '1rem',
            color: '#ffffff',
          },
          '& .MuiInputLabel-root': {
            fontSize: '1rem',
            color: '#b0b0b0',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#333333',
            },
            '&:hover fieldset': {
              borderColor: '#b0b0b0',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          color: '#b0b0b0',
          '&.Mui-selected': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          color: '#ffffff',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '1rem',
          color: '#ffffff',
        },
        secondary: {
          color: '#b0b0b0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid #333333',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#333333',
        },
      },
    },
  },
};
