import { Box, Typography } from '@mui/material'
import tokens from '../../styles/design-tokens'
import { Button } from '@nextui-org/react'

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
          <Button
            key={option.value}
            variant="bordered"
            className={`w-full ${
              value === option.value 
                ? 'bg-mint text-black border-mint' 
                : 'bg-gray-600/50 border-gray-500 text-gray-200 hover:bg-mint/20 hover:border-mint'
            } transition-colors`}
            onPress={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </Box>
    </Box>
  )
}
