import React, { useState, useEffect } from 'react'
import { Button } from '@nextui-org/react'
import { ArrowLeft, Clock } from 'lucide-react'

interface GameHeaderProps {
  gameType: string
  sessionId: string
  playerCount: number
  gameCount: number
  sessionStatus: string
  sessionCreatedAt: string
  sessionEndedAt?: string
  templateData?: {
    paymentDirection?: string
    pointValueRubles?: number
    queueAlgorithm?: string
    ballsToWin?: number
  }
  onBack: () => void
}

export default function GameHeader({ 
  gameType, 
  sessionId, 
  playerCount, 
  gameCount, 
  sessionStatus,
  sessionCreatedAt,
  sessionEndedAt,
  templateData,
  onBack 
}: GameHeaderProps) {
  const [sessionTime, setSessionTime] = useState('00:00')

  useEffect(() => {
    const timer = setInterval(() => {
      const startTime = new Date(sessionCreatedAt).getTime()
      const endTime = sessionEndedAt ? new Date(sessionEndedAt).getTime() : Date.now()
      const elapsed = Math.floor((endTime - startTime) / 1000)
      
      if (elapsed >= 3600) {
        // Больше часа - показываем в часах и минутах
        const hours = Math.floor(elapsed / 3600)
        const minutes = Math.floor((elapsed % 3600) / 60)
        if (minutes === 0) {
          setSessionTime(`${hours}ч`)
        } else {
          setSessionTime(`${hours}ч\u00A0${minutes}мин`)
        }
      } else {
        // Меньше часа - показываем только минуты
        const minutes = Math.floor(elapsed / 60)
        if (minutes === 0) {
          setSessionTime(`${elapsed}сек`)
        } else {
          setSessionTime(`${minutes}мин`)
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionCreatedAt, sessionEndedAt])

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
                Сессия {gameType}
              </div>
                             <div className="text-xs text-gray-300">
                 {templateData && (
                   <div className="flex flex-wrap gap-2 text-gray-400">
                                           {templateData.pointValueRubles && (
                        <span>• {templateData.pointValueRubles}₽</span>
                      )}
                      {templateData.queueAlgorithm && (
                        <span>• {templateData.queueAlgorithm === 'random_no_repeat' ? 'Рандом без повторов' : 
                                templateData.queueAlgorithm === 'always_random' ? 'Всегда рандом' : 
                                templateData.queueAlgorithm === 'manual' ? 'Ручное управление' : 
                                templateData.queueAlgorithm}</span>
                      )}
                   </div>
                 )}
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-full">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                sessionStatus === 'waiting' ? 'bg-yellow-600 text-white' :
                sessionStatus === 'in_progress' ? 'bg-green-600 text-white' :
                sessionStatus === 'completed' ? 'bg-blue-600 text-white' :
                sessionStatus === 'cancelled' ? 'bg-red-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                                 {sessionStatus === 'waiting' ? '⏳ Ожидание' :
                  sessionStatus === 'in_progress' ? 'В процессе' :
                  sessionStatus === 'completed' ? 'Завершена' :
                  sessionStatus === 'cancelled' ? '❌ Отменена' :
                  sessionStatus}
              </span>
            </div>
            
                         <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-full">
               <Clock className="text-mint" size={16} />
               <span className="font-mono font-bold text-white text-sm">
                 {sessionEndedAt ? '⏹️ ' : ''}
                 {sessionTime.split(' ').map((part, index) => {
                   if (part.includes('ч') || part.includes('мин') || part.includes('сек')) {
                     return (
                       <span key={index} className="text-gray-300">
                         {part}
                       </span>
                     )
                   }
                   return part
                 })}
               </span>
             </div>
          </div>
        </div>
      </div>
    </header>
  )
}
