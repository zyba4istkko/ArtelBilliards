import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  GameHeader, 
  Scoreboard, 
  GameHistory, 
  ActionPanel, 
  GameControls,
  ScoreModal,
  GameLog,
  PlayerCard,
  EndGameModal
} from '../components/ui'
import { SessionService } from '../api/services/sessionService'
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

interface LogEntry {
  id: string
  text: string
  icon: string
  color?: string
  playerName: string
  timestamp: string
  addedBy: string
  canEdit?: boolean
}

export default function GameSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Real data from API
  const [session, setSession] = useState<GameSession | null>(null)
  const [games, setGames] = useState<Game[]>([])
  
  // Game state
  const [isPaused, setIsPaused] = useState(false)
  const [gameStartTime] = useState(Date.now())
  const [currentGameNumber, setCurrentGameNumber] = useState(1)
  
  // Players state (transformed from API data)
  const [players, setPlayers] = useState<Player[]>([])

  // Log entries
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

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
        id: sp.user_id,
        name: sp.display_name || sp.username,
        avatar: (sp.display_name || sp.username).charAt(0).toUpperCase(),
        points: sp.current_score || 0,
        money: (sp.session_balance_rubles || 0) * 10, // Convert to game currency
        balls: [], // TODO: Add balls from game events
        fouls: 0   // TODO: Add fouls from game events
      }))
      setPlayers(transformedPlayers)
      
      // TODO: Load games data when GameService.getGames() is implemented
      // const gamesData = await GameService.getGames(sessionId)
      // setGames(gamesData)
      
      // For now, create a mock game with real players
      if (playersData.length > 0) {
        const mockGame: Game = {
          id: '1',
          session_id: sessionId,
          game_number: 1,
          status: 'active',
          scores: playersData.reduce((acc, sp) => ({ ...acc, [sp.user_id]: sp.current_score || 0 }), {}),
          events: [],
          started_at: new Date().toISOString()
        }
        setGames([mockGame])
      } else {
        setGames([])
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

  const handleNextGame = () => {
    // Logic for starting next game
    setCurrentGameNumber(prev => prev + 1)
    // Reset players for new game
    setPlayers(prev => prev.map(p => ({ ...p, points: 0, balls: [], fouls: 0 })))
    // Add log entry
    addLogEntry('Началась новая игра!', '🎮', undefined, 'Система')
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
          addLogEntry(logText, '⚫', getBallColor(ball.name), p.name)

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
          addLogEntry(logText, '❌', '#ef4444', p.name)

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
      if (game.status === 'active') {
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

  const addLogEntry = (text: string, icon: string, color?: string, addedBy: string = 'Система') => {
    const now = new Date()
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const newEntry: LogEntry = {
      id: Date.now().toString(),
      text,
      icon,
      color,
      playerName: selectedPlayer?.name || '',
      timestamp: timeString,
      addedBy,
      canEdit: addedBy !== 'Система'
    }

    setLogEntries(prev => [newEntry, ...prev.slice(0, 14)]) // Keep max 15 entries
  }

  const getBallColor = (ballName: string) => {
    const colors: Record<string, string> = {
      'Красный': '#f44336',
      'Желтый': '#ffeb3b',
      'Зеленый': '#4caf50',
      'Коричневый': '#8d6e63',
      'Синий': '#2196f3',
      'Розовый': '#e91e63',
      'Черный': '#212121',
      'Белый': '#ffffff'
    }
    return colors[ballName] || '#ffffff'
  }

  const handleEditLogEntry = (entryId: string) => {
    // Find the entry and open score modal for the player
    const entry = logEntries.find(e => e.id === entryId)
    if (entry) {
      const player = players.find(p => p.name === entry.playerName)
      if (player) {
        setSelectedPlayer(player)
        setIsScoreModalOpen(true)
      }
    }
  }

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
        playerCount={session.current_players}
        gameCount={games.length}
        onBack={handleBackToSession}
      />

      <main className="max-w-4xl mx-auto px-4 pb-20">
        {/* Game Controls */}
        <ActionPanel
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResume}
          onEndGame={handleEndGame}
          onNextGame={handleNextGame}
          canStartNextGame={games.length === 0}
        />

        {/* Players Section */}
        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-bold text-mint mb-4 text-center">
            Игроки ({players.length})
          </h2>
          
          {players.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Игроки не найдены</p>
            </div>
          ) : (
            <div className="space-y-3">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onAddScore={() => handleAddScore(player)}
                  isLeading={leadingPlayer ? player.id === leadingPlayer.id : false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Games Section */}
        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-6">
          <h2 className="text-base font-bold text-mint mb-4 text-center">
            Игры ({games.length})
          </h2>
          
          {games.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Игр еще нет</p>
              <p className="text-sm text-gray-500 mt-2">Начните первую игру</p>
            </div>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <div key={game.id} className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-white">Игра #{game.game_number} - {game.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Log */}
        <GameLog
          entries={logEntries}
          onEditEntry={handleEditLogEntry}
        />

        {/* End Game Section */}
        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-4 text-center">
          <button
            className="bg-gray-700 text-white border border-gray-600 rounded-full px-8 py-4 font-semibold text-base hover:bg-gray-600 hover:border-gray-500 transition-all duration-250"
            onClick={handleEndGame}
          >
            🏁 Завершить игру
          </button>
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
