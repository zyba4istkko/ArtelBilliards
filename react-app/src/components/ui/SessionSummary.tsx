import { Box, Typography, Button, Card, CardContent, Chip, Divider, Alert } from '@mui/material'
import { PlayArrow, SmartToy, Person } from '@mui/icons-material'
import tokens from '../../styles/design-tokens'
import { BallsDisplay } from './BallsDisplay'
import { SettingsPanel } from './SettingsPanel'
import type { Player } from '../../api/types'

interface SessionSummaryProps {
  selectedTemplate: any
  players: Player[]
  onStartGame: () => void
  isStarting?: boolean
  sessionId?: string
}

export function SessionSummary({ selectedTemplate, players, onStartGame, isStarting = false }: SessionSummaryProps) {
  const canStartGame = players.length >= 2 && selectedTemplate

  return (
    <Box>
      <Typography variant="h4" component="h2" sx={{ color: tokens.colors.mint, fontWeight: 700, mb: 2 }}>
        📋 Предпросмотр сессии
      </Typography>
      <Typography variant="body1" sx={{ color: tokens.colors.gray300, mb: 4 }}>
        Проверьте настройки перед началом игры
      </Typography>

      {/* Основная сводка - как в HTML шаблоне */}
      <Card sx={{ mb: 4, bgcolor: tokens.colors.gray700, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 2,
              borderBottom: `1px solid ${tokens.colors.gray600}`
            }}>
              <Typography variant="body1" sx={{ color: tokens.colors.gray300 }}>
                Тип игры:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.colors.white }}>
                🎱 {selectedTemplate?.name || 'Название шаблона'}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 2,
              borderBottom: `1px solid ${tokens.colors.gray600}`
            }}>
              <Typography variant="body1" sx={{ color: tokens.colors.gray300 }}>
                Игроков:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.colors.mint }}>
                {players.length} игрока
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 2,
              borderBottom: `1px solid ${tokens.colors.gray600}`
            }}>
              <Typography variant="body1" sx={{ color: tokens.colors.gray300 }}>
                Шары:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.colors.mint }}>
                {selectedTemplate?.rules?.balls?.length || 0} шаров
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 2,
              borderBottom: `1px solid ${tokens.colors.gray600}`
            }}>
              <Typography variant="body1" sx={{ color: tokens.colors.gray300 }}>
                Победа:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.colors.mint }}>
                {selectedTemplate?.rules?.balls_to_win ? `До ${selectedTemplate.rules.balls_to_win} очков` : 'До последнего шара'}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 2,
              borderBottom: `1px solid ${tokens.colors.gray600}`
            }}>
              <Typography variant="body1" sx={{ color: tokens.colors.gray300 }}>
                Порядок:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.colors.mint }}>
                {selectedTemplate?.rules?.queue_algorithm === 'random_no_repeat' ? 'Случайно без повторов' : 
                 selectedTemplate?.rules?.queue_algorithm === 'sequential' ? 'По очереди' :
                 selectedTemplate?.rules?.queue_algorithm === 'random' ? 'Случайно' :
                 selectedTemplate?.rules?.queue_algorithm || 'По очереди'}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 2,
              borderBottom: `1px solid ${tokens.colors.gray600}`
            }}>
              <Typography variant="body1" sx={{ color: tokens.colors.gray300 }}>
                Стоимость очка:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.colors.mint }}>
                {selectedTemplate?.rules?.point_value_rubles ? `${selectedTemplate.rules.point_value_rubles} ₽` : 'Не указано'}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 2
            }}>
              <Typography variant="body1" sx={{ color: tokens.colors.gray300 }}>
                Штраф за фол:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.colors.mint }}>
                {selectedTemplate?.rules?.foul_penalty_points ? `-${selectedTemplate.rules.foul_penalty_points} очков` : 'Не указано'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Настройки шаров - перемещаем выше списка игроков */}
      {selectedTemplate?.rules?.balls && selectedTemplate.rules.balls.length > 0 && (
        <Card sx={{ mb: 4, bgcolor: tokens.colors.gray700, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: tokens.colors.mint, mb: 3, fontSize: '1.1rem', fontWeight: 600 }}>
              🎱 Настройки шаров
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 2 
            }}>
              {selectedTemplate.rules.balls.map((ball: any, index: number) => (
                <Box 
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: tokens.colors.gray600,
                    borderRadius: 1,
                    p: 2
                  }}
                >
                  <Box 
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: ball.color || '#ccc',
                      flexShrink: 0,
                      boxShadow: 'inset -4px -4px 8px rgba(0,0,0,0.3), inset 4px 4px 8px rgba(255,255,255,0.1)'
                    }}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ color: tokens.colors.white, fontWeight: 600, fontSize: '0.9rem' }}>
                      {ball.color === 'white' ? 'Белый' :
                       ball.color === 'yellow' ? 'Желтый' :
                       ball.color === 'green' ? 'Зеленый' :
                       ball.color === 'brown' ? 'Коричневый' :
                       ball.color === 'blue' ? 'Синий' :
                       ball.color === 'pink' ? 'Розовый' :
                       ball.color === 'black' ? 'Черный' :
                       ball.color === 'red' ? 'Красный' :
                       ball.color || `Шар ${index + 1}`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.colors.gray300, fontSize: '0.8rem' }}>
                      {ball.points} {typeof ball.points === 'number' ? 'очков' : ''}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Список игроков */}
      <Card sx={{ mb: 4, bgcolor: tokens.colors.gray800 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: tokens.colors.white, mb: 3 }}>
            👥 Игроки в сессии ({players.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {players.map((player, index) => (
              <Box key={player.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: tokens.colors.gray700, borderRadius: 1, border: `1px solid ${tokens.colors.gray600}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 'fit-content' }}>
                  {player.isBot ? (<SmartToy sx={{ color: tokens.colors.peach }} />) : (<Person sx={{ color: tokens.colors.mint }} />)}
                  <Typography variant="body2" sx={{ color: tokens.colors.gray400, fontWeight: 500 }}>
                    #{index + 1}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: tokens.colors.white, fontWeight: 500, flex: 1 }}>
                  {player.displayName}
                </Typography>
                {player.isBot && (<Chip label="Бот" size="small" sx={{ bgcolor: tokens.colors.peach, color: tokens.colors.black, fontSize: '0.7rem', height: '20px' }} />)}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Готово к игре - как в HTML */}
      <Box sx={{ 
        bgcolor: 'rgba(133, 220, 203, 0.1)', 
        border: `1px solid ${tokens.colors.mint}`, 
        borderRadius: 2, 
        p: 3, 
        mb: 4 
      }}>
        <Typography variant="body1" sx={{ color: tokens.colors.mint, fontWeight: 600, mb: 1 }}>
          🎯 Готово к игре!
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', color: tokens.colors.gray300 }}>
          После создания вы сможете начать вести счет во время реальной игры
        </Typography>
      </Box>

      {/* Кнопка начала игры */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={onStartGame} 
          disabled={!canStartGame || isStarting} 
          startIcon={<PlayArrow />} 
          sx={{ 
            bgcolor: tokens.colors.darkTeal, 
            color: tokens.colors.white, 
            px: 6, 
            py: 2, 
            fontSize: '1.1rem', 
            fontWeight: 600, 
            '&:hover': { bgcolor: '#2a8f7f' }, 
            '&:disabled': { bgcolor: tokens.colors.gray600, color: tokens.colors.gray400 } 
          }}
        >
          {isStarting ? 'Создание сессии...' : '🚀 Начать игру'}
        </Button>
      </Box>

      {/* Предупреждения */}
      {players.length < 2 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Для начала игры нужно минимум 2 игрока
        </Alert>
      )}
      {!selectedTemplate && (
        <Alert severity="error" sx={{ mt: 3 }}>
          Не выбран шаблон игры
        </Alert>
      )}
    </Box>
  )
}
