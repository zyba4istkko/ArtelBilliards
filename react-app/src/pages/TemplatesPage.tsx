import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button, 
  CircularProgress,
  Alert,
  TextField
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { TemplateService } from '../api/services/templateService'
import type { GameTemplate, GameTemplateListResponse, GameTemplateCreate } from '../api/types'
import tokens from '../styles/design-tokens'
import { 
  PriceSelector, 
  OptionSelector,
  BaseModal,
  TemplateCard,
  CreateTemplateCard,
  BallConfigurator,
  SettingsPanel,
  BallsDisplay
} from '../components/ui'
import { 
  headerStyles,
  primaryButtonStyles,
  secondaryButtonStyles
} from '../styles/template-styles'
import { 
  DEFAULT_TEMPLATE_SETTINGS,
  BALL_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
  WIN_CONDITION_OPTIONS,
  TURN_ORDER_OPTIONS,
  POINT_PRICE_OPTIONS,
  FOUL_PENALTY_OPTIONS,
  GAME_TYPE_ICONS
} from '../constants/template-constants'
import { getTemplateDetails, normalizeTemplateData } from '../utils/template-utils'
import { useAuthStore } from '../store/authStore'

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
  console.log('🚀 TemplatesPage: Component starting...')
  
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templatesData, setTemplatesData] = useState<GameTemplateListResponse>({
    templates: [],
    total: 0,
    page: 1,
    page_size: 20,
    categories: []
  })

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<GameTemplate | null>(null)
  
  // Custom template state
  const [customTemplate, setCustomTemplate] = useState<CustomTemplateData>(DEFAULT_TEMPLATE_SETTINGS)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Starting to load templates...')
      
      const data = await TemplateService.getTemplates({ 
        page: 1, 
        page_size: 20,
        is_public: true 
      })
      
      console.log('🔍 API Response:', data)
      
      if (!data) {
        throw new Error('Не удалось загрузить шаблоны')
      }
      
      const normalizedData = normalizeTemplateData(data)
      console.log('📋 Normalized data:', normalizedData)
      
      setTemplatesData(normalizedData)
      
    } catch (err) {
      console.error('❌ Error loading templates:', err)
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(errorMessage)
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

  const saveCustomTemplate = async () => {
    if (!customTemplate.name.trim()) {
      toast.error('Введите название шаблона!')
      return
    }
    
    try {
      setLoading(true)
      
      // Создаем объект шаблона для API
      const templateData: GameTemplateCreate = {
        name: customTemplate.name,
        description: customTemplate.description,
        game_type: 'kolkhoz',
        rules: {
          game_type: 'kolkhoz',
          max_players: parseInt(customTemplate.ballCount) || 6,
          min_players: 2,
          point_value_rubles: parseFloat(customTemplate.pointPrice) || 10.0,
          balls: customTemplate.balls
            .filter(ball => ball.enabled)
            .map((ball) => ({
              color: ball.color,
              points: typeof ball.points === 'string' ? 
                (ball.points === 'Биток' ? 0 : parseInt(ball.points) || 1) : 
                ball.points,
              is_required: ball.enabled,
              order_priority: 1
            })),
          queue_algorithm: customTemplate.turnOrder === 'sequential' ? 'manual' : 'always_random',
          payment_direction: 'clockwise',
          allow_queue_change: true,
          calculate_net_result: true
        },
        settings: {
          ui_theme: 'custom',
          show_running_total: true,
          enable_sound_effects: true
        },
        category_id: 2, // Пользовательские (созданная категория)
        is_public: true,
        tags: ['пользовательский', 'кастомный'],
        creator_user_id: user?.id || '00000000-0000-0000-0000-000000000000'
      }
      
      console.log('💾 Creating custom template:', templateData)
      
      // Отправляем запрос на создание шаблона
      const createdTemplate = await TemplateService.createTemplate(templateData)
      
      console.log('✅ Template created:', createdTemplate)
      
      setCreateModalOpen(false)
      toast.success(`Шаблон "${customTemplate.name}" успешно создан!`)
      
      // Перезагружаем список шаблонов
      await loadTemplates()
      
      // Сбрасываем форму
      setCustomTemplate(DEFAULT_TEMPLATE_SETTINGS)
      
    } catch (error: any) {
      console.error('❌ Error creating template:', error)
      toast.error(`Ошибка создания шаблона: ${error.message || 'Неизвестная ошибка'}`)
    } finally {
      setLoading(false)
    }
  }

  const getTemplateIcon = (gameType: string) => {
    return GAME_TYPE_ICONS[gameType] || '🎯'
  }

  console.log('🎨 RENDER: templatesData:', templatesData)
  console.log('🎨 RENDER: loading:', loading)
  console.log('🎨 RENDER: error:', error)

  return (
    <Box sx={{ bgcolor: tokens.colors.black, color: tokens.colors.white, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h1" sx={headerStyles}>
            Шаблоны игр
          </Typography>
          <Typography variant="h6" color={tokens.colors.gray300} sx={{ fontSize: '1.125rem' }}>
            Выбери готовый шаблон или создай свои правила
          </Typography>
        </Box>

        {/* Templates Grid */}
        <Grid container spacing={3}>
          {/* Если загрузка */}
          {loading && (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            </Grid>
          )}

          {/* Если ошибка */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 3 }} action={
                <Button color="inherit" size="small" onClick={loadTemplates}>
                  Повторить
                </Button>
              }>
                {error}
              </Alert>
            </Grid>
          )}

          {/* Если данные загружены */}
          {!loading && !error && (
            <>
              {/* Шаблоны */}
              {templatesData?.templates?.length ? (
                templatesData.templates.map((template) => (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <TemplateCard template={template} onView={viewTemplate} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography color={tokens.colors.gray300} textAlign="center" sx={{ py: 4 }}>
                    Нет доступных шаблонов. Создайте свой!
                  </Typography>
                </Grid>
              )}

              {/* Кнопка создания */}
              <Grid item xs={12} md={6} lg={4}>
                <CreateTemplateCard onClick={createCustomTemplate} />
              </Grid>
            </>
          )}
        </Grid>

        {/* Template View Modal */}
        <BaseModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={currentTemplate?.name || 'Шаблон'}
        >
          {currentTemplate && (
            <>
              {/* Header with Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.darkTeal})`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  {getTemplateIcon(currentTemplate.game_type)}
                </Box>
                <Typography variant="h5" fontWeight={700} color={tokens.colors.white}>
                  {currentTemplate.name}
                </Typography>
              </Box>

              {/* Settings Panel */}
              <SettingsPanel 
                settings={getTemplateDetails(currentTemplate).settings}
                title="Настройки игры"
              />

              {/* Balls Display */}
              <BallsDisplay 
                balls={getTemplateDetails(currentTemplate).balls}
                title="Настройки шаров"
              />

              {/* Scoring Panel */}
              <SettingsPanel 
                settings={getTemplateDetails(currentTemplate).scoring}
                title="Система очков"
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setViewModalOpen(false)}
                  sx={secondaryButtonStyles}
                >
                  Закрыть
                </Button>
                <Button 
                  variant="contained"
                  onClick={selectTemplate}
                  sx={primaryButtonStyles}
                >
                  Выбрать шаблон
                </Button>
              </Box>
            </>
          )}
        </BaseModal>

        {/* Create Custom Template Modal */}
        <BaseModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Создать свой шаблон"
          size="large"
        >
          {/* Basic Info */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
              Основная информация
            </Typography>
            <TextField
              fullWidth
              label="Название шаблона"
              placeholder="Введите название шаблона..."
              value={customTemplate.name}
              onChange={(e) => setCustomTemplate({ ...customTemplate, name: e.target.value })}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-root': {
                  background: tokens.colors.gray700,
                  color: tokens.colors.white
                },
                '& .MuiInputLabel-root': {
                  color: tokens.colors.gray300
                }
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Описание"
              placeholder="Краткое описание правил игры..."
              value={customTemplate.description}
              onChange={(e) => setCustomTemplate({ ...customTemplate, description: e.target.value })}
              sx={{
                '& .MuiInputBase-root': {
                  background: tokens.colors.gray700,
                  color: tokens.colors.white
                },
                '& .MuiInputLabel-root': {
                  color: tokens.colors.gray300
                }
              }}
            />
          </Box>

          {/* Game Settings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
              Настройки игры
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                  <OptionSelector
                    label="Количество шаров"
                    value={customTemplate.ballCount}
                    onChange={(value) => setCustomTemplate({ ...customTemplate, ballCount: value })}
                    options={BALL_COUNT_OPTIONS}
                    row
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                  <OptionSelector
                    label="Лимит времени на ход"
                    value={customTemplate.timeLimit}
                    onChange={(value) => setCustomTemplate({ ...customTemplate, timeLimit: value })}
                    options={TIME_LIMIT_OPTIONS}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                  <OptionSelector
                    label="Условие победы"
                    value={customTemplate.winCondition}
                    onChange={(value) => setCustomTemplate({ ...customTemplate, winCondition: value })}
                    options={WIN_CONDITION_OPTIONS}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                  <OptionSelector
                    label="Порядок игры"
                    value={customTemplate.turnOrder}
                    onChange={(value) => setCustomTemplate({ ...customTemplate, turnOrder: value })}
                    options={TURN_ORDER_OPTIONS}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Ball Configuration */}
          <Box sx={{ mb: 4 }}>
            <BallConfigurator 
              balls={customTemplate.balls}
              onBallChange={(index, ball) => {
                const newBalls = [...customTemplate.balls]
                newBalls[index] = ball
                setCustomTemplate({ ...customTemplate, balls: newBalls })
              }}
            />
          </Box>

          {/* Scoring System */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
              Система очков
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                  <PriceSelector
                    label="Стоимость одного очка (₽)"
                    value={customTemplate.pointPrice}
                    onChange={(value) => setCustomTemplate({ ...customTemplate, pointPrice: value })}
                    options={POINT_PRICE_OPTIONS}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                  <PriceSelector
                    label="Штраф за фол (₽)"
                    value={customTemplate.foulPenalty}
                    onChange={(value) => setCustomTemplate({ ...customTemplate, foulPenalty: value })}
                    options={FOUL_PENALTY_OPTIONS}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined"
              onClick={() => setCreateModalOpen(false)}
              sx={secondaryButtonStyles}
            >
              Отмена
            </Button>
            <Button 
              variant="contained"
              onClick={saveCustomTemplate}
              sx={primaryButtonStyles}
            >
              Создать шаблон
            </Button>
          </Box>
        </BaseModal>
      </Container>
    </Box>
  )
}

export default TemplatesPage 