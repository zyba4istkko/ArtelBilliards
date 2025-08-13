import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import tokens from './design-tokens'

export function buildTheme(): ReturnType<typeof createTheme> {
  const t = tokens
  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'dark',
      primary: { main: t.colors.darkTeal, contrastText: t.colors.white },
      secondary: { main: t.colors.coral, contrastText: t.colors.white },
      success: { main: t.colors.success },
      warning: { main: t.colors.warning },
      error: { main: t.colors.error },
      info: { main: t.colors.info },
      background: {
        default: t.colors.black,
        paper: t.colors.gray800,
      },
      text: {
        primary: t.colors.white,
        secondary: t.colors.gray300,
      },
    },
    typography: {
      fontFamily: t.typography.fontFamily,
      h1: { fontSize: t.typography.h1.size, fontWeight: t.typography.h1.weight, lineHeight: `${t.typography.h1.lineHeight / t.typography.h1.size}` },
      h2: { fontSize: t.typography.h2.size, fontWeight: t.typography.h2.weight, lineHeight: `${t.typography.h2.lineHeight / t.typography.h2.size}` },
      h3: { fontSize: t.typography.h3.size, fontWeight: t.typography.h3.weight, lineHeight: `${t.typography.h3.lineHeight / t.typography.h3.size}` },
      h4: { fontSize: t.typography.h4.size, fontWeight: t.typography.h4.weight, lineHeight: `${t.typography.h4.lineHeight / t.typography.h4.size}` },
      body1: { fontSize: t.typography.body.size },
      body2: { fontSize: t.typography.small.size },
    },
    shape: {
      borderRadius: t.radii.md,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: t.colors.gray800,
            border: `1px solid ${t.colors.gray600}`,
            borderRadius: t.radii.lg,
            boxShadow: t.shadows.md,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: t.radii.pill,
            textTransform: 'none',
            fontWeight: 700,
            paddingInline: t.spacing.xl,
            paddingBlock: t.spacing.md,
            transition: `all ${t.transitions.normal}`,
          },
          containedPrimary: {
            boxShadow: t.shadows.glowMint,
            ':hover': { boxShadow: t.shadows.glowCoral },
          },
          outlined: {
            borderWidth: 2,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: t.radii.pill },
        },
      },
    },
  }

  return createTheme(themeOptions)
}

export default buildTheme
