import React from 'react'
import { Box, Typography, Grid } from '@mui/material'
import { Ball } from './Ball'
import tokens from '../../styles/design-tokens'
import type { BallConfig } from '../../api/types'

interface BallInfo {
  name: string
  points: string
  color: string
}

interface BallsDisplayProps {
  // Старый интерфейс для совместимости
  balls?: BallInfo[]
  title?: string
  // Новый интерфейс
  template?: any
  readOnly?: boolean
}

export function BallsDisplay({ 
  balls: oldBalls, 
  title, 
  template, 
  readOnly = false 
}: BallsDisplayProps) {
  let balls: any[] = []
  let displayTitle = title

  // Определяем источник данных
  if (template && template.rules && template.rules.balls) {
    // Новый интерфейс - берем из template.rules.balls
    balls = template.rules.balls
    displayTitle = displayTitle || 'Настройки шаров'
  } else if (oldBalls && oldBalls.length > 0) {
    // Старый интерфейс - используем переданные balls
    balls = oldBalls
    displayTitle = displayTitle || 'Шары'
  } else {
    // Нет данных
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" sx={{ color: tokens.colors.gray400 }}>
          Шары не найдены
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {displayTitle && (
        <Typography variant="h6" sx={{ 
          color: tokens.colors.white, 
          fontWeight: 600, 
          mb: 3 
        }}>
          {displayTitle}
        </Typography>
      )}
      
      <Grid container spacing={2}>
        {balls.map((ball: any, index: number) => (
          <Grid item xs={6} md={3} key={index}>
            <Box 
              sx={{
                bgcolor: tokens.colors.gray700,
                border: `1px solid ${tokens.colors.gray600}`,
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: tokens.colors.gray600,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Ball color={ball.color} size="md" />
              </Box>
              <Typography variant="body2" sx={{ 
                color: tokens.colors.white,
                fontWeight: 600,
                mb: 1
              }}>
                {ball.name || ball.color}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: tokens.colors.gray300
              }}>
                {ball.points} {typeof ball.points === 'number' ? 'очков' : ''}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
