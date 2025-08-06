import { useState } from 'react'
import { Card, CardContent, Button, Container, Typography, Grid, Box, Chip, CircularProgress, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PlayArrow, Group, Timer, Star } from '@mui/icons-material'

interface Template {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  maxPlayers: number
  estimatedTime: string
  popularity: number
  rules: string[]
}

function TemplatesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error] = useState<string | null>(null)

  // Mock template data
  const templates: Template[] = [
    {
      id: '1',
      name: '8-Ball Pool',
      description: 'Классическая игра в восьмерку. Самый популярный вид бильярда.',
      difficulty: 'easy',
      maxPlayers: 2,
      estimatedTime: '15-30 мин',
      popularity: 95,
      rules: ['Забить все свои шары', 'Забить черный шар в конце', 'Не касаться чужих шаров']
    },
    {
      id: '2',
      name: '9-Ball Pool',
      description: 'Динамичная игра с шарами от 1 до 9.',
      difficulty: 'medium',
      maxPlayers: 2,
      estimatedTime: '10-20 мин',
      popularity: 78,
      rules: ['Бить по наименьшему номеру', 'Забить 9-й шар', 'Соблюдать порядок ударов']
    },
    {
      id: '3',
      name: 'Straight Pool',
      description: 'Игра до определенного количества очков.',
      difficulty: 'hard',
      maxPlayers: 2,
      estimatedTime: '30-60 мин',
      popularity: 45,
      rules: ['Набрать 150 очков', 'Объявлять лузу и шар', 'Штрафы за нарушения']
    },
    {
      id: '4',
      name: 'Турнир 8-Ball',
      description: 'Турнирный формат игры в восьмерку.',
      difficulty: 'medium',
      maxPlayers: 8,
      estimatedTime: '2-4 часа',
      popularity: 67,
      rules: ['Плей-офф система', 'Лимит времени на ход', 'Официальные правила']
    }
  ]

  const handleStartGame = async (template: Template) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      navigate(`/session/new?template=${template.id}`)
    } catch (err) {
      console.error('Error starting game:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легкий'
      case 'medium': return 'Средний'
      case 'hard': return 'Сложный'
      default: return difficulty
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Шаблоны игр
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Выберите готовый шаблон для быстрого старта
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} key={template.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flex: 1, p: 3 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    {template.name}
                  </Typography>
                  <Chip 
                    label={getDifficultyLabel(template.difficulty)}
                    color={getDifficultyColor(template.difficulty) as any}
                    size="small"
                  />
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>

                {/* Game Info */}
                <Box display="flex" gap={2} mb={3}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Group fontSize="small" color="action" />
                    <Typography variant="caption">
                      До {template.maxPlayers} игроков
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Timer fontSize="small" color="action" />
                    <Typography variant="caption">
                      {template.estimatedTime}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Star fontSize="small" color="action" />
                    <Typography variant="caption">
                      {template.popularity}% популярность
                    </Typography>
                  </Box>
                </Box>

                {/* Rules */}
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Основные правила:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {template.rules.map((rule, index) => (
                      <Typography 
                        key={index} 
                        variant="body2" 
                        color="text.secondary" 
                        component="li"
                        sx={{ mb: 0.5 }}
                      >
                        {rule}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Action Button */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrow />}
                  onClick={() => handleStartGame(template)}
                  disabled={loading}
                  size="large"
                >
                  Играть
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No templates message */}
      {templates.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Шаблоны не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте создать игру вручную
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default TemplatesPage 