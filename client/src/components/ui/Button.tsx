import React, { memo, forwardRef } from 'react';
import {
  Button as MUIButton,
  ButtonProps as MUIButtonProps,
  IconButton as MUIIconButton,
  IconButtonProps as MUIIconButtonProps,
  CircularProgress,
  Box,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Extended Button Props
export interface ButtonProps extends Omit<MUIButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
}

// Styled Button Component
const StyledButton = styled(MUIButton, {
  shouldForwardProp: (prop) => !['loading', 'iconPosition'].includes(prop as string),
})<ButtonProps>(({ theme, variant, size, loading }) => ({
  position: 'relative',
  borderRadius: theme.spacing(1),
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Size variants
  ...(size === 'small' && {
    minHeight: 32,
    fontSize: '0.875rem',
    padding: theme.spacing(0.5, 1.5),
  }),
  ...(size === 'medium' && {
    minHeight: 40,
    fontSize: '0.9375rem',
    padding: theme.spacing(1, 2),
  }),
  ...(size === 'large' && {
    minHeight: 48,
    fontSize: '1rem',
    padding: theme.spacing(1.5, 3),
  }),

  // Color variants
  ...(variant === 'primary' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.4)}`,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }),

  ...(variant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    boxShadow: `0 1px 3px ${alpha(theme.palette.secondary.main, 0.3)}`,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
      boxShadow: `0 2px 6px ${alpha(theme.palette.secondary.main, 0.4)}`,
      transform: 'translateY(-1px)',
    },
  }),

  ...(variant === 'outline' && {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
      borderColor: theme.palette.primary.main,
      boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  }),

  ...(variant === 'ghost' && {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    border: 'none',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  }),

  ...(variant === 'text' && {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    border: 'none',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  }),

  // Loading state
  ...(loading && {
    pointerEvents: 'none',
    '& .button-content': {
      opacity: 0.7,
    },
  }),

  // Disabled state
  '&:disabled': {
    opacity: 0.6,
    transform: 'none',
    boxShadow: 'none',
  },
}));

// Loading Spinner
const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'inherit',
}));

// Main Button Component
export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'start',
  disabled,
  onClick,
  ...props
}, ref) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    onClick?.(event);
  };

  const spinnerSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  const buttonContent = (
    <Box
      className="button-content"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: icon ? 1 : 0,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {icon && iconPosition === 'start' && (
        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
      )}
      
      <Box component="span">
        {loading && loadingText ? loadingText : children}
      </Box>
      
      {icon && iconPosition === 'end' && (
        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
      )}
    </Box>
  );

  return (
    <StyledButton
      ref={ref}
      variant={variant as any} // Type assertion for custom variants
      size={size}
      loading={loading}
      disabled={disabled || loading}
      onClick={handleClick}
      iconPosition={iconPosition}
      {...props}
    >
      {buttonContent}
      {loading && (
        <LoadingSpinner size={spinnerSize} thickness={4} />
      )}
    </StyledButton>
  );
}));

Button.displayName = 'Button';

// Icon Button Wrapper
export interface IconButtonProps extends Omit<MUIIconButtonProps, 'size'> {
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
}

const StyledIconButton = styled(MUIIconButton, {
  shouldForwardProp: (prop) => prop !== 'loading' && prop !== 'variant',
})<IconButtonProps>(({ theme, size, variant, loading }) => ({
  position: 'relative',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Size variants
  ...(size === 'small' && {
    width: 32,
    height: 32,
    padding: theme.spacing(0.5),
  }),
  ...(size === 'medium' && {
    width: 40,
    height: 40,
    padding: theme.spacing(1),
  }),
  ...(size === 'large' && {
    width: 48,
    height: 48,
    padding: theme.spacing(1.5),
  }),

  // Variant styles
  ...(variant === 'primary' && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
    },
  }),

  ...(variant === 'secondary' && {
    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
    color: theme.palette.secondary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.secondary.main, 0.2),
    },
  }),

  // Loading state
  ...(loading && {
    pointerEvents: 'none',
    '& .icon-content': {
      opacity: 0,
    },
  }),

  '&:hover': {
    transform: 'scale(1.05)',
  },

  '&:active': {
    transform: 'scale(0.95)',
  },

  '&:disabled': {
    transform: 'none',
    opacity: 0.6,
  },
}));

export const IconButton = memo(forwardRef<HTMLButtonElement, IconButtonProps>(({
  children,
  size = 'medium',
  loading = false,
  variant = 'default',
  disabled,
  onClick,
  ...props
}, ref) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    onClick?.(event);
  };

  const spinnerSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

  return (
    <StyledIconButton
      ref={ref}
      size={size}
      loading={loading}
      variant={variant}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      <Box
        className="icon-content"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
      {loading && (
        <LoadingSpinner
          size={spinnerSize}
          thickness={4}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </StyledIconButton>
  );
}));

IconButton.displayName = 'IconButton';
