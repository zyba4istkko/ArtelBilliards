import React from 'react'
import { Input, Select, SelectItem } from '@nextui-org/react'
import { BallConfigurator } from './BallConfigurator'
import { PriceSelector } from './PriceSelector'
import type { GameType, BallConfig } from '../../api/types'

interface GameTypeFieldsProps {
  gameType: GameType
  values: {
    minPlayers: number
    maxPlayers: number
    turnSequence: string
    paymentDirection: string
    gamePrice: number
    pointValue: number
    foulPenalty: number
    ballsToWin: number
    totalBalls: number
    balls: BallConfig[]
  }
  onChange: (field: 'minPlayers' | 'maxPlayers' | 'turnSequence' | 'paymentDirection' | 'gamePrice' | 'pointValue' | 'foulPenalty' | 'ballsToWin' | 'totalBalls' | 'balls', value: any) => void
}

export function GameTypeFields({ gameType, values, onChange }: GameTypeFieldsProps) {
  // Стили для компонентов с нашими цветами - сделал фон светлее
  const inputClasses = {
    base: "w-full",
    input: "text-white bg-gray-600 placeholder:text-gray-400", // Изменил с gray-700 на gray-600
    inputWrapper: "border-gray-500 bg-gray-600 hover:border-mint focus-within:border-mint transition-colors", // Изменил с gray-600/gray-700 на gray-500/gray-600
    label: "text-gray-200 font-semibold text-sm"
  }

  const selectClasses = {
    base: "w-full",
    trigger: "bg-gray-600 border-gray-500 hover:border-mint data-[open=true]:border-mint transition-colors min-h-12", // Изменил с gray-700/gray-600 на gray-600/gray-500
    value: "text-white font-medium",
    label: "text-gray-200 font-semibold text-sm",
    listbox: "bg-gray-700", // Оставил темнее для выпадающего списка
    popoverContent: "bg-gray-700 border-gray-500" // Изменил с gray-600 на gray-500
  }

  const componentStyles = {
    '--nextui-focus': '#85DCCB',
    '--nextui-primary': '#85DCCB'
  } as React.CSSProperties

  const selectItemStyles = {
    '--nextui-hover': 'rgba(133, 220, 203, 0.1)',
    '--nextui-selected': 'rgba(133, 220, 203, 0.2)'
  } as React.CSSProperties

  if (gameType === 'kolkhoz') {
    return (
      <div className="space-y-6">
        {/* Общие поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Input
            type="number"
            label="Мин. игроков"
            value={values.minPlayers.toString()}
            onChange={(e) => onChange('minPlayers', parseInt(e.target.value) || 2)}
            min={2}
            max={6}
            variant="bordered"
            classNames={inputClasses}
            style={componentStyles}
          />

          <Input
            type="number"
            label="Макс. игроков"
            value={values.maxPlayers.toString()}
            onChange={(e) => onChange('maxPlayers', parseInt(e.target.value) || 6)}
            min={2}
            max={6}
            variant="bordered"
            classNames={inputClasses}
            style={componentStyles}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Select
            label="Алгоритм очереди"
            selectedKeys={[values.turnSequence]}
            onSelectionChange={(keys) => onChange('turnSequence', Array.from(keys)[0])}
            variant="bordered"
            classNames={selectClasses}
            style={componentStyles}
          >
            <SelectItem 
              key="По очереди без повторения" 
              textValue="По очереди без повторения"
              className="text-white hover:bg-mint/10 data-[selected=true]:bg-mint/20"
              style={selectItemStyles}
            >
              <span className="text-white font-medium">По очереди без повторения</span>
            </SelectItem>
            <SelectItem 
              key="Случайный порядок" 
              textValue="Случайный порядок"
              className="text-white hover:bg-mint/10 data-[selected=true]:bg-mint/20"
              style={selectItemStyles}
            >
              <span className="text-white font-medium">Случайный порядок</span>
            </SelectItem>
          </Select>

          <Select
            label="Направление оплаты"
            selectedKeys={[values.paymentDirection]}
            onSelectionChange={(keys) => onChange('paymentDirection', Array.from(keys)[0])}
            variant="bordered"
            classNames={selectClasses}
            style={componentStyles}
          >
            <SelectItem 
              key="По часовой стрелке" 
              textValue="По часовой стрелке"
              className="text-white hover:bg-mint/10 data-[selected=true]:bg-mint/20"
              style={selectItemStyles}
            >
              <span className="text-white font-medium">По часовой стрелке</span>
            </SelectItem>
            <SelectItem 
              key="Против часовой стрелки" 
              textValue="Против часовой стрелки"
              className="text-white hover:bg-mint/10 data-[selected=true]:bg-mint/20"
              style={selectItemStyles}
            >
              <span className="text-white font-medium">Против часовой стрелки</span>
            </SelectItem>
          </Select>
        </div>

        {/* Стоимость очка */}
        <div className="space-y-3">
          <PriceSelector
            label="Стоимость очка (₽)"
            value={values.pointValue}
            onChange={(value) => onChange('pointValue', value)}
            presetValues={[10, 25, 50, 100]}
          />
        </div>

        {/* Штраф за фол */}
        <div className="space-y-3">
          <label className="text-gray-200 text-sm font-semibold">Штраф за фол (₽)</label>
          <Input
            type="number"
            value={values.foulPenalty.toString()}
            onChange={(e) => onChange('foulPenalty', parseInt(e.target.value) || 50)}
            min={0}
            max={1000}
            variant="bordered"
            classNames={inputClasses}
            style={componentStyles}
            placeholder="Введите размер штрафа..."
          />
        </div>

        {/* Настройка шаров */}
        <div className="space-y-3">
          <BallConfigurator
            balls={values.balls}
            onChange={(balls) => onChange('balls', balls)}
            allowPointsEdit={true}
          />
        </div>
      </div>
    )
  }

  // Для американки и московской пирамиды
  return (
    <div className="space-y-6">
      {/* Общие поля */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          type="number"
          label="Мин. игроков"
          value={values.minPlayers.toString()}
          onChange={(e) => onChange('minPlayers', parseInt(e.target.value) || 2)}
          min={2}
          max={6}
          variant="bordered"
          classNames={inputClasses}
          style={componentStyles}
        />

        <Input
          type="number"
          label="Макс. игроков"
          value={values.maxPlayers.toString()}
          onChange={(e) => onChange('maxPlayers', parseInt(e.target.value) || 6)}
          min={2}
          max={6}
          variant="bordered"
          classNames={inputClasses}
          style={componentStyles}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Select
          label="Алгоритм очереди"
          selectedKeys={[values.turnSequence]}
          onSelectionChange={(keys) => onChange('turnSequence', Array.from(keys)[0])}
          variant="bordered"
          classNames={selectClasses}
          style={componentStyles}
        >
          <SelectItem 
            key="По очереди без повторения" 
            textValue="По очереди без повторения"
            className="text-white hover:bg-mint/10 data-[selected=true]:bg-mint/20"
            style={selectItemStyles}
          >
            <span className="text-white font-medium">По очереди без повторения</span>
          </SelectItem>
          <SelectItem 
            key="Случайный порядок" 
            textValue="Случайный порядок"
            className="text-white hover:bg-mint/10 data-[selected=true]:bg-mint/20"
            style={selectItemStyles}
          >
            <span className="text-white font-medium">Случайный порядок</span>
          </SelectItem>
        </Select>

        <Select
          label="Направление оплаты"
          selectedKeys={[values.paymentDirection]}
          onSelectionChange={(keys) => onChange('paymentDirection', Array.from(keys)[0])}
          variant="bordered"
          classNames={selectClasses}
          style={componentStyles}
        >
          <SelectItem 
            key="По часовой стрелке" 
            textValue="По часовой стрелке"
            className="text-white hover:bg-mint/10 data-[selected=true]:bg-mint/20"
            style={selectItemStyles}
          >
            <span className="text-white font-medium">По часовой стрелке</span>
          </SelectItem>
          <SelectItem 
            key="Против часовой стрелки" 
            textValue="Против часовой стрелки"
            className="text-white hover:bg-mint/10 data-[selected=true]:bg-mint/20"
            style={selectItemStyles}
          >
            <span className="text-white font-medium">Против часовой стрелки</span>
          </SelectItem>
        </Select>
      </div>

      {/* Стоимость партии */}
      <div className="space-y-3">
        <PriceSelector
          label="Стоимость партии (₽)"
          value={values.gamePrice}
          onChange={(value) => onChange('gamePrice', value)}
          presetValues={[100, 250, 500, 1000]}
        />
      </div>

      {/* Шары для победы и общее количество */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Input
          type="number"
          label="Шаров для победы"
          value={values.ballsToWin.toString()}
          onChange={(e) => onChange('ballsToWin', parseInt(e.target.value) || 8)}
          min={1}
          max={15}
          variant="bordered"
          classNames={inputClasses}
          style={componentStyles}
        />

        <Input
          type="number"
          label="Всего шаров"
          value={values.totalBalls.toString()}
          onChange={(e) => onChange('totalBalls', parseInt(e.target.value) || 15)}
          min={8}
          max={21}
          variant="bordered"
          classNames={inputClasses}
          style={componentStyles}
        />
      </div>
    </div>
  )
}
