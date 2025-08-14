import React from 'react'
import { Ball } from './Ball'

interface BallInfo {
  name: string
  points: string
  color: string
}

interface BallsDisplayProps {
  balls: BallInfo[]
  title: string
}

export function BallsDisplay({ balls, title }: BallsDisplayProps) {
  if (!balls || balls.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <h3 className="font-bold text-lg mb-4" style={{ color: '#85DCCB' }}>
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {balls.map((ball, index) => (
          <div 
            key={index}
            className="bg-gray-700 border border-gray-600 rounded-lg p-4 text-center transition-all hover:bg-gray-600"
          >
            <div className="flex justify-center mb-2">
              <Ball color={ball.color} size="md" />
            </div>
            <div className="text-white font-semibold text-sm mb-1">
              {ball.name}
            </div>
            <div className="text-gray-300 text-xs">
              {ball.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
