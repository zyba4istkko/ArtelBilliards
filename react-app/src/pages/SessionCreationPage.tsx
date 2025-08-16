import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { ProgressSteps } from '../components/ui/ProgressSteps'
import { SimplifiedTemplateCard } from '../components/ui/SimplifiedTemplateCard'
import { PlayerManagement } from '../components/ui/PlayerManagement'
import { SessionSummary } from '../components/ui/SessionSummary'
import { TemplateService } from '../api/services/templateService'
import { SessionService } from '../api/services/sessionService'
import type { GameTemplate, Player, GameSession } from '../api/types'
import tokens from '../styles/design-tokens'
import { useUser } from '../store/authStore'

function SessionCreationPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId?: string }>()
  const currentUser = useUser() // 🔄 НОВОЕ: получаем текущего пользователя
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  
  const stepLabels = [
    'Тип игры',
    'Игроки', 
    'Подтверждение'
  ]

  // Template selection state
  const [templates, setTemplates] = useState<GameTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Player management state
  const [players, setPlayers] = useState<Player[]>([])
  const [isStarting, setIsStarting] = useState(false)

  // 🔄 НОВОЕ: Состояние созданной сессии
  const [createdSession, setCreatedSession] = useState<GameSession | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // 🔄 НОВОЕ: Загружаем существующую сессию если sessionId есть в URL
  useEffect(() => {
    if (sessionId && !createdSession) {
      loadExistingSession(sessionId)
    }
  }, [sessionId, createdSession])

  // 🔄 НОВОЕ: Функция загрузки существующей сессии
  const loadExistingSession = async (id: string) => {
    try {
      console.log('🔍 SessionCreationPage: Загружаю существующую сессию:', id)
      const session = await SessionService.getSession(id)
      
      if (session) {
        console.log('✅ SessionCreationPage: Сессия загружена:', session)
        setCreatedSession(session)
        
        // Загружаем шаблон для этой сессии
        if (session.template_id) {
          try {
            console.log('🔍 SessionCreationPage: Загружаю шаблон для сессии:', session.template_id)
            const template = await TemplateService.getTemplate(session.template_id)
            if (template) {
              console.log('✅ SessionCreationPage: Шаблон загружен:', template)
              setSelectedTemplate(template)
            }
          } catch (templateError) {
            console.error('❌ SessionCreationPage: Ошибка загрузки шаблона:', templateError)
            // Не блокируем загрузку сессии, если шаблон не загрузился
          }
        }
        
        // 🔄 НОВОЕ: Загружаем участников сессии из базы данных
        try {
          console.log('🔍 SessionCreationPage: Загружаю участников сессии...')
          const participants = await SessionService.getSessionParticipants(id)
          console.log('✅ SessionCreationPage: Участники загружены:', participants)
          
          // Преобразуем участников в формат Player для локального состояния
          const sessionPlayers = participants.map(participant => ({
            id: participant.id,
            username: participant.display_name, // 🔄 ИСПРАВЛЯЕМ: используем display_name как username
            displayName: participant.display_name,
            isBot: participant.is_empty_user,
            email: undefined,
            first_name: undefined,
            last_name: undefined,
            avatar_url: undefined,
            is_online: undefined,
            last_seen: undefined
          }))
          
          console.log('✅ SessionCreationPage: Участники преобразованы в локальное состояние:', sessionPlayers)
          setPlayers(sessionPlayers)
        } catch (participantsError) {
          console.error('❌ SessionCreationPage: Ошибка загрузки участников:', participantsError)
          // Не блокируем загрузку сессии, если участники не загрузились
        }
        
        // 🔄 НОВОЕ: Устанавливаем правильный шаг на основе creation_step из базы
        const sessionStep = session.creation_step || 1
        console.log(`🔍 SessionCreationPage: Устанавливаю шаг ${sessionStep} на основе creation_step из базы`)
        
        // 🔄 ИСПРАВЛЯЕМ: Убираем автоматический переход, чтобы избежать двойного перехода
        // Теперь ActiveGamesSection сам решает, куда переходить
        console.log('🔄 SessionCreationPage: Сессия загружена, но переход не происходит автоматически')
        
        setCurrentStep(sessionStep)
        
        // 🔄 УБИРАЕМ: Автоматическое исправление статуса при загрузке
        // Теперь пользователь сам решает, когда запускать сессию
      }
    } catch (error) {
      console.error('❌ SessionCreationPage: Ошибка загрузки сессии:', error)
      setError('Ошибка загрузки сессии. Создайте новую.')
    }
  }

  // Load templates on component mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    setError(null)
    
    console.log('🔍 SessionCreationPage: Начинаю загрузку шаблонов...')
    
    try {
      const response = await TemplateService.getTemplates()
      console.log('🔍 SessionCreationPage: Ответ от API:', response)
      console.log('🔍 SessionCreationPage: Тип ответа:', typeof response)
      console.log('🔍 SessionCreationPage: Это массив?', Array.isArray(response))
      
      // API возвращает массив GameTemplateResponse напрямую
      const templatesArray = Array.isArray(response) ? response : []
      console.log('🔍 SessionCreationPage: templatesArray:', templatesArray)
      console.log('🔍 SessionCreationPage: Длина массива:', templatesArray.length)
      
      setTemplates(templatesArray)
      console.log('🔍 SessionCreationPage: Состояние templates обновлено:', templatesArray)
    } catch (err) {
      console.error('❌ SessionCreationPage: Ошибка загрузки шаблонов:', err)
      setError('Ошибка загрузки шаблонов')
    } finally {
      setLoading(false)
      console.log('🔍 SessionCreationPage: Загрузка завершена, loading = false')
    }
  }

  // 🔄 НОВАЯ ЛОГИКА: Создание сессии сразу после выбора шаблона
  const handleTemplateSelect = (template: GameTemplate) => {
    setSelectedTemplate(template)
    
    // 🔄 Если сессия уже существует - обновляем её, иначе создаем новую
    if (createdSession) {
      updateExistingSession(template)
      // 🔄 НОВОЕ: Игроки сохраняются при смене шаблона
    } else {
      createSessionForTemplate(template)
    }
  }



  // 🔄 Отдельная функция для создания сессии
  const createSessionForTemplate = async (template: GameTemplate) => {
    setIsCreatingSession(true)
    setError(null)
    
          try {
        console.log('🔍 SessionCreationPage: Создаю сессию для шаблона:', template.id)
        
        // 🔄 ИСПРАВЛЯЕМ: Определяем display_name для создателя сессии
      let creatorDisplayName = 'Пользователь'
      if (currentUser?.first_name && currentUser.first_name.trim()) {
        creatorDisplayName = currentUser.first_name.trim()
      } else if (currentUser?.username && currentUser.username.trim()) {
        creatorDisplayName = currentUser.username
      }
      
      console.log('🔍 SessionCreationPage: creator_display_name будет установлен как:', creatorDisplayName)
      
      // Создаем сессию в статусе 'waiting'
      const sessionData = await SessionService.createSession({
        name: template.name, // Просто название шаблона без временных суффиксов
        template_id: template.id,
        max_players: 8, // Максимум игроков по умолчанию
        description: `Сессия для игры ${template.name}`,
        creator_display_name: creatorDisplayName // 🔄 ИСПРАВЛЯЕМ: Передаем имя создателя
      })
      
      console.log('✅ SessionCreationPage: Сессия создана:', sessionData)
      
      // 🔄 НОВОЕ: Сохраняем созданную сессию
      setCreatedSession(sessionData)
      
      // 🔄 ИСПРАВЛЯЕМ: Убираем дублирующий вызов addPlayerToSession
      // Участник уже создается при создании сессии с правильным creator_display_name
      console.log('✅ SessionCreationPage: Участник создателя уже добавлен в сессию при создании')
      
      // 🔄 НОВОЕ: Сразу переходим на URL с ID сессии
      navigate(`/session/create/${sessionData.id}`)
      
      // 🔄 НОВОЕ: Переход к шагу 2 теперь происходит автоматически через useEffect
      
    } catch (error) {
      console.error('❌ SessionCreationPage: Ошибка создания сессии:', error)
      setError('Ошибка создания сессии. Попробуйте еще раз.')
    } finally {
      setIsCreatingSession(false)
    }
  }

  // 🔄 Функция обновления существующей сессии
  const updateExistingSession = async (template: GameTemplate) => {
    if (!createdSession) return
    
    setIsCreatingSession(true)
    setError(null)
    
    try {
      console.log('🔄 SessionCreationPage: Обновляю сессию для шаблона:', template.id)
      
      // Обновляем сессию через API
      const updatedSession = await SessionService.updateSession(createdSession.id, {
        name: template.name, // Просто название шаблона без временных суффиксов
        template_id: template.id,
        description: `Сессия для игры ${template.name}`
      })
      
      console.log('✅ SessionCreationPage: Сессия обновлена:', updatedSession)
      
      // Обновляем состояние
      setCreatedSession(updatedSession)
      
    } catch (error) {
      console.error('❌ SessionCreationPage: Ошибка обновления сессии:', error)
      setError('Ошибка обновления сессии. Попробуйте еще раз.')
    } finally {
      setIsCreatingSession(false)
    }
  }

  // 🔄 ИЗМЕНЕНО: Простой переход на дашборд без удаления сессии
  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleNext = async () => {
    if (currentStep === 1 && !selectedTemplate) {
      // Cannot proceed without selecting a template
      return
    }
    
    if (currentStep === 1 && !createdSession) {
      // 🔄 НОВОЕ: Нельзя перейти дальше без создания сессии
      return
    }
    
    if (currentStep === 2 && players.length < 2) {
      // Cannot proceed without at least 2 players
      return
    }
    
    // 🔄 НОВОЕ: Обновляем шаг создания в базе данных
    if (createdSession && currentStep < totalSteps) {
      try {
        const nextStep = currentStep + 1
        console.log(`🔄 SessionCreationPage: Обновляю шаг создания с ${currentStep} на ${nextStep}`)
        
        // 🔄 ИСПРАВЛЯЕМ: НЕ запускаем сессию автоматически при переходе на шаг 3
        // Пользователь сам решит, когда запускать сессию
        await SessionService.updateSession(createdSession.id, {
          creation_step: nextStep
        })
        console.log(`✅ SessionCreationPage: Шаг создания обновлен на ${nextStep}`)
      } catch (error) {
        console.error('❌ SessionCreationPage: Ошибка обновления шага:', error)
        // Не блокируем переход, но логируем ошибку
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      // 🔄 НОВОЕ: Просто переходим к предыдущему шагу без очистки сессии
      setCurrentStep(currentStep - 1)
    }
  }

  // 🔄 ИСПРАВЛЕННАЯ ЛОГИКА: Теперь запускаем сессию при нажатии кнопки
  const handleStartGame = async () => {
    if (!createdSession || players.length === 0) return
    
    setIsStarting(true)
    console.log('🚀 Запускаем сессию:', createdSession.id)
    
    try {
      // 🔄 НОВОЕ: Запускаем сессию (меняем статус на in_progress)
      console.log('🔄 SessionCreationPage: Запускаю сессию...')
      await SessionService.updateSession(createdSession.id, {
        status: 'in_progress'
      })
      console.log('✅ SessionCreationPage: Сессия запущена')
      
      // Обновляем локальное состояние
      setCreatedSession(prev => prev ? { ...prev, status: 'in_progress' } : null)
      
      // Переходим на страницу игровой сессии
      setTimeout(() => {
        setIsStarting(false)
        navigate(`/game-session/${createdSession.id}`)
      }, 1000)
      
    } catch (error) {
      console.error('❌ Ошибка запуска сессии:', error)
      setIsStarting(false)
      setError('Ошибка запуска сессии. Попробуйте еще раз.')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Box>
            <Typography variant="h4" component="h2" sx={{ 
              color: tokens.colors.mint, 
              fontWeight: 700, 
              mb: 2 
            }}>
              Выбери тип игры
            </Typography>
            <Typography variant="body1" sx={{ 
              color: tokens.colors.gray300, 
              mb: 4 
            }}>
              Выбери правила, по которым будете играть
            </Typography>
            
            {/* Template Selection */}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress sx={{ color: tokens.colors.mint }} />
                <Typography sx={{ mt: 2, color: tokens.colors.gray300 }}>
                  Загрузка шаблонов...
                </Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : templates.length === 0 ? (
              <Card sx={{ 
                bgcolor: tokens.colors.gray800, 
                border: `1px solid ${tokens.colors.gray600}`,
                p: 4,
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ color: tokens.colors.gray300 }}>
                  Нет доступных шаблонов
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {templates.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <SimplifiedTemplateCard
                      template={template}
                      isSelected={selectedTemplate?.id === template.id}
                      onSelect={handleTemplateSelect}
                      disabled={isCreatingSession} // 🔄 Блокируем выбор во время создания сессии
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Selection Info */}
            {selectedTemplate && (
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: 'rgba(133, 220, 203, 0.1)', 
                border: `1px solid ${tokens.colors.mint}`, 
                borderRadius: 2 
              }}>
                <Typography variant="body2" sx={{ color: tokens.colors.mint, fontWeight: 600 }}>
                  ✅ Выбран шаблон: {selectedTemplate.name}
                </Typography>
                {isCreatingSession && (
                  <Typography variant="body2" sx={{ color: tokens.colors.mint, mt: 1 }}>
                    🔄 Создание сессии...
                  </Typography>
                )}
                {createdSession && (
                  <Typography variant="body2" sx={{ color: tokens.colors.mint, mt: 1 }}>
                    ✅ Сессия создана: {createdSession.name}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )
      
      case 2:
        return (
          <PlayerManagement 
            onPlayersChange={setPlayers}
            selectedTemplate={selectedTemplate}
            sessionId={createdSession?.id} // 🔄 Передаем ID созданной сессии
          />
        )
      case 3:
        return (
          <SessionSummary
            selectedTemplate={selectedTemplate}
            players={players}
            onStartGame={handleStartGame}
            isStarting={isStarting}
            sessionId={createdSession?.id} // 🔄 Передаем ID созданной сессии
          />
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ 
      bgcolor: tokens.colors.black, 
      minHeight: '100vh', 
      py: 3 
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ 
              color: tokens.colors.mint,
              mr: 2,
              '&:hover': {
                bgcolor: 'rgba(133, 220, 203, 0.1)'
              }
            }}
          >
            Назад
          </Button>
          <Typography variant="h5" component="h1" sx={{ 
            color: tokens.colors.white, 
            fontWeight: 700 
          }}>
            Создание игры
          </Typography>
        </Box>

        {/* Progress Steps */}
        <ProgressSteps 
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
        />

        {/* Step Content */}
        <Card sx={{ 
          bgcolor: tokens.colors.gray800, 
          border: `1px solid ${tokens.colors.gray600}`,
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < totalSteps && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            gap: 2
          }}>
            <Button
              variant="outlined"
              onClick={handlePrev}
              disabled={currentStep === 1}
              sx={{
                borderColor: tokens.colors.gray600,
                color: tokens.colors.white,
                '&:hover': {
                  borderColor: tokens.colors.mint
                }
              }}
            >
              Назад
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!selectedTemplate || !createdSession)) || // 🔄 НОВОЕ: проверяем создание сессии
                (currentStep === 2 && players.length < 2) ||
                isStarting ||
                isCreatingSession // 🔄 Блокируем во время создания сессии
              }
              sx={{
                bgcolor: tokens.colors.mint,
                color: tokens.colors.black,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': { bgcolor: '#6bbf9a' },
                '&:disabled': { 
                  bgcolor: tokens.colors.gray600,
                  color: tokens.colors.gray400
                }
              }}
            >
              {isCreatingSession ? 'Создание сессии...' : 'Далее'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default SessionCreationPage
