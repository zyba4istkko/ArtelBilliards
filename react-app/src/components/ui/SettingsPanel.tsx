import React from 'react'

interface SettingsPanelProps {
  settings: Record<string, string>
  title: string
}

export function SettingsPanel({ settings, title }: SettingsPanelProps) {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-lg mb-4" style={{ color: '#85DCCB' }}>
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(settings).map(([key, value]) => (
          <div 
            key={key}
            className="bg-gray-700 border border-gray-600 rounded-lg p-4"
          >
            <div className="text-white font-semibold text-sm mb-2">
              {key}
            </div>
            <div 
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: '#85DCCB', 
                color: '#0a0a0a' 
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
