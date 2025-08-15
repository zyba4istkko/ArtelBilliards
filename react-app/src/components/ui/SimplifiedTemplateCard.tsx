import { Box, Card, CardContent, Typography, Chip } from '@mui/material'
import { 
  GAME_TYPE_ICONS, 
  GAME_TYPE_NAMES 
} from '../../constants/template-constants'
import tokens from '../../styles/design-tokens'
import type { GameTemplate } from '../../api/types'
import { getTemplateDetails } from '../../utils/template-utils'

interface SimplifiedTemplateCardProps {
  template: GameTemplate
  isSelected: boolean
  onSelect: (template: GameTemplate) => void
  disabled?: boolean
}

export function SimplifiedTemplateCard({ 
  template, 
  isSelected, 
  onSelect,
  disabled = false
}: SimplifiedTemplateCardProps) {
  
  const getTemplateIcon = (gameType: string) => {
    return GAME_TYPE_ICONS[gameType] || '🎯'
  }

  const getGameTypeName = (gameType: string) => {
    return GAME_TYPE_NAMES[gameType] || gameType
  }

  // Получаем детали шаблона для отображения
  const templateDetails = getTemplateDetails(template)

  // Получаем стоимость для отображения
  const getCostDisplay = () => {
    const { scoring } = templateDetails
    if (template.game_type === 'kolkhoz') {
      return scoring['Стоимость очка'] || 'Не указано'
    } else {
      return scoring['Стоимость партии'] || 'Не указано'
    }
  }

  // Получаем алгоритм очереди
  const getQueueAlgorithm = () => {
    const { settings } = templateDetails
    return settings['Алгоритм очереди'] || 'Не указано'
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        border: `2px solid ${isSelected ? tokens.colors.mint : tokens.colors.gray600}`,
        bgcolor: isSelected ? 'rgba(133, 220, 203, 0.1)' : tokens.colors.gray700,
        opacity: disabled ? 0.6 : 1,
        '&:hover': {
          transform: disabled ? 'none' : 'translateY(-4px)',
          boxShadow: disabled ? 'none' : (isSelected 
            ? '0 10px 20px rgba(133, 220, 203, 0.25)'
            : '0 6px 16px rgba(0,0,0,0.16)'),
          borderColor: disabled ? tokens.colors.gray600 : tokens.colors.mint
        }
      }}
      onClick={() => !disabled && onSelect(template)}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with Icon and Type */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 2 
        }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.darkTeal})`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            {getTemplateIcon(template.game_type)}
          </Box>
          
          <Box>
            <Typography variant="h6" component="h3" sx={{ 
              fontWeight: 700, 
              color: tokens.colors.white,
              mb: 0.5
            }}>
              {template.name}
            </Typography>
            <Chip 
              label={getGameTypeName(template.game_type)}
              size="small"
              sx={{
                bgcolor: tokens.colors.mint,
                color: tokens.colors.black,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body2" sx={{ 
          color: tokens.colors.gray300, 
          mb: 3,
          flex: 1,
          lineHeight: 1.5
        }}>
          {template.description}
        </Typography>

        {/* Key Information - Only 4 fields */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1.5 
        }}>
          {/* Algorithm */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 1,
            borderBottom: `1px solid ${tokens.colors.gray600}`
          }}>
            <Typography variant="caption" sx={{ 
              color: tokens.colors.gray300,
              fontSize: '0.8rem'
            }}>
              Алгоритм очереди:
            </Typography>
            <Typography variant="caption" sx={{ 
              fontWeight: 600,
              color: tokens.colors.mint,
              fontSize: '0.8rem'
            }}>
              {getQueueAlgorithm()}
            </Typography>
          </Box>

          {/* Cost */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 1
          }}>
            <Typography variant="caption" sx={{ 
              color: tokens.colors.gray300,
              fontSize: '0.8rem'
            }}>
              {template.game_type === 'kolkhoz' ? 'Стоимость очка:' : 'Стоимость партии:'}
            </Typography>
            <Typography variant="caption" sx={{ 
              fontWeight: 600,
              color: tokens.colors.mint,
              fontSize: '0.8rem'
            }}>
              {getCostDisplay()}
            </Typography>
          </Box>
        </Box>

        {/* Selection Indicator */}
        {isSelected && (
          <Box sx={{ 
            position: 'absolute',
            top: 12,
            right: 12,
            width: 20,
            height: 20,
            background: tokens.colors.mint,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colors.black,
            fontSize: 12,
            fontWeight: 700
          }}>
            ✓
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
