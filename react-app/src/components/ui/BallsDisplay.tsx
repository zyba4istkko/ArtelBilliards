import { Box, Grid, Typography } from '@mui/material'
import { Ball } from './Ball'
import { settingBlockStyles } from '../../styles/template-styles'
import tokens from '../../styles/design-tokens'

interface BallDisplay {
  name: string
  points: string
  color: string
}

interface BallsDisplayProps {
  balls: BallDisplay[]
  title: string
}

export function BallsDisplay({ balls, title }: BallsDisplayProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {balls.map((ball, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Box sx={{ 
              ...settingBlockStyles,
              textAlign: 'center',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                background: tokens.colors.gray600,
                transform: 'translateY(-2px)'
              }
            }}>
              <Ball color={ball.color} size={32} />
              <Typography variant="caption" display="block" fontWeight={600} sx={{ mt: 1, color: tokens.colors.white, fontSize: '0.75rem' }}>
                {ball.name}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: tokens.colors.gray300 }}>
                {ball.points}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
