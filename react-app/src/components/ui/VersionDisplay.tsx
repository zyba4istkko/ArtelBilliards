import { Box, Typography, Chip } from '@mui/material'
import tokens from '../../styles/design-tokens'

interface VersionDisplayProps {
  version?: string
  buildDate?: string
  className?: string
}

export function VersionDisplay({ 
  version, 
  buildDate,
  className 
}: VersionDisplayProps) {
  
  // DEBUG: Логи для отладки
  console.log('🔍 VersionDisplay DEBUG:', {
    version,
    buildDate,
    className,
    isRendering: true
  })
  
  // Проверяем наличие данных
  if (!version || !buildDate) {
    console.warn('⚠️ VersionDisplay: Missing version or buildDate props')
    return null
  }

  const formatBuildDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Неизвестно'
    }
  }

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) return 'Только что'
      if (diffMins < 60) return `${diffMins} мин назад`
      if (diffHours < 24) return `${diffHours} ч назад`
      return `${diffDays} дн назад`
    } catch {
      return 'Неизвестно'
    }
  }

  return (
    <Box 
      className={className}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        fontSize: '0.75rem'
      }}
    >
      {/* Version */}
      <Chip
        label={`v${version}`}
        size="small"
        sx={{
          bgcolor: tokens.colors.mint,
          color: tokens.colors.black,
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 20
        }}
      />
      
      {/* Build Date */}
      <Typography 
        variant="caption" 
        sx={{ 
          color: tokens.colors.gray400,
          fontSize: '0.7rem',
          whiteSpace: 'nowrap'
        }}
      >
        Сборка: {formatBuildDate(buildDate)}
      </Typography>
      
      {/* Time Ago */}
      <Typography 
        variant="caption" 
        sx={{ 
          color: tokens.colors.gray500,
          fontSize: '0.65rem',
          whiteSpace: 'nowrap'
        }}
      >
        ({getTimeAgo(buildDate)})
      </Typography>
    </Box>
  )
}
