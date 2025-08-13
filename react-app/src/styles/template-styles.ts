import tokens from './design-tokens'

// Стили для карточек шаблонов
export const cardStyles = {
  background: tokens.colors.gray800,
  border: `1px solid ${tokens.colors.gray600}`,
  borderRadius: '18px',
  padding: 3,
  transition: 'all 0.25s ease-in-out',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: tokens.colors.mint,
    boxShadow: '0 10px 20px rgba(133, 220, 203, 0.25)',
    transform: 'translateY(-4px)'
  }
}

// Стили для модальных окон
export const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 },
  maxHeight: '90vh',
  overflow: 'auto',
  background: tokens.colors.gray800,
  borderRadius: '18px',
  border: `1px solid ${tokens.colors.gray600}`,
  p: 4,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
}

// Стили для больших модальных окон
export const largeModalStyles = {
  ...modalStyles,
  width: { xs: '90%', sm: 700 }
}

// Стили для кнопок
export const primaryButtonStyles = {
  background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.darkTeal})`,
  color: tokens.colors.black,
  border: 'none',
  padding: '12px 24px',
  borderRadius: '14px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.16)'
  }
}

export const secondaryButtonStyles = {
  background: tokens.colors.gray600,
  color: tokens.colors.white,
  border: 'none',
  '&:hover': {
    background: tokens.colors.gray500
  }
}

export const coralButtonStyles = {
  background: `linear-gradient(135deg, ${tokens.colors.coral}, ${tokens.colors.peach})`,
  color: tokens.colors.white,
  border: 'none',
  padding: '12px 32px',
  borderRadius: '14px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.16)'
  }
}

// Стили для иконок
export const iconStyles = {
  width: 60,
  height: 60,
  background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.darkTeal})`,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.8rem',
  mb: 2
}

export const largeIconStyles = {
  ...iconStyles,
  width: 80,
  height: 80,
  fontSize: '2.5rem',
  mb: 3
}

// Стили для заголовков
export const headerStyles = {
  fontSize: '2.5rem',
  fontWeight: 700,
  mb: 2,
  background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.coral})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}

// Стили для блоков настроек
export const settingBlockStyles = {
  background: tokens.colors.gray700,
  borderRadius: '14px',
  p: 2
}

// Стили для значков
export const valueBadgeStyles = {
  color: tokens.colors.mint,
  fontWeight: 600,
  padding: '8px 12px',
  background: tokens.colors.gray600,
  borderRadius: '999px',
  display: 'inline-block',
  fontSize: '0.875rem'
}

// Стили для карточки создания
export const createCardStyles = {
  border: `2px dashed ${tokens.colors.gray600}`,
  background: tokens.colors.gray900,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  minHeight: 320,
  borderRadius: '18px',
  padding: 3,
  transition: 'all 0.25s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    borderColor: tokens.colors.coral,
    background: tokens.colors.gray800,
    boxShadow: '0 10px 20px rgba(226, 125, 96, 0.25)',
    transform: 'translateY(-4px)'
  }
}
