import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  IconButton,
  Chip,
  Alert
} from '@mui/material'
import { 
  Search, 
  PersonAdd, 
  Delete,
  Edit,
  Check,
  Close,
  SmartToy
} from '@mui/icons-material'
import tokens from '../../styles/design-tokens'
import { useUser } from '../../store/authStore'
import { PlayerService } from '../../api/services/playerService'
import type { Player } from '../../api/types'
import { SessionService } from '../../api/services/sessionService'

interface PlayerManagementProps {
  onPlayersChange: (players: Player[]) => void
  selectedTemplate?: any
  sessionId?: string
}

export function PlayerManagement({ onPlayersChange, selectedTemplate, sessionId }: PlayerManagementProps) {
  const currentUser = useUser()
  const [players, setPlayers] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [botName, setBotName] = useState('')
  const [editingBotId, setEditingBotId] = useState<string | null>(null)
  const [editingBotName, setEditingBotName] = useState('')

  // 🔄 НОВОЕ: Состояние для участников сессии
  const [sessionParticipants, setSessionParticipants] = useState<any[]>([])
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)

  // 🔄 ИСПРАВЛЯЕМ: НЕ добавляем текущего пользователя автоматически через API
  // Участники уже загружаются из SessionCreationPage
  useEffect(() => {
    // Пустой useEffect - убираем автоматическое добавление
  }, [])

  // 🔄 НОВОЕ: Загружаем участников сессии если sessionId есть И если нет переданных игроков
  useEffect(() => {
    if (sessionId && players.length === 0) {
      loadSessionParticipants()
    }
  }, [sessionId, players.length])

  // 🔄 НОВОЕ: Функция загрузки участников сессии
  const loadSessionParticipants = async () => {
    if (!sessionId) return
    
    setIsLoadingParticipants(true)
    try {
      console.log('🔍 PlayerManagement: Загружаю участников сессии:', sessionId)
      const participants = await SessionService.getSessionParticipants(sessionId)
      console.log('✅ PlayerManagement: Участники загружены:', participants)
      setSessionParticipants(participants)
      
      // 🔄 ДОБАВЛЯЕМ: Логирование для отладки
      console.log('🔍 PlayerManagement: Участники из API:', participants)
      participants.forEach((p, index) => {
        console.log(`🔍 PlayerManagement: Участник ${index}:`, {
          id: p.id,
          user_id: p.user_id,
          display_name: p.display_name,
          is_empty_user: p.is_empty_user
        })
      })
      
      // Синхронизируем с локальным списком игроков
      const existingPlayers = participants.map(p => ({
        id: p.user_id || p.id,
        username: p.display_name, // 🔄 display_name из базы становится username
        email: '',
        isBot: p.is_empty_user,
        displayName: p.display_name || 'Пользователь' // 🔄 display_name из базы становится displayName, fallback если пусто
      }))
      
      console.log('🔍 PlayerManagement: Преобразованные игроки:', existingPlayers)
      
      // Добавляем только новых игроков (не дублируем)
      const newPlayers = existingPlayers.filter(p => 
        !players.find(localP => localP.id === p.id)
      )
      
      if (newPlayers.length > 0) {
        const updatedPlayers = [...players, ...newPlayers]
        setPlayers(updatedPlayers)
        onPlayersChange(updatedPlayers)
        console.log('✅ PlayerManagement: Добавлены новые игроки из сессии:', newPlayers)
      }
      
    } catch (error) {
      console.error('❌ PlayerManagement: Ошибка загрузки участников:', error)
      setError('Ошибка загрузки участников сессии')
    } finally {
      setIsLoadingParticipants(false)
    }
  }

  // Добавить игрока в список
  const addPlayer = async (player: Player) => {
    if (!sessionId) return
    
    if (players.find(p => p.id === player.id)) {
      setError('Игрок уже добавлен в список')
      return
    }
    
    try {
      console.log('🔍 PlayerManagement: Добавляю участника:', player)
      
      if (player.isBot) {
        // 🔄 ИСПРАВЛЯЕМ: Для ботов НЕ вызываем API повторно
        // Бот уже добавлен в базу в createBotWithName
        console.log('✅ PlayerManagement: Бот уже добавлен в базу, пропускаем API вызов')
      } else {
        // Для участников вызываем API
        const playerData = await SessionService.addPlayerToSession(sessionId, {
          user_id: player.id,
          display_name: player.displayName,
          session_role: 'participant'
        })
        console.log('✅ PlayerManagement: Участник добавлен в базу:', playerData)
      }
      
      // Добавляем в локальный список
      const newPlayers = [...players, player]
      setPlayers(newPlayers)
      onPlayersChange(newPlayers)
      setError(null)
      
      // Перезагружаем участников сессии из базы
      await loadSessionParticipants()
      
      console.log('✅ PlayerManagement: Участник успешно добавлен и сохранен в базе')
      
    } catch (error) {
      console.error('❌ PlayerManagement: Ошибка добавления участника:', error)
      setError('Ошибка добавления участника в сессию')
    }
  }

  // Создать бота с именем
  const createBotWithName = async (name: string) => {
    if (!name.trim() || !sessionId) return
    
    try {
      console.log('🔍 PlayerManagement: Создаю бота:', name)
      
      // Добавляем бота в базу данных
      const botData = await SessionService.addBotToSession(sessionId, name.trim())
      console.log('✅ PlayerManagement: Бот добавлен в базу:', botData)
      
      // Создаем локального бота для UI
      const botPlayer: Player = {
        id: botData.id,
        username: name.toLowerCase().replace(/\s+/g, '_'),
        isBot: true,
        displayName: name.trim()
      }
      
      // Добавляем в локальный список
      addPlayer(botPlayer)
      
      // Перезагружаем участников сессии из базы
      await loadSessionParticipants()
      
      setBotName('') // Очищаем поле после создания
      console.log('✅ PlayerManagement: Бот успешно создан и сохранен в базе')
      
    } catch (error) {
      console.error('❌ PlayerManagement: Ошибка создания бота:', error)
      setError('Ошибка создания бота. Попробуйте еще раз.')
    }
  }

  // Изменить имя бота
  const changeBotName = (playerId: string, newName: string) => {
    if (!newName.trim()) return
    
    const updatedPlayers = players.map(player => 
      player.id === playerId 
        ? { ...player, displayName: newName.trim() }
        : player
    )
    
    setPlayers(updatedPlayers)
    onPlayersChange(updatedPlayers)
  }

  // Удалить игрока из списка
  const removePlayer = async (playerId: string) => {
    if (!sessionId) return
    
    try {
      // 🔄 ИСПРАВЛЯЕМ: Удаляем ВСЕХ участников из базы (и ботов, и игроков)
      console.log('🔍 PlayerManagement: Удаляю участника из базы:', playerId)
      await SessionService.removeParticipantFromSession(sessionId, playerId)
      console.log('✅ PlayerManagement: Участник удален из базы')
      
      // Удаляем из локального списка
      const newPlayers = players.filter(p => p.id !== playerId)
      setPlayers(newPlayers)
      onPlayersChange(newPlayers)
      
      // Перезагружаем участников сессии из базы
      await loadSessionParticipants()
      
      console.log('✅ PlayerManagement: Игрок удален из списка и базы')
      
    } catch (error) {
      console.error('❌ PlayerManagement: Ошибка удаления игрока:', error)
      setError('Ошибка удаления игрока. Попробуйте еще раз.')
    }
  }

  // Поиск игроков
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setError(null)
    
    try {
      const results = await PlayerService.searchPlayers(searchQuery)
      setSearchResults(results)
    } catch (err) {
      setError('Ошибка поиска игроков')
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Box>
      {/* Заголовок */}
      <Typography variant="h5" sx={{ 
        color: tokens.colors.white, 
        mb: 2 
      }}>
        Управление игроками
      </Typography>

      <Typography variant="body1" sx={{ 
        color: tokens.colors.gray300, 
        mb: 4 
      }}>
        Добавь игроков или ботов для участия в игре
      </Typography>

      {/* Поиск игроков */}
      <Card sx={{ mb: 4, bgcolor: tokens.colors.gray800 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: tokens.colors.white, mb: 3 }}>
            🔍 Поиск игроков
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Введите username или email игрока"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: tokens.colors.white,
                  '& fieldset': { borderColor: tokens.colors.gray600 },
                  '&:hover fieldset': { borderColor: tokens.colors.mint },
                  '&.Mui-focused fieldset': { borderColor: tokens.colors.mint }
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              startIcon={<Search />}
              sx={{
                bgcolor: tokens.colors.mint,
                color: tokens.colors.black,
                px: 3,
                '&:hover': { bgcolor: '#6bbf9a' },
                '&:disabled': { 
                  bgcolor: tokens.colors.gray600,
                  color: tokens.colors.gray400
                },
                '& .MuiButton-label': { color: 'inherit' },
                '& .MuiTypography-root': { color: 'inherit' },
                '& span': { color: 'inherit' }
              }}
            >
              {isSearching ? 'Поиск...' : 'Найти'}
            </Button>
          </Box>

          {/* Результаты поиска */}
          {searchResults.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ 
                color: tokens.colors.gray300, 
                mb: 2,
                fontWeight: 500
              }}>
                Найденные игроки:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {searchResults.map((player) => (
                  <Box 
                    key={player.id} 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: tokens.colors.gray700,
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${tokens.colors.gray600}`
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ 
                        color: tokens.colors.white,
                        fontWeight: 500,
                        mb: 0.5
                      }}>
                        {player.displayName}
                      </Typography>
                      {player.email && (
                        <Typography variant="body2" sx={{ 
                          color: tokens.colors.gray400,
                          fontSize: '0.875rem'
                        }}>
                          {player.email}
                        </Typography>
                      )}
                    </Box>
                    
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => addPlayer(player)}
                      sx={{
                        bgcolor: tokens.colors.mint,
                        color: tokens.colors.black,
                        px: 2,
                        py: 0.75,
                        minWidth: 'auto',
                        '&:hover': { bgcolor: '#6bbf9a' },
                        '&:disabled': { 
                          bgcolor: tokens.colors.gray600,
                          color: tokens.colors.gray400
                        },
                        '& .MuiButton-label': { color: 'inherit' },
                        '& .MuiTypography-root': { color: 'inherit' },
                        '& span': { color: 'inherit' }
                      }}
                    >
                      Добавить
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Создание ботов */}
      <Card sx={{ mb: 4, bgcolor: tokens.colors.gray800 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: tokens.colors.white, mb: 3 }}>
            🤖 Боты-заглушки
          </Typography>
          
          <Typography variant="body2" sx={{ color: tokens.colors.gray300, mb: 3 }}>
            Создайте ботов для игроков без приложения
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Введите имя бота"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createBotWithName(botName)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: tokens.colors.white,
                  '& fieldset': { borderColor: tokens.colors.gray600 },
                  '&:hover fieldset': { borderColor: tokens.colors.mint },
                  '&.Mui-focused fieldset': { borderColor: tokens.colors.mint }
                }
              }}
            />
            <Button
              variant="contained"
              onClick={() => createBotWithName(botName)}
              disabled={!botName.trim()}
              startIcon={<SmartToy />}
              sx={{
                bgcolor: tokens.colors.mint,
                color: tokens.colors.black,
                px: 3,
                whiteSpace: 'nowrap',
                minWidth: 'fit-content',
                '&:hover': { bgcolor: '#6bbf9a' },
                '&:disabled': { 
                  bgcolor: tokens.colors.gray600,
                  color: tokens.colors.gray400
                },
                '& .MuiButton-label': { color: 'inherit' },
                '& .MuiTypography-root': { color: 'inherit' },
                '& span': { color: 'inherit' }
              }}
            >Добавить бота</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Список выбранных игроков */}
      <Card sx={{ bgcolor: tokens.colors.gray800 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: tokens.colors.white, mb: 3 }}>
            👥 Игроки в сессии ({players.length})
          </Typography>
          
          {players.length === 0 ? (
            <Typography variant="body2" sx={{ 
              color: tokens.colors.gray400, 
              textAlign: 'center', 
              py: 3,
              fontStyle: 'italic'
            }}>
              Пока нет добавленных игроков
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {players.map((player, index) => (
                <Box 
                  key={player.id}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: tokens.colors.gray700,
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${tokens.colors.gray600}`
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {editingBotId === player.id && player.isBot ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            value={editingBotName}
                            onChange={(e) => setEditingBotName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                changeBotName(player.id, editingBotName)
                                setEditingBotId(null)
                                setEditingBotName('')
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: tokens.colors.white,
                                '& fieldset': { borderColor: tokens.colors.mint },
                                '& input': { py: 0.5, px: 1, fontSize: '0.875rem' }
                              }
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              changeBotName(player.id, editingBotName)
                              setEditingBotId(null)
                              setEditingBotName('')
                            }}
                            sx={{ color: tokens.colors.mint, p: 0.5 }}
                          >
                            <Check />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingBotId(null)
                              setEditingBotName('')
                            }}
                            sx={{ color: tokens.colors.error, p: 0.5 }}
                          >
                            <Close />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <Typography variant="body1" sx={{ 
                            color: tokens.colors.white,
                            fontWeight: 500
                          }}>
                            {player.displayName}
                          </Typography>
                          {player.isBot && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingBotId(player.id)
                                setEditingBotName(player.displayName)
                              }}
                              sx={{ color: tokens.colors.mint, p: 0.5 }}
                            >
                              <Edit />
                            </IconButton>
                          )}
                        </>
                      )}
                      {player.isBot && (
                        <Chip 
                          label="Бот" 
                          size="small" 
                          sx={{ 
                            bgcolor: tokens.colors.peach,
                            color: tokens.colors.black,
                            fontSize: '0.7rem',
                            height: '20px'
                          }} 
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: tokens.colors.gray400,
                      fontSize: '0.875rem'
                    }}>
                      {player.email || `ID: ${player.id}`}
                    </Typography>
                  </Box>
                  
                  <IconButton
                    edge="end"
                    onClick={() => removePlayer(player.id)}
                    sx={{ 
                      color: tokens.colors.error,
                      '&:hover': { 
                        bgcolor: 'rgba(239, 68, 68, 0.1)'
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Сообщения об ошибках */}
      {error && (
        <Alert 
          severity="info" 
          sx={{ mt: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Валидация */}
      {players.length > 0 && players.length < 2 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Для начала игры нужно минимум 2 игрока
        </Alert>
      )}
    </Box>
  )
}
