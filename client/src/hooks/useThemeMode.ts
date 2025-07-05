import { useContext } from 'react';
import type { PaletteMode } from '@mui/material';
import { ThemeContext } from '../contexts/ThemeContext';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a CustomThemeProvider');
  }
  return context;
};
