/**
 * Context de thème consolidé avec configuration centralisée
 */

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';
import { STORAGE_KEYS } from '../utils/constants';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: PaletteMode;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  theme: Theme;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook pour utiliser le contexte de thème
 */
export const useThemeMode = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a CustomThemeProvider');
  }
  return context;
};

/**
 * Détecte la préférence système pour le thème
 */
const getSystemTheme = (): PaletteMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * Récupère le mode de thème sauvegardé ou utilise la valeur par défaut
 */
const getSavedThemeMode = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved as ThemeMode;
    }
  }
  return 'system';
};

/**
 * Résout le mode de palette basé sur le mode de thème
 */
const resolvePaletteMode = (themeMode: ThemeMode): PaletteMode => {
  if (themeMode === 'system') {
    return getSystemTheme();
  }
  return themeMode;
};

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getSavedThemeMode);
  const [mode, setMode] = useState<PaletteMode>(() => resolvePaletteMode(getSavedThemeMode()));

  // Écoute les changements de préférence système
  useEffect(() => {
    if (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setMode(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // Met à jour le mode quand themeMode change
  useEffect(() => {
    const newMode = resolvePaletteMode(themeMode);
    setMode(newMode);
    localStorage.setItem(STORAGE_KEYS.THEME, themeMode);
  }, [themeMode]);

  // Crée le thème basé sur le mode actuel
  const theme = useMemo(() => {
    const baseTheme = mode === 'dark' ? darkTheme : lightTheme;
    return createTheme(baseTheme);
  }, [mode]);

  // Fonction pour basculer entre light et dark (sans system)
  const toggleTheme = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setThemeModeState(newMode);
  }, [mode]);

  // Fonction pour définir explicitement le mode
  const setThemeMode = useCallback((newThemeMode: ThemeMode) => {
    setThemeModeState(newThemeMode);
  }, []);

  // Mémorise la valeur du contexte pour éviter les re-renders inutiles
  const contextValue = useMemo(() => ({
    mode,
    themeMode,
    toggleTheme,
    setThemeMode,
    theme,
  }), [mode, themeMode, toggleTheme, setThemeMode, theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
