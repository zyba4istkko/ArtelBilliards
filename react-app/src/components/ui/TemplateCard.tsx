import { Box, Card, CardContent, Typography, Button } from '@mui/material'
import { 
  cardStyles, 
  iconStyles, 
  primaryButtonStyles 
} from '../../styles/template-styles'
import { 
  GAME_TYPE_ICONS, 
  GAME_TYPE_NAMES
} from '../../constants/template-constants'
import tokens from '../../styles/design-tokens'
import type { GameTemplate } from '../../api/types'
import { getTemplateDetails } from '../../utils/template-utils'

interface TemplateCardProps {
  template: GameTemplate
  onView: (template: GameTemplate) => void
}

export function TemplateCard({ template, onView }: TemplateCardProps) {
  console.log('🚀 TemplateCard вызван для:', template?.name)
  
  if (!template) {
    return null
  }

  const getTemplateIcon = (gameType: string) => {
    return GAME_TYPE_ICONS[gameType] || '🎯'
  }

  const getGameTypeName = (gameType: string) => {
    return GAME_TYPE_NAMES[gameType] || gameType
  }

  // Получаем детали шаблона через нашу функцию
  const templateDetails = getTemplateDetails(template)
  
  // Отладочный лог
  console.log('🔍 TemplateCard debug:', {
    templateName: template.name,
    gameType: template.game_type,
    templateDetails,
    settings: templateDetails.settings,
    scoring: templateDetails.scoring
  })

  return (
    <Card sx={cardStyles} onClick={() => onView(template)}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* Icon */}
        <Box sx={iconStyles}>
          {getTemplateIcon(template.game_type)}
        </Box>

        {/* Title */}
        <Typography variant="h6" component="h3" sx={{ 
          fontSize: '1.5rem',
          fontWeight: 700, 
          mb: 1,
          color: tokens.colors.white
        }}>
          {template.name}
        </Typography>

        {/* Description */}
        <Typography variant="body2" color={tokens.colors.gray300} sx={{ 
          mb: 3, 
          minHeight: '3em',
          lineHeight: 1.6
        }}>
          {template.description}
        </Typography>

        {/* Settings Preview */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: '8px',
            borderBottom: `1px solid ${tokens.colors.gray700}`
          }}>
            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
              Тип игры:
            </Typography>
            <Typography variant="caption" sx={{ 
              fontWeight: 600,
              color: tokens.colors.mint,
              fontSize: '0.875rem'
            }}>
              {getGameTypeName(template.game_type)}
            </Typography>
          </Box>
          
          {/* Динамически отображаем поля в зависимости от типа игры */}
          {Object.entries(templateDetails.settings).slice(0, 2).map(([key, value]) => (
            <Box key={key} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: '8px',
              borderBottom: `1px solid ${tokens.colors.gray700}`
            }}>
              <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
                {key}:
              </Typography>
              <Typography variant="caption" sx={{ 
                fontWeight: 600,
                color: tokens.colors.mint,
                fontSize: '0.875rem'
              }}>
                {value}
              </Typography>
            </Box>
          ))}

          {/* Отображаем стоимость (очка или партии) */}
          {Object.entries(templateDetails.scoring).slice(0, 1).map(([key, value]) => (
            <Box key={key} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: '8px',
              borderBottom: `1px solid ${tokens.colors.gray700}`
            }}>
              <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
                {key}:
              </Typography>
              <Typography variant="caption" sx={{ 
                fontWeight: 600,
                color: tokens.colors.mint,
                fontSize: '0.875rem'
              }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Template Type */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          pt: 2,
          borderTop: `1px solid ${tokens.colors.gray700}`
        }}>
          <Typography variant="caption" sx={{ 
            color: tokens.colors.mint,
            fontWeight: 600
          }}>
            {template.is_system ? 'Системный' : 'Пользовательский'}
          </Typography>
        </Box>

        {/* Action Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation()
            onView(template)
          }}
          sx={primaryButtonStyles}
        >
          Посмотреть шаблон
        </Button>
      </CardContent>
    </Card>
  )
}
