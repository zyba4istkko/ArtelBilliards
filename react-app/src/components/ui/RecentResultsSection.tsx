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
  Refresh,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { SessionService } from '../../api/services/sessionService'
import { useUser } from '../../store/authStore'
import type { GameSession } from '../../api/types'

interface RecentResultsSectionProps {
  title?: string
  sessionsPerPage?: number
}

export default function RecentResultsSection({ 
  title = "Недавние результаты",
  sessionsPerPage = 5
}: RecentResultsSectionProps) {
  const navigate = useNavigate()
  const user = useUser()
  
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Загружаем завершенные сессии пользователя
  const loadCompletedSessions = async (page: number = 0, append: boolean = false) => {
    if (!user) return

    try {
      if (page === 0) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)
      
      console.log('🔍 RecentResultsSection: Загружаю завершенные сессии для страницы:', page)
      
      // Получаем завершенные сессии пользователя
      const completedSessions = await SessionService.getSessionsByFilter({
        user_id: user.id,
        status: 'completed', // Фильтруем по статусу completed
        limit: sessionsPerPage,
        offset: page * sessionsPerPage
      })
      
      // Получаем отмененные сессии отдельно
      const cancelledSessions = await SessionService.getSessionsByFilter({
        user_id: user.id,
        status: 'cancelled', // Фильтруем по статусу cancelled
        limit: sessionsPerPage,
        offset: page * sessionsPerPage
      })
      
      // Объединяем и ограничиваем
      const filteredSessions = [...completedSessions, ...cancelledSessions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, sessionsPerPage)
      
      console.log('🔍 RecentResultsSection: Сессии после фильтрации (completed + cancelled):', filteredSessions.map(s => ({ id: s.id, name: s.name, status: s.status })))
      
      console.log('🔍 RecentResultsSection: Получено завершенных сессий:', filteredSessions.length)
      
      if (append) {
        setSessions(prev => [...prev, ...filteredSessions])
      } else {
        setSessions(filteredSessions)
      }
      
      // Проверяем, есть ли еще сессии для загрузки
      setHasMore(filteredSessions.length === sessionsPerPage)
      
    } catch (err: any) {
      console.error('❌ RecentResultsSection: Ошибка загрузки завершенных сессий:', err)
      setError('Не удалось загрузить недавние результаты')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Загружаем сессии при монтировании и изменении пользователя
  useEffect(() => {
    if (user) {
      loadCompletedSessions(0, false)
    }
  }, [user])

  // Обработчик загрузки следующей страницы
  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    loadCompletedSessions(nextPage, true)
  }

  // Обработчик обновления
  const handleRefresh = () => {
    setCurrentPage(0)
    loadCompletedSessions(0, false)
  }

  // Получаем иконку для статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
      case 'cancelled':
        return <Cancel sx={{ color: 'error.main', fontSize: 20 }} />
      default:
        return <FiberManualRecord sx={{ color: 'text.secondary', fontSize: 20 }} />
    }
  }

  // Получаем цвет для статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  // Получаем текст для статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершена'
      case 'cancelled':
        return 'Отменена'
      default:
        return status
    }
  }

  // Форматируем время
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Сегодня'
    } else if (diffDays === 1) {
      return 'Вчера'
    } else if (diffDays < 7) {
      return `${diffDays} дня назад`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? 'неделю' : weeks < 5 ? 'недели' : 'недель'} назад`
    } else {
      const months = Math.floor(diffDays / 30)
      return `${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'} назад`
    }
  }

  if (isLoading && currentPage === 0) {
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
            {Array.from({ length: sessionsPerPage }).map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                  <Skeleton variant="text" width="80px" height={20} />
                </Box>
                {index < sessionsPerPage - 1 && <Skeleton variant="divider" />}
              </Box>
            ))}
          </CardContent>
        </Card>
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
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Обновить
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          {sessions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Нет завершенных сессий
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Создайте игру, чтобы увидеть результаты
              </Typography>
            </Box>
          ) : (
            <>
              {sessions.map((session, index) => (
                <Box key={session.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 2,
                    px: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => navigate(`/game-session/${session.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getStatusIcon(session.status)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {session.name || 'Без названия'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {session.current_players_count} игроков • {session.game_type?.display_name || 'Игра'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={getStatusText(session.status)}
                        color={getStatusColor(session.status) as any}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatTime(session.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {index < sessions.length - 1 && (
                    <Box sx={{ mx: 2 }}>
                      <hr style={{ border: 'none', borderTop: '1px solid', borderColor: 'divider' }} />
                    </Box>
                  )}
                </Box>
              ))}
              
              {/* Кнопка "Загрузить еще" */}
              {hasMore && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    startIcon={isLoadingMore ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : null}
                  >
                    {isLoadingMore ? 'Загружаем...' : 'Загрузить еще'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
