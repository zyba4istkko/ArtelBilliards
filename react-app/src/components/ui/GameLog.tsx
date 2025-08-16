import React from 'react'
import { Button } from '@nextui-org/react'
import { Edit2 } from 'lucide-react'

interface LogEntry {
  id: string
  text: string
  icon: string
  color?: string
  playerName: string
  timestamp: string
  addedBy: string
  canEdit?: boolean
}

interface GameLogProps {
  entries: LogEntry[]
  onEditEntry?: (entryId: string) => void
  title?: string
}

export default function GameLog({ 
  entries, 
  onEditEntry, 
  title = "События игры" 
}: GameLogProps) {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-6">
      <h3 className="text-base font-bold text-mint mb-4">
        {title}
      </h3>
      
      <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-400 italic">
            Пока нет событий в игре
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between items-center p-3 border-b border-gray-600 last:border-b-0 transition-all duration-150 hover:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <span 
                  className="text-sm"
                  style={{ color: entry.color || '#ffffff' }}
                >
                  {entry.icon}
                </span>
                
                <div className="flex-1">
                  <span className="text-white font-medium text-sm">
                    {entry.text}
                  </span>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    Добавил: {entry.addedBy}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300 font-mono">
                  {entry.timestamp}
                </span>
                
                {entry.canEdit && onEditEntry && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-gray-400 hover:text-mint hover:bg-gray-700"
                    onClick={() => onEditEntry(entry.id)}
                  >
                    <Edit2 size={12} />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
