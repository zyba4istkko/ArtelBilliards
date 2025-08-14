import React, { useState } from 'react'
import { Input, Textarea, Button } from '@nextui-org/react'
import { GameTypeSelector } from './GameTypeSelector'
import { GameTypeFields } from './GameTypeFields'
import type { GameType, GameTemplateCreate } from '../../api/types'
import { useAuthStore } from '../../store/authStore'

interface CreateTemplateFormProps {
  onClose: () => void
  onSubmit: (template: GameTemplateCreate) => void
}

interface CustomTemplateState {
  name: string
  description: string
  gameType: GameType | ''
  minPlayers: number
  maxPlayers: number
  turnSequence: string
  paymentDirection: string
  gamePrice: number
  pointValue: number
  foulPenalty: number
  ballsToWin: number
  totalBalls: number
  balls: Array<{
    color: string
    points: number
    is_required: boolean
    order_priority: number
  }>
}

export function CreateTemplateForm({ onClose, onSubmit }: CreateTemplateFormProps) {
  const { user } = useAuthStore()
  
  const [formData, setFormData] = useState<CustomTemplateState>({
    name: '',
    description: '',
    gameType: '',
    minPlayers: 2,
    maxPlayers: 6,
    turnSequence: 'По очереди без повторения',
    paymentDirection: 'По часовой стрелке',
    gamePrice: 500,
    pointValue: 100,
    foulPenalty: 50,
    ballsToWin: 8,
    totalBalls: 15,
    balls: []
  })

  const [isCreating, setIsCreating] = useState(false)

  const handleFieldChange = (field: keyof CustomTemplateState, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGameTypeChange = (gameType: GameType) => {
    setFormData(prev => ({
      ...prev,
      gameType
    }))
  }

  const buildRules = () => {
    if (!formData.gameType) return null

    const baseRules = {
      game_type: formData.gameType,
      min_players: formData.minPlayers,
      max_players: formData.maxPlayers,
      queue_algorithm: (formData.turnSequence === 'По очереди без повторения' ? 'random_no_repeat' : 'always_random') as 'random_no_repeat' | 'always_random',
      balls: formData.balls || []
    }

    switch (formData.gameType) {
      case 'kolkhoz':
        return {
          ...baseRules,
          point_value_rubles: formData.pointValue,
          foul_penalty_points: -formData.foulPenalty, // Отрицательное значение для штрафа
          payment_direction: formData.paymentDirection === 'По часовой стрелке' ? 'clockwise' : 'counterclockwise'
        }
      case 'americana':
      case 'moscow_pyramid':
        return {
          ...baseRules,
          game_price_rubles: formData.gamePrice,
          balls_to_win: formData.ballsToWin,
          balls_total: formData.totalBalls,
          payment_direction: formData.paymentDirection === 'По часовой стрелке' ? 'clockwise' : 'counterclockwise'
        }
      default:
        return baseRules
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.gameType) {
      return
    }

    if (!user?.id) {
      console.error('❌ User not authenticated')
      return
    }

    setIsCreating(true)
    
    try {
      const rules = buildRules()
      if (!rules) return

      const template: GameTemplateCreate = {
        name: formData.name.trim(),
        description: formData.description.trim() || 'Пользовательский шаблон',
        game_type: formData.gameType,
        rules,
        settings: {}, // Пустые настройки UI
        category_id: 1, // ID категории "Колхоз" (ID=1)
        is_public: true, // Публичный по умолчанию
        tags: [], // Пустые теги
        creator_user_id: user.id // Используем ID пользователя из authStore
      }

      await onSubmit(template)
      onClose()
    } catch (error) {
      console.error('Ошибка создания шаблона:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Стили для компонентов с нашими цветами
  const inputClasses = {
    base: "w-full",
    input: "text-white bg-gray-700 placeholder:text-gray-400",
    inputWrapper: "border-gray-600 bg-gray-700 hover:border-mint focus-within:border-mint transition-colors",
    label: "text-gray-200 font-semibold text-sm"
  }

  const textareaClasses = {
    base: "w-full",
    input: "text-white bg-gray-700 placeholder:text-gray-400",
    inputWrapper: "border-gray-600 bg-gray-700 hover:border-mint focus-within:border-mint transition-colors",
    label: "text-gray-200 font-semibold text-sm"
  }

  const componentStyles = {
    '--nextui-focus': '#85DCCB',
    '--nextui-primary': '#85DCCB'
  } as React.CSSProperties

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Основная информация */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg mb-4" style={{ color: '#85DCCB' }}>
          Основная информация
        </h3>
        
        <Input
          label="Название шаблона"
          placeholder="Например: Мой колхоз"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('name', e.target.value)}
          variant="bordered"
          isRequired
          classNames={inputClasses}
          style={componentStyles}
        />

        <Textarea
          label="Описание"
          placeholder="Опишите особенности вашего шаблона..."
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('description', e.target.value)}
          variant="bordered"
          rows={3}
          classNames={textareaClasses}
          style={componentStyles}
        />
      </div>

      {/* Выбор типа игры */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg mb-4" style={{ color: '#85DCCB' }}>
          Тип игры
        </h3>
        
        <GameTypeSelector
          value={formData.gameType}
          onChange={handleGameTypeChange}
        />
      </div>

      {/* Настройки игры */}
      {formData.gameType && (
        <div className="space-y-6">
          <h3 className="font-bold text-lg mb-4" style={{ color: '#85DCCB' }}>
            Настройки игры
          </h3>
          
          <GameTypeFields
            gameType={formData.gameType}
            values={formData}
            onChange={handleFieldChange}
          />
        </div>
      )}

      {/* Кнопки действий */}
      <div className="flex gap-4 pt-6 border-t border-gray-600">
        <Button
          type="button"
          variant="bordered"
          onPress={onClose}
          className="flex-1 border-gray-600 text-gray-200 hover:bg-gray-700 transition-colors"
        >
          Отмена
        </Button>
        
        <Button
          type="submit"
          isLoading={isCreating}
          isDisabled={!formData.name.trim() || !formData.gameType}
          className="flex-1 font-semibold text-white transition-all"
          style={{ 
            background: 'linear-gradient(135deg, #E27D60, #E8A87C)',
            opacity: (!formData.name.trim() || !formData.gameType) ? 0.5 : 1
          }}
        >
          {isCreating ? 'Создание...' : 'Создать шаблон'}
        </Button>
      </div>
    </form>
  )
}
