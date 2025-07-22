import React, { memo } from 'react';
import {
  Card as MUICard,
  CardProps as MUICardProps,
  CardContent,
  CardActions,
  CardHeader,
  Box,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Extended Card Props
export interface CardProps extends Omit<MUICardProps, 'variant'> {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  interactive?: boolean;
  loading?: boolean;
  headerContent?: React.ReactNode;
  actions?: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

// Styled Card Component
const StyledCard = styled(MUICard, {
  shouldForwardProp: (prop) => !['variant', 'interactive', 'loading'].includes(prop as string),
})<CardProps>(({ theme, variant, interactive }) => ({
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',

  // Variant styles
  ...(variant === 'default' && {
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  }),

  ...(variant === 'outlined' && {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    boxShadow: 'none',
  }),

  ...(variant === 'elevated' && {
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  }),

  ...(variant === 'glass' && {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  }),

  // Interactive styles
  ...(interactive && {
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: variant === 'elevated' 
        ? '0 8px 25px rgba(0, 0, 0, 0.2)' 
        : '0 4px 20px rgba(0, 0, 0, 0.15)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }),
}));

// Loading Skeleton
const CardSkeleton: React.FC<{ 
  hasHeader?: boolean; 
  hasActions?: boolean; 
  contentLines?: number;
}> = memo(({ 
  hasHeader = false, 
  hasActions = false, 
  contentLines = 3 
}) => (
  <Box>
    {hasHeader && (
      <Box sx={{ p: 2, pb: 0 }}>
        <Skeleton variant="text" width="60%" height={32} />
      </Box>
    )}
    <Box sx={{ p: 2 }}>
      {Array.from({ length: contentLines }, (_, index) => (
        <Skeleton 
          key={index}
          variant="text" 
          width={index === contentLines - 1 ? '40%' : '100%'} 
          height={20}
          sx={{ mb: 1 }}
        />
      ))}
    </Box>
    {hasActions && (
      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      </Box>
    )}
  </Box>
));

CardSkeleton.displayName = 'CardSkeleton';

// Main Card Component
export const Card = memo<CardProps>(({
  children,
  variant = 'default',
  interactive = false,
  loading = false,
  headerContent,
  actions,
  padding = 'medium',
  onClick,
  ...props
}) => {
  const theme = useTheme();

  // Padding map
  const paddingMap = {
    none: 0,
    small: 1,
    medium: 2,
    large: 3,
  };

  const cardPadding = paddingMap[padding];

  // Loading state
  if (loading) {
    return (
      <StyledCard variant={variant} {...props}>
        <CardSkeleton 
          hasHeader={!!headerContent}
          hasActions={!!actions}
          contentLines={3}
        />
      </StyledCard>
    );
  }

  return (
    <StyledCard
      variant={variant}
      interactive={interactive}
      onClick={interactive ? onClick : undefined}
      {...props}
    >
      {headerContent && (
        <CardHeader
          sx={{
            pb: padding === 'none' ? 0 : 1,
            px: cardPadding,
            pt: cardPadding,
          }}
        >
          {headerContent}
        </CardHeader>
      )}
      
      <CardContent
        sx={{
          p: cardPadding,
          '&:last-child': {
            pb: actions ? 1 : cardPadding,
          },
        }}
      >
        {children}
      </CardContent>
      
      {actions && (
        <CardActions
          sx={{
            px: cardPadding,
            pb: cardPadding,
            pt: 0,
          }}
        >
          {actions}
        </CardActions>
      )}
    </StyledCard>
  );
});

Card.displayName = 'Card';

// Specialized Card Components

// Content Card
export interface ContentCardProps extends CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const ContentCard = memo<ContentCardProps>(({
  title,
  subtitle,
  icon,
  children,
  ...props
}) => {
  const headerContent = (title || subtitle || icon) ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {icon && (
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
          {icon}
        </Box>
      )}
      <Box>
        {title && (
          <Box component="h3" sx={{ 
            m: 0, 
            fontSize: '1.125rem', 
            fontWeight: 600,
            color: 'text.primary'
          }}>
            {title}
          </Box>
        )}
        {subtitle && (
          <Box component="p" sx={{ 
            m: 0,
            fontSize: '0.875rem',
            color: 'text.secondary',
            mt: title ? 0.5 : 0
          }}>
            {subtitle}
          </Box>
        )}
      </Box>
    </Box>
  ) : undefined;

  return (
    <Card headerContent={headerContent} {...props}>
      {children}
    </Card>
  );
});

ContentCard.displayName = 'ContentCard';

// Action Card
export interface ActionCardProps extends CardProps {
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export const ActionCard = memo<ActionCardProps>(({
  primaryAction,
  secondaryAction,
  children,
  ...props
}) => {
  const actions = (primaryAction || secondaryAction) ? (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      {secondaryAction}
      {primaryAction}
    </Box>
  ) : undefined;

  return (
    <Card actions={actions} {...props}>
      {children}
    </Card>
  );
});

ActionCard.displayName = 'ActionCard';
