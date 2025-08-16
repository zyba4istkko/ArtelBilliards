import React from 'react'

interface Player {
  id: string
  name: string
  avatar: string
  points: number
  money: number
  isActive?: boolean
}

interface ScoreboardProps {
  players: Player[]
  title?: string
}

export default function Scoreboard({ players, title = "Общий счет сессии" }: ScoreboardProps) {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-bold text-mint text-center mb-4">
        {title}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {players.map((player) => (
          <div
            key={player.id}
            className={`bg-gray-700 rounded-xl p-3 text-center relative transition-all duration-250 ${
              player.isActive 
                ? 'border-2 border-mint bg-mint/10' 
                : 'border border-gray-600'
            }`}
          >
            {player.isActive && (
              <div className="absolute top-2 right-2 text-base">
                🎯
              </div>
            )}
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-peach flex items-center justify-center font-bold text-sm mx-auto mb-1">
              {player.avatar}
            </div>
            
            <div className="font-bold text-sm text-white mb-1">
              {player.name}
            </div>
            
            <div className="text-xl font-extrabold text-mint mb-1">
              {player.points}
            </div>
            
            <div className="text-xs text-gray-300">
              {player.money > 0 ? '+' : ''}{player.money} ₽
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
