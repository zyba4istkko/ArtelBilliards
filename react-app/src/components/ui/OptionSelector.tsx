import { Box, Typography } from '@mui/material'
import tokens from '../../styles/design-tokens'

interface Option {
  label: string
  value: string
}

interface OptionSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  row?: boolean
}

export function OptionSelector({ 
  label, 
  value, 
  onChange, 
  options, 
  row = false 
}: OptionSelectorProps) {
  return (
    <Box>
      <Typography 
        variant="subtitle2" 
        fontWeight={600} 
        gutterBottom 
        color={tokens.colors.white} 
        sx={{ fontSize: '0.875rem', mb: 2 }}
      >
        {label}
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        flexDirection: row ? 'row' : 'column',
        flexWrap: 'wrap'
      }}>
        {options.map((option) => (
          <Box
            key={option.value}
            onClick={() => onChange(option.value)}
            sx={{
              background: value === option.value ? tokens.colors.mint : tokens.colors.gray600,
              color: value === option.value ? tokens.colors.black : tokens.colors.white,
              border: `1px solid ${value === option.value ? tokens.colors.mint : tokens.colors.gray500}`,
              borderRadius: '999px',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
              fontSize: '0.875rem',
              fontWeight: 600,
              textAlign: 'center',
              minWidth: row ? 'auto' : '100%',
              '&:hover': {
                borderColor: tokens.colors.mint,
                background: value === option.value ? tokens.colors.mint : tokens.colors.gray500
              }
            }}
          >
            {option.label}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
