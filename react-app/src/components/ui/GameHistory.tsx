import React from 'react'

interface GameBall {
  color: string
  name: string
  points: number
}

interface GamePlayer {
  id: string
  name: string
  avatar: string
  points: number
  balls: GameBall[]
  fouls: number
}

interface Game {
  id: string
  number: number
  status: 'completed' | 'active' | 'upcoming'
  duration?: string
  players: GamePlayer[]
}

interface GameHistoryProps {
  games: Game[]
  title?: string
}

const ballColors = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-400', 
  green: 'bg-green-500',
  brown: 'bg-amber-700',
  blue: 'bg-blue-500',
  pink: 'bg-pink-500',
  black: 'bg-gray-900 border border-gray-600',
  white: 'bg-white border border-gray-600'
}

export default function GameHistory({ games, title = "Игры в сессии" }: GameHistoryProps) {
  const getStatusInfo = (status: Game['status']) => {
    switch (status) {
      case 'completed':
        return { text: '✅ Завершена', className: 'bg-green-500/20 text-green-400' }
      case 'active':
        return { text: '🎮 Идет сейчас', className: 'bg-mint/20 text-mint' }
      case 'upcoming':
        return { text: '⏳ Ожидает', className: 'bg-gray-500/20 text-gray-400' }
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-bold text-mint mb-4">
        {title}
      </h3>
      
      <div className="flex flex-col gap-3">
        {games.map((game) => {
          const statusInfo = getStatusInfo(game.status)
          
          return (
            <div
              key={game.id}
              className={`bg-gray-700 border rounded-xl p-3 transition-all duration-250 ${
                game.status === 'completed' 
                  ? 'border-green-500 bg-green-500/5'
                  : game.status === 'active'
                  ? 'border-mint bg-mint/10 shadow-lg shadow-mint/25'
                  : 'border-gray-500 opacity-70'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    Игра #{game.number}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </div>
                
                {game.duration && (
                  <div className="font-mono font-bold text-xs text-gray-300">
                    {game.duration}
                  </div>
                )}
              </div>
              
              {game.status === 'upcoming' ? (
                <div className="text-center py-3 text-gray-300 italic text-sm">
                  Начнется после завершения текущей игры
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {game.players.map((player) => (
                    <div
                      key={player.id}
                      className={`bg-gray-700 border rounded-lg p-3 flex items-center gap-3 transition-all duration-250 ${
                        player.points === Math.max(...game.players.map(p => p.points))
                          ? 'border-mint bg-mint/10'
                          : 'border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-peach flex items-center justify-center font-bold text-xs text-white">
                          {player.avatar}
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <div className="font-bold text-xs text-white">
                            {player.name}
                          </div>
                          <div className="text-xs text-mint font-semibold">
                            {player.points} очков
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 items-center ml-2 flex-1">
                        {player.balls.map((ball, index) => (
                          <div
                            key={index}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold relative shadow-inner ${
                              ballColors[ball.color as keyof typeof ballColors] || 'bg-gray-500'
                            }`}
                            style={{
                              boxShadow: 'inset -1px -1px 4px rgba(0,0,0,0.3), inset 1px 1px 4px rgba(255,255,255,0.1)'
                            }}
                          >
                            <div className="absolute top-1 left-1.5 w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                          </div>
                        ))}
                        
                        {player.fouls > 0 && (
                          <div className="w-5 h-5 flex items-center justify-center text-xs font-bold text-pink-500">
                            ✕
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
