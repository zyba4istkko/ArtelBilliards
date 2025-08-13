import { Box, Card, CardContent, Typography, Button } from '@mui/material'
import Ball from './Ball'
import { 
  cardStyles, 
  iconStyles, 
  popularBadgeStyles, 
  primaryButtonStyles 
} from '../../styles/template-styles'
import { 
  GAME_TYPE_ICONS, 
  GAME_TYPE_NAMES
} from '../../constants/template-constants'
import tokens from '../../styles/design-tokens'
import type { GameTemplate } from '../../api/types'

interface TemplateCardProps {
  template: GameTemplate
  onView: (template: GameTemplate) => void
}

export function TemplateCard({ template, onView }: TemplateCardProps) {
  if (!template) {
    return null
  }

  const getTemplateIcon = (gameType: string) => {
    return GAME_TYPE_ICONS[gameType] || '🎯'
  }

  const getGameTypeName = (gameType: string) => {
    return GAME_TYPE_NAMES[gameType] || gameType
  }

  return (
    <Card sx={cardStyles} onClick={() => onView(template)}>
      {/* Popular Badge */}
      {template.usage_count > 10 && (
        <Box sx={popularBadgeStyles}>
          Популярный
        </Box>
      )}
      
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: '8px',
            borderBottom: `1px solid ${tokens.colors.gray700}`
          }}>
            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
              Стоимость очка:
            </Typography>
            <Typography variant="caption" sx={{ 
              fontWeight: 600,
              color: tokens.colors.mint,
              fontSize: '0.875rem'
            }}>
              {template.rules?.point_value_rubles ? `${template.rules.point_value_rubles}₽` : 'Не указано'}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: '8px',
            borderBottom: `1px solid ${tokens.colors.gray700}`
          }}>
            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
              Игроков:
            </Typography>
            <Typography variant="caption" sx={{ 
              fontWeight: 600,
              color: tokens.colors.mint,
              fontSize: '0.875rem'
            }}>
              {template.rules?.min_players ? `${template.rules.min_players}-${template.rules.max_players}` : 'Не указано'}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: '8px',
            borderBottom: `1px solid ${tokens.colors.gray700}`
          }}>
            <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
              Шаров:
            </Typography>
            <Typography variant="caption" sx={{ 
              fontWeight: 600,
              color: tokens.colors.mint,
              fontSize: '0.875rem'
            }}>
              {template.rules?.balls ? template.rules.balls.length : 'Не указано'}
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pt: 2,
          borderTop: `1px solid ${tokens.colors.gray700}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: tokens.colors.gray400 }}>
              ⭐ {template.rating}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.gray400 }}>
              👥 {template.usage_count}
            </Typography>
          </Box>
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
