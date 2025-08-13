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
  Divider,
  Fade,
  Backdrop
} from '@mui/material'
import { 
  Close,
  Add,
  Settings
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { TemplateService } from '../api/services/templateService'
import type { GameTemplate, GameTemplateListResponse } from '../api/types'
import tokens from '../styles/design-tokens'

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
    
    console.log('💾 Saving custom template:', customTemplate)
    
    setCreateModalOpen(false)
    toast.success(`Шаблон "${customTemplate.name}" создан!`)
    
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

  const getBallComponent = (color: string, size: number = 32) => {
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
          width: size,
          height: size,
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
    <Box sx={{ bgcolor: tokens.colors.black, color: tokens.colors.white, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontSize: '2.5rem',
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.coral})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Шаблоны игр
          </Typography>
          <Typography variant="h6" color={tokens.colors.gray300} sx={{ fontSize: '1.125rem' }}>
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
                  background: tokens.colors.gray800,
                  border: `1px solid ${tokens.colors.gray600}`,
                  borderRadius: '18px',
                  padding: 3,
                  transition: 'all 0.25s ease-in-out',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: tokens.colors.mint,
                    boxShadow: '0 10px 20px rgba(133, 220, 203, 0.25)',
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => viewTemplate(template)}
              >
                {/* Popular Badge */}
                {template.usage_count > 10 && (
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: tokens.colors.success,
                    color: tokens.colors.white,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Популярный
                  </Box>
                )}
                
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  {/* Icon */}
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.darkTeal})`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    mb: 2
                  }}>
                    {getTemplateIcon(template.game_type)}
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" component="h3" sx={{ 
                    fontSize: '1.5rem',
                    fontWeight: 700, 
                    mb: 1,
                    color: tokens.colors.white
                  }}>
                    {template.name}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" color={tokens.colors.gray300} sx={{ 
                    mb: 3, 
                    minHeight: '3em',
                    lineHeight: 1.6
                  }}>
                    {template.description}
                  </Typography>

                  {/* Settings Preview */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: '8px',
                      borderBottom: `1px solid ${tokens.colors.gray700}`
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
                        Тип игры:
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 600,
                        color: tokens.colors.mint,
                        fontSize: '0.875rem'
                      }}>
                        {template.game_type === 'kolkhoz' ? 'Колхоз' : 
                         template.game_type === 'americana' ? 'Американка' : 
                         template.game_type === 'moscow_pyramid' ? 'Пирамида' : template.game_type}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: '8px',
                      borderBottom: `1px solid ${tokens.colors.gray700}`
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
                        Рейтинг:
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 600,
                        color: tokens.colors.mint,
                        fontSize: '0.875rem'
                      }}>
                        {template.rating}/5 ({template.usage_count} игр)
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: '8px'
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.875rem', color: tokens.colors.gray300 }}>
                        Стоимость очка:
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 600,
                        color: tokens.colors.mint,
                        fontSize: '0.875rem'
                      }}>
                        10₽
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
                      background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.darkTeal})`,
                      color: tokens.colors.black,
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '14px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-in-out',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.16)'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
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
                border: `2px dashed ${tokens.colors.gray600}`,
                background: tokens.colors.gray900,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: 320,
                borderRadius: '18px',
                padding: 3,
                transition: 'all 0.25s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: tokens.colors.coral,
                  background: tokens.colors.gray800,
                  boxShadow: '0 10px 20px rgba(226, 125, 96, 0.25)',
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={createCustomTemplate}
            >
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                {/* Icon */}
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  background: `linear-gradient(135deg, ${tokens.colors.coral}, ${tokens.colors.peach})`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  mb: 3,
                  transition: 'all 0.25s ease-in-out',
                  '.MuiCard-root:hover &': {
                    transform: 'scale(1.1) rotate(90deg)'
                  }
                }}>
                  ⚙️
                </Box>

                {/* Title */}
                <Typography variant="h6" component="h3" sx={{ 
                  fontSize: '1.5rem',
                  fontWeight: 700, 
                  mb: 1,
                  color: tokens.colors.white
                }}>
                  Создать свой
                </Typography>

                {/* Description */}
                <Typography variant="body2" color={tokens.colors.gray300} sx={{ mb: 3 }}>
                  Настрой правила под себя: количество шаров, очки, стоимость, штрафы и другие параметры
                </Typography>

                {/* Action Button */}
                <Button 
                  variant="contained"
                  sx={{ 
                    background: `linear-gradient(135deg, ${tokens.colors.coral}, ${tokens.colors.peach})`,
                    color: tokens.colors.white,
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
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
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)'
              }
            }
          }}
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
              background: tokens.colors.gray800,
              borderRadius: '18px',
              border: `1px solid ${tokens.colors.gray600}`,
              p: 4,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              {currentTemplate && (
                <>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: `1px solid ${tokens.colors.gray700}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    <IconButton 
                      onClick={() => setViewModalOpen(false)}
                      sx={{ 
                        color: tokens.colors.gray300,
                        '&:hover': {
                          background: tokens.colors.gray700,
                          color: tokens.colors.white
                        }
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Box>

                  {/* Settings Grid */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom color={tokens.colors.white} sx={{ fontSize: '0.875rem' }}>
                          Тип игры
                        </Typography>
                        <Box sx={{
                          color: tokens.colors.mint,
                          fontWeight: 600,
                          padding: '8px 12px',
                          background: tokens.colors.gray600,
                          borderRadius: '999px',
                          display: 'inline-block',
                          fontSize: '0.875rem'
                        }}>
                          {currentTemplate.game_type}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom color={tokens.colors.white} sx={{ fontSize: '0.875rem' }}>
                          Рейтинг
                        </Typography>
                        <Box sx={{
                          color: tokens.colors.mint,
                          fontWeight: 600,
                          padding: '8px 12px',
                          background: tokens.colors.gray600,
                          borderRadius: '999px',
                          display: 'inline-block',
                          fontSize: '0.875rem'
                        }}>
                          {currentTemplate.rating}/5
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Description */}
                  <Typography variant="body1" color={tokens.colors.gray300} sx={{ mb: 3 }}>
                    {currentTemplate.description}
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setViewModalOpen(false)}
                      sx={{
                        background: tokens.colors.gray600,
                        color: tokens.colors.white,
                        border: 'none',
                        '&:hover': {
                          background: tokens.colors.gray500
                        }
                      }}
                    >
                      Закрыть
                    </Button>
                    <Button 
                      variant="contained"
                      onClick={selectTemplate}
                      sx={{ 
                        background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.darkTeal})`,
                        color: tokens.colors.black,
                        fontWeight: 700,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.16)'
                        }
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
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)'
              }
            }
          }}
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
              background: tokens.colors.gray800,
              borderRadius: '18px',
              border: `1px solid ${tokens.colors.gray600}`,
              p: 4,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: `1px solid ${tokens.colors.gray700}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    ⚙️
                  </Box>
                  <Typography variant="h5" fontWeight={700} color={tokens.colors.white}>
                    Создать свой шаблон
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setCreateModalOpen(false)}
                  sx={{ 
                    color: tokens.colors.gray300,
                    '&:hover': {
                      background: tokens.colors.gray700,
                      color: tokens.colors.white
                    }
                  }}
                >
                  <Close />
                </IconButton>
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

              {/* Game Settings */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
                  Настройки игры
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom color={tokens.colors.white} sx={{ fontSize: '0.875rem' }}>
                        Количество шаров
                      </Typography>
                      <RadioGroup
                        row
                        value={customTemplate.ballCount}
                        onChange={(e) => setCustomTemplate({ ...customTemplate, ballCount: e.target.value })}
                        sx={{ 
                          '& .MuiFormControlLabel-label': { 
                            color: tokens.colors.white,
                            fontSize: '0.875rem'
                          } 
                        }}
                      >
                        <FormControlLabel value="15" control={<Radio size="small" sx={{ color: tokens.colors.mint }} />} label="15" />
                        <FormControlLabel value="8" control={<Radio size="small" sx={{ color: tokens.colors.mint }} />} label="8" />
                        <FormControlLabel value="9" control={<Radio size="small" sx={{ color: tokens.colors.mint }} />} label="9" />
                        <FormControlLabel value="21" control={<Radio size="small" sx={{ color: tokens.colors.mint }} />} label="21" />
                      </RadioGroup>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ background: tokens.colors.gray700, borderRadius: '14px', p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom color={tokens.colors.white} sx={{ fontSize: '0.875rem' }}>
                        Условие победы
                      </Typography>
                      <RadioGroup
                        value={customTemplate.winCondition}
                        onChange={(e) => setCustomTemplate({ ...customTemplate, winCondition: e.target.value })}
                        sx={{ 
                          '& .MuiFormControlLabel-label': { 
                            color: tokens.colors.white,
                            fontSize: '0.875rem'
                          } 
                        }}
                      >
                        <FormControlLabel value="last" control={<Radio size="small" sx={{ color: tokens.colors.mint }} />} label="До последнего" />
                        <FormControlLabel value="50" control={<Radio size="small" sx={{ color: tokens.colors.mint }} />} label="До 50 очков" />
                        <FormControlLabel value="100" control={<Radio size="small" sx={{ color: tokens.colors.mint }} />} label="До 100 очков" />
                      </RadioGroup>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Scoring System */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
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
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Штраф за фол (₽)"
                      type="number"
                      value={customTemplate.foulPenalty}
                      onChange={(e) => setCustomTemplate({ ...customTemplate, foulPenalty: e.target.value })}
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
                  </Grid>
                </Grid>
              </Box>

              {/* Ball Configuration */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" color={tokens.colors.mint} fontWeight={700} gutterBottom sx={{ fontSize: '1.125rem' }}>
                  Настройки шаров
                </Typography>
                <Grid container spacing={2}>
                  {customTemplate.balls.map((ball, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box 
                        sx={{ 
                          background: ball.enabled ? tokens.colors.gray700 : tokens.colors.gray600,
                          borderRadius: '14px', 
                          p: 2, 
                          textAlign: 'center',
                          cursor: 'pointer',
                          border: ball.enabled ? `2px solid ${tokens.colors.mint}` : `1px solid ${tokens.colors.gray600}`,
                          transition: 'all 0.15s ease-in-out',
                          '&:hover': {
                            background: ball.enabled ? tokens.colors.gray600 : tokens.colors.gray500,
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
                        <Typography variant="caption" display="block" fontWeight={600} sx={{ mt: 1, color: tokens.colors.white, fontSize: '0.75rem' }}>
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
                          sx={{ 
                            mt: 1, 
                            '& .MuiInputBase-input': { 
                              textAlign: 'center', 
                              fontSize: '0.7rem',
                              color: tokens.colors.white
                            },
                            '& .MuiInputBase-root': {
                              background: tokens.colors.gray600,
                              borderRadius: '6px'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Typography variant="caption" color={tokens.colors.gray300} sx={{ mt: 1, display: 'block', fontSize: '0.8rem' }}>
                  💡 Нажмите на шар чтобы включить/исключить его из игры
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined"
                  onClick={() => setCreateModalOpen(false)}
                  sx={{
                    background: tokens.colors.gray600,
                    color: tokens.colors.white,
                    border: 'none',
                    '&:hover': {
                      background: tokens.colors.gray500
                    }
                  }}
                >
                  Отмена
                </Button>
                <Button 
                  variant="contained"
                  onClick={saveCustomTemplate}
                  sx={{ 
                    background: `linear-gradient(135deg, ${tokens.colors.mint}, ${tokens.colors.darkTeal})`,
                    color: tokens.colors.black,
                    fontWeight: 700,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.16)'
                    }
                  }}
                >
                  Создать шаблон
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Container>
    </Box>
  )
}

export default TemplatesPage 