import React, { useState } from 'react'
import { Input, Button, ButtonGroup } from '@nextui-org/react'

interface PriceSelectorProps {
  label: string
  value: number
  onChange: (value: number) => void
  presetValues: number[]
}

export function PriceSelector({ label, value, onChange, presetValues }: PriceSelectorProps) {
  const [customValue, setCustomValue] = useState('')
  const [isCustom, setIsCustom] = useState(!presetValues.includes(value))

  const handlePresetClick = (presetValue: number) => {
    setIsCustom(false)
    setCustomValue('')
    onChange(presetValue)
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setCustomValue(inputValue)
    setIsCustom(true)
    
    const numValue = parseInt(inputValue)
    if (!isNaN(numValue) && numValue > 0) {
      onChange(numValue)
    }
  }

  const componentStyles = {
    '--nextui-focus': '#85DCCB',
    '--nextui-primary': '#85DCCB'
  } as React.CSSProperties

  return (
    <div className="space-y-3">
      <label className="text-gray-200 text-sm font-semibold">{label}</label>
      
      {/* Preset values */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {presetValues.map((preset) => (
          <Button
            key={preset}
            size="sm"
            variant="bordered"
            className="bg-gray-600/50 border-gray-500 text-gray-200 hover:bg-mint/20 hover:border-mint transition-colors"
            onPress={() => handlePresetClick(preset)}
          >
            {preset}₽
          </Button>
        ))}
      </div>

      {/* Custom input */}
      <Input
        type="number"
        label="Или введите свое значение"
        placeholder="Введите другую сумму..."
        value={isCustom ? value.toString() : customValue}
        onChange={handleCustomChange}
        onFocus={() => setIsCustom(true)}
        variant="bordered"
        classNames={{
          base: "w-full",
          input: "text-white bg-gray-600 placeholder:text-gray-400",
          inputWrapper: "border-gray-500 bg-gray-600 hover:border-mint focus-within:border-mint",
          label: "text-gray-200 font-semibold text-sm"
        }}
        style={componentStyles}
        endContent={<span className="text-gray-400 text-sm">₽</span>}
      />
    </div>
  )
}
