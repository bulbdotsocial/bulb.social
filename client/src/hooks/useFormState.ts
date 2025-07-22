/**
 * Hook réutilisable pour la gestion des formulaires avec validation
 */

import { useState, useCallback, useMemo } from 'react';
import { useErrorHandler } from '../contexts/ErrorContext';

export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule;
}

export interface FormErrors {
  [fieldName: string]: string;
}

export interface UseFormStateOptions<T> {
  initialValues: T;
  validation?: FieldValidation;
  onSubmit?: (values: T) => Promise<boolean>;
  resetOnSuccess?: boolean;
  showErrorMessages?: boolean;
}

export interface UseFormStateResult<T> {
  // État du formulaire
  values: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isLoading: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  // Actions
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  handleChange: (field: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  handleSubmit: (event?: React.FormEvent) => Promise<void>;
  reset: () => void;
  
  // Utilitaires
  getFieldProps: (field: keyof T) => {
    value: any;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: () => void;
    error: boolean;
    helperText: string;
  };
}

/**
 * Valide une valeur selon une règle
 */
const validateValue = (value: any, rule: ValidationRule, fieldName: string): string | null => {
  // Required
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return rule.message || `${fieldName} est requis`;
  }
  
  // Si pas de valeur et pas requis, pas d'erreur
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }
  
  // Min length
  if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
    return rule.message || `${fieldName} doit contenir au moins ${rule.minLength} caractères`;
  }
  
  // Max length
  if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
    return rule.message || `${fieldName} ne peut pas dépasser ${rule.maxLength} caractères`;
  }
  
  // Pattern
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return rule.message || `Format de ${fieldName} invalide`;
  }
  
  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }
  
  return null;
};

/**
 * Hook principal pour la gestion des formulaires
 */
export const useFormState = <T extends Record<string, any>>(
  options: UseFormStateOptions<T>
): UseFormStateResult<T> => {
  const { initialValues, validation = {}, onSubmit, resetOnSuccess = true, showErrorMessages = true } = options;
  const { showError, showSuccess } = useErrorHandler();
  
  // États
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors>({});
  const [touched, setTouchedState] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculé
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);
  
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);
  
  // Actions
  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    // Validation en temps réel si le champ a déjà été touché
    if (touched[field] && validation[field as string]) {
      const error = validateValue(value, validation[field as string], field as string);
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }));
      } else {
        setErrorsState(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    }
  }, [touched, validation]);
  
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);
  
  const setError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [field]: error }));
  }, []);
  
  const clearError = useCallback((field: keyof T) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);
  
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);
  
  const handleChange = useCallback((field: keyof T) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(field, event.target.value);
    };
  }, [setValue]);
  
  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      setTouchedState(prev => ({ ...prev, [field]: true }));
      
      // Valider le champ au blur
      if (validation[field as string]) {
        const error = validateValue(values[field], validation[field as string], field as string);
        if (error) {
          setError(field, error);
        } else {
          clearError(field);
        }
      }
    };
  }, [values, validation, setError, clearError]);
  
  const validateField = useCallback((field: keyof T): boolean => {
    if (!validation[field as string]) return true;
    
    const error = validateValue(values[field], validation[field as string], field as string);
    if (error) {
      setError(field, error);
      return false;
    } else {
      clearError(field);
      return true;
    }
  }, [values, validation, setError, clearError]);
  
  const validateForm = useCallback((): boolean => {
    let isFormValid = true;
    const newErrors: FormErrors = {};
    
    Object.keys(validation).forEach(fieldName => {
      const error = validateValue(
        values[fieldName as keyof T],
        validation[fieldName],
        fieldName
      );
      if (error) {
        newErrors[fieldName] = error;
        isFormValid = false;
      }
    });
    
    setErrorsState(newErrors);
    return isFormValid;
  }, [values, validation]);
  
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (isLoading) return;
    
    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouchedState(allTouched);
    
    // Valider le formulaire
    if (!validateForm()) {
      if (showErrorMessages) {
        showError('Veuillez corriger les erreurs dans le formulaire');
      }
      return;
    }
    
    if (!onSubmit) return;
    
    try {
      setIsLoading(true);
      const success = await onSubmit(values);
      
      if (success) {
        if (showErrorMessages) {
          showSuccess('Formulaire soumis avec succès');
        }
        if (resetOnSuccess) {
          reset();
        }
      }
    } catch (error) {
      if (showErrorMessages) {
        showError(error instanceof Error ? error.message : 'Erreur lors de la soumission');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, values, validateForm, onSubmit, showErrorMessages, showError, showSuccess, resetOnSuccess]);
  
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({} as Record<keyof T, boolean>);
    setIsLoading(false);
  }, [initialValues]);
  
  const getFieldProps = useCallback((field: keyof T) => {
    return {
      value: values[field] || '',
      onChange: handleChange(field),
      onBlur: handleBlur(field),
      error: touched[field] && !!errors[field as string],
      helperText: touched[field] ? errors[field as string] || '' : '',
    };
  }, [values, handleChange, handleBlur, touched, errors]);
  
  return {
    // État
    values,
    errors,
    touched,
    isLoading,
    isValid,
    isDirty,
    
    // Actions
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    
    // Utilitaires
    getFieldProps,
  };
};
