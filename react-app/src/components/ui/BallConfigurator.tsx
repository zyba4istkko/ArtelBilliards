import { useState } from 'react'
import { Button, Input, Chip, Select, SelectItem } from '@nextui-org/react'
import { Plus, Trash2 } from 'lucide-react'
import { Ball } from './Ball'
import type { BallConfig } from '../../api/types'

interface BallConfiguratorProps {
  balls: BallConfig[]
  onChange: (balls: BallConfig[]) => void
  allowPointsEdit?: boolean
}

const availableColors = [
  { key: 'white', label: 'Белый', color: '#ffffff' },
  { key: 'yellow', label: 'Желтый', color: '#ffeb3b' },
  { key: 'green', label: 'Зеленый', color: '#4caf50' },
  { key: 'brown', label: 'Коричневый', color: '#8d6e63' },
  { key: 'blue', label: 'Синий', color: '#2196f3' },
  { key: 'pink', label: 'Розовый', color: '#e91e63' },
  { key: 'black', label: 'Черный', color: '#333333' },
  { key: 'red', label: 'Красный', color: '#f44336' }
]

export function BallConfigurator({ balls, onChange, allowPointsEdit = true }: BallConfiguratorProps) {
  const [selectedColor, setSelectedColor] = useState('white')

  const addBall = () => {
    const colorExists = balls.some(ball => ball.color === selectedColor)
    if (colorExists) return

    const newBall: BallConfig = {
      color: selectedColor,
      points: selectedColor === 'white' ? 1 : balls.length + 1,
      is_required: true,
      order_priority: balls.length + 1
    }

    onChange([...balls, newBall])
  }

  const removeBall = (index: number) => {
    const newBalls = balls.filter((_, i) => i !== index)
    onChange(newBalls)
  }

  const updateBallPoints = (index: number, points: number) => {
    const newBalls = [...balls]
    newBalls[index] = { ...newBalls[index], points }
    onChange(newBalls)
  }

  const getColorLabel = (colorKey: string) => {
    return availableColors.find(c => c.key === colorKey)?.label || colorKey
  }

  return (
    <>
      {/* Кастомные стили для Select */}
      <style dangerouslySetInnerHTML={{
        __html: `
          [data-slot="listbox"] {
            background: #1a1a1a !important;
          }
          [data-slot="listbox"] [role="option"] {
            color: white !important;
            background: #1a1a1a !important;
          }
          [data-slot="listbox"] [role="option"]:hover {
            background: rgba(133, 220, 203, 0.1) !important;
          }
          [data-slot="listbox"] [role="option"][data-selected="true"] {
            background: rgba(133, 220, 203, 0.2) !important;
            color: white !important;
          }
          [data-slot="popover-content"] {
            background: #1a1a1a !important;
            border: 1px solid #333333 !important;
          }
          [data-slot="trigger"] [data-slot="inner-wrapper"] {
            color: white !important;
          }
          [data-slot="trigger"] [data-slot="inner-wrapper"] span {
            color: white !important;
          }
        `
      }} />

      <div className="space-y-4 bg-gray-700/50 p-4 sm:p-6 rounded-lg border border-gray-600">
        <h4 className="font-bold text-lg mb-4" style={{ color: '#85DCCB' }}>
          Настройки шаров
        </h4>

        {/* Добавление нового шара */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <Select
            label="Цвет шара"
            placeholder="Выберите цвет"
            selectedKeys={[selectedColor]}
            onSelectionChange={(keys) => setSelectedColor(Array.from(keys)[0] as string)}
            variant="bordered"
            className="flex-1"
            classNames={{
              trigger: "bg-gray-600 border-gray-500 hover:border-mint data-[open=true]:border-mint",
              value: "text-white !important",
              label: "text-gray-200 font-medium",
              listbox: "bg-gray-700",
              popoverContent: "bg-gray-700 border-gray-500",
              innerWrapper: "text-white"
            }}
            style={{
              '--nextui-focus': '#85DCCB',
              '--nextui-primary': '#85DCCB'
            } as React.CSSProperties}
            renderValue={(items) => {
              if (items.length === 0) return null;
              const selectedItem = availableColors.find(c => c.key === selectedColor);
              return selectedItem ? (
                <div className="flex items-center gap-2 text-white">
                  <Ball color={selectedItem.key} size="sm" />
                  <span className="text-white font-medium">{selectedItem.label}</span>
                </div>
              ) : null;
            }}
          >
            {availableColors.map((color) => (
              <SelectItem 
                key={color.key} 
                value={color.key}
                textValue={color.label}
                className="text-white"
                style={{
                  color: 'white !important',
                  backgroundColor: 'transparent'
                }}
              >
                <div className="flex items-center gap-2 text-white">
                  <Ball color={color.key} size="sm" />
                  <span className="text-white font-medium">{color.label}</span>
                </div>
              </SelectItem>
            ))}
          </Select>

          <Button
            onPress={addBall}
            isDisabled={balls.some(ball => ball.color === selectedColor)}
            className="text-white font-semibold transition-all px-6"
            variant="solid"
            startContent={<Plus size={16} />}
            style={{ 
              backgroundColor: '#85DCCB',
              color: '#0a0a0a'
            }}
          >
            <span className="hidden sm:inline">Добавить</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>

        {/* Список добавленных шаров */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-200">Добавленные шары:</h5>
          {balls.length === 0 ? (
            <p className="text-gray-400 text-sm italic">Добавьте шары для игры</p>
          ) : (
            <div className="space-y-3">
              {balls.map((ball, index) => (
                <div 
                  key={`${ball.color}-${index}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600/50 transition-colors"
                >
                  {/* Первая строка: шар и название */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Ball color={ball.color} size="md" />
                    
                    {/* Адаптивная ширина для названия цвета */}
                    <div className="min-w-0 flex-1 sm:w-24 sm:flex-shrink-0">
                      <span className="text-white text-sm font-medium truncate block">
                        {getColorLabel(ball.color)}
                      </span>
                    </div>
                  </div>

                  {/* Вторая строка: очки и кнопка удаления */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1">
                    {allowPointsEdit && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={ball.points.toString()}
                          onChange={(e) => updateBallPoints(index, parseInt(e.target.value) || 1)}
                          className="w-20"
                          size="sm"
                          variant="bordered"
                          classNames={{
                            input: "text-white text-center",
                            inputWrapper: "border-gray-600 hover:border-mint focus-within:border-mint bg-gray-600"
                          }}
                          style={{
                            '--nextui-focus': '#85DCCB',
                            '--nextui-primary': '#85DCCB'
                          } as React.CSSProperties}
                        />
                        <span className="text-gray-300 text-sm">очк.</span>
                      </div>
                    )}

                    <Button
                      onPress={() => removeBall(index)}
                      size="sm"
                      isIconOnly
                      className="text-red-400 hover:bg-red-400/20 hover:text-red-300 ml-auto sm:ml-0"
                      variant="light"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Инфо */}
        <div className="text-xs text-gray-400 bg-gray-700/30 p-3 rounded border border-gray-600/50">
          💡 Добавьте шары для игры в Колхоз. Для белого шара рекомендуется 1 очко.
        </div>
      </div>
    </>
  )
}
