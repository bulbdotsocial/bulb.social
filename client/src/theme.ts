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
    fontSize: 18, // Increase base font size from 16px to 18px for better readability
    h4: {
      fontWeight: 600,
      fontSize: '2rem', // Increased from 1.75rem
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.75rem', // Increased from 1.5rem
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.5rem', // Increased from 1.25rem
    },
    body1: {
      fontSize: '1.125rem', // Increased from 1rem (18px)
      lineHeight: 1.5, // Good line height for readability
    },
    body2: {
      fontSize: '1rem', // Increased from 0.875rem (16px)
      lineHeight: 1.4, 
    },
    caption: {
      fontSize: '1rem', // Increased from 0.875rem (16px)
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
          fontSize: '1.125rem', // Larger font size for buttons
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
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem', // Ensure all typography uses larger font size
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '1.125rem', // Larger font size for input fields
          },
          '& .MuiInputLabel-root': {
            fontSize: '1.125rem', // Larger font size for input labels
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem', // Larger font size for tabs
          fontWeight: 600,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem', // Larger font size for menu items
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '1.125rem', // Larger font size for list items
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
