/**
 * Context global pour la gestion des erreurs
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, AlertProps } from '@mui/material';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  code?: string;
  details?: unknown;
  timestamp: number;
  autoHide?: boolean;
  duration?: number;
}

export interface ErrorContextState {
  errors: AppError[];
  showError: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp'>>) => void;
  showSuccess: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'type'>>) => void;
  showWarning: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'type'>>) => void;
  showInfo: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'type'>>) => void;
  hideError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextState | undefined>(undefined);

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
  maxErrors?: number;
  defaultDuration?: number;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxErrors = 5,
  defaultDuration = 6000,
}) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  /**
   * Génère un ID unique pour une erreur
   */
  const generateId = useCallback(() => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Ajoute une nouvelle erreur
   */
  const addError = useCallback((
    message: string,
    type: AppError['type'] = 'error',
    options: Partial<Omit<AppError, 'id' | 'timestamp' | 'message' | 'type'>> = {}
  ) => {
    const newError: AppError = {
      id: generateId(),
      message,
      type,
      timestamp: Date.now(),
      autoHide: true,
      duration: defaultDuration,
      ...options,
    };

    setErrors(prev => {
      // Limiter le nombre d'erreurs affichées
      const updated = [newError, ...prev];
      return updated.slice(0, maxErrors);
    });

    // Auto-hide si configuré
    if (newError.autoHide) {
      setTimeout(() => {
        hideError(newError.id);
      }, newError.duration);
    }

    return newError.id;
  }, [generateId, defaultDuration, maxErrors]);

  /**
   * Supprime une erreur par ID
   */
  const hideError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  /**
   * Vide toutes les erreurs
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  /**
   * Méthodes de convenance pour différents types d'erreur
   */
  const showError = useCallback((message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp'>>) => {
    return addError(message, 'error', options);
  }, [addError]);

  const showSuccess = useCallback((message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'type'>>) => {
    return addError(message, 'success', options);
  }, [addError]);

  const showWarning = useCallback((message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'type'>>) => {
    return addError(message, 'warning', options);
  }, [addError]);

  const showInfo = useCallback((message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'type'>>) => {
    return addError(message, 'info', options);
  }, [addError]);

  /**
   * Nettoie automatiquement les erreurs anciennes
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setErrors(prev => prev.filter(error => {
        // Garder les erreurs récentes ou celles qui ne s'auto-masquent pas
        return !error.autoHide || (now - error.timestamp) < (error.duration || defaultDuration);
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [defaultDuration]);

  const contextValue: ErrorContextState = {
    errors,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    hideError,
    clearErrors,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      <ErrorDisplay errors={errors} onClose={hideError} />
    </ErrorContext.Provider>
  );
};

/**
 * Composant pour afficher les erreurs sous forme de Snackbars
 */
interface ErrorDisplayProps {
  errors: AppError[];
  onClose: (id: string) => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, onClose }) => {
  // Afficher seulement la première erreur pour éviter l'encombrement
  const currentError = errors[0];

  if (!currentError) return null;

  const severity: AlertProps['severity'] = currentError.type === 'error' ? 'error' :
    currentError.type === 'warning' ? 'warning' :
    currentError.type === 'info' ? 'info' : 'success';

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      autoHideDuration={currentError.autoHide ? currentError.duration : null}
      onClose={() => onClose(currentError.id)}
      sx={{ zIndex: 9999 }}
    >
      <Alert
        onClose={() => onClose(currentError.id)}
        severity={severity}
        variant="filled"
        sx={{
          minWidth: 300,
          '& .MuiAlert-message': {
            fontSize: '0.95rem',
            fontWeight: 500,
          },
        }}
      >
        {currentError.message}
        {errors.length > 1 && (
          <div style={{ fontSize: '0.8rem', marginTop: 4, opacity: 0.8 }}>
            +{errors.length - 1} autre(s) notification(s)
          </div>
        )}
      </Alert>
    </Snackbar>
  );
};

/**
 * Hook pour gérer les erreurs d'API de manière cohérente
 */
export const useAPIErrorHandler = () => {
  const { showError, showWarning } = useErrorHandler();

  const handleAPIError = useCallback((error: unknown, context?: string) => {
    let message = 'Une erreur inattendue s\'est produite';
    let isWarning = false;

    if (error instanceof Error) {
      message = error.message;
      
      // Traiter différents types d'erreurs
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        message = 'Vous devez être connecté pour effectuer cette action';
        isWarning = true;
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        message = 'Vous n\'avez pas les permissions nécessaires';
        isWarning = true;
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        message = 'Ressource introuvable';
        isWarning = true;
      } else if (error.message.includes('Network')) {
        message = 'Problème de connexion réseau';
      }
    }

    if (context) {
      message = `${context}: ${message}`;
    }

    if (isWarning) {
      showWarning(message);
    } else {
      showError(message);
    }
  }, [showError, showWarning]);

  return { handleAPIError };
};
