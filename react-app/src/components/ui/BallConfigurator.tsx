import { Box, Grid, Typography, TextField } from '@mui/material'
import Ball from './Ball'
import { settingBlockStyles } from '../../styles/template-styles'
import tokens from '../../styles/design-tokens'

interface BallConfig {
  name: string
  color: string
  points: string | number
  enabled: boolean
}

interface BallConfiguratorProps {
  balls: BallConfig[]
  onBallChange: (index: number, ball: BallConfig) => void
}

export function BallConfigurator({ balls, onBallChange }: BallConfiguratorProps) {
  const handleBallToggle = (index: number) => {
    const newBall = { ...balls[index], enabled: !balls[index].enabled }
    onBallChange(index, newBall)
  }

  const handlePointsChange = (index: number, points: string) => {
    const newBall = { ...balls[index], points }
    onBallChange(index, newBall)
  }

  return (
    <Box>
      <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
        Настройки шаров
      </Typography>
      <Grid container spacing={2}>
        {balls.map((ball, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Box 
              sx={{ 
                ...settingBlockStyles,
                background: ball.enabled ? tokens.colors.gray700 : tokens.colors.gray600,
                cursor: 'pointer',
                border: ball.enabled ? `2px solid ${tokens.colors.mint}` : `1px solid ${tokens.colors.gray600}`,
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  background: ball.enabled ? tokens.colors.gray600 : tokens.colors.gray500,
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => handleBallToggle(index)}
            >
              <Ball color={ball.color} size={32} />
              <Typography variant="caption" display="block" fontWeight={600} sx={{ mt: 1, color: tokens.colors.white, fontSize: '0.75rem' }}>
                {ball.name}
              </Typography>
              <TextField
                size="small"
                value={ball.points}
                onChange={(e) => handlePointsChange(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                sx={{ 
                  mt: 1, 
                  '& .MuiInputBase-input': { 
                    textAlign: 'center', 
                    fontSize: '0.7rem',
                    color: tokens.colors.white
                  },
                  '& .MuiInputBase-root': {
                    background: tokens.colors.gray600,
                    borderRadius: '6px'
                  }
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
      <Typography variant="caption" color={tokens.colors.gray300} sx={{ mt: 1, display: 'block', fontSize: '0.8rem' }}>
        💡 Нажмите на шар чтобы включить/исключить его из игры
      </Typography>
    </Box>
  )
}
