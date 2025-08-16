export interface GamePlayer {
  id: string
  display_name: string
  queue_position?: number
  [key: string]: any
}

export interface GamePlayerSortingOptions {
  currentQueue?: string[]
  fallbackSort?: 'queue_position' | 'name'
}

export function sortGamePlayers(
  players: GamePlayer[],
  options: GamePlayerSortingOptions = {}
): GamePlayer[] {
  const {
    currentQueue,
    fallbackSort = 'queue_position'
  } = options

  if (!players || players.length === 0) return []
  
  // Если есть current_queue, сортируем по нему
  if (currentQueue && currentQueue.length > 0) {
    const queueOrder = currentQueue
    const sorted = queueOrder.map(participantId => 
      players.find(p => p.id === participantId)
    ).filter(Boolean) as GamePlayer[]
    
    console.log(`🎮 sortGamePlayers: Игроки отсортированы по current_queue:`, 
      sorted.map(p => `${p.display_name} (${p.id})`))
    
    return sorted
  }
  
  // Fallback: сортируем по queue_position или name
  console.log(`🎮 sortGamePlayers: Используем fallback сортировку по ${fallbackSort}`)
  
  return [...players].sort((a, b) => {
    if (fallbackSort === 'queue_position') {
      return (a.queue_position || 0) - (b.queue_position || 0)
    } else {
      return a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase())
    }
  })
}
