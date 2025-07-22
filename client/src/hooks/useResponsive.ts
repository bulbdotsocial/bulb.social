import { useState, useEffect, useMemo } from 'react';
import { useTheme, useMediaQuery, Breakpoint } from '@mui/material';
import type { BreakpointValue } from '../types/components';

// Custom breakpoint values
const CUSTOM_BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
  mobile: 600,
  tablet: 900,
  desktop: 1200,
  wide: 1536,
} as const;

export type CustomBreakpoint = keyof typeof CUSTOM_BREAKPOINTS;

// Hook for responsive values
export function useResponsiveValue<T>(values: BreakpointValue<T>): T {
  const theme = useTheme();
  
  // Create media queries for each breakpoint
  const breakpoints = useMemo(() => ({
    xl: useMediaQuery(theme.breakpoints.up('xl')),
    lg: useMediaQuery(theme.breakpoints.up('lg')),
    md: useMediaQuery(theme.breakpoints.up('md')),
    sm: useMediaQuery(theme.breakpoints.up('sm')),
    xs: true, // xs is always true as it's the smallest
  }), [theme]);

  // Find the appropriate value based on current breakpoint
  return useMemo(() => {
    if (typeof values !== 'object' || values === null) {
      return values as T;
    }

    // Check breakpoints from largest to smallest
    const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs'];
    
    for (const bp of breakpointOrder) {
      if (breakpoints[bp] && values[bp] !== undefined) {
        return values[bp] as T;
      }
    }

    // Fallback to xs or first available value
    return (values.xs ?? Object.values(values)[0]) as T;
  }, [values, breakpoints]);
}

// Hook for current breakpoint detection
export function useBreakpoint() {
  const theme = useTheme();
  
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  const isUpSm = useMediaQuery(theme.breakpoints.up('sm'));
  const isUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const isUpLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isUpXl = useMediaQuery(theme.breakpoints.up('xl'));

  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const isDownLg = useMediaQuery(theme.breakpoints.down('lg'));
  const isDownXl = useMediaQuery(theme.breakpoints.down('xl'));

  // Determine current breakpoint
  const current = useMemo(() => {
    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    if (isSm) return 'sm';
    return 'xs';
  }, [isXl, isLg, isMd, isSm]);

  // Device type helpers
  const isMobile = isDownSm;
  const isTablet = isSm || isMd;
  const isDesktop = isUpLg;

  return {
    // Current breakpoint
    current,
    
    // Exact breakpoint matches
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Up breakpoints (>=)
    isUpSm,
    isUpMd,
    isUpLg,
    isUpXl,
    
    // Down breakpoints (<)
    isDownSm,
    isDownMd,
    isDownLg,
    isDownXl,
    
    // Device types
    isMobile,
    isTablet,
    isDesktop,
  } as const;
}

// Hook for window dimensions
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Hook for responsive grid columns
export function useResponsiveGrid(baseColumns: number = 12) {
  const breakpoint = useBreakpoint();
  
  return useMemo(() => {
    const columns = {
      xs: Math.min(baseColumns, 1),
      sm: Math.min(baseColumns, 2),
      md: Math.min(baseColumns, 3),
      lg: Math.min(baseColumns, 4),
      xl: Math.min(baseColumns, 6),
    };

    return {
      columns: columns[breakpoint.current as keyof typeof columns],
      spacing: breakpoint.isMobile ? 1 : breakpoint.isTablet ? 2 : 3,
    };
  }, [baseColumns, breakpoint]);
}

// Hook for responsive typography
export function useResponsiveTypography() {
  const breakpoint = useBreakpoint();
  
  return useMemo(() => ({
    h1: breakpoint.isMobile ? 'h4' : breakpoint.isTablet ? 'h3' : 'h1',
    h2: breakpoint.isMobile ? 'h5' : breakpoint.isTablet ? 'h4' : 'h2',
    h3: breakpoint.isMobile ? 'h6' : breakpoint.isTablet ? 'h5' : 'h3',
    h4: breakpoint.isMobile ? 'subtitle1' : breakpoint.isTablet ? 'h6' : 'h4',
    body1: breakpoint.isMobile ? 'body2' : 'body1',
  }), [breakpoint]);
}

// Hook for responsive spacing
export function useResponsiveSpacing() {
  const breakpoint = useBreakpoint();
  
  return useMemo(() => ({
    section: breakpoint.isMobile ? 2 : breakpoint.isTablet ? 3 : 4,
    container: breakpoint.isMobile ? 1 : breakpoint.isTablet ? 2 : 3,
    component: breakpoint.isMobile ? 1 : 2,
    element: breakpoint.isMobile ? 0.5 : 1,
  }), [breakpoint]);
}

// Custom hook for responsive layout
export function useResponsiveLayout() {
  const breakpoint = useBreakpoint();
  const spacing = useResponsiveSpacing();
  const typography = useResponsiveTypography();
  
  return {
    ...breakpoint,
    spacing,
    typography,
    sidebar: {
      width: breakpoint.isMobile ? '100%' : breakpoint.isTablet ? 280 : 320,
      variant: breakpoint.isMobile ? 'temporary' : 'persistent',
    },
    header: {
      height: breakpoint.isMobile ? 56 : 64,
    },
    content: {
      padding: spacing.container,
      maxWidth: breakpoint.isDesktop ? 1200 : '100%',
    },
  };
}
