import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  GameHeader, 
  Scoreboard, 
  GameHistory, 
  ActionPanel, 
  GameControls,
  ScoreModal,
  PlayerCard,
  EndGameModal
} from '../components/ui'
import { SessionService } from '../api/services/sessionService'
import { gameService } from '../api/services/gameService'
import { TemplateService } from '../api/services/templateService' // Added import for TemplateService
import type { GameSession, Game } from '../api/types'

interface Player {
  id: string
  name: string
  avatar: string
  points: number
  money: number
  balls: Array<{
    color: string
    name: string
    points: number
  }>
  fouls: number
}

export default function GameSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentGame, setCurrentGame] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [games, setGames] = useState<any[]>([])
  const [isLoadingGames, setIsLoadingGames] = useState(false)  // 🔄 ДОБАВЛЯЕМ: состояние загрузки игр
  
  // Game state
  const [isPaused, setIsPaused] = useState(false)
  const [gameStartTime] = useState(Date.now())
  const [currentGameNumber, setCurrentGameNumber] = useState(1)
  
  // Players state (transformed from API data)
  const [players, setPlayers] = useState<Player[]>([])

  // Modal states
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
  const [isEndGameModalOpen, setIsEndGameModalOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  // Load session data on component mount
  useEffect(() => {
    if (sessionId) {
      loadSessionData()
    }
  }, [sessionId])

  // Load session data from API
  const loadSessionData = async () => {
    if (!sessionId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Load session details
      const sessionData = await SessionService.getSession(sessionId)
      setSession(sessionData)
      
      // Load session players
      const playersData = await SessionService.getSessionPlayers(sessionId)
      
      // Transform API data to Player format for UI
      const transformedPlayers: Player[] = playersData.map((sp) => ({
        id: sp.id, // Используем sp.id вместо sp.user_id для ботов
        name: sp.display_name,
        avatar: sp.display_name.charAt(0).toUpperCase(),
        points: sp.current_score || 0,
        money: (sp.session_balance_rubles || 0) * 10, // Convert to game currency
        balls: [], // TODO: Add balls from game events
        fouls: 0   // TODO: Add fouls from game events
      }))
      setPlayers(transformedPlayers)
      
      // Load games data
      try {
        setIsLoadingGames(true)  // 🔄 ДОБАВЛЯЕМ: начало загрузки игр
        console.log('🎮 GameSessionPage: Загружаем игры для сессии:', sessionId)
        const gamesData = await gameService.getSessionGames(sessionId)
        console.log('🎮 GameSessionPage: Получены игры от API:', gamesData)
        console.log('🎮 GameSessionPage: Тип gamesData:', typeof gamesData)
        console.log('🎮 GameSessionPage: gamesData.length:', gamesData?.length)
        
        if (gamesData && Array.isArray(gamesData)) {
          console.log('🎮 GameSessionPage: Игры загружены успешно, количество:', gamesData.length)
          setGames(gamesData)
        } else {
          console.log('🎮 GameSessionPage: gamesData не является массивом, устанавливаем пустой массив')
          console.log('🎮 GameSessionPage: gamesData тип:', typeof gamesData)
          console.log('🎮 GameSessionPage: gamesData содержимое:', gamesData)
          setGames([])
        }
      } catch (gamesError) {
        console.error('❌ GameSessionPage: Ошибка загрузки игр:', gamesError)
        setGames([])
      } finally {
        setIsLoadingGames(false)  // 🔄 ДОБАВЛЯЕМ: конец загрузки игр
      }
      
    } catch (err: any) {
      console.error('Failed to load session data:', err)
      setError('Не удалось загрузить данные сессии')
    } finally {
      setIsLoading(false)
    }
  }

  // Game controls
  const handlePause = () => setIsPaused(true)
  const handleResume = () => setIsPaused(false)
  
  const handleEndGame = () => {
    setIsEndGameModalOpen(true)
  }

  const handleNextGame = async () => {
    // Create new game in session
    if (sessionId) {
      try {
        console.log('🎮 GameSessionPage: Создаем новую игру в сессии...')
        console.log('🎮 GameSessionPage: sessionId:', sessionId)
        
        // 🔄 ИСПРАВЛЯЕМ: Получаем алгоритм очередности из шаблона сессии
        let queueAlgorithm = 'random_no_repeat' // fallback по умолчанию
        
        if (session?.template_id) {
          try {
            console.log('🎮 GameSessionPage: Загружаем шаблон для определения алгоритма очередности...')
            const template = await TemplateService.getTemplate(session.template_id)
            if (template?.rules?.queue_algorithm) {
              queueAlgorithm = template.rules.queue_algorithm
              console.log('🎮 GameSessionPage: Алгоритм из шаблона:', queueAlgorithm)
            } else {
              console.log('🎮 GameSessionPage: Алгоритм не найден в шаблоне, используем fallback:', queueAlgorithm)
            }
          } catch (templateError) {
            console.error('❌ GameSessionPage: Ошибка загрузки шаблона:', templateError)
            console.log('🎮 GameSessionPage: Используем fallback алгоритм:', queueAlgorithm)
          }
        } else {
          console.log('🎮 GameSessionPage: Нет template_id в сессии, используем fallback:', queueAlgorithm)
        }
        
        // Create game with algorithm from template
        const newGame = await gameService.createGame(sessionId, {
          queue_algorithm: queueAlgorithm
        })
        
        console.log('🎮 GameSessionPage: Игра создана:', newGame)
        console.log('🎮 GameSessionPage: Тип newGame:', typeof newGame)
        console.log('🎮 GameSessionPage: newGame.id:', newGame?.id)
        
        if (newGame && newGame.id) {
          console.log('🎮 GameSessionPage: Игра создана успешно, обновляем список игр')
          // Refresh games list
          await loadSessionData()
          // Navigate to the new game's page
          navigate(`/active-game/${newGame.id}`)  // 🔄 ИСПРАВЛЯЕМ: /game/ -> /active-game/
        } else {
          console.log('🎮 GameSessionPage: Игра не создана (newGame undefined или без ID)')
        }
      } catch (error) {
        console.error('❌ GameSessionPage: Ошибка создания игры:', error)
      }
    }
  }

  // 🔄 ДОБАВЛЯЕМ: функция для перехода к игре
  const handleGameClick = (gameId: string) => {
    console.log('🎮 GameSessionPage: Переходим к игре:', gameId)
    navigate(`/active-game/${gameId}`)  // 🔄 ИСПРАВЛЯЕМ: /game/ -> /active-game/
  }

  const handleAddScore = (player: Player) => {
    setSelectedPlayer(player)
    setIsScoreModalOpen(true)
  }

  const handleScoreConfirm = (action: 'ball' | 'foul', ball?: any, tag?: string) => {
    if (!selectedPlayer) return

    setPlayers(prev => prev.map(p => {
      if (p.id === selectedPlayer.id) {
        if (action === 'ball' && ball) {
          const newBalls = [...p.balls, ball]
          const newPoints = p.points + ball.points
          const newMoney = p.money + (ball.points * 10)
          
          // Add log entry
          let logText = `${p.name} забил ${ball.name.toLowerCase()} шар (+${ball.points})`
          if (tag) logText += ` [${tag}]`
          // addLogEntry(logText, '⚫', getBallColor(ball.name), p.name)

          return {
            ...p,
            points: newPoints,
            money: newMoney,
            balls: newBalls
          }
        } else if (action === 'foul') {
          const newPoints = p.points - 1
          const newMoney = p.money - 50
          const newFouls = p.fouls + 1
          
          // Add log entry
          let logText = `${p.name} совершил штраф (-1, -50₽)`
          if (tag) logText += ` [${tag}]`
          // addLogEntry(logText, '❌', '#ef4444', p.name)

          return {
            ...p,
            points: newPoints,
            money: newMoney,
            fouls: newFouls
          }
        }
      }
      return p
    }))

    // Update current game in games array
    setGames(prev => prev.map(game => {
      if (game.status === 'in_progress') {
        return {
          ...game,
          players: players.map(p => {
            if (p.id === selectedPlayer.id) {
              if (action === 'ball' && ball) {
                return { ...p, balls: [...p.balls, ball] }
              } else if (action === 'foul') {
                return { ...p, fouls: p.fouls + 1 }
              }
            }
            return p
          })
        }
      }
      return game
    }))
  }

  // const addLogEntry = (text: string, icon: string, color?: string, addedBy: string = 'Система') => {
  //   const now = new Date()
  //   const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    
  //   const newEntry: LogEntry = {
  //     id: Date.now().toString(),
  //     text,
  //     icon,
  //     color,
  //     playerName: selectedPlayer?.name || '',
  //     timestamp: timeString,
  //     addedBy,
  //     canEdit: addedBy !== 'Система'
  //   }

  //   setLogEntries(prev => [newEntry, ...prev.slice(0, 14)]) // Keep max 15 entries
  // }

  // const getBallColor = (ballName: string) => {
  //   const colors: Record<string, string> = {
  //     'Красный': '#f44336',
  //     'Желтый': '#ffeb3b',
  //     'Зеленый': '#4caf50',
  //     'Коричневый': '#8d6e63',
  //     'Синий': '#2196f3',
  //     'Розовый': '#e91e63',
  //     'Черный': '#212121',
  //     'Белый': '#ffffff'
  //   }
  //   return colors[ballName] || '#ffffff'
  // }

  // const handleEditLogEntry = (entryId: string) => {
  //   // Find the entry and open score modal for the player
  //   const entry = logEntries.find(e => e.id === entryId)
  //   if (entry) {
  //     const player = players.find(p => p.name === entry.playerName)
  //     if (player) {
  //       setSelectedPlayer(player)
  //       setIsScoreModalOpen(true)
  //     }
  //   }
  // }

  const handleBackToSession = () => {
    navigate('/session')
  }

  const handleConfirmEndGame = () => {
    // Logic for ending the game
    setIsEndGameModalOpen(false)
    // Navigate back to session
    navigate('/session')
  }

  // Find leading player
  const leadingPlayer = players.length > 0 
    ? players.reduce((prev, current) => 
        prev.points > current.points ? prev : current
      )
    : null

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mint mx-auto mb-4"></div>
          <p className="text-mint text-lg">Загрузка сессии...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button 
            onClick={loadSessionData}
            className="bg-mint text-black px-6 py-2 rounded-lg hover:bg-mint/80"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  // No session data
  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Сессия не найдена</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-mint text-black px-6 py-2 rounded-lg hover:bg-mint/80 mt-4"
          >
            Вернуться на dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Game Header */}
      <GameHeader
        gameType={session.name || 'Игра'}
        sessionId={session.id}
        playerCount={session.current_players_count}
        gameCount={games?.length || 0}
        sessionStatus={session.status}
        onBack={handleBackToSession}
      />

      <main className="max-w-4xl mx-auto px-4 pb-20">
        {/* Scoreboard - Общий счет сессии */}
        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-mint mb-4 text-center">
            Общий счет сессии
          </h2>
          
          {!session.participants || session.participants.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Нет данных для отображения</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {session.participants.map((participant: any) => (
                <div key={participant.id} className="bg-gray-700 p-4 rounded-lg text-center relative">
                  <div className="w-8 h-8 bg-mint text-black rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-2">
                    {participant.display_name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{participant.display_name}</h3>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Очки: {participant.current_score}</p>
                    <p>Баланс: {participant.session_balance_rubles} ₽</p>
                    <p>Игр сыграно: {participant.total_games_played}</p>
                    <p>Шаров забито: {participant.total_balls_potted}</p>
                  </div>
                  {leadingPlayer && participant.id === leadingPlayer.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs">👑</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Games Section - Игры в сессии */}
        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-mint mb-4 text-center">
            Игры в сессии
          </h3>
          
          {isLoadingGames ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint mx-auto mb-4"></div>
              <p>Загружаем игры...</p>
            </div>
          ) : !games || games.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Игр в сессии еще не было</p>
              <p className="text-sm text-gray-500 mt-2">Создайте игру, чтобы начать играть</p>
              <button
                onClick={handleNextGame}
                className="bg-mint text-black px-6 py-3 rounded-lg hover:bg-mint/80 mt-4 font-medium"
              >
                🎮 Создать игру
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add New Game Button */}
              <div className="text-center mb-4">
                <button
                  onClick={handleNextGame}
                  className="bg-mint text-black px-6 py-3 rounded-lg hover:bg-mint/80 font-medium"
                >
                  🎮 Создать новую игру
                </button>
              </div>
              
              {games && games.map((game) => (
                <div 
                  key={game.id} 
                  className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200 border border-transparent hover:border-mint/30"
                  onClick={() => handleGameClick(game.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-mint font-bold">Игра #{game.game_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        game.status === 'completed' ? 'bg-green-600 text-white' :
                        game.status === 'in_progress' ? 'bg-blue-600 text-white' :
                        game.status === 'cancelled' ? 'bg-red-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {game.status === 'completed' ? '✅ Завершена' :
                         game.status === 'in_progress' ? '🎮 Идет сейчас' :
                         game.status === 'cancelled' ? '❌ Отменена' :
                         game.status}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {game.started_at ? new Date(game.started_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '--:--'}
                    </div>
                  </div>
                  
                  {/* Game details */}
                  <div className="text-gray-300 text-sm">
                    <p>ID: {game.id}</p>
                    <p>Сессия: {game.session_id}</p>
                    {game.winner_participant_id && (
                      <p className="text-mint">Победитель: {game.winner_participant_id}</p>
                    )}
                    {game.completed_at && game.started_at && (
                      <p>Длительность: {Math.floor((new Date(game.completed_at).getTime() - new Date(game.started_at).getTime()) / 1000 / 60)}:{(Math.floor((new Date(game.completed_at).getTime() - new Date(game.started_at).getTime()) / 1000) % 60).toString().padStart(2, '0')}</p>
                    )}
                  </div>
                  
                  {/* 🔄 ДОБАВЛЯЕМ: подсказка о клике */}
                  <div className="text-center mt-3 pt-3 border-t border-gray-600">
                    <span className="text-xs text-gray-400">👆 Нажмите, чтобы открыть игру</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Controls - Завершить игру (перемещено вниз) */}
        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-6">
          <div className="flex gap-3">
            <button
              onClick={handleEndGame}
              className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 font-semibold text-base transition-all duration-250"
            >
              🏁 Завершить игру
            </button>
          </div>
        </div>
      </main>

      {/* Score Modal */}
      <ScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        playerName={selectedPlayer?.name || ''}
        onConfirm={handleScoreConfirm}
      />

      {/* End Game Modal */}
      <EndGameModal
        isOpen={isEndGameModalOpen}
        onClose={() => setIsEndGameModalOpen(false)}
        onConfirm={handleConfirmEndGame}
      />
    </div>
  )
}
