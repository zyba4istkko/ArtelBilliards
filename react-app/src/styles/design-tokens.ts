export const colors = {
  // Core brand palette
  coral: '#E27D60',      // secondary/accent
  peach: '#E8A87C',      // highlight
  rosePurple: '#C38D9E', // special
  darkTeal: '#41B3A3',   // primary/cta
  mint: '#85DCCB',       // accent light

  // Neutrals
  black: '#0a0a0a',
  gray900: '#121212',
  gray800: '#1a1a1a',
  gray700: '#2a2a2a',
  gray600: '#333333',
  gray500: '#4f4f4f',
  gray400: '#7a7a7a',
  gray300: '#b0b0b0',
  gray200: '#d9d9d9',
  gray100: '#efefef',
  white: '#ffffff',

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',

  // Extended status for auth
  online: '#22c55e',     // green for online
  offline: '#6b7280',    // gray for offline
  inGame: '#f59e0b',     // orange for "in game"
  away: '#8b5cf6',       // purple for "away"
}

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  }
}

export const spacing = {
  // Base spacing scale
  xs: '0.25rem',      // 4px
  sm: '0.5rem',       // 8px
  md: '1rem',         // 16px
  lg: '1.5rem',       // 24px
  xl: '2rem',         // 32px
  '2xl': '3rem',      // 48px
  '3xl': '4rem',      // 64px
  
  // Specific use cases
  inputPadding: '0.75rem 1rem',
  buttonPadding: '0.75rem 1.5rem',
  cardPadding: '1.5rem',
}

export const borderRadius = {
  none: '0',
  sm: '0.375rem',     // 6px
  md: '0.5rem',       // 8px
  lg: '0.75rem',      // 12px
  xl: '1rem',         // 16px
  '2xl': '1.5rem',    // 24px
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
}

export const transitions = {
  fast: '150ms ease',
  normal: '300ms ease',
  slow: '500ms ease',
  
  // Specific transitions
  button: '150ms ease-in-out',
  modal: '300ms ease-out',
  tooltip: '100ms ease',
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Export default tokens object
const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
}

export default tokens
