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
import type { GameTemplate, GameTemplateListResponse, GameTemplateCreate, GameType } from '../api/types'
import tokens from '../styles/design-tokens'
import { 
  PriceSelector, 
  OptionSelector,
  BaseModal,
  TemplateCard,
  CreateTemplateCard,
  BallConfigurator,
  SettingsPanel,
  BallsDisplay,
  GameTypeSelector,
  GameTypeFields
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

interface CustomTemplateState {
  name: string
  description: string
  gameType: GameType
  ballCount: string
  timeLimit: string
  winCondition: string
  turnOrder: string
  pointPrice: string
  foulPenalty: string
  balls: BallConfig[]
  // Specific game type fields
  point_value_rubles?: number
  foul_penalty_points?: number
  min_players?: number
  max_players?: number
  game_price_rubles?: number
  balls_to_win?: number
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
  const [customTemplate, setCustomTemplate] = useState<CustomTemplateState>(DEFAULT_TEMPLATE_SETTINGS)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    console.log('🎯 createModalOpen changed to:', createModalOpen)
  }, [createModalOpen])

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
    console.log('🎯 Opening custom template modal')
    console.log('🎯 Current createModalOpen state:', createModalOpen)
    setCreateModalOpen(true)
    console.log('🎯 setCreateModalOpen(true) called')
  }

  const selectTemplate = () => {
    if (!currentTemplate) return
    
    setViewModalOpen(false)
    toast.success(`Выбран шаблон: ${currentTemplate.name}`)
    navigate(`/session?template=${currentTemplate.id}`)
  }

  const saveCustomTemplate = async () => {
    console.log('🎯 Saving custom template:', customTemplate)
    
    if (!customTemplate.name.trim()) {
      toast.error('Введите название шаблона!')
      return
    }
    
    try {
      setLoading(true)
      
      // Создаем правила в зависимости от типа игры
      let rules: any = {
        game_type: customTemplate.gameType,
        queue_algorithm: 'random_no_repeat'
      }

      // Настраиваем поля в зависимости от типа игры
      switch (customTemplate.gameType) {
        case 'kolkhoz':
          rules = {
            ...rules,
            max_players: customTemplate.max_players || 6,
            min_players: customTemplate.min_players || 2,
            balls_total: 15,
            point_value_rubles: customTemplate.point_value_rubles || 50,
            winning_condition: 'last_ball_remaining',
            game_rules: {
              description: 'Классическая русская игра Колхоз. Игра до последнего шара',
              ball_counting: 'point_based',
              foul_penalty_points: customTemplate.foul_penalty_points || 1,
              foul_penalty_description: `Штраф за фол: -${customTemplate.foul_penalty_points || 1} очко`,
              payment_direction: 'clockwise',
              calculate_net_result: true
            }
          }
          break
          
        case 'americana':
          rules = {
            ...rules,
            max_players: 2,
            min_players: 2,
            balls_total: 16,
            balls_to_win: customTemplate.balls_to_win || 8,
            game_price_rubles: customTemplate.game_price_rubles || 500,
            winning_condition: 'first_to_8_balls',
            game_rules: {
              description: `Игра до ${customTemplate.balls_to_win || 8} шаров. Выигрывает тот, кто первым забьет ${customTemplate.balls_to_win || 8} шаров`,
              ball_counting: 'simple_count',
              no_color_values: true
            }
          }
          break
          
        case 'moscow_pyramid':
          rules = {
            ...rules,
            max_players: 2,
            min_players: 2,
            balls_total: 16,
            balls_to_win: customTemplate.balls_to_win || 8,
            game_price_rubles: customTemplate.game_price_rubles || 1000,
            winning_condition: 'first_to_8_balls',
            game_rules: {
              description: `Московская пирамида. Игра одним желтым шаром до ${customTemplate.balls_to_win || 8}. Всего 16 шаров`,
              special_rule: 'yellow_ball_only',
              ball_counting: 'simple_count',
              no_color_values: true,
              yellow_ball_description: 'Игра ведется одним желтым шаром'
            }
          }
          break
      }

      // Настройки UI в зависимости от типа игры
      let settings: any = {
        ui_theme: 'classic'
      }

      switch (customTemplate.gameType) {
        case 'kolkhoz':
          settings = {
            ...settings,
            show_points_counter: true,
            show_running_total: true,
            enable_point_calculation: true,
            show_foul_warnings: true,
            show_payment_direction: true
          }
          break
          
        case 'americana':
          settings = {
            ...settings,
            show_ball_counter: true,
            show_game_progress: true,
            enable_simple_scoring: true,
            show_winning_condition: true
          }
          break
          
        case 'moscow_pyramid':
          settings = {
            ...settings,
            show_ball_counter: true,
            show_game_progress: true,
            enable_simple_scoring: true,
            highlight_yellow_ball: true,
            show_yellow_ball_rule: true,
            show_winning_condition: true
          }
          break
      }

      // Определяем категорию в зависимости от типа игры
      const categoryId = 
        customTemplate.gameType === 'kolkhoz' ? 1 :
        customTemplate.gameType === 'americana' ? 2 : 3 // moscow_pyramid

      // Создаем объект шаблона для API
      const templateData: GameTemplateCreate = {
        name: customTemplate.name,
        description: customTemplate.description,
        game_type: customTemplate.gameType,
        rules,
        settings,
        category_id: categoryId,
        is_public: true,
        tags: [
          'пользовательский',
          customTemplate.gameType === 'kolkhoz' ? 'колхоз' :
          customTemplate.gameType === 'americana' ? 'американка' :
          'московская пирамида'
        ],
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
          {/* DEBUG INFO */}
          <Box sx={{ p: 2, bgcolor: 'red', color: 'white', mb: 2 }}>
            DEBUG: Модальное окно открыто! createModalOpen = {createModalOpen.toString()}
          </Box>
          
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

          {/* Game Type Selector */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
              Тип игры (DEBUG: {customTemplate.gameType})
            </Typography>
            <Box sx={{ p: 2, bgcolor: tokens.colors.gray700, borderRadius: '14px', mb: 2 }}>
              <Typography color={tokens.colors.white}>
                DEBUG: Этот блок должен быть виден. Если видно - проблема в GameTypeSelector.
              </Typography>
            </Box>
            {/* Временно отключаем GameTypeSelector для тестирования */}
            {/*
            <GameTypeSelector 
              value={customTemplate.gameType}
              onChange={(gameType: GameType) => {
                console.log('🎯 GameTypeSelector onChange:', gameType)
                setCustomTemplate({ ...customTemplate, gameType })
              }}
            />
            */}
            <Typography color={tokens.colors.white}>
              GameTypeSelector временно отключен для диагностики
            </Typography>
          </Box>

          {/* Dynamic Game Type Fields */}
          <Box sx={{ mb: 4 }}>
            <GameTypeFields 
              gameType={customTemplate.gameType}
              values={customTemplate}
              onChange={(field: string, value: any) => setCustomTemplate({ ...customTemplate, [field]: value })}
            />
          </Box>

          {/* Ball Configuration - only for kolkhoz */}
          {customTemplate.gameType === 'kolkhoz' && (
            <Box sx={{ mb: 4 }}>
              <BallConfigurator 
                balls={customTemplate.balls}
                onBallChange={(index: number, ball: BallConfig) => {
                  const newBalls = [...customTemplate.balls]
                  newBalls[index] = ball
                  setCustomTemplate({ ...customTemplate, balls: newBalls })
                }}
              />
            </Box>
          )}

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