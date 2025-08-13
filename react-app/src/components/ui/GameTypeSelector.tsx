import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material'
import { GameType } from '../../api/types'
import { GAME_TYPE_ICONS, GAME_TYPE_NAMES } from '../../constants/template-constants'
import tokens from '../../styles/design-tokens'

interface GameTypeSelectorProps {
  value: GameType
  onChange: (gameType: GameType) => void
  label?: string
}

export function GameTypeSelector({ value, onChange, label = "Тип игры" }: GameTypeSelectorProps) {
  const gameTypes: GameType[] = ['kolkhoz', 'americana', 'moscow_pyramid']

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" color={tokens.colors.gray300} sx={{ mb: 2, fontWeight: 600 }}>
        {label}
      </Typography>
      <FormControl fullWidth>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value as GameType)}
          sx={{
            background: tokens.colors.gray700,
            color: tokens.colors.white,
            borderRadius: '14px',
            '& .MuiOutlinedInput-notchedOutline': {
              border: `2px solid ${tokens.colors.gray600}`,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.colors.mint,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.colors.mint,
            },
            '& .MuiSelect-icon': {
              color: tokens.colors.gray300,
            }
          }}
        >
          {gameTypes.map((gameType) => (
            <MenuItem 
              key={gameType} 
              value={gameType}
              sx={{
                color: tokens.colors.white,
                background: tokens.colors.gray700,
                '&:hover': {
                  background: tokens.colors.gray600,
                },
                '&.Mui-selected': {
                  background: tokens.colors.gray600,
                  '&:hover': {
                    background: tokens.colors.gray500,
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ fontSize: '1.2rem' }}>
                  {GAME_TYPE_ICONS[gameType]}
                </Box>
                <Typography>
                  {GAME_TYPE_NAMES[gameType]}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
