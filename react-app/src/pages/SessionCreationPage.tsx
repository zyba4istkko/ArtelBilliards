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
import { useNavigate } from 'react-router-dom'
import { ProgressSteps } from '../components/ui/ProgressSteps'
import { SimplifiedTemplateCard } from '../components/ui/SimplifiedTemplateCard'
import { PlayerManagement } from '../components/ui/PlayerManagement'
import { SessionSummary } from '../components/ui/SessionSummary'
import { TemplateService } from '../api/services/templateService'
import { SessionService } from '../api/services/sessionService'
import type { GameTemplate, Player } from '../api/types'
import tokens from '../styles/design-tokens'

function SessionCreationPage() {
  const navigate = useNavigate()
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

  const handleTemplateSelect = (template: GameTemplate) => {
    setSelectedTemplate(template)
  }

  const handleNext = () => {
    if (currentStep === 1 && !selectedTemplate) {
      // Cannot proceed without selecting a template
      return
    }
    
    if (currentStep === 2 && players.length < 2) {
      // Cannot proceed without at least 2 players
      return
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleStartGame = async () => {
    if (!selectedTemplate || players.length === 0) return
    
    setIsStarting(true)
    console.log('�� Начинаю игру...')
    console.log('📋 Данные для создания сессии:', {
      template: selectedTemplate,
      players: players,
      template_id: selectedTemplate.id
    })
    
    try {
      // Создаем сессию через API
      const sessionData = await SessionService.createSession({
        name: `${selectedTemplate.name} с ${players[0].displayName}`,
        template_id: selectedTemplate.id,
        max_players: players.length
      })
      
      console.log('✅ Сессия создана:', sessionData)
      console.log('🔍 Тип sessionData:', typeof sessionData)
      console.log('🔍 sessionData.id:', sessionData?.id)
      
      // Проверяем что получили правильные данные
      if (!sessionData || !sessionData.id) {
        throw new Error(`Invalid session data received: ${JSON.stringify(sessionData)}`)
      }
      
      // Переходим на страницу игровой сессии с реальным UUID
      setTimeout(() => {
        setIsStarting(false)
        navigate(`/game-session/${sessionData.id}`)
      }, 1000)
      
    } catch (error) {
      console.error('❌ Ошибка создания сессии:', error)
      setIsStarting(false)
      // TODO: Показать ошибку пользователю
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
              </Box>
            )}
          </Box>
        )
      
      case 2:
        return (
          <PlayerManagement 
            onPlayersChange={setPlayers}
            selectedTemplate={selectedTemplate}
          />
        )
      case 3:
        return (
          <SessionSummary
            selectedTemplate={selectedTemplate}
            players={players}
            onStartGame={handleStartGame}
            isStarting={isStarting}
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
                (currentStep === 1 && !selectedTemplate) || 
                (currentStep === 2 && players.length < 2) ||
                isStarting
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
              Далее
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default SessionCreationPage
