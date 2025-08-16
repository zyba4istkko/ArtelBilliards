import React from 'react'
import { Button } from '@nextui-org/react'
import { Pause, Play, Flag, Gamepad2 } from 'lucide-react'

interface ActionPanelProps {
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  onEndGame: () => void
  onNextGame: () => void
  canStartNextGame: boolean
}

export default function ActionPanel({
  isPaused,
  onPause,
  onResume,
  onEndGame,
  onNextGame,
  canStartNextGame
}: ActionPanelProps) {
  return (
    <div className="space-y-4">
      {/* Game Controls */}
      <div className="flex gap-3 mb-6">
        <Button
          color={isPaused ? "success" : "warning"}
          variant="solid"
          startContent={isPaused ? <Play size={16} /> : <Pause size={16} />}
          onClick={isPaused ? onResume : onPause}
          className="font-semibold"
        >
          {isPaused ? 'Продолжить' : 'Пауза'}
        </Button>
        
        <Button
          color="danger"
          variant="solid"
          startContent={<Flag size={16} />}
          onClick={onEndGame}
          className="font-semibold"
        >
          🏁 Завершить игру
        </Button>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-4 bg-gray-800 border border-gray-600 rounded-2xl p-4">
        <Button
          color="primary"
          variant="solid"
          startContent={<Gamepad2 size={16} />}
          onClick={onNextGame}
          disabled={!canStartNextGame}
          className="w-full font-bold text-lg py-6"
        >
          🎲 Следующая игра
        </Button>
      </div>
    </div>
  )
}
