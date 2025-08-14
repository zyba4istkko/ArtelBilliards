import React, { useState, useEffect } from 'react'
import { Button } from '@nextui-org/react'
import { ArrowLeft, Clock } from 'lucide-react'

interface GameHeaderProps {
  gameType: string
  sessionId: string
  playerCount: number
  gameCount: number
  onBack: () => void
}

export default function GameHeader({ 
  gameType, 
  sessionId, 
  playerCount, 
  gameCount, 
  onBack 
}: GameHeaderProps) {
  const [sessionTime, setSessionTime] = useState('00:00')
  const [sessionStartTime] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      setSessionTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionStartTime])

  return (
    <header className="bg-gray-800 border-b border-gray-600 py-4 mb-6 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              className="text-mint hover:bg-gray-700"
              onClick={onBack}
            >
              <ArrowLeft size={18} />
            </Button>
            
            <div>
              <div className="text-lg font-bold text-white">
                🎱 Сессия {gameType}
              </div>
              <div className="text-xs text-gray-300">
                {playerCount} игрока • {gameCount} игр
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full">
            <Clock className="text-mint" size={16} />
            <span className="font-mono font-bold text-white text-sm">
              {sessionTime}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
