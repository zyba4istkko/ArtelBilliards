import React, { useState } from 'react'
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react'
import { X } from 'lucide-react'

interface Ball {
  color: string
  name: string
  points: number
  icon: string
}

interface ScoreModalProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  onConfirm: (action: 'ball' | 'foul', ball?: Ball, tag?: string) => void
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

const tagOptions = [
  'Стандарт', 'Подстава', 'Серия', 'От борта', 'Сложный', 'Случайный'
]

export default function ScoreModal({
  isOpen,
  onClose,
  playerName,
  onConfirm
}: ScoreModalProps) {
  const [selectedAction, setSelectedAction] = useState<'ball' | 'foul' | null>(null)
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const handleConfirm = () => {
    if (selectedAction === 'ball' && selectedBall) {
      onConfirm('ball', selectedBall, selectedTag || undefined)
    } else if (selectedAction === 'foul') {
      onConfirm('foul', undefined, selectedTag || undefined)
    }
    handleClose()
  }

  const handleClose = () => {
    setSelectedAction(null)
    setSelectedBall(null)
    setSelectedTag(null)
    onClose()
  }

  const canConfirm = selectedAction !== null

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="2xl"
      classNames={{
        base: "bg-gray-800 border border-gray-600",
        header: "border-b border-gray-600",
        body: "py-6",
        footer: "border-t border-gray-600"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {playerName}
          </h3>
          <Button
            isIconOnly
            variant="light"
            className="text-gray-300 hover:text-white"
            onClick={handleClose}
          >
            <X size={20} />
          </Button>
        </ModalHeader>

        <ModalBody>
          {/* Ball Selection */}
          <div className="mb-8">
            <h4 className="text-base font-bold text-mint mb-4 text-center">
              Забитый шар
            </h4>
            
            <div className="grid grid-cols-4 gap-3 mb-6">
              {defaultBalls.map((ball) => (
                <Button
                  key={ball.color}
                  variant="bordered"
                  className={`h-20 bg-gray-700 border-2 transition-all duration-250 ${
                    selectedAction === 'ball' && selectedBall?.color === ball.color
                      ? 'border-mint bg-mint/20'
                      : 'border-gray-600 hover:border-mint hover:scale-105'
                  }`}
                  onClick={() => {
                    setSelectedAction('ball')
                    setSelectedBall(ball)
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{ball.icon}</span>
                    <div className="text-xs font-semibold text-white">
                      {ball.name}
                    </div>
                    <div className="text-sm font-bold text-mint">
                      +{ball.points}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Foul Button */}
            <div className="flex justify-center">
              <Button
                variant="bordered"
                className={`h-16 px-6 border-2 transition-all duration-250 ${
                  selectedAction === 'foul'
                    ? 'border-mint bg-mint/20'
                    : 'border-red-500 text-red-500 hover:bg-red-500/10'
                }`}
                onClick={() => {
                  setSelectedAction('foul')
                  setSelectedBall(null)
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">✕</span>
                  <span className="text-sm font-semibold">Штраф</span>
                  <span className="text-xs">-1 очко</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Tag Selection */}
          <div className="mb-6">
            <label className="block font-semibold text-sm text-white mb-3">
              Описание (необязательно)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {tagOptions.map((tag) => (
                <Button
                  key={tag}
                  variant="bordered"
                  size="sm"
                  className={`transition-all duration-250 ${
                    selectedTag === tag
                      ? 'bg-mint/20 border-mint text-mint'
                      : 'bg-gray-700 border-gray-600 text-white hover:border-mint'
                  }`}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            className="border-gray-600 text-white hover:bg-gray-700"
            onClick={handleClose}
          >
            Отмена
          </Button>
          <Button
            color="success"
            className="font-bold"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            Добавить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
