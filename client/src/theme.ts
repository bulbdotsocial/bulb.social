import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
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
    background: {
      default: '#fafafa', // Instagram light gray
      paper: '#ffffff',
    },
    text: {
      primary: '#262626', // Instagram dark text
      secondary: '#8e8e8e', // Instagram gray text
    },
    divider: '#dbdbdb', // Instagram border color
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16, // Increase base font size from default 14px to 16px
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem', // Increased from 1.5rem
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem', // Increased from 1.25rem
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem', // Increased from 1.1rem
    },
    body1: {
      fontSize: '1rem', // Increased from 0.875rem
      lineHeight: 1.5, // Slightly increased line height for better readability
    },
    body2: {
      fontSize: '0.875rem', // Increased from 0.75rem
      lineHeight: 1.4, // Increased from 1.3
    },
    caption: {
      fontSize: '0.875rem', // Increased from 0.75rem
      color: '#8e8e8e',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #dbdbdb',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #dbdbdb',
          borderRadius: 8,
          marginBottom: 24,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 4,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});
