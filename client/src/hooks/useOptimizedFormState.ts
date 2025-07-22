import { useState, useCallback, useMemo, useRef } from 'react';

// Types pour la validation
export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: T) => string | null;
  dependencies?: string[]; // Champs dont dépend cette validation
}

export interface FieldConfig<T = any> {
  initialValue: T;
  validation?: ValidationRule<T>;
  transform?: (value: any) => T; // Transforme la valeur avant stockage
  debounceMs?: number; // Délai de debounce pour la validation
}

export interface FormConfig {
  [fieldName: string]: FieldConfig;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface UseFormStateOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
  onSubmit?: (values: Record<string, any>) => Promise<boolean> | boolean;
  onReset?: () => void;
}

const DEFAULT_OPTIONS: UseFormStateOptions = {
  validateOnChange: true,
  validateOnBlur: true,
  resetOnSubmit: false,
};

// Utilitaires de validation
const validateField = <T>(
  value: T,
  rule: ValidationRule<T>,
  allValues: Record<string, any>
): string | null => {
  if (rule.required && (value === undefined || value === null || value === '')) {
    return 'This field is required';
  }

  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `Minimum length is ${rule.minLength} characters`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return `Maximum length is ${rule.maxLength} characters`;
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return `Minimum value is ${rule.min}`;
    }
    if (rule.max !== undefined && value > rule.max) {
      return `Maximum value is ${rule.max}`;
    }
  }

  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

