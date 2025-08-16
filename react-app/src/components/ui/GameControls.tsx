import React from 'react'
import { Button } from '@nextui-org/react'

interface Ball {
  color: string
  name: string
  points: number
  icon: string
}

interface GameControlsProps {
  balls: Ball[]
  onBallClick: (ball: Ball) => void
  onFoul: () => void
  onMiss: () => void
  disabled?: boolean
}

const defaultBalls: Ball[] = [
  { color: 'red', name: 'Красный', points: 1, icon: '🔴' },
  { color: 'yellow', name: 'Желтый', points: 2, icon: '🟡' },
  { color: 'green', name: 'Зеленый', points: 3, icon: '🟢' },
  { color: 'brown', name: 'Коричневый', points: 4, icon: '🟤' },
  { color: 'blue', name: 'Синий', points: 5, icon: '🔵' },
  { color: 'pink', name: 'Розовый', points: 6, icon: '🩷' },
  { color: 'black', name: 'Черный', points: 7, icon: '⚫' },
  { color: 'white', name: 'Белый', points: 0, icon: '⚪' }
]

export default function GameControls({
  balls = defaultBalls,
  onBallClick,
  onFoul,
  onMiss,
  disabled = false
}: GameControlsProps) {
  return (
    <div className="space-y-6">
      {/* Ball Buttons */}
      <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6">
        <h3 className="text-base font-bold text-mint mb-4">
          Действия с шарами
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {balls.map((ball) => (
            <Button
              key={ball.color}
              variant="bordered"
              className="h-20 bg-gray-700 border-2 border-gray-600 hover:border-mint hover:scale-105 transition-all duration-250"
              onClick={() => onBallClick(ball)}
              disabled={disabled}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{ball.icon}</span>
                <span className="text-xs font-semibold text-white">
                  {ball.name}
                </span>
                <span className="text-sm font-bold text-mint">
                  {ball.points} очк.
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Special Actions */}
      <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6">
        <h3 className="text-base font-bold text-mint mb-4">
          Специальные действия
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            color="danger"
            variant="bordered"
            className="h-16 border-2 border-red-500 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-250"
            onClick={onFoul}
            disabled={disabled}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">✕</span>
              <span className="text-sm font-semibold">Штраф</span>
              <span className="text-xs">-1 очко</span>
            </div>
          </Button>
          
          <Button
            variant="bordered"
            className="h-16 border-2 border-gray-600 text-white hover:border-mint hover:bg-gray-600 transition-all duration-250"
            onClick={onMiss}
            disabled={disabled}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">💨</span>
              <span className="text-sm font-semibold">Промах</span>
              <span className="text-xs">0 очков</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
