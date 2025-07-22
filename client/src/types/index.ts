/**
 * Fichier d'index central pour tous les types
 * Exporte tous les types de l'application pour un import facilité
 */

// Types utilisateur
export * from './user';

// Types posts et médias
export * from './post';

// Types API
export * from './api';

// Types composants
export * from './components';

// Types utilitaires
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Types de thème
export type ThemeMode = 'light' | 'dark' | 'system';

// Types de navigation
export type NavigationItem = {
  label: string;
  path: string;
  icon: React.ComponentType;
  requireAuth?: boolean;
};

// Types d'erreur
export interface AppError {
  message: string;
  code?: string | number;
  details?: unknown;
}

// Types exports
export type {
  User,
  UserProfile,
  SocialLink,
  ProfileFormData,
  ProfileValidationError,
} from './user';

export type {
  Post,
  PostContent,
  PostMetadata,
  PostFormData,
  PostValidationError,
  PostDisplayMode,
  PostInteraction,
} from './post';

export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  RequestConfig,
  ErrorResponse,
} from './api';

export type {
  ComponentBaseProps,
  LoadingState,
  ErrorState,
  ThemeMode,
  ResponsiveValue,
  BreakpointValue,
} from './components';

// Hook types
export type {
  UserData,
  UseUserDataOptions,
} from '../hooks/useUserData';
