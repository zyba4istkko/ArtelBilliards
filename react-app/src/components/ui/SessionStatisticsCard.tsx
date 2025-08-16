import React, { useMemo } from 'react'
import { Swords } from 'lucide-react'

interface SessionStatistics {
  totalPoints: number
  totalBalls: number
  totalFouls: number
  totalEarned: number
  totalPaid: number
  netBalance: number
  gamesPlayed: number
  wins: number
}

interface SessionStatisticsCardProps {
  statistics: Record<string, SessionStatistics>
  participants: Array<{ id: string; display_name: string; queue_position?: number }>
}

export default function SessionStatisticsCard({ statistics, participants }: SessionStatisticsCardProps) {
  // 🔄 ОПТИМИЗИРУЕМ: Сортируем участников по позиции в очереди (queue_position)
  // Используем useMemo для предотвращения пересчета при каждом рендере
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      // Если есть queue_position, сортируем по нему
      if (a.queue_position !== undefined && b.queue_position !== undefined) {
        return a.queue_position - b.queue_position
      }
      // Иначе оставляем как есть
      return 0
    })
  }, [participants])

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
        <Swords className="text-mint" size={24} />
        Общий счет сессии
      </h3>
      
      {/* Статистика по игрокам в виде красивых блоков */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedParticipants.map((participant) => {
          const stats = statistics[participant.id]
          if (!stats) return null
          
          return (
            <div key={participant.id} className="bg-gray-700 border border-gray-600 rounded-xl p-4 hover:border-mint/30 transition-colors">
              {/* Заголовок игрока */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-mint to-mint/70 rounded-full flex items-center justify-center text-black font-bold text-lg">
                  {participant.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white text-lg">{participant.display_name}</div>
                  <div className="text-sm text-gray-400">{stats.gamesPlayed} игр</div>
                </div>
              </div>
              
                             {/* Статистика в одну линию */}
               <div className="flex gap-2">
                 {/* Общий баланс - главная метрика */}
                 <div className={`rounded-lg p-1 text-center flex-1 ${
                   stats.netBalance >= 0 
                     ? 'bg-gradient-to-br from-mint/20 to-mint/10 border border-mint/30' 
                     : 'bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/30'
                 }`}>
                   <div className={`text-sm font-bold ${
                     stats.netBalance >= 0 ? 'text-mint' : 'text-red-400'
                   }`}>
                     {stats.netBalance >= 0 ? '+' : ''}{Math.round(stats.netBalance)} ₽
                   </div>
                   <div className="text-xs text-gray-300">Баланс</div>
                 </div>

                 {/* Очки */}
                 <div className="bg-gray-600 border border-gray-500 rounded-lg p-1 text-center flex-1">
                   <div className="text-sm font-bold text-white">{stats.totalPoints}</div>
                   <div className="text-xs text-gray-300">Очки</div>
                 </div>

                 {/* Шары */}
                 <div className="bg-gray-600 border border-gray-500 rounded-lg p-1 text-center flex-1">
                   <div className="text-sm font-bold text-white">{stats.totalBalls}</div>
                   <div className="text-xs text-gray-300">Шары</div>
                 </div>

                 {/* Штрафы */}
                 <div className="bg-gray-600 border border-gray-500 rounded-lg p-1 text-center flex-1">
                   <div className="text-sm font-bold text-white">{stats.totalFouls}</div>
                   <div className="text-xs text-gray-300">Штрафы</div>
                 </div>
               </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
