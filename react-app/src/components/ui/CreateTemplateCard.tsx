import { Box, Card, CardContent, Typography, Button } from '@mui/material'
import { createCardStyles, largeIconStyles, coralButtonStyles } from '../../styles/template-styles'
import tokens from '../../styles/design-tokens'

interface CreateTemplateCardProps {
  onClick: () => void
}

export function CreateTemplateCard({ onClick }: CreateTemplateCardProps) {
  return (
    <Card sx={createCardStyles} onClick={onClick}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* Icon */}
        <Box sx={largeIconStyles}>
          ⚙️
        </Box>

        {/* Title */}
        <Typography variant="h6" component="h3" sx={{ 
          fontSize: '1.5rem',
          fontWeight: 700, 
          mb: 1,
          color: tokens.colors.white
        }}>
          Создать свой
        </Typography>

        {/* Description */}
        <Typography variant="body2" color={tokens.colors.gray300} sx={{ mb: 3 }}>
          Настрой правила под себя: количество шаров, очки, стоимость, штрафы и другие параметры
        </Typography>

        {/* Action Button */}
        <Button 
          variant="contained"
          sx={coralButtonStyles}
        >
          Настроить правила
        </Button>
      </CardContent>
    </Card>
  )
}
