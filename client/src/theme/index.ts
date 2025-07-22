/**
 * Fichier d'index pour la configuration des thèmes
 */

export * from './baseTheme';
export * from './lightTheme';
export * from './darkTheme';
export * from './profileStyles';

// Réexportation du ThemeContext consolidé
export { CustomThemeProvider, useThemeMode } from './ThemeContext';
