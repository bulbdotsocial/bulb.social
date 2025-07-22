/**
 * Configuration spécifique au mode light
 */

import { ThemeOptions } from '@mui/material/styles';
import { commonColors, typography, breakpoints, borderRadius, shadows } from './baseTheme';

export const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    ...commonColors,
    background: {
      default: '#fafafa', // Instagram light gray
      paper: '#ffffff',
    },
    text: {
      primary: '#262626', // Instagram dark text
      secondary: '#8e8e8e', // Instagram gray text
    },
    divider: '#dbdbdb', // Instagram border color
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  },
  typography,
  breakpoints,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #dbdbdb',
          boxShadow: shadows.none,
          color: '#262626',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: shadows.none,
          border: '1px solid #dbdbdb',
          borderRadius: borderRadius.medium,
          marginBottom: 24,
          backgroundColor: '#ffffff',
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
          backgroundColor: '#ffffff',
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
          },
          '& .MuiInputLabel-root': {
            fontSize: '1rem',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#dbdbdb',
            },
            '&:hover fieldset': {
              borderColor: '#8e8e8e',
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
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '1rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #dbdbdb',
        },
      },
    },
  },
};
