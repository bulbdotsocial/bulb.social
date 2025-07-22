import React, { memo } from 'react';
import {
  TextField as MUITextField,
  TextFieldProps as MUITextFieldProps,
  InputAdornment,
  IconButton,
  Box,
  FormHelperText,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff, Clear } from '@mui/icons-material';

// Extended Input Props
export interface InputProps extends Omit<MUITextFieldProps, 'variant' | 'size'> {
  variant?: 'outlined' | 'filled' | 'standard' | 'floating';
  size?: 'small' | 'medium' | 'large';
  clearable?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  maxLength?: number;
  showCount?: boolean;
  loading?: boolean;
}

// Styled TextField
const StyledTextField = styled(MUITextField, {
  shouldForwardProp: (prop) => !['clearable', 'iconPosition', 'loading'].includes(prop as string),
})<InputProps>(({ theme, variant, size, error }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    transition: 'all 0.2s ease-in-out',
    
    // Size variants
    ...(size === 'small' && {
      fontSize: '0.875rem',
      '& .MuiOutlinedInput-input': {
        padding: '8px 12px',
      },
    }),
    ...(size === 'medium' && {
      fontSize: '0.9375rem',
      '& .MuiOutlinedInput-input': {
        padding: '12px 14px',
      },
    }),
    ...(size === 'large' && {
      fontSize: '1rem',
      '& .MuiOutlinedInput-input': {
        padding: '16px 16px',
      },
    }),

    // Default state
    '& fieldset': {
      borderColor: alpha(theme.palette.divider, 0.3),
      borderWidth: 1,
    },
    
    // Hover state
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
    },
    
    // Focus state
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },

    // Error state
    ...(error && {
      '& fieldset': {
        borderColor: theme.palette.error.main,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.error.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.error.main,
        boxShadow: `0 0 0 3px ${alpha(theme.palette.error.main, 0.1)}`,
      },
    }),
  },

  // Floating variant
  ...(variant === 'floating' && {
    '& .MuiInputLabel-outlined': {
      transform: 'translate(14px, 12px) scale(1)',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(14px, -9px) scale(0.75)',
        backgroundColor: theme.palette.background.paper,
        padding: '0 8px',
      },
    },
  }),

  // Filled variant
  ...(variant === 'filled' && {
    '& .MuiFilledInput-root': {
      backgroundColor: alpha(theme.palette.background.default, 0.6),
      borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
      '&:hover': {
        backgroundColor: alpha(theme.palette.background.default, 0.8),
      },
      '&.Mui-focused': {
        backgroundColor: alpha(theme.palette.background.default, 0.8),
      },
    },
  }),
}));

// Password Input Hook
const usePasswordToggle = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const togglePassword = React.useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return { showPassword, togglePassword };
};

// Character Counter
const CharacterCounter = memo<{ current: number; max: number; error?: boolean }>(({
  current,
  max,
  error
}) => (
  <Box
    component="span"
    sx={{
      fontSize: '0.75rem',
      color: error ? 'error.main' : 'text.secondary',
      ml: 'auto',
    }}
  >
    {current}/{max}
  </Box>
));

CharacterCounter.displayName = 'CharacterCounter';

// Main Input Component
export const Input = memo<InputProps>(({
  type = 'text',
  variant = 'outlined',
  size = 'medium',
  clearable = false,
  icon,
  iconPosition = 'start',
  maxLength,
  showCount = false,
  loading = false,
  value,
  onChange,
  helperText,
  error,
  ...props
}) => {
  const { showPassword, togglePassword } = usePasswordToggle();
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  const currentLength = typeof value === 'string' ? value.length : 0;
  const hasLengthError = maxLength ? currentLength > maxLength : false;
  const finalError = error || hasLengthError;

  // Handle clear action
  const handleClear = React.useCallback(() => {
    if (onChange) {
      const event = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  }, [onChange]);

  // Handle input change with max length
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (maxLength && event.target.value.length > maxLength) return;
    onChange?.(event);
  }, [onChange, maxLength]);

  // Start adornment
  const startAdornment = icon && iconPosition === 'start' ? (
    <InputAdornment position="start">
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
        {icon}
      </Box>
    </InputAdornment>
  ) : undefined;

  // End adornment
  const endAdornmentItems = [];

  // Clear button
  if (clearable && value && typeof value === 'string' && value.length > 0) {
    endAdornmentItems.push(
      <IconButton
        key="clear"
        size="small"
        onClick={handleClear}
        edge="end"
        sx={{ mr: 0.5 }}
      >
        <Clear fontSize="small" />
      </IconButton>
    );
  }

  // Password toggle
  if (isPassword) {
    endAdornmentItems.push(
      <IconButton
        key="password-toggle"
        size="small"
        onClick={togglePassword}
        edge="end"
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    );
  }

  // Icon at end
  if (icon && iconPosition === 'end') {
    endAdornmentItems.push(
      <Box key="icon" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mr: 1 }}>
        {icon}
      </Box>
    );
  }

  const endAdornment = endAdornmentItems.length > 0 ? (
    <InputAdornment position="end">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {endAdornmentItems}
      </Box>
    </InputAdornment>
  ) : undefined;

  // Helper text with character counter
  const finalHelperText = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {helperText && (
        <Box component="span" sx={{ flex: 1 }}>
          {helperText}
        </Box>
      )}
      {showCount && maxLength && (
        <CharacterCounter
          current={currentLength}
          max={maxLength}
          error={hasLengthError}
        />
      )}
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <StyledTextField
        type={inputType}
        variant={variant as any}
        size={size as any}
        value={value}
        onChange={handleChange}
        error={finalError}
        clearable={clearable}
        iconPosition={iconPosition}
        loading={loading}
        InputProps={{
          startAdornment,
          endAdornment,
        }}
        {...props}
      />
      {(helperText || (showCount && maxLength)) && (
        <FormHelperText error={finalError} sx={{ mx: 1.75, mt: 0.5 }}>
          {finalHelperText}
        </FormHelperText>
      )}
    </Box>
  );
});

Input.displayName = 'Input';

// Specialized Input Components

// Search Input
export interface SearchInputProps extends Omit<InputProps, 'type' | 'icon'> {
  onSearch?: (value: string) => void;
  searchDelay?: number;
}

export const SearchInput = memo<SearchInputProps>(({
  onSearch,
  searchDelay = 300,
  onChange,
  ...props
}) => {
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onChange?.(event);

    if (onSearch) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(value);
      }, searchDelay);
    }
  }, [onChange, onSearch, searchDelay]);

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Input
      type="text"
      placeholder="Search..."
      icon={<span>🔍</span>}
      iconPosition="start"
      clearable
      onChange={handleChange}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

// Textarea Input
export interface TextareaInputProps extends Omit<InputProps, 'multiline' | 'rows'> {
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
}

export const TextareaInput = memo<TextareaInputProps>(({
  minRows = 3,
  maxRows = 10,
  autoResize = true,
  ...props
}) => (
  <Input
    multiline
    rows={autoResize ? undefined : minRows}
    minRows={autoResize ? minRows : undefined}
    maxRows={autoResize ? maxRows : undefined}
    {...props}
  />
));

TextareaInput.displayName = 'TextareaInput';