// Hook principal
export function useOptimizedFormState(
  config: FormConfig,
  options: UseFormStateOptions = DEFAULT_OPTIONS
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Initialisation des valeurs
  const initialValues = useMemo(() => {
    const values: Record<string, any> = {};
    Object.entries(config).forEach(([key, fieldConfig]) => {
      values[key] = fieldConfig.initialValue;
    });
    return values;
  }, [config]);

  // État du formulaire
  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
  });

  // Référence pour les timeouts de debounce
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const validationCache = useRef<Record<string, { value: any; error: string | null }>>({});

  // Validation d'un champ avec cache et debounce
  const validateFieldWithCache = useCallback((
    fieldName: string,
    value: any,
    allValues: Record<string, any>
  ): string | null => {
    const fieldConfig = config[fieldName];
    if (!fieldConfig?.validation) return null;

    // Check cache
    const cacheKey = `${fieldName}:${JSON.stringify(value)}`;
    const cached = validationCache.current[cacheKey];
    if (cached && cached.value === value) {
      return cached.error;
    }

    // Validate
    const error = validateField(value, fieldConfig.validation, allValues);
    
    // Cache result
    validationCache.current[cacheKey] = { value, error };
    
    return error;
  }, [config]);

  // Validation de tous les champs
  const validateAllFields = useCallback((values: Record<string, any>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    Object.keys(config).forEach(fieldName => {
      const error = validateFieldWithCache(fieldName, values[fieldName], values);
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }, [config, validateFieldWithCache]);

  // Mise à jour d'un champ avec validation optionnelle
  const setFieldValue = useCallback((
    fieldName: string,
    value: any,
    shouldValidate: boolean = mergedOptions.validateOnChange
  ) => {
    setFormState(prev => {
      const fieldConfig = config[fieldName];
      
      // Transform value if needed
      const transformedValue = fieldConfig?.transform ? fieldConfig.transform(value) : value;
      
      const newValues = {
        ...prev.values,
        [fieldName]: transformedValue,
      };

      let newErrors = { ...prev.errors };
      
      if (shouldValidate) {
        const debounceMs = fieldConfig?.debounceMs || 0;
        
        if (debounceMs > 0) {
          // Clear previous timeout
          if (debounceTimeouts.current[fieldName]) {
            clearTimeout(debounceTimeouts.current[fieldName]);
          }
          
          // Set new timeout for validation
          debounceTimeouts.current[fieldName] = setTimeout(() => {
            const error = validateFieldWithCache(fieldName, transformedValue, newValues);
            setFormState(current => ({
              ...current,
              errors: {
                ...current.errors,
                [fieldName]: error || '',
              },
            }));
          }, debounceMs);
        } else {
          // Immediate validation
          const error = validateFieldWithCache(fieldName, transformedValue, newValues);
          if (error) {
            newErrors[fieldName] = error;
          } else {
            delete newErrors[fieldName];
          }
        }
      }

      const hasErrors = Object.values(newErrors).some(error => error);
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValues);

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isValid: !hasErrors,
        isDirty,
      };
    });
  }, [config, mergedOptions.validateOnChange, validateFieldWithCache, initialValues]);

  // Marquer un champ comme touché
  const setFieldTouched = useCallback((fieldName: string, shouldValidate: boolean = mergedOptions.validateOnBlur) => {
    setFormState(prev => {
      let newErrors = { ...prev.errors };
      
      if (shouldValidate && !prev.touched[fieldName]) {
        const error = validateFieldWithCache(fieldName, prev.values[fieldName], prev.values);
        if (error) {
          newErrors[fieldName] = error;
        }
      }

      return {
        ...prev,
        touched: {
          ...prev.touched,
          [fieldName]: true,
        },
        errors: newErrors,
        isValid: !Object.values(newErrors).some(error => error),
      };
    });
  }, [mergedOptions.validateOnBlur, validateFieldWithCache]);

  // Gestion de la soumission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Validate all fields
      const errors = validateAllFields(formState.values);
      const hasErrors = Object.values(errors).some(error => error);
      
      if (hasErrors) {
        setFormState(prev => ({
          ...prev,
          errors,
          isValid: false,
          isSubmitting: false,
          touched: Object.keys(config).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        }));
        return false;
      }

      // Call onSubmit if provided
      let success = true;
      if (mergedOptions.onSubmit) {
        success = await mergedOptions.onSubmit(formState.values);
      }

      if (success && mergedOptions.resetOnSubmit) {
        reset();
      }

      return success;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.values, validateAllFields, config, mergedOptions]);

  // Reset du formulaire
  const reset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    });
    
    // Clear debounce timeouts
    Object.values(debounceTimeouts.current).forEach(clearTimeout);
    debounceTimeouts.current = {};
    
    // Clear validation cache
    validationCache.current = {};
    
    mergedOptions.onReset?.();
  }, [initialValues, mergedOptions]);

  // Getters pour les champs
  const getFieldProps = useCallback((fieldName: string) => ({
    value: formState.values[fieldName] ?? config[fieldName]?.initialValue ?? '',
    error: !!(formState.touched[fieldName] && formState.errors[fieldName]),
    helperText: formState.touched[fieldName] ? formState.errors[fieldName] : '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue(fieldName, e.target.value);
    },
    onBlur: () => {
      setFieldTouched(fieldName);
    },
  }), [formState, config, setFieldValue, setFieldTouched]);

  // Nettoyage des timeouts
  React.useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  return {
    // État
    ...formState,
    
    // Actions
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    reset,
    
    // Utilitaires
    getFieldProps,
    validateField: (fieldName: string) => {
      const error = validateFieldWithCache(fieldName, formState.values[fieldName], formState.values);
      setFormState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: error || '',
        },
      }));
    },
    setFieldError: (fieldName: string, error: string) => {
      setFormState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: error,
        },
        isValid: false,
      }));
    },
  };
}

// Validateurs prédéfinis
export const validators = {
  required: (): ValidationRule => ({ required: true }),
  
  minLength: (min: number): ValidationRule => ({ minLength: min }),
  
  maxLength: (max: number): ValidationRule => ({ maxLength: max }),
  
  email: (): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
  }),
  
  url: (): ValidationRule => ({
    pattern: /^https?:\/\/.+/,
    custom: (value: string) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        return 'Please enter a valid URL';
      }
      return null;
    },
  }),
  
  ethereum: (): ValidationRule => ({
    pattern: /^0x[a-fA-F0-9]{40}$/,
    custom: (value: string) => {
      if (value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
        return 'Please enter a valid Ethereum address';
      }
      return null;
    },
  }),
  
  combine: (...rules: ValidationRule[]): ValidationRule => ({
    custom: (value: any, allValues?: Record<string, any>) => {
      for (const rule of rules) {
        const error = validateField(value, rule, allValues || {});
        if (error) return error;
      }
      return null;
    },
  }),
};

export default useOptimizedFormState;
