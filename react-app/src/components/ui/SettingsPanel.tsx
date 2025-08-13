import { Box, Grid, Typography } from '@mui/material'
import { settingBlockStyles, valueBadgeStyles } from '../../styles/template-styles'
import tokens from '../../styles/design-tokens'

interface SettingsPanelProps {
  settings: Record<string, string>
  title: string
}

export function SettingsPanel({ settings, title }: SettingsPanelProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(settings).map(([key, value]) => (
          <Grid item xs={6} key={key}>
            <Box sx={settingBlockStyles}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom color={tokens.colors.white} sx={{ fontSize: '0.875rem' }}>
                {key}
              </Typography>
              <Box sx={valueBadgeStyles}>
                {value}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
