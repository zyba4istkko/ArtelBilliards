import React from 'react'
import { Button } from '@nextui-org/react'
import { Plus } from 'lucide-react'

interface PlayerBall {
  color: string
  name: string
  points: number
}

interface PlayerCardProps {
  player: {
    id: string
    name: string
    avatar: string
    points: number
    money: number
    balls: PlayerBall[]
    fouls: number
  }
  onAddScore: () => void
  isLeading?: boolean
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

export default function PlayerCard({ 
  player, 
  onAddScore, 
  isLeading = false 
}: PlayerCardProps) {
  return (
    <div className={`bg-gray-700 border rounded-xl p-4 transition-all duration-250 ${
      isLeading 
        ? 'border-mint bg-mint/10' 
        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-600'
    }`}>
      <div className="flex items-center gap-4 min-h-[90px]">
        {/* Player Info */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coral to-peach flex items-center justify-center font-bold text-sm text-white">
            {player.avatar}
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="font-bold text-sm text-white max-w-[120px] truncate">
              {player.name}
            </div>
            <div className="text-xs text-mint font-semibold">
              {player.points} очков
            </div>
            <div className="text-xs text-gray-300">
              {player.money >= 0 ? '+' : ''}{player.money} ₽
            </div>
          </div>
        </div>

        {/* Player Balls */}
        <div className="flex flex-wrap gap-1 items-center flex-1 ml-4">
          {player.balls.map((ball, index) => (
            <div
              key={index}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold relative shadow-inner ${
                ballColors[ball.color as keyof typeof ballColors] || 'bg-gray-500'
              }`}
              style={{
                boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.1)'
              }}
            >
              <div className="absolute top-2 left-3 w-2 h-2 bg-white/80 rounded-full"></div>
            </div>
          ))}
          
          {player.fouls > 0 && (
            <div className="w-7 h-7 flex items-center justify-center text-sm font-bold text-pink-500">
              ✕
            </div>
          )}
        </div>

        {/* Add Score Button */}
        <Button
          isIconOnly
          size="lg"
          color="success"
          className="flex-shrink-0 self-center hover:scale-110 transition-transform duration-200"
          onClick={onAddScore}
        >
          <Plus size={20} />
        </Button>
      </div>
    </div>
  )
}
