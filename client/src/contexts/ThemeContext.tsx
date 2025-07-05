import React, { createContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import type { PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    // Get saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme-mode');
    return (savedTheme as PaletteMode) || 'light';
  });

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode,
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
      ...(mode === 'light'
        ? {
            // Light mode colors
            background: {
              default: '#fafafa',
              paper: '#ffffff',
            },
            text: {
              primary: '#262626',
              secondary: '#8e8e8e',
            },
            divider: '#dbdbdb',
          }
        : {
            // Dark mode colors
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#ffffff',
              secondary: '#b0b0b0',
            },
            divider: '#333333',
          }),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.1rem',
      },
      body1: {
        fontSize: '0.875rem',
        lineHeight: 1.4,
      },
      body2: {
        fontSize: '0.75rem',
        lineHeight: 1.3,
      },
      caption: {
        fontSize: '0.75rem',
        color: mode === 'light' ? '#8e8e8e' : '#b0b0b0',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
            boxShadow: mode === 'light' 
              ? '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' 
              : '0 1px 3px rgba(255,255,255,0.12), 0 1px 2px rgba(255,255,255,0.24)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#fafafa' : '#2e2e2e',
            '&.MuiPaper-elevation0': {
              backgroundColor: mode === 'light' ? '#fafafa' : '#2e2e2e',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
            color: mode === 'light' ? '#262626' : '#ffffff',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
