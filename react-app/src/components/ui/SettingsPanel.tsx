import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import tokens from '../../styles/design-tokens'

interface SettingsPanelProps {
  // Старый интерфейс для совместимости
  settings?: Record<string, string>
  title?: string
  // Новый интерфейс
  template?: any
  readOnly?: boolean
}

export function SettingsPanel({ 
  settings: oldSettings, 
  title, 
  template, 
  readOnly = false 
}: SettingsPanelProps) {
  let settings: Record<string, any> = {}
  let displayTitle = title

  // Определяем источник данных
  if (template && template.settings) {
    // Новый интерфейс - берем из template.settings
    settings = template.settings
    displayTitle = displayTitle || 'Настройки игры'
  } else if (oldSettings && Object.keys(oldSettings).length > 0) {
    // Старый интерфейс - используем переданные settings
    settings = oldSettings
    displayTitle = displayTitle || 'Настройки'
  } else {
    // Нет данных
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" sx={{ color: tokens.colors.gray400 }}>
          Настройки не найдены
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {displayTitle && (
        <Typography variant="h6" sx={{ 
          color: tokens.colors.white, 
          fontWeight: 600, 
          mb: 3 
        }}>
          {displayTitle}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Object.entries(settings).map(([key, value]) => (
          <Box 
            key={key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: tokens.colors.gray700,
              p: 2,
              borderRadius: 1,
              border: `1px solid ${tokens.colors.gray600}`
            }}
          >
            <Typography variant="body1" sx={{ 
              color: tokens.colors.white,
              fontWeight: 500
            }}>
              {key}
            </Typography>
            
            <Chip 
              label={String(value)} 
              sx={{ 
                bgcolor: tokens.colors.mint,
                color: tokens.colors.black,
                fontWeight: 500
              }} 
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
