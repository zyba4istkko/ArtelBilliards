import { Box, Grid, Typography, TextField } from '@mui/material'
import { GameType } from '../../api/types'
import { PriceSelector, OptionSelector } from './'
import tokens from '../../styles/design-tokens'

interface GameTypeFieldsProps {
  gameType: GameType
  values: Record<string, any>
  onChange: (field: string, value: any) => void
}

// Опции для Американки и Московской пирамиды
const BALLS_TO_WIN_OPTIONS = [
  { label: '8 шаров', value: '8' },
  { label: '9 шаров', value: '9' },
  { label: '10 шаров', value: '10' },
]

const GAME_PRICE_OPTIONS = [
  { label: '100₽', value: '100' },
  { label: '200₽', value: '200' },
  { label: '500₽', value: '500' },
  { label: '1000₽', value: '1000' },
  { label: '2000₽', value: '2000' },
]

const POINT_VALUE_OPTIONS = [
  { label: '25₽', value: '25' },
  { label: '50₽', value: '50' },
  { label: '100₽', value: '100' },
  { label: '200₽', value: '200' },
]

const FOUL_PENALTY_OPTIONS = [
  { label: '1 очко', value: '1' },
  { label: '2 очка', value: '2' },
  { label: '3 очка', value: '3' },
]

export function GameTypeFields({ gameType, values, onChange }: GameTypeFieldsProps) {
  const renderKolkhozFields = () => (
    <Box>
      <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
        Настройки Колхоза
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
            <PriceSelector
              label="Стоимость одного очка (₽)"
              value={values.point_value_rubles || '50'}
              onChange={(value) => onChange('point_value_rubles', parseInt(value))}
              options={POINT_VALUE_OPTIONS}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
            <OptionSelector
              label="Штраф за фол (очки)"
              value={values.foul_penalty_points?.toString() || '1'}
              onChange={(value) => onChange('foul_penalty_points', parseInt(value))}
              options={FOUL_PENALTY_OPTIONS}
              row
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
            <TextField
              fullWidth
              label="Минимум игроков"
              type="number"
              value={values.min_players || 2}
              onChange={(e) => onChange('min_players', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 2, max: 6 } }}
              sx={{
                '& .MuiInputBase-root': {
                  background: tokens.colors.gray600,
                  color: tokens.colors.white
                },
                '& .MuiInputLabel-root': {
                  color: tokens.colors.gray300
                }
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
            <TextField
              fullWidth
              label="Максимум игроков"
              type="number"
              value={values.max_players || 6}
              onChange={(e) => onChange('max_players', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 2, max: 6 } }}
              sx={{
                '& .MuiInputBase-root': {
                  background: tokens.colors.gray600,
                  color: tokens.colors.white
                },
                '& .MuiInputLabel-root': {
                  color: tokens.colors.gray300
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )

  const renderAmericanaFields = () => (
    <Box>
      <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
        Настройки Американки
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
            <PriceSelector
              label="Стоимость партии (₽)"
              value={values.game_price_rubles?.toString() || '500'}
              onChange={(value) => onChange('game_price_rubles', parseInt(value))}
              options={GAME_PRICE_OPTIONS}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
            <OptionSelector
              label="Шаров до победы"
              value={values.balls_to_win?.toString() || '8'}
              onChange={(value) => onChange('balls_to_win', parseInt(value))}
              options={BALLS_TO_WIN_OPTIONS}
              row
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
            <Typography variant="subtitle2" color={tokens.colors.gray300} sx={{ mb: 1 }}>
              Особенности игры
            </Typography>
            <Typography variant="body2" color={tokens.colors.gray400}>
              • Игра для 2 игроков<br/>
              • Выигрывает тот, кто первым забьет указанное количество шаров<br/>
              • Простой счет без очков - только количество забитых шаров
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )

  const renderMoscowPyramidFields = () => (
    <Box>
      <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
        Настройки Московской пирамиды
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
            <PriceSelector
              label="Стоимость партии (₽)"
              value={values.game_price_rubles?.toString() || '1000'}
              onChange={(value) => onChange('game_price_rubles', parseInt(value))}
              options={GAME_PRICE_OPTIONS}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
            <OptionSelector
              label="Шаров до победы"
              value={values.balls_to_win?.toString() || '8'}
              onChange={(value) => onChange('balls_to_win', parseInt(value))}
              options={BALLS_TO_WIN_OPTIONS}
              row
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ 
            background: `linear-gradient(135deg, ${tokens.colors.coral}20, ${tokens.colors.mint}20)`,
            borderRadius: '14px', 
            p: 2,
            border: `1px solid ${tokens.colors.mint}40`
          }}>
            <Typography variant="subtitle2" color={tokens.colors.mint} sx={{ mb: 1, fontWeight: 600 }}>
              🔺 Особенности Московской пирамиды
            </Typography>
            <Typography variant="body2" color={tokens.colors.gray300}>
              • Игра для 2 игроков одним желтым шаром<br/>
              • Всего на столе 16 шаров (15 + желтый биток)<br/>
              • Выигрывает тот, кто первым забьет указанное количество шаров<br/>
              • Игра ведется только желтым шаром - остальные шары являются целями
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )

  switch (gameType) {
    case 'kolkhoz':
      return renderKolkhozFields()
    case 'americana':
      return renderAmericanaFields()
    case 'moscow_pyramid':
      return renderMoscowPyramidFields()
    default:
      return null
  }
}
