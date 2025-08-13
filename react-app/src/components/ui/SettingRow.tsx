import { Box, Typography } from '@mui/material'
import tokens from '../../styles/design-tokens'

interface SettingRowProps {
  label: string
  value: React.ReactNode
}

export function SettingRow({ label, value }: SettingRowProps) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      py: '8px',
      borderBottom: `1px solid ${tokens.colors.gray700}`
    }}>
      <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ 
        fontWeight: 600,
        color: tokens.colors.mint,
        fontSize: '0.875rem'
      }}>
        {value}
      </Typography>
    </Box>
  )
}
