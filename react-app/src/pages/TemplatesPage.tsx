import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  CircularProgress,
  Alert,
  Modal,
  IconButton,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Fade
} from '@mui/material'
import { 
  Close,
  Add,
  Settings,
  SportsTennis,
  EmojiEvents,
  Timer,
  Group,
  Star
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { TemplateService } from '../api/services/templateService'
import type { GameTemplate, GameTemplateListResponse } from '../api/types'

interface BallConfig {
  name: string
  color: string
  points: string | number
  enabled: boolean
}

interface CustomTemplateData {
  name: string
  description: string
  ballCount: string
  timeLimit: string
  winCondition: string
  turnOrder: string
  pointPrice: string
  foulPenalty: string
  balls: BallConfig[]
}

function TemplatesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templatesData, setTemplatesData] = useState<GameTemplateListResponse | null>(null)
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<GameTemplate | null>(null)
  
  // Custom template state
  const [customTemplate, setCustomTemplate] = useState<CustomTemplateData>({
    name: '',
    description: '',
    ballCount: '15',
    timeLimit: 'none',
    winCondition: 'last',
    turnOrder: 'sequential',
    pointPrice: '10',
    foulPenalty: '50',
    balls: [
      { name: 'Белый', color: 'white', points: 'Биток', enabled: true },
      { name: 'Желтый', color: 'yellow', points: 2, enabled: true },
      { name: 'Зеленый', color: 'green', points: 3, enabled: true },
      { name: 'Коричневый', color: 'brown', points: 4, enabled: true },
      { name: 'Синий', color: 'blue', points: 5, enabled: true },
      { name: 'Розовый', color: 'pink', points: 6, enabled: true },
      { name: 'Черный', color: 'black', points: 7, enabled: true },
      { name: 'Красные', color: 'red', points: 1, enabled: false },
    ]
  })

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
    } catch (err: any) {
      console.error('❌ Error loading templates:', err)
      setError(err.message || 'Ошибка загрузки шаблонов')
      toast.error('Не удалось загрузить шаблоны')
    } finally {
      setLoading(false)
    }
  }

  const viewTemplate = (template: GameTemplate) => {
    setCurrentTemplate(template)
    setViewModalOpen(true)
  }

  const createCustomTemplate = () => {
    setCreateModalOpen(true)
  }

  const selectTemplate = () => {
    if (!currentTemplate) return
    
    setViewModalOpen(false)
    toast.success(`Выбран шаблон: ${currentTemplate.name}`)
    navigate(`/session?template=${currentTemplate.id}`)
  }

  const saveCustomTemplate = () => {
    if (!customTemplate.name.trim()) {
      toast.error('Введите название шаблона!')
      return
    }
    
    // TODO: Интеграция с API для сохранения кастомного шаблона
    console.log('💾 Saving custom template:', customTemplate)
    
    setCreateModalOpen(false)
    toast.success(`Шаблон "${customTemplate.name}" создан!`)
    
    // После создания можно обновить список шаблонов
    loadTemplates()
  }

  const getTemplateIcon = (gameType: string) => {
    switch (gameType) {
      case 'kolkhoz': return '🎱'
      case 'americana': return '🔴'
      case 'moscow_pyramid': return '🔺'
      default: return '🎯'
    }
  }

  const getBallComponent = (color: string) => {
    const ballStyles = {
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'inline-block',
      border: color === 'white' ? '1px solid #666' : 'none',
      boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.1)',
      position: 'relative' as const
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

    return (
      <Box 
        sx={{ 
          ...ballStyles,
          backgroundColor: ballColors[color] || ballColors.white,
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
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #85DCCB, #E27D60)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Шаблоны игр
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Выбери готовый шаблон или создай свои правила
        </Typography>
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
      <Grid container spacing={3}>
        {/* Template Cards */}
        {templatesData?.templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 1,
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 10px 20px rgba(133, 220, 203, 0.25)',
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => viewTemplate(template)}
            >
              {/* Popular Badge */}
              {template.usage_count > 10 && (
                <Chip 
                  label="Популярный"
                  size="small"
                  color="success"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                />
              )}
              
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                {/* Icon */}
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  background: 'linear-gradient(135deg, #85DCCB, #41B3A3)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  mb: 2,
                  mx: 'auto'
                }}>
                  {getTemplateIcon(template.game_type)}
                </Box>

                {/* Title */}
                <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {template.name}
                </Typography>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: '3em' }}>
                  {template.description}
                </Typography>

                {/* Settings Preview */}
                <Box sx={{ mb: 3, textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">Тип игры:</Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={600}>
                      {template.game_type === 'kolkhoz' ? 'Колхоз' : 
                       template.game_type === 'americana' ? 'Американка' : 
                       template.game_type === 'moscow_pyramid' ? 'Пирамида' : template.game_type}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">Игроков:</Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={600}>До 8</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">Рейтинг:</Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={600}>
                      {template.rating}/5 ({template.usage_count} игр)
                    </Typography>
                  </Box>
                </Box>

                {/* Action Button */}
                <Button 
                  variant="contained"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation()
                    viewTemplate(template)
                  }}
                  sx={{ 
                    borderRadius: '999px',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #85DCCB, #41B3A3)',
                    color: 'black',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.16)'
                    }
                  }}
                >
                  Посмотреть шаблон
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Create Custom Template Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px dashed',
              borderColor: 'divider',
              background: 'rgba(18, 18, 18, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 320,
              '&:hover': {
                borderColor: 'secondary.main',
                background: 'background.paper',
                boxShadow: '0 10px 20px rgba(226, 125, 96, 0.25)',
                transform: 'translateY(-4px)'
              }
            }}
            onClick={createCustomTemplate}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              {/* Icon */}
              <Box sx={{ 
                width: 80, 
                height: 80, 
                background: 'linear-gradient(135deg, #E27D60, #E8A87C)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                mb: 3,
                mx: 'auto',
                transition: 'all 0.3s ease',
                '.MuiCard-root:hover &': {
                  transform: 'scale(1.1) rotate(90deg)'
                }
              }}>
                <Add />
              </Box>

              {/* Title */}
              <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                Создать свой
              </Typography>

              {/* Description */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Настрой правила под себя: количество шаров, очки, стоимость, штрафы и другие параметры
              </Typography>

              {/* Action Button */}
              <Button 
                variant="contained"
                color="secondary"
                sx={{ 
                  borderRadius: '999px',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #E27D60, #E8A87C)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.16)'
                  }
                }}
              >
                Настроить правила
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Template View Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        closeAfterTransition
      >
        <Fade in={viewModalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 600 },
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            p: 4,
            boxShadow: 24
          }}>
            {currentTemplate && (
              <>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      background: 'linear-gradient(135deg, #85DCCB, #41B3A3)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>
                      {getTemplateIcon(currentTemplate.game_type)}
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {currentTemplate.name}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => setViewModalOpen(false)}>
                    <Close />
                  </IconButton>
                </Box>

                {/* Settings Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Тип игры
                      </Typography>
                      <Chip label={currentTemplate.game_type} color="primary" size="small" />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Рейтинг
                      </Typography>
                      <Chip label={`${currentTemplate.rating}/5`} color="secondary" size="small" />
                    </Box>
                  </Grid>
                </Grid>

                {/* Description */}
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {currentTemplate.description}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => setViewModalOpen(false)}>
                    Закрыть
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={selectTemplate}
                    sx={{ 
                      background: 'linear-gradient(135deg, #85DCCB, #41B3A3)',
                      color: 'black',
                      fontWeight: 700
                    }}
                  >
                    Выбрать шаблон
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Create Custom Template Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        closeAfterTransition
      >
        <Fade in={createModalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 700 },
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            p: 4,
            boxShadow: 24
          }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Settings color="primary" />
                <Typography variant="h5" fontWeight={700}>
                  Создать свой шаблон
                </Typography>
              </Box>
              <IconButton onClick={() => setCreateModalOpen(false)}>
                <Close />
              </IconButton>
            </Box>

            {/* Basic Info */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary.main" fontWeight={700} gutterBottom>
                Основная информация
              </Typography>
              <TextField
                fullWidth
                label="Название шаблона"
                value={customTemplate.name}
                onChange={(e) => setCustomTemplate({ ...customTemplate, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Описание"
                value={customTemplate.description}
                onChange={(e) => setCustomTemplate({ ...customTemplate, description: e.target.value })}
              />
            </Box>

            {/* Game Settings */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary.main" fontWeight={700} gutterBottom>
                Настройки игры
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Количество шаров</FormLabel>
                    <RadioGroup
                      row
                      value={customTemplate.ballCount}
                      onChange={(e) => setCustomTemplate({ ...customTemplate, ballCount: e.target.value })}
                    >
                      <FormControlLabel value="8" control={<Radio size="small" />} label="8" />
                      <FormControlLabel value="9" control={<Radio size="small" />} label="9" />
                      <FormControlLabel value="15" control={<Radio size="small" />} label="15" />
                      <FormControlLabel value="21" control={<Radio size="small" />} label="21" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Условие победы</FormLabel>
                    <RadioGroup
                      value={customTemplate.winCondition}
                      onChange={(e) => setCustomTemplate({ ...customTemplate, winCondition: e.target.value })}
                    >
                      <FormControlLabel value="last" control={<Radio size="small" />} label="До последнего" />
                      <FormControlLabel value="50" control={<Radio size="small" />} label="До 50 очков" />
                      <FormControlLabel value="100" control={<Radio size="small" />} label="До 100 очков" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Scoring System */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary.main" fontWeight={700} gutterBottom>
                Система очков
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Стоимость одного очка (₽)"
                    type="number"
                    value={customTemplate.pointPrice}
                    onChange={(e) => setCustomTemplate({ ...customTemplate, pointPrice: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Штраф за фол (₽)"
                    type="number"
                    value={customTemplate.foulPenalty}
                    onChange={(e) => setCustomTemplate({ ...customTemplate, foulPenalty: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Ball Configuration */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary.main" fontWeight={700} gutterBottom>
                Настройки шаров
              </Typography>
              <Grid container spacing={2}>
                {customTemplate.balls.map((ball, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box 
                      sx={{ 
                        bgcolor: ball.enabled ? 'action.hover' : 'action.disabled',
                        borderRadius: 2, 
                        p: 2, 
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: ball.enabled ? 2 : 1,
                        borderColor: ball.enabled ? 'primary.main' : 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => {
                        const newBalls = [...customTemplate.balls]
                        newBalls[index].enabled = !newBalls[index].enabled
                        setCustomTemplate({ ...customTemplate, balls: newBalls })
                      }}
                    >
                      {getBallComponent(ball.color)}
                      <Typography variant="caption" display="block" fontWeight={600} sx={{ mt: 1 }}>
                        {ball.name}
                      </Typography>
                      <TextField
                        size="small"
                        value={ball.points}
                        onChange={(e) => {
                          const newBalls = [...customTemplate.balls]
                          newBalls[index].points = e.target.value
                          setCustomTemplate({ ...customTemplate, balls: newBalls })
                        }}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mt: 1, '& .MuiInputBase-input': { textAlign: 'center', fontSize: '0.7rem' } }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                💡 Нажмите на шар чтобы включить/исключить его из игры
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => setCreateModalOpen(false)}>
                Отмена
              </Button>
              <Button 
                variant="contained"
                onClick={saveCustomTemplate}
                sx={{ 
                  background: 'linear-gradient(135deg, #85DCCB, #41B3A3)',
                  color: 'black',
                  fontWeight: 700
                }}
              >
                Создать шаблон
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Container>
  )
}

export default TemplatesPage 