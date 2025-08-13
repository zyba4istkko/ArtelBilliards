import { useState, useEffect } from 'react'
import { Card, CardContent, Button, Container, Typography, Grid, Box, Chip, CircularProgress, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PlayArrow, Group, Timer, Star } from '@mui/icons-material'
import { toast } from 'sonner'

import { TemplateService } from '../api/services/templateService'
import type { GameTemplate, GameTemplateListResponse } from '../api/types'

function TemplatesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templatesData, setTemplatesData] = useState<GameTemplateListResponse | null>(null)

  // Загрузка шаблонов при монтировании компонента
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await TemplateService.getTemplates({ 
        page: 1, 
        page_size: 20,
        is_public: true 
      })
      setTemplatesData(data)
      console.log('✅ Templates loaded:', data)
    } catch (err: any) {
      console.error('❌ Error loading templates:', err)
      setError(err.message || 'Ошибка загрузки шаблонов')
      toast.error('Не удалось загрузить шаблоны')
    } finally {
      setLoading(false)
    }
  }

  const handleStartGame = async (template: GameTemplate) => {
    setActionLoading(true)
    try {
      console.log('🎮 Starting game with template:', template.name)
      toast.success(`Создание игры: ${template.name}`)
      
      // Переход на страницу создания сессии с выбранным шаблоном
      navigate(`/session/new?template=${template.id}`)
    } catch (err: any) {
      console.error('❌ Error starting game:', err)
      toast.error('Ошибка создания игры')
    } finally {
      setActionLoading(false)
    }
  }

  const getDifficultyFromGameType = (gameType: string) => {
    switch (gameType) {
      case 'kolkhoz': return 'easy'
      case 'americana': return 'medium'
      case 'moscow_pyramid': return 'hard'
      default: return 'medium'
    }
  }

  const getDifficultyColor = (gameType: string) => {
    const difficulty = getDifficultyFromGameType(gameType)
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'default'
    }
  }

  const getDifficultyLabel = (gameType: string) => {
    const difficulty = getDifficultyFromGameType(gameType)
    switch (difficulty) {
      case 'easy': return 'Легкий'
      case 'medium': return 'Средний'
      case 'hard': return 'Сложный'
      default: return 'Средний'
    }
  }

  const getGameTypeLabel = (gameType: string) => {
    switch (gameType) {
      case 'kolkhoz': return 'Колхоз'
      case 'americana': return 'Американка'
      case 'moscow_pyramid': return 'Московская пирамида'
      default: return gameType
    }
  }

  const getEstimatedTime = (template: GameTemplate) => {
    // Определяем время на основе типа игры
    switch (template.game_type) {
      case 'kolkhoz': return '15-30 мин'
      case 'americana': return '20-45 мин'
      case 'moscow_pyramid': return '30-60 мин'
      default: return '20-40 мин'
    }
  }

  const getMaxPlayers = (template: GameTemplate) => {
    // Извлекаем из rules или используем значение по умолчанию
    try {
      if (template.rules && typeof template.rules === 'object' && 'max_players' in template.rules) {
        return template.rules.max_players
      }
    } catch (e) {
      console.warn('Could not parse rules for template:', template.id)
    }
    return 8 // значение по умолчанию
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Загрузка шаблонов...
          </Typography>
        </Box>
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
        {templatesData && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Найдено {templatesData.total} шаблонов в {templatesData.categories.length} категориях
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={loadTemplates}>
            Повторить
          </Button>
        }>
          {error}
        </Alert>
      )}

      {/* Templates Grid */}
      {templatesData && templatesData.templates.length > 0 && (
        <Grid container spacing={3}>
          {templatesData.templates.map((template) => (
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
                    <Box display="flex" gap={1} flexDirection="column" alignItems="flex-end">
                      <Chip 
                        label={getDifficultyLabel(template.game_type)}
                        color={getDifficultyColor(template.game_type) as any}
                        size="small"
                      />
                      {template.is_system && (
                        <Chip 
                          label="Системный"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Game Type */}
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {getGameTypeLabel(template.game_type)}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>

                  {/* Game Info */}
                  <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Group fontSize="small" color="action" />
                      <Typography variant="caption">
                        До {getMaxPlayers(template)} игроков
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Timer fontSize="small" color="action" />
                      <Typography variant="caption">
                        {getEstimatedTime(template)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Star fontSize="small" color="action" />
                      <Typography variant="caption">
                        {template.rating}/5 ({template.usage_count} игр)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Category */}
                  <Box mb={2}>
                    <Chip 
                      label={template.category_name}
                      variant="outlined"
                      size="small"
                      color="primary"
                    />
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PlayArrow />}
                    onClick={() => handleStartGame(template)}
                    disabled={actionLoading}
                    size="large"
                  >
                    {actionLoading ? 'Создание...' : 'Играть'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* No templates message */}
      {templatesData && templatesData.templates.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Шаблоны не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте создать игру вручную
          </Typography>
        </Box>
      )}

      {/* Categories Info */}
      {templatesData && templatesData.categories.length > 0 && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Доступные категории
          </Typography>
          <Grid container spacing={2}>
            {templatesData.categories.map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {category.description}
                    </Typography>
                    <Typography variant="caption" color="primary">
                      {category.templates_count} шаблонов
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  )
}

export default TemplatesPage 