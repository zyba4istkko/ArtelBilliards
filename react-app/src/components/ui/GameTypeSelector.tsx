import React from 'react'
import { Select, SelectItem } from '@nextui-org/react'
import type { GameType } from '../../api/types'

interface GameTypeSelectorProps {
  value: GameType | ''
  onChange: (gameType: GameType) => void
}

const gameTypes = [
  {
    key: 'kolkhoz' as GameType,
    label: 'Колхоз',
    description: 'Игра на очки с настраиваемыми шарами'
  },
  {
    key: 'americana' as GameType,
    label: 'Американка', 
    description: 'Игра до 8 шаров, фиксированная цена'
  },
  {
    key: 'moscow_pyramid' as GameType,
    label: 'Московская пирамида',
    description: 'Классическая пирамида с желтым шаром'
  }
]

export function GameTypeSelector({ value, onChange }: GameTypeSelectorProps) {
  return (
    <Select
      label="Тип игры"
      placeholder="Выберите тип игры"
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0] as GameType
        if (selectedKey) {
          onChange(selectedKey)
        }
      }}
      variant="bordered"
      className="w-full"
      classNames={{
        trigger: "bg-gray-600 border-gray-500 hover:border-mint data-[open=true]:border-mint transition-colors min-h-12",
        value: "text-white font-medium",
        label: "text-gray-200 font-semibold text-sm",
        listbox: "bg-gray-700",
        popoverContent: "bg-gray-700 border-gray-500"
      }}
      style={{
        '--nextui-focus': '#85DCCB',
        '--nextui-primary': '#85DCCB'
      } as React.CSSProperties}
      renderValue={(items) => {
        if (items.length === 0) return null;
        const selectedItem = gameTypes.find(gt => gt.key === value);
        return selectedItem ? (
          <span className="text-white font-semibold">{selectedItem.label}</span>
        ) : null;
      }}
    >
      {gameTypes.map((gameType) => (
        <SelectItem 
          key={gameType.key} 
          value={gameType.key}
          textValue={gameType.label}
          className="text-white py-2"
          style={{
            '--nextui-hover': 'rgba(133, 220, 203, 0.1)',
            '--nextui-selected': 'rgba(133, 220, 203, 0.2)'
          } as React.CSSProperties}
        >
          <div className="flex flex-col">
            <span className="font-semibold text-white text-base leading-tight">{gameType.label}</span>
            <span className="text-sm text-gray-300 leading-tight">{gameType.description}</span>
          </div>
        </SelectItem>
      ))}
    </Select>
  )
}
