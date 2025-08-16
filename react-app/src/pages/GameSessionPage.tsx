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
  EndGameModal,
  GamePlayersSummary,
  SessionStatisticsCard
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
  
  // 🔄 ДОБАВЛЯЕМ: Состояние для агрегированной статистики сессии
  const [sessionStatistics, setSessionStatistics] = useState<Record<string, {
    totalPoints: number
    totalBalls: number
    totalFouls: number
    totalEarned: number
    totalPaid: number
    netBalance: number
    gamesPlayed: number
    wins: number
  }>>({})
  
  // 🔄 ДОБАВЛЯЕМ: Состояние для данных игроков каждой игры
  const [gamePlayersData, setGamePlayersData] = useState<Record<string, any[]>>({})
  
  // Game state
  const [isPaused, setIsPaused] = useState(false)
  const [gameStartTime] = useState(Date.now())
  const [currentGameNumber, setCurrentGameNumber] = useState(1)
  const [currentTime, setCurrentTime] = useState(Date.now())
  
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

  // 🔄 ДОБАВЛЯЕМ: Обновление времени каждую секунду для активных игр
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // 🔄 НОВАЯ ФУНКЦИЯ: Загрузка данных игроков для конкретной игры
  const loadGamePlayersData = async (gameId: string, gameData?: any) => {
    try {
      // Загружаем события игры
      const gameEvents = await gameService.getGameEvents(gameId)
      console.log(`🎮 GameSessionPage: События игры ${gameId}:`, gameEvents)
      
      // Получаем участников сессии
      const participants = await SessionService.getSessionPlayers(sessionId!)
      
      // Создаем объект для хранения данных игроков
      const gamePlayers: Record<string, {
        id: string
        name: string
        avatar: string
        points: number
        money: number
        netBalance: number
        balls: Array<{
          id: string
          type: string
          points: number
          name: string
          color: string
          timestamp: string
        }>
        fouls: Array<{
          id: string
          timestamp: string
        }>
      }> = {}
      
      // Инициализируем игроков
      participants.forEach(participant => {
        gamePlayers[participant.id] = {
          id: participant.id,
          name: participant.display_name,
          avatar: participant.display_name.charAt(0).toUpperCase(),
          points: 0,
          money: 0,
          netBalance: 0,
          balls: [],
          fouls: []
        }
      })
      
      // Обрабатываем события игры
      gameEvents.forEach((event: any) => {
        const participantId = event.participant_id
        if (gamePlayers[participantId]) {
          if (event.event_type === 'shot') {
            // Забитый шар
            const eventData = event.event_data
            if (eventData && eventData.points) {
              const ball = {
                id: event.id,
                type: eventData.ball_type || 'white',
                points: eventData.points,
                name: eventData.ball_name || 'Шар',
                color: '#ffffff', // Будет заменено в компоненте
                timestamp: eventData.timestamp || '00:00'
              }
              
              gamePlayers[participantId].balls.push(ball)
              gamePlayers[participantId].points += eventData.points
              gamePlayers[participantId].money += eventData.points * 50 // 50₽ за очко
            }
          } else if (event.event_type === 'foul') {
            // Штраф
            const eventData = event.event_data
            const foul = {
              id: event.id,
              timestamp: eventData?.timestamp || '00:00'
            }
            
            gamePlayers[participantId].fouls.push(foul)
            gamePlayers[participantId].points -= 1
            gamePlayers[participantId].money -= 50 // 50₽ за штраф
          }
        }
      })
      
      // 🔄 РАССЧИТЫВАЕМ: Чистый баланс для каждого игрока (netBalance)
      // ИСПРАВЛЯЕМ: Используем current_queue из игры, а не queue_position из участников
      
      // Получаем данные игры, чтобы узнать current_queue
      // Если gameData не передан, ищем в массиве games
      let gameInfo = gameData
      if (!gameInfo) {
        gameInfo = games.find(g => g.id === gameId)
      }
      
      if (!gameInfo) {
        console.error(`🎮 GameSessionPage: Игра ${gameId} не найдена в списке игр`)
        console.error(`🎮 GameSessionPage: gameData:`, gameData)
        console.error(`🎮 GameSessionPage: games.length:`, games.length)
        console.error(`🎮 GameSessionPage: games IDs:`, games.map(g => g.id))
        return []
      }
      
      console.log(`🎮 GameSessionPage: Данные игры ${gameId}:`, gameInfo)
      console.log(`🎮 GameSessionPage: game_data игры:`, gameInfo.game_data)
      
      // 🔄 ИСПРАВЛЯЕМ: Ищем current_queue в правильном месте - game_data
      let currentQueue = gameInfo.current_queue
      if (!currentQueue && gameInfo.game_data) {
        currentQueue = gameInfo.game_data.current_queue
        console.log(`🎮 GameSessionPage: current_queue найден в game_data:`, currentQueue)
      }
      
      console.log(`🎮 GameSessionPage: current_queue игры:`, currentQueue)
      
      let sortedParticipants = [...participants]
      
      if (currentQueue && currentQueue.length > 0) {
        // Сортируем участников согласно current_queue игры
        let queueOrder = currentQueue
        
        // 🔄 ИСПРАВЛЯЕМ: Проверяем, что current_queue это массив
        if (typeof queueOrder === 'string') {
          try {
            queueOrder = JSON.parse(queueOrder)
            console.log(`🎮 GameSessionPage: current_queue распарсен из JSON:`, queueOrder)
          } catch (e) {
            console.error(`🎮 GameSessionPage: Ошибка парсинга current_queue:`, e)
            queueOrder = []
          }
        }
        
        console.log(`🎮 GameSessionPage: queueOrder для сортировки:`, queueOrder)
        console.log(`🎮 GameSessionPage: participants для поиска:`, participants.map(p => ({ id: p.id, name: p.display_name })))
        
        sortedParticipants = queueOrder.map(participantId => {
          const found = participants.find(p => p.id === participantId)
          console.log(`🎮 GameSessionPage: Ищем участника ${participantId}:`, found ? found.display_name : 'НЕ НАЙДЕН')
          return found
        }).filter(Boolean) as any[]
        
        console.log(`🎮 GameSessionPage: Участники отсортированы по current_queue игры:`, 
          sortedParticipants.map(p => `${p.display_name} (${p.id})`))
      } else {
        // Fallback: сортируем по queue_position если current_queue недоступен
        sortedParticipants.sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0))
        console.log(`🎮 GameSessionPage: Используем fallback сортировку по queue_position`)
      }
      
      for (let i = 0; i < sortedParticipants.length; i++) {
        const currentParticipant = sortedParticipants[i]
        const nextParticipant = sortedParticipants[i === sortedParticipants.length - 1 ? 0 : i + 1]
        
        const currentPoints = gamePlayers[currentParticipant.id]?.points || 0
        const nextPoints = gamePlayers[nextParticipant.id]?.points || 0
        
        // Текущий участник получает за свои очки
        const earnedFromPrev = currentPoints * 50 // 50₽ за очко
        // Текущий участник платит следующему за его очки  
        const paidToNext = nextPoints * 50
        
        // Чистый баланс для текущего участника
        const netBalance = earnedFromPrev - paidToNext
        
        console.log(`🎮 ${currentParticipant.display_name}: получает ${earnedFromPrev}₽, платит ${paidToNext}₽, итого: ${netBalance}₽`)
        
        // Обновляем netBalance
        if (gamePlayers[currentParticipant.id]) {
          gamePlayers[currentParticipant.id].netBalance = netBalance
        }
      }
      
      // 🔄 ИСПРАВЛЯЕМ: Возвращаем игроков в правильном порядке сортировки
      // а не в произвольном порядке Object.values()
      return sortedParticipants.map(participant => gamePlayers[participant.id]).filter(Boolean)
    } catch (error) {
      console.error(`❌ GameSessionPage: Ошибка загрузки данных игроков для игры ${gameId}:`, error)
      return []
    }
  }

  // 🔄 НОВАЯ ФУНКЦИЯ: Расчет агрегированной статистики сессии по завершенным играм
  const calculateSessionStatistics = async (games: any[], participants: any[]) => {
    const stats: Record<string, {
      totalPoints: number
      totalBalls: number
      totalFouls: number
      totalEarned: number
      totalPaid: number
      netBalance: number
      gamesPlayed: number
      wins: number
    }> = {}

    // Инициализируем статистику для всех участников
    participants.forEach(participant => {
      stats[participant.id] = {
        totalPoints: 0,
        totalBalls: 0,
        totalFouls: 0,
        totalEarned: 0,
        totalPaid: 0,
        netBalance: 0,
        gamesPlayed: 0,
        wins: 0
      }
    })

    // Агрегируем данные по всем завершенным играм
    for (const game of games) {
      if (game.status === 'completed') {
        // Увеличиваем счетчик сыгранных игр для всех участников
        participants.forEach(participant => {
          stats[participant.id].gamesPlayed++
        })

        // Если есть winner_participant_id, увеличиваем счетчик побед
        if (game.winner_participant_id && stats[game.winner_participant_id]) {
          stats[game.winner_participant_id].wins++
        }

        // 🔄 ДОБАВЛЯЕМ: Загружаем события игры для точного расчета
        try {
          const gameEvents = await gameService.getGameEvents(game.id)
          console.log(`📊 GameSessionPage: События игры ${game.id}:`, gameEvents)
          
          // 🔄 ИСПРАВЛЯЕМ: Правильный расчет чистого баланса как в ActiveGamePage
          // Сначала собираем все события для каждого участника
          const participantEvents: Record<string, { points: number, fouls: number }> = {}
          
          // Инициализируем события для всех участников
          participants.forEach(participant => {
            participantEvents[participant.id] = { points: 0, fouls: 0 }
          })
          
          // Обрабатываем события игры
          gameEvents.forEach((event: any) => {
            const participantId = event.participant_id
            if (participantEvents[participantId]) {
              if (event.event_type === 'shot') {
                // Забитый шар
                const eventData = event.event_data
                if (eventData && eventData.points) {
                  participantEvents[participantId].points += eventData.points
                  stats[participantId].totalPoints += eventData.points
                  stats[participantId].totalBalls++
                }
              } else if (event.event_type === 'foul') {
                // Штраф
                participantEvents[participantId].fouls += 1
                stats[participantId].totalFouls++
                stats[participantId].totalPoints -= 1
              }
            }
          })
          
          // 🔄 РАССЧИТЫВАЕМ: Чистый баланс для каждого участника
          // Логика как в ActiveGamePage: каждый платит следующему за его очки
          const sortedParticipants = [...participants].sort((a, b) => {
            // Сортируем по позиции в очереди или по ID
            return (a.queue_position || 0) - (b.queue_position || 0)
          })
          
          for (let i = 0; i < sortedParticipants.length; i++) {
            const currentParticipant = sortedParticipants[i]
            const nextParticipant = sortedParticipants[i === sortedParticipants.length - 1 ? 0 : i + 1]
            
            const currentPoints = participantEvents[currentParticipant.id]?.points || 0
            const nextPoints = participantEvents[nextParticipant.id]?.points || 0
            
            // Текущий участник получает за свои очки
            const earnedFromPrev = currentPoints * 50 // 50₽ за очко
            // Текущий участник платит следующему за его очки  
            const paidToNext = nextPoints * 50
            
            // Чистый баланс для текущего участника
            const netBalance = earnedFromPrev - paidToNext
            
            console.log(`📊 ${currentParticipant.display_name}: получает ${earnedFromPrev}₽, платит ${paidToNext}₽, итого: ${netBalance}₽`)
            
            // Обновляем статистику
            stats[currentParticipant.id].totalEarned += earnedFromPrev
            stats[currentParticipant.id].totalPaid += paidToNext
            stats[currentParticipant.id].netBalance += netBalance
          }
          
        } catch (error) {
          console.error(`❌ GameSessionPage: Ошибка загрузки событий игры ${game.id}:`, error)
        }
      }
    }

    return stats
  }

  // Load session data from API
  const loadSessionData = async () => {
    if (!sessionId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Load session details
      const sessionData = await SessionService.getSession(sessionId)
      
      // Load template data if available
      if (sessionData?.template_id) {
        try {
          const template = await TemplateService.getTemplate(sessionData.template_id)
          sessionData.template = template
        } catch (templateError) {
          console.error('❌ GameSessionPage: Ошибка загрузки шаблона:', templateError)
        }
      }
      
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
          
          // 🔄 ДОБАВЛЯЕМ: Рассчитываем агрегированную статистику
          const sessionStats = await calculateSessionStatistics(gamesData, playersData)
          console.log('📊 GameSessionPage: Агрегированная статистика сессии:', sessionStats)
          setSessionStatistics(sessionStats)
          
          // 🔄 ДОБАВЛЯЕМ: Автоматически загружаем данные игроков для всех завершенных игр
          const completedGames = gamesData.filter(game => game.status === 'completed')
          console.log('🎮 GameSessionPage: Завершенных игр для загрузки данных:', completedGames.length)
          
          for (const game of completedGames) {
            try {
              console.log('🎮 GameSessionPage: Загружаем данные игроков для игры:', game.id)
              const playersData = await loadGamePlayersData(game.id, game)
              setGamePlayersData(prev => ({
                ...prev,
                [game.id]: playersData
              }))
              console.log('🎮 GameSessionPage: Данные игроков загружены для игры:', game.id, playersData)
            } catch (error) {
              console.error(`❌ GameSessionPage: Ошибка загрузки данных игроков для игры ${game.id}:`, error)
            }
          }
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
  const handleGameClick = async (gameId: string) => {
    console.log('🎮 GameSessionPage: Переходим к игре:', gameId)
    
    // 🔄 ДОБАВЛЯЕМ: Загружаем данные игроков для завершенной игры
    const game = games.find(g => g.id === gameId)
    if (game && game.status === 'completed' && !gamePlayersData[gameId]) {
      try {
        console.log('🎮 GameSessionPage: Загружаем данные игроков для завершенной игры:', gameId)
        const playersData = await loadGamePlayersData(gameId)
        setGamePlayersData(prev => ({
          ...prev,
          [gameId]: playersData
        }))
        console.log('🎮 GameSessionPage: Данные игроков загружены:', playersData)
      } catch (error) {
        console.error('❌ GameSessionPage: Ошибка загрузки данных игроков:', error)
      }
    }
    
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
        sessionCreatedAt={session.created_at}
        sessionEndedAt={session.ended_at}
        templateData={session.template_id ? {
          paymentDirection: session.template?.rules?.payment_direction || 'По часовой',
          pointValueRubles: session.template?.rules?.point_value_rubles || 50,
          queueAlgorithm: session.template?.rules?.queue_algorithm || 'random_no_repeat',
          ballsToWin: session.template?.rules?.balls_to_win || 15
        } : undefined}
        onBack={handleBackToSession}
      />

      <main className="max-w-4xl mx-auto px-4 pb-20">
        {/* Scoreboard - Общий счет сессии */}
        <SessionStatisticsCard 
          statistics={sessionStatistics}
          participants={(session.participants || []).map(p => ({
            id: p.id,
            display_name: p.display_name,
            queue_position: p.queue_position
          }))}
        />

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
                        {game.status === 'completed' ? 'Завершена' :
                         game.status === 'in_progress' ? 'Идет сейчас' :
                         game.status === 'cancelled' ? 'Отменена' :
                         game.status}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {game.status === 'completed' && game.completed_at && game.started_at ? (
                        (() => {
                          const startTime = new Date(game.started_at).getTime()
                          const endTime = new Date(game.completed_at).getTime()
                          const durationMs = endTime - startTime
                          const durationMinutes = Math.floor(durationMs / (1000 * 60))
                          const durationSeconds = Math.floor((durationMs % (1000 * 60)) / 1000)
                          return `⏱️ ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`
                        })()
                      ) : game.status === 'in_progress' ? (
                        ''
                      ) : '--:--'}
                    </div>
                  </div>
                  
                  {/* 🔄 ОБНОВЛЯЕМ: Показываем GamePlayersSummary для завершенных игр */}
                  {game.status === 'completed' ? (
                    <div className="mb-3">
                      {gamePlayersData[game.id] ? (
                        <GamePlayersSummary 
                          players={gamePlayersData[game.id]} 
                          isReadOnly={true}
                        />
                      ) : (
                        <div className="text-center py-2 text-gray-400">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mint mx-auto mb-2"></div>
                          <p className="text-xs">Загружаем результаты...</p>
                        </div>
                      )}
                    </div>
                  ) : game.status === 'in_progress' ? (
                    <div className="text-center py-4 text-blue-400">
                      <div className="text-lg mb-2">Игра идет</div>
                      <div className="text-sm">Результаты будут доступны после завершения</div>
                    </div>
                  ) : game.status === 'cancelled' ? (
                    <div className="text-center py-4 text-red-400">
                      <div className="text-sm">Игра отменена</div>
                    </div>
                  ) : (
                    <div className="text-gray-300 text-sm">
                      <p>ID: {game.id}</p>
                      <p>Сессия: {game.session_id}</p>
                    </div>
                  )}
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
