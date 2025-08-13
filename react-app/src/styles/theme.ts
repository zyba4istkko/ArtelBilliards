import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import tokens from './design-tokens'

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary']
    quaternary: Palette['primary']
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary']
    quaternary?: PaletteOptions['primary']
  }
}

export function buildTheme(): ReturnType<typeof createTheme> {
  const t = tokens
  
  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'dark',
      primary: { 
        main: t.colors.darkTeal,
        contrastText: t.colors.white,
      },
      secondary: { 
        main: t.colors.coral,
        contrastText: t.colors.white,
      },
      tertiary: { 
        main: t.colors.peach,
        contrastText: t.colors.white,
      },
      quaternary: { 
        main: t.colors.rosePurple,
        contrastText: t.colors.white,
      },
      
      // Status colors
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
      
      divider: t.colors.gray700,
    },
    
    typography: {
      fontFamily: t.typography.fontFamily,
      h1: {
        fontSize: t.typography.fontSize['4xl'],
        fontWeight: t.typography.fontWeight.bold,
        lineHeight: t.typography.lineHeight.tight,
      },
      h2: {
        fontSize: t.typography.fontSize['3xl'],
        fontWeight: t.typography.fontWeight.bold,
        lineHeight: t.typography.lineHeight.tight,
      },
      h3: {
        fontSize: t.typography.fontSize['2xl'],
        fontWeight: t.typography.fontWeight.semibold,
        lineHeight: t.typography.lineHeight.normal,
      },
      h4: {
        fontSize: t.typography.fontSize.xl,
        fontWeight: t.typography.fontWeight.semibold,
        lineHeight: t.typography.lineHeight.normal,
      },
      h5: {
        fontSize: t.typography.fontSize.lg,
        fontWeight: t.typography.fontWeight.medium,
        lineHeight: t.typography.lineHeight.normal,
      },
      h6: {
        fontSize: t.typography.fontSize.base,
        fontWeight: t.typography.fontWeight.medium,
        lineHeight: t.typography.lineHeight.normal,
      },
      body1: {
        fontSize: t.typography.fontSize.base,
        fontWeight: t.typography.fontWeight.normal,
        lineHeight: t.typography.lineHeight.normal,
      },
      body2: {
        fontSize: t.typography.fontSize.sm,
        fontWeight: t.typography.fontWeight.normal,
        lineHeight: t.typography.lineHeight.normal,
      },
      button: {
        fontSize: t.typography.fontSize.sm,
        fontWeight: t.typography.fontWeight.medium,
        textTransform: 'none',
      },
      caption: {
        fontSize: t.typography.fontSize.xs,
        fontWeight: t.typography.fontWeight.normal,
        lineHeight: t.typography.lineHeight.normal,
      },
    },
    
    shape: {
      borderRadius: parseInt(t.borderRadius.lg.replace('rem', '')) * 16, // Convert rem to px
    },
    
    spacing: 8, // Base spacing unit (8px)
    
    components: {
      // Card component styling
      MuiCard: {
        styleOverrides: {
          root: {
            background: t.colors.gray800,
            border: `1px solid ${t.colors.gray700}`,
            borderRadius: t.borderRadius.xl,
            boxShadow: t.shadows.lg,
            transition: t.transitions.normal,
            '&:hover': {
              boxShadow: t.shadows.xl,
            },
          },
        },
      },
      
      // Button component styling
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: t.borderRadius.lg,
            padding: t.spacing.buttonPadding,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.medium,
            textTransform: 'none',
            transition: t.transitions.button,
            minHeight: '44px', // Touch-friendly height
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${t.colors.darkTeal} 0%, ${t.colors.mint} 100%)`,
            boxShadow: t.shadows.md,
            '&:hover': {
              background: `linear-gradient(135deg, ${t.colors.mint} 0%, ${t.colors.darkTeal} 100%)`,
              boxShadow: t.shadows.lg,
            },
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${t.colors.coral} 0%, ${t.colors.peach} 100%)`,
            boxShadow: t.shadows.md,
            '&:hover': {
              background: `linear-gradient(135deg, ${t.colors.peach} 0%, ${t.colors.coral} 100%)`,
              boxShadow: t.shadows.lg,
            },
          },
          outlined: {
            borderColor: t.colors.gray600,
            color: t.colors.white,
            '&:hover': {
              borderColor: t.colors.darkTeal,
              backgroundColor: `${t.colors.darkTeal}10`,
            },
          },
        },
      },
      
      // TextField component styling
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: t.borderRadius.lg,
              backgroundColor: t.colors.gray700,
              
              '& fieldset': {
                borderColor: t.colors.gray600,
              },
              '&:hover fieldset': {
                borderColor: t.colors.gray500,
              },
              '&.Mui-focused fieldset': {
                borderColor: t.colors.darkTeal,
              },
            },
            
            '& .MuiInputLabel-root': {
              color: t.colors.gray300,
              '&.Mui-focused': {
                color: t.colors.darkTeal,
              },
            },
            
            '& .MuiInputBase-input': {
              color: t.colors.white,
              padding: t.spacing.inputPadding,
            },
          },
        },
      },
      
      // Chip component styling
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: t.borderRadius.full,
            fontWeight: t.typography.fontWeight.medium,
          },
          colorPrimary: {
            backgroundColor: t.colors.darkTeal,
            color: t.colors.white,
          },
          colorSecondary: {
            backgroundColor: t.colors.coral,
            color: t.colors.white,
          },
        },
      },
      
      // Avatar component styling
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: t.colors.darkTeal,
            color: t.colors.white,
            fontWeight: t.typography.fontWeight.semibold,
          },
        },
      },
      
      // Paper component styling
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: t.colors.gray800,
            borderRadius: t.borderRadius.xl,
          },
        },
      },
      
      // Dialog component styling
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: t.colors.gray800,
            borderRadius: t.borderRadius.xl,
            border: `1px solid ${t.colors.gray700}`,
          },
        },
      },
      
      // AppBar component styling
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: t.colors.gray900,
            borderBottom: `1px solid ${t.colors.gray700}`,
            boxShadow: t.shadows.sm,
          },
        },
      },
    },
  }
  
  return createTheme(themeOptions)
}

export default buildTheme
