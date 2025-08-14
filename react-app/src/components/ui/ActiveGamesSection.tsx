import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  Skeleton,
  Alert,
  Button
} from '@mui/material'
import { 
  FiberManualRecord,
  PlayArrow,
  Refresh
} from '@mui/icons-material'
import { SessionService } from '../../api/services/sessionService'
import { useUser } from '../../store/authStore'
import type { GameSession } from '../../api/types'

interface ActiveGamesSectionProps {
  title?: string
  maxSessions?: number
}

export default function ActiveGamesSection({ 
  title = "Активные игры",
  maxSessions = 5
}: ActiveGamesSectionProps) {
  const navigate = useNavigate()
  const user = useUser()
  
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загружаем активные сессии пользователя
  const loadActiveSessions = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)
      
      // Получаем активные сессии пользователя через новый endpoint /filter
      const sessions = await SessionService.getSessionsByFilter({
        status: 'in_progress',
        user_id: user.id,
        limit: maxSessions,
        offset: 0
      })
      
      setSessions(sessions)
    } catch (err: any) {
      console.error('Failed to load active sessions:', err)
      setError('Не удалось загрузить активные игры')
    } finally {
      setIsLoading(false)
    }
  }

  // Загружаем сессии при монтировании и изменении пользователя
  useEffect(() => {
    loadActiveSessions()
  }, [user])

  // Обработчик перехода в сессию
  const handleJoinSession = (sessionId: string) => {
    navigate(`/game-session/${sessionId}`)
  }

  // Обработчик обновления
  const handleRefresh = () => {
    loadActiveSessions()
  }

  // Получаем статус сессии для отображения
  const getSessionStatus = (session: GameSession) => {
    switch (session.status) {
      case 'in_progress':
        return { text: 'В процессе', color: 'success' as const }
      case 'waiting':
        return { text: 'Ожидание', color: 'warning' as const }
      case 'completed':
        return { text: 'Завершена', color: 'default' as const }
      case 'cancelled':
        return { text: 'Отменена', color: 'error' as const }
      default:
        return { text: 'Неизвестно', color: 'default' as const }
    }
  }

  // Получаем время начала сессии
  const getSessionTime = (session: GameSession) => {
    if (session.started_at) {
      const startTime = new Date(session.started_at)
      const now = new Date()
      const diffMs = now.getTime() - startTime.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      
      if (diffMins < 1) return 'Только что'
      if (diffMins < 60) return `${diffMins} мин назад`
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ч назад`
      return `${Math.floor(diffMins / 1440)} дн назад`
    }
    
    if (session.status === 'waiting') {
      return 'Ожидает игроков'
    }
    
    return 'Не началась'
  }

  // Получаем иконку типа игры
  const getGameTypeIcon = (session: GameSession) => {
    // Здесь можно добавить логику определения типа игры по template_id
    // Пока возвращаем общую иконку
    return '🎱'
  }

  if (isLoading) {
    return (
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ 
          color: 'primary.main', 
          fontWeight: 700, 
          mb: 3,
          textAlign: { xs: 'center', md: 'left' }
        }}>
          {title}
        </Typography>
        
        <Card sx={{ border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            {[...Array(3)].map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 2,
                  px: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={12} height={12} />
                    <Box>
                      <Skeleton variant="text" width={200} height={24} />
                      <Skeleton variant="text" width={150} height={20} />
                    </Box>
                  </Box>
                  <Skeleton variant="rectangular" width={80} height={24} />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ 
          color: 'primary.main', 
          fontWeight: 700, 
          mb: 3,
          textAlign: { xs: 'center', md: 'left' }
        }}>
          {title}
        </Typography>
        
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Повторить
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h2" sx={{ 
          color: 'primary.main', 
          fontWeight: 700,
          textAlign: { xs: 'center', md: 'left' }
        }}>
          {title}
        </Typography>
        
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          size="small"
          sx={{ minWidth: 'auto' }}
        >
          Обновить
        </Button>
      </Box>
      
      <Card sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          {!sessions || sessions.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary'
            }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                У вас пока нет активных игр
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => navigate('/session/create')}
                sx={{ borderRadius: '999px' }}
              >
                Создать игру
              </Button>
            </Box>
          ) : (
            sessions.map((session, index) => {
              const status = getSessionStatus(session)
              const timeText = getSessionTime(session)
              const gameIcon = getGameTypeIcon(session)
              
              return (
                <Box key={session.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 2,
                    px: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    mb: index < (sessions?.length || 0) - 1 ? 2 : 0,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateY(-1px)',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => handleJoinSession(session.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FiberManualRecord sx={{ 
                        fontSize: 12,
                        color: status.color === 'success' ? 'success.main' : 
                               status.color === 'warning' ? 'warning.main' : 
                               status.color === 'info' ? 'info.main' : 'text.secondary'
                      }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {gameIcon} {session.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {timeText} • {session.current_players}/{session.max_players} игроков
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={status.text}
                        size="small"
                        color={status.color}
                        sx={{
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      <PlayArrow sx={{ 
                        color: 'primary.main',
                        fontSize: 20
                      }} />
                    </Box>
                  </Box>
                </Box>
              )
            })
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
