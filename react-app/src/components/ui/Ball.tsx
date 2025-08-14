import { Box } from '@mui/material'

interface BallProps {
  color: string
  size?: number | 'sm' | 'md' | 'lg'
}

const ballColors: Record<string, string> = {
  white: '#ffffff',
  yellow: '#ffeb3b',
  green: '#4caf50',
  brown: '#8d6e63',
  blue: '#2196f3',
  pink: '#e91e63',
  black: '#212121',
  red: '#f44336'
}

export function Ball({ color, size = 32 }: BallProps) {
  const getSize = (size: number | 'sm' | 'md' | 'lg'): number => {
    if (typeof size === 'number') return size
    switch (size) {
      case 'sm': return 20
      case 'md': return 32
      case 'lg': return 48
      default: return 32
    }
  }

  const ballSize = getSize(size)
  return (
    <Box 
      sx={{ 
        width: ballSize,
        height: ballSize,
        borderRadius: '50%',
        display: 'inline-block',
        backgroundColor: ballColors[color] || ballColors.white,
        border: color === 'white' ? '1px solid #666' : 'none',
        boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.1)',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '6px',
          left: '10px',
          width: '8px',
          height: '8px',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 60%)',
          borderRadius: '50%'
        }
      }}
    />
  )
}
