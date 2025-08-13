// Colors derived from the agreed palette and neutrals
export const colors = {
  // Core brand palette
  coral: '#E27D60', // secondary/accent
  peach: '#E8A87C', // highlight
  rosePurple: '#C38D9E', // special
  darkTeal: '#41B3A3', // primary/cta
  mint: '#85DCCB', // approximation of #85DCB (corrected to valid hex)

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
}

export const typography = {
  fontFamily: `'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'`,
  h1: { size: 48, lineHeight: 56, weight: 800 },
  h2: { size: 32, lineHeight: 40, weight: 800 },
  h3: { size: 24, lineHeight: 32, weight: 700 },
  h4: { size: 20, lineHeight: 28, weight: 700 },
  body: { size: 16, lineHeight: 24, weight: 400 },
  small: { size: 14, lineHeight: 20, weight: 400 },
  tiny: { size: 12, lineHeight: 16, weight: 400 },
}

export const spacing = {
  unit: 8,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
}

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
}

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.08)',
  md: '0 6px 16px rgba(0,0,0,0.16)',
  lg: '0 12px 28px rgba(0,0,0,0.22)',
  glowMint: `0 10px 20px rgba(133, 220, 203, 0.25)`,
  glowCoral: `0 10px 20px rgba(226, 125, 96, 0.25)`,
}

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '400ms ease-in-out',
}

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

export interface DesignTokens {
  colors: typeof colors
  typography: typeof typography
  spacing: typeof spacing
  radii: typeof radii
  shadows: typeof shadows
  transitions: typeof transitions
  breakpoints: typeof breakpoints
}

export const tokens: DesignTokens = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  transitions,
  breakpoints,
}

export default tokens
