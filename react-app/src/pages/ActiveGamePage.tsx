import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Avatar, 
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Chip,
  Divider
} from '@nextui-org/react'
import { ArrowLeft, Clock, Plus, Edit2, X } from 'lucide-react'
import { gameService } from '../api/services/gameService'
import { SessionService } from '../api/services/sessionService'

interface ActiveGamePageProps {
  // Props будут добавлены по мере необходимости
}

interface Player {
  id: string
  name: string
  avatar: string
  points: number
  money: number
  balls: Ball[]
  fouls: Foul[]
}

interface Ball {
  id: string
  type: 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black' | 'white'
  points: number
  name: string
  color: string
}

interface Foul {
  id: string
  timestamp: string
  tag?: string
}

interface LogEntry {
  id: string
  type: 'ball' | 'foul' | 'turn' | 'game_start'
  playerName: string
  description: string
  points: number
  timestamp: string
  addedBy: string
  tag?: string
  isDeleted?: boolean
}

export default function ActiveGamePage({}: ActiveGamePageProps) {
  const { gameId } = useParams()  // 🔄 ИСПРАВЛЯЕМ: sessionId -> gameId
  const navigate = useNavigate()
  
  // State
  const [gameStartTime] = useState(Date.now())
  const [gameTime, setGameTime] = useState('00:00')
  const [currentUser] = useState('Ты') // Текущий пользователь
  const [isCreator] = useState(true) // Только creator может удалять записи
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentGame, setCurrentGame] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  
  const [players, setPlayers] = useState<Player[]>([
    {
      id: '1',
      name: 'Ты',
      avatar: 'Т',
      points: 0,
      money: 0,
      balls: [],
      fouls: []
    },
    {
      id: '2',
      name: 'Игорь',
      avatar: 'И',
      points: 0,
      money: 0,
      balls: [],
      fouls: []
    },
    {
      id: '3',
      name: 'Александр',
      avatar: 'А',
      points: 0,
      money: 0,
      balls: [],
      fouls: []
    }
  ])
  
  const [logEntries, setLogEntries] = useState<LogEntry[]>([
    {
      id: '1',
      type: 'game_start',
      playerName: 'Система',
      description: 'Игра началась! Первый ход: Ты',
      points: 0,
      timestamp: '00:00',
      addedBy: 'Система',
      isDeleted: false
    }
  ])
  
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false)
  const [isEndGameModalOpen, setIsEndGameModalOpen] = useState(false)
  const [isEditLogModalOpen, setIsEditLogModalOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [customDescription, setCustomDescription] = useState('')
  const [editingLogEntry, setEditingLogEntry] = useState<LogEntry | null>(null)

  // Effect для инициализации игры
  useEffect(() => {
    const initializeGame = async () => {
      if (!gameId) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🎮 ActiveGamePage: Инициализируем игру:', gameId)
        
        // 1. Получаем информацию об игре
        const gameData = await gameService.getGame(gameId)
        console.log('✅ Игра получена:', gameData)
        setCurrentGame(gameData)
        
        // 2. Получаем информацию о сессии по session_id из игры
        const sessionData = await SessionService.getSession(gameData.session_id)
        console.log('✅ Сессия получена:', sessionData)
        setSession(sessionData)
        
        // 3. Получаем участников сессии
        const participants = await SessionService.getSessionParticipants(gameData.session_id)
        console.log('✅ Участники получены:', participants)
        
        // 4. Преобразуем участников в формат Player
        const transformedPlayers = participants.map((participant: any) => ({
          id: participant.id,
          name: participant.display_name || 'Игрок',
          avatar: (participant.display_name || 'И')[0].toUpperCase(),
          points: participant.current_score || 0,
          money: participant.session_balance_rubles || 0,
          balls: [],
          fouls: []
        }))
        
        setPlayers(transformedPlayers)
        setIsLoading(false)
        
      } catch (error: any) {
        console.error('❌ Ошибка инициализации игры:', error)
        setError(error.message || 'Ошибка загрузки игры')
        setIsLoading(false)
      }
    }
    
    initializeGame()
  }, [gameId])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      setGameTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStartTime])

  // Ball definitions
  const ballTypes: Ball[] = [
    { id: 'red', type: 'red', points: 1, name: 'Красный', color: '#f44336' },
    { id: 'yellow', type: 'yellow', points: 2, name: 'Желтый', color: '#ffeb3b' },
    { id: 'green', type: 'green', points: 3, name: 'Зеленый', color: '#4caf50' },
    { id: 'brown', type: 'brown', points: 4, name: 'Коричневый', color: '#8d6e63' },
    { id: 'blue', type: 'blue', points: 5, name: 'Синий', color: '#2196f3' },
    { id: 'pink', type: 'pink', points: 6, name: 'Розовый', color: '#e91e63' },
    { id: 'black', type: 'black', points: 7, name: 'Черный', color: '#212121' }
  ]

  const tagOptions = ['Стандарт', 'Подстава', 'Серия', 'От борта', 'Сложный', 'Случайный']

  // Handlers
  const handleBackToSession = () => {
    if (currentGame && currentGame.session_id) {
      navigate(`/game-session/${currentGame.session_id}`)
    } else {
      navigate('/dashboard') // Fallback если нет session_id
    }
  }

  const handleOpenScoreModal = (player: Player) => {
    setSelectedPlayer(player)
    setIsScoreModalOpen(true)
    resetModalState()
  }

  const handleCloseScoreModal = () => {
    setIsScoreModalOpen(false)
    setSelectedPlayer(null)
    resetModalState()
  }

  const resetModalState = () => {
    setSelectedBall(null)
    setSelectedTag('')
    setCustomDescription('')
  }

  const handleSelectBall = (ball: Ball) => {
    setSelectedBall(ball)
  }

  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag === selectedTag ? '' : tag)
  }

  const handleAddScore = () => {
    if (!selectedPlayer || !selectedBall) return

    const updatedPlayers = players.map(player => {
      if (player.id === selectedPlayer.id) {
        const newBall = { ...selectedBall, id: `${Date.now()}` }
        return {
          ...player,
          points: player.points + selectedBall.points,
          money: player.money + (selectedBall.points * 10),
          balls: [...player.balls, newBall]
        }
      }
      return player
    })

    setPlayers(updatedPlayers)

    // Add log entry
    const newLogEntry: LogEntry = {
      id: `${Date.now()}`,
      type: 'ball',
      playerName: selectedPlayer.name,
      description: `${selectedPlayer.name} забил ${selectedBall.name.toLowerCase()} шар (+${selectedBall.points})`,
      points: selectedBall.points,
      timestamp: gameTime,
      addedBy: selectedPlayer.name,
      tag: selectedTag || undefined,
      isDeleted: false
    }

    setLogEntries(prev => [newLogEntry, ...prev])
    handleCloseScoreModal()
  }

  const handleAddFoul = () => {
    if (!selectedPlayer) return

    const updatedPlayers = players.map(player => {
      if (player.id === selectedPlayer.id) {
        const newFoul: Foul = {
          id: `${Date.now()}`,
          timestamp: gameTime,
          tag: selectedTag || undefined
        }
        
        // Пересчитываем очки и деньги
        const totalPoints = player.points - 1 // -1 за штраф
        const totalMoney = totalPoints * 10 // 10₽ за каждое очко
        
        return {
          ...player,
          points: totalPoints,
          money: totalMoney,
          fouls: [...player.fouls, newFoul]
        }
      }
      return player
    })

    setPlayers(updatedPlayers)

    // Add log entry
    const newLogEntry: LogEntry = {
      id: `${Date.now()}`,
      type: 'foul',
      playerName: selectedPlayer.name,
      description: `${selectedPlayer.name} совершил штраф (-1 очко)`,
      points: -1,
      timestamp: gameTime,
      addedBy: selectedPlayer.name,
      tag: selectedTag || undefined,
      isDeleted: false
    }

    setLogEntries(prev => [newLogEntry, ...prev])
    handleCloseScoreModal()
  }

  const handleEditLogEntry = (entry: LogEntry) => {
    setEditingLogEntry(entry)
    setIsEditLogModalOpen(true)
  }

  const handleUpdateLogEntry = (updatedEntry: LogEntry) => {
    setLogEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ))
    setIsEditLogModalOpen(false)
    setEditingLogEntry(null)
  }

  const handleDeleteLogEntry = (entryId: string) => {
    // Вместо удаления помечаем запись как удаленную
    setLogEntries(prev => {
      const updated = prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, isDeleted: true }
          : entry
      )
      
      // Пересчитываем состояние игры с обновленными записями
      recalculateGameState(updated)
      
      return updated
    })
    
    setIsEditLogModalOpen(false)
    setEditingLogEntry(null)
  }

  const recalculateGameState = (entries?: LogEntry[]) => {
    // Используем переданные записи или текущее состояние
    const logToUse = entries || logEntries
    
    // Создаем копию игроков с начальными значениями
    const updatedPlayers = players.map(player => ({
      ...player,
      points: 0,
      money: 0,
      balls: [],
      fouls: []
    }))

    // Проходим по всем активным записям лога (не удаленным)
    const activeEntries = logToUse.filter(entry => !entry.isDeleted)
    
    activeEntries.forEach(entry => {
      const player = updatedPlayers.find(p => p.name === entry.playerName)
      if (!player) return

      if (entry.type === 'ball') {
        // Находим шар по описанию
        const ball = ballTypes.find(ball => 
          entry.description.toLowerCase().includes(ball.name.toLowerCase())
        )
        if (ball) {
          const newBall = { ...ball, id: entry.id }
          player.balls.push(newBall)
          player.points += ball.points
          player.money += (ball.points * 10)
        }
      } else if (entry.type === 'foul') {
        // Добавляем штраф
        const newFoul: Foul = {
          id: entry.id,
          timestamp: entry.timestamp,
          tag: entry.tag
        }
        player.fouls.push(newFoul)
        player.points -= 1
        player.money = player.points * 10
      }
    })

    setPlayers(updatedPlayers)
  }

  // Обновляем handleEndGame для работы с API
  const handleEndGame = () => {
    setIsEndGameModalOpen(true)
  }

  const handleConfirmEndGame = async () => {
    if (!currentGame) return
    
    try {
      // Завершаем игру через API
      await gameService.completeGame(currentGame.id)
      
      // Возвращаемся к сессии
      if (currentGame && currentGame.session_id) {
        navigate(`/game-session/${currentGame.session_id}`)
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      console.error('❌ Ошибка завершения игры:', err)
      setError(err.message || 'Ошибка завершения игры')
    }
  }

  const getBallIcon = (ball: Ball) => (
    <div 
      className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
      style={{ 
        backgroundColor: ball.color,
        boxShadow: `inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.2)`
      }}
    />
  )

  const getFoulIcon = () => (
    <div className="w-8 h-8 flex items-center justify-center text-red-500 font-bold text-xl">
      ✕
    </div>
  )

  const getEventIcon = (entry: LogEntry) => {
    if (entry.type === 'ball') {
      // Находим цвет шара по описанию
      const ballColor = ballTypes.find(ball => 
        entry.description.toLowerCase().includes(ball.name.toLowerCase())
      )?.color || '#212121'
      
      return (
        <div 
          className="w-6 h-6 rounded-full shadow-md"
          style={{ backgroundColor: ballColor }}
        />
      )
    }
    
    if (entry.type === 'foul') {
      return <div className="text-red-500 text-xl">❌</div>
    }
    
    if (entry.type === 'turn') {
      return <div className="text-blue-500 text-xl">🔄</div>
    }
    
    if (entry.type === 'game_start') {
      return <div className="text-green-500 text-xl">🎯</div>
    }
    
    return <div className="text-gray-400 text-xl">⚫</div>
  }

  // Если загрузка - показываем индикатор
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mint mx-auto mb-4"></div>
          <div className="text-xl text-mint">Загрузка игры...</div>
        </div>
      </div>
    )
  }

  // Если ошибка - показываем сообщение
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Ошибка</div>
          <div className="text-gray-300 mb-6">{error}</div>
          <Button 
            color="primary" 
            onClick={() => {
              if (currentGame && currentGame.session_id) {
                navigate(`/game-session/${currentGame.session_id}`)
              } else {
                navigate('/dashboard')
              }
            }}
          >
            Вернуться к сессии
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-600 py-4 mb-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                className="text-mint hover:bg-gray-700"
                onClick={handleBackToSession}
              >
                <ArrowLeft size={18} />
              </Button>
              
              <div>
                <div className="text-lg font-bold text-white">
                  🎱 {session?.name || 'Колхоз'} - Игра #{currentGame?.game_number || '1'}
                </div>
                <div className="text-xs text-gray-300">
                  {players.length} игрока • До последнего шара
                  {currentGame?.game_data?.queue_algorithm && (
                    <span className="ml-2">
                      • {currentGame.game_data.queue_algorithm === 'random_no_repeat' ? 'Рандом без повторов' : 
                          currentGame.game_data.queue_algorithm === 'always_random' ? 'Всегда рандом' : 'Ручная очередь'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full">
              <Clock className="text-mint" size={16} />
              <span className="font-mono font-bold text-white text-sm">
                {gameTime}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-20">
        {/* Players Section */}
        <Card className="bg-gray-800 border border-gray-600 mb-6">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold text-mint text-center w-full">Игроки</h2>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-4">
              {players.map((player) => (
                <div key={player.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={player.avatar} 
                      className="bg-gradient-to-br from-coral to-peach text-white font-bold"
                    />
                    <div className="max-w-32">
                      <div className="font-bold text-white truncate">{player.name}</div>
                      <div className="text-sm text-mint">{player.points} очков</div>
                      <div className="text-xs text-gray-300">
                        {player.money >= 0 ? '+' : ''}{player.money} ₽
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap ml-4">
                    {/* Сначала отображаем все шары и штрафы в порядке добавления */}
                    {[...player.balls, ...player.fouls].sort((a, b) => {
                      // Сортируем по времени добавления (по id)
                      const aTime = parseInt(a.id)
                      const bTime = parseInt(b.id)
                      return aTime - bTime
                    }).map((item) => (
                      <div key={item.id}>
                        {'type' in item ? getBallIcon(item as Ball) : getFoulIcon()}
                      </div>
                    ))}
                  </div>
                  
                  <div className="ml-auto">
                    <Button
                      isIconOnly
                      color="success"
                      variant="solid"
                      size="lg"
                      onClick={() => handleOpenScoreModal(player)}
                    >
                      <Plus size={20} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Game Log */}
        <Card className="bg-gray-800 border border-gray-600 mb-6">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-bold text-mint">События игры</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {logEntries.map((entry) => (
                <div key={entry.id} className={`flex justify-between items-start p-3 rounded-lg ${
                  entry.isDeleted 
                    ? 'bg-gray-600 border border-gray-500 opacity-60' 
                    : 'bg-gray-700'
                }`}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-lg">
                      {getEventIcon(entry)}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${
                        entry.isDeleted ? 'text-gray-400 line-through' : 'text-white'
                      }`}>
                        {entry.isDeleted ? `${entry.description} (УДАЛЕНО)` : entry.description}
                      </div>
                      {entry.tag && !entry.isDeleted && (
                        <Chip size="sm" variant="flat" className="mt-1">
                          {entry.tag}
                        </Chip>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Добавил: {entry.addedBy}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Показываем кнопку редактирования только creator и только для неудаленных записей */}
                    {!entry.isDeleted && isCreator && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-gray-400 hover:text-white"
                        onClick={() => handleEditLogEntry(entry)}
                      >
                        <Edit2 size={16} />
                      </Button>
                    )}
                    <div className="text-xs text-gray-300 font-mono">
                      {entry.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* End Game Section */}
        <Card className="bg-gray-800 border border-gray-600">
          <CardBody className="text-center">
            <Button
              color="danger"
              variant="bordered"
              size="lg"
              onClick={handleEndGame}
              className="w-full max-w-xs"
            >
              🏁 Завершить игру
            </Button>
          </CardBody>
        </Card>
      </main>

      {/* Score Modal */}
      <Modal 
        isOpen={isScoreModalOpen} 
        onClose={handleCloseScoreModal}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-gray-800 border border-gray-600 rounded-xl",
          header: "bg-gray-800 text-white rounded-t-xl",
          body: "bg-gray-800 text-white",
          footer: "bg-gray-800 rounded-b-xl"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-white">Добавить очки - {selectedPlayer?.name}</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
               {/* Ball Selection */}
               <div>
                 <h4 className="text-lg font-semibold text-mint mb-4">Забитый шар</h4>
                 <div className="flex flex-wrap gap-8 justify-center">
                   {ballTypes.map((ball) => (
                     <Button
                       key={ball.id}
                       variant={selectedBall?.id === ball.id ? "solid" : "bordered"}
                       color={selectedBall?.id === ball.id ? "primary" : "default"}
                       isIconOnly
                       className={`!w-20 !h-20 !p-0 rounded-lg transition-all ${
                         selectedBall?.id === ball.id 
                           ? "bg-white text-black" 
                           : "bg-gray-700 border-gray-500 text-white hover:bg-gray-600"
                       }`}
                       onClick={() => handleSelectBall(ball)}
                     >
                       <div className="flex flex-col items-center gap-1">
                         <div 
                           className="w-6 h-6 rounded-full shadow-md"
                           style={{ 
                             backgroundColor: ball.color,
                             boxShadow: `inset -1px -1px 3px rgba(0,0,0,0.3), inset 1px 1px 3px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.2)`
                           }}
                         />
                         <div className={`text-xs font-medium ${
                           selectedBall?.id === ball.id ? "text-black" : "text-mint"
                         }`}>
                           +{ball.points}
                         </div>
                       </div>
                     </Button>
                   ))}
                   
                   {/* Foul Button */}
                   <Button
                     variant="bordered"
                     color="danger"
                     isIconOnly
                     className={`!w-20 !h-20 !p-0 rounded-lg ${
                       selectedBall === null && !selectedPlayer
                         ? "bg-red-600 text-white hover:bg-red-700" 
                         : "bg-gray-700 border-red-500 text-red-500 hover:bg-gray-600"
                     }`}
                     onClick={() => setSelectedBall(null)}
                   >
                     <div className="flex flex-col items-center gap-1">
                       <div className="w-6 h-6 flex items-center justify-center text-red-500 font-bold text-xl">
                         ✕
                       </div>
                       <div className="text-xs font-medium text-white">-1</div>
                     </div>
                   </Button>
                 </div>
               </div>

              <Divider className="bg-gray-600" />

              {/* Tag Selection */}
              <div>
                <h4 className="text-lg font-semibold text-mint mb-4">Тег (необязательно)</h4>
                <div className="flex flex-wrap gap-3">
                  {tagOptions.map((tag) => (
                    <Chip
                      key={tag}
                      variant={selectedTag === tag ? "solid" : "bordered"}
                      color={selectedTag === tag ? "primary" : "default"}
                      className={`cursor-pointer px-4 py-2 ${
                        selectedTag === tag 
                          ? "bg-mint text-white" 
                          : "bg-gray-700 border-gray-500 text-white hover:bg-gray-600"
                      }`}
                      onClick={() => handleSelectTag(tag)}
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Custom Description */}
              <div>
                <Input
                  label="Описание (необязательно)"
                  placeholder="Введите описание..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  variant="bordered"
                  classNames={{
                    base: "bg-gray-700",
                    label: "text-white",
                    input: "text-white bg-gray-700 border-gray-500",
                    inputWrapper: "bg-gray-700 border-gray-500 hover:border-gray-400"
                  }}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex justify-between">
            <Button 
              variant="bordered" 
              onPress={handleCloseScoreModal}
              className="bg-gray-700 border-gray-500 text-white hover:bg-gray-600"
            >
              Отмена
            </Button>
            <Button 
              color="success" 
              onPress={selectedBall ? handleAddScore : handleAddFoul}
              isDisabled={!selectedBall && !selectedPlayer}
              className="bg-mint text-white hover:bg-green-600"
            >
              {selectedBall ? 'Добавить очки' : 'Добавить штраф'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Log Entry Modal */}
      <Modal 
        isOpen={isEditLogModalOpen} 
        onClose={() => setIsEditLogModalOpen(false)}
        size="lg"
        classNames={{
          base: "bg-gray-800 border border-gray-600 rounded-xl",
          header: "bg-gray-800 text-white rounded-t-xl",
          body: "bg-gray-800 text-white",
          footer: "bg-gray-800 rounded-b-xl"
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-white">Редактировать событие</h3>
          </ModalHeader>
          <ModalBody>
            {editingLogEntry && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Описание
                  </label>
                  <Input
                    value={editingLogEntry.description}
                    onChange={(e) => setEditingLogEntry({
                      ...editingLogEntry,
                      description: e.target.value
                    })}
                    variant="bordered"
                    classNames={{
                      base: "bg-gray-700",
                      input: "text-white bg-gray-700 border-gray-500",
                      inputWrapper: "bg-gray-700 border-gray-500 hover:border-gray-400"
                    }}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Тег
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => (
                      <Button
                        key={tag}
                        size="sm"
                        variant={editingLogEntry.tag === tag ? "solid" : "bordered"}
                        color={editingLogEntry.tag === tag ? "primary" : "default"}
                        className={`px-3 py-1 ${
                          editingLogEntry.tag === tag 
                            ? "bg-mint text-white" 
                            : "bg-gray-700 border-gray-500 text-white hover:bg-gray-600"
                        }`}
                        onClick={() => setEditingLogEntry({
                          ...editingLogEntry,
                          tag: editingLogEntry.tag === tag ? undefined : tag
                        })}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Игрок: {editingLogEntry.playerName}</span>
                  <span>Очки: {editingLogEntry.points}</span>
                  <span>Время: {editingLogEntry.timestamp}</span>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="flex justify-between">
            {/* Кнопка удаления только для creator */}
            {isCreator && (
              <Button 
                color="danger" 
                variant="bordered"
                onPress={() => editingLogEntry && handleDeleteLogEntry(editingLogEntry.id)}
                className="bg-gray-700 border-red-500 text-red-500 hover:bg-gray-600"
              >
                Удалить
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="bordered" 
                onPress={() => setIsEditLogModalOpen(false)}
                className="bg-gray-700 border-gray-500 text-white hover:bg-gray-600"
              >
                Отмена
              </Button>
              {/* Кнопка сохранения для creator */}
              {isCreator && (
                <Button 
                  color="success" 
                  onPress={() => editingLogEntry && handleUpdateLogEntry(editingLogEntry)}
                  className="bg-mint text-white hover:bg-green-600"
                >
                  Сохранить
                </Button>
              )}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* End Game Modal */}
      <Modal 
        isOpen={isEndGameModalOpen} 
        onClose={() => setIsEndGameModalOpen(false)}
        size="md"
        classNames={{
          base: "bg-gray-800 border border-gray-600 rounded-xl",
          header: "bg-gray-800 text-white rounded-t-xl",
          body: "bg-gray-800 text-white",
          footer: "bg-gray-800 rounded-b-xl"
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-white">Завершить игру?</h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-300">
              Игра будет завершена и результаты сохранены. Вы вернетесь к обзору сессии.
            </p>
          </ModalBody>
          <ModalFooter className="flex justify-between">
            <Button 
              variant="bordered" 
              onPress={() => setIsEndGameModalOpen(false)}
              className="bg-gray-700 border-gray-500 text-white hover:bg-gray-600"
            >
              Отмена
            </Button>
            <Button 
              color="danger" 
              onPress={handleConfirmEndGame}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Завершить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
