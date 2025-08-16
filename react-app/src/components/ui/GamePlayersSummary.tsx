import React from 'react'
import { Avatar } from '@nextui-org/react'

interface Ball {
  id: string
  type: string
  points: number
  name: string
  color: string
  timestamp: string
}

interface Foul {
  id: string
  timestamp: string
}

interface Player {
  id: string
  name: string
  avatar: string
  points: number
  money: number
  netBalance?: number
  balls: Ball[]
  fouls: Foul[]
}

interface GamePlayersSummaryProps {
  players: Player[]
  isReadOnly?: boolean
}

export default function GamePlayersSummary({ players, isReadOnly = true }: GamePlayersSummaryProps) {
  // Функция для получения иконки шара (точно как в ActiveGamePage)
  const getBallIcon = (ball: Ball) => {
    const ballColors: Record<string, string> = {
      'white': '#ffffff',
      'red': '#f44336',
      'yellow': '#ffeb3b',
      'green': '#4caf50',
      'brown': '#8d6e63',
      'blue': '#2196f3',
      'pink': '#e91e63',
      'black': '#212121'
    }
    
    const color = ballColors[ball.type] || ball.color
    
    return (
      <div 
        className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
        style={{ 
          backgroundColor: color,
          boxShadow: `inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.2)`
        }}
        title={`${ball.name} (${ball.points} очков)`}
      />
    )
  }

  // Функция для получения иконки штрафа (точно как в ActiveGamePage)
  const getFoulIcon = () => (
    <div 
      className="w-8 h-8 flex items-center justify-center text-red-500 font-bold text-xl"
      title="Штраф (-1 очко)"
    >
      ✕
    </div>
  )

  // 🔄 ИСПРАВЛЯЕМ: НЕ сортируем игроков - они уже приходят отсортированными из GameSessionPage
  // const sortedPlayers = [...players].sort((a, b) => {
  //   // Если есть queue_position, сортируем по нему
  //   if ('queue_position' in a && 'queue_position' in b) {
  //     return (a.queue_position || 0) - (b.queue_position || 0)
  //   }
  //   // Иначе сортируем по ID
  //   return a.id.localeCompare(b.id)
  // })
  
  // Используем игроков в том порядке, в котором они пришли
  const sortedPlayers = players

  if (players.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        <div className="text-sm">Нет данных об игроках</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sortedPlayers.map((player) => (
        <div key={player.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg border border-gray-600 shadow-md hover:bg-gray-650 hover:border-gray-500 transition-all duration-200">
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
              <div className={`text-xs font-medium ${
                player.netBalance !== undefined 
                  ? (player.netBalance >= 0 ? 'text-mint' : 'text-red-400') 
                  : (player.money >= 0 ? 'text-mint' : 'text-red-400')
              }`}>
                Баланс: {player.netBalance !== undefined ? (player.netBalance >= 0 ? '+' : '') + player.netBalance : (player.money >= 0 ? '+' : '') + player.money} ₽
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap ml-4">
            {/* Отображаем все шары и штрафы в порядке добавления */}
            {[...player.balls, ...player.fouls].sort((a, b) => {
              // Сортируем по времени добавления (timestamp)
              const aTime = a.timestamp || '00:00'
              const bTime = b.timestamp || '00:00'
              
              // Конвертируем время в минуты для сравнения
              const aMinutes = parseInt(aTime.split(':')[0]) || 0
              const aSeconds = parseInt(aTime.split(':')[1]) || 0
              const bMinutes = parseInt(bTime.split(':')[0]) || 0
              const bSeconds = parseInt(bTime.split(':')[1]) || 0
              
              const aTotalSeconds = aMinutes * 60 + aSeconds
              const bTotalSeconds = bMinutes * 60 + bSeconds
              
              // Сортируем по времени (раньше добавленные сначала)
              return aTotalSeconds - bTotalSeconds
            }).map((item) => (
              <div key={item.id}>
                {'type' in item ? getBallIcon(item as Ball) : getFoulIcon()}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
