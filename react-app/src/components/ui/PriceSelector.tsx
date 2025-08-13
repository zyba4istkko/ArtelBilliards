import { Box, TextField, Typography } from '@mui/material'
import tokens from '../../styles/design-tokens'

interface PriceSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  customPlaceholder?: string
}

export function PriceSelector({ label, value, onChange, options, customPlaceholder = "Введите другую сумму..." }: PriceSelectorProps) {
  const isCustomValue = !options.some(option => option.value === value)
  
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
        alignItems: 'center', 
        flexWrap: 'wrap' 
      }}>
        {/* Preset options */}
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
              minWidth: '50px',
              textAlign: 'center',
              '&:hover': {
                borderColor: tokens.colors.mint,
                background: value === option.value ? tokens.colors.mint : tokens.colors.gray500
              }
            }}
          >
            {option.label}
          </Box>
        ))}
        
        {/* Custom input */}
        <TextField
          type="number"
          placeholder={customPlaceholder}
          value={isCustomValue ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            // Clear selection when focusing custom input
            if (!isCustomValue) {
              onChange('')
            }
          }}
          sx={{
            width: '80px',
            '& .MuiInputBase-root': {
              background: isCustomValue ? tokens.colors.mint : tokens.colors.gray600,
              color: isCustomValue ? tokens.colors.black : tokens.colors.white,
              border: `1px solid ${tokens.colors.gray500}`,
              borderRadius: '999px',
              fontSize: '0.875rem',
              textAlign: 'center',
              '&:focus': {
                borderColor: tokens.colors.mint
              }
            },
            '& .MuiInputBase-input': {
              textAlign: 'center',
              padding: '8px 16px'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            }
          }}
        />
      </Box>
    </Box>
  )
}
