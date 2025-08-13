import { Box, Button, Container, Typography, Grid, Card, CardContent, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PlayArrow, TrendingUp, Groups, BarChart, Timeline, EmojiEvents, KeyboardArrowDown, Delete } from '@mui/icons-material'
import { useUser, useIsAuthenticated } from '../store/authStore'

function HomePage() {
  const navigate = useNavigate()
  const user = useUser()
  const isAuthenticated = useIsAuthenticated()

  // DEBUG функции
  const clearLocalStorage = () => {
    localStorage.clear()
    window.location.reload()
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  const statisticsFeatures = [
    {
      icon: '🎯',
      title: 'СЧЕТ',
      description: 'Точные очки каждого игрока'
    },
    {
      icon: '⚫',
      title: 'ЗАБИТЫЕ ШАРЫ',
      description: 'Какие шары, в каком порядке'
    },
    {
      icon: '⚠️',
      title: 'ШТРАФЫ',
      description: 'Все нарушения с временными метками'
    },
    {
      icon: '📈',
      title: 'СЕРИИ И ПОДХОДЫ',
      description: 'Анализ эффективности каждого хода'
    },
    {
      icon: '⏱️',
      title: 'ВРЕМЯ ИГРЫ',
      description: 'Длительность партий и ходов'
    }
  ]

  const benefits = [
    {
      icon: <TrendingUp />,
      title: 'ОТСЛЕЖИВАЙ ПРОГРЕСС',
      description: 'Смотри как растет твое мастерство'
    },
    {
      icon: <EmojiEvents />,
      title: 'СОРЕВНУЙСЯ С ДРУЗЬЯМИ',
      description: 'Кто лучший игрок в вашей компании?'
    },
    {
      icon: <BarChart />,
      title: 'АНАЛИЗИРУЙ ИГРУ',
      description: 'Какие типы игр даются лучше всего'
    },
    {
      icon: <Timeline />,
      title: 'СОХРАНЯЙ ИСТОРИЮ',
      description: 'Никогда не забудешь крутые партии'
    }
  ]

  const steps = [
    {
      number: '1️⃣',
      title: 'НАЧНИ ИГРУ',
      description: 'Открой приложение и выбери тип бильярда'
    },
    {
      number: '2️⃣',
      title: 'ДОБАВЬ ИГРОКОВ',
      description: 'Введи имена всех, кто играет'
    },
    {
      number: '3️⃣',
      title: 'ВЕДИ СЧЕТ',
      description: 'Забил шар? Нажми кнопку в приложении!'
    },
    {
      number: '4️⃣',
      title: 'СМОТРИ РЕЗУЛЬТАТ',
      description: 'Кто победил и подробная статистика игры'
    }
  ]

  return (
    <Box sx={{ bgcolor: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
      {/* DEBUG: Блок отладки */}
      {import.meta.env.DEV && (
        <Box sx={{ bgcolor: '#ff4444', p: 2, m: 2, borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>🔧 DEBUG INFO</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            isAuthenticated: {isAuthenticated ? 'true' : 'false'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            user: {user ? JSON.stringify(user) : 'null'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            localStorage: {Object.keys(localStorage).join(', ') || 'пуст'}
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Delete />}
            onClick={clearLocalStorage}
            sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}
          >
            Очистить localStorage
          </Button>
        </Box>
      )}

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #41B3A3 30%, #85DCB 50%, #C38D9E 70%, #0a0a0a 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            bgcolor: '#85DCB',
            opacity: 0.4,
            animation: 'float 6s ease-in-out infinite',
            top: '20%',
            left: '10%',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' }
            }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            bgcolor: '#E27D60',
            opacity: 0.4,
            animation: 'float 8s ease-in-out infinite',
            top: '60%',
            right: '15%'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            bgcolor: '#E8A87C',
            opacity: 0.3,
            animation: 'float 7s ease-in-out infinite',
            top: '40%',
            left: '80%'
          }}
        />
        
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 'bold',
                mb: 2,
                background: 'linear-gradient(45deg, #85DCB, #E27D60, #E8A87C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              🎱 Artel Billiards
            </Typography>
            
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                fontWeight: 'bold',
                mb: 2,
                color: '#85DCB'
              }}
            >
              ВЕДИ СЧЕТ СВОИХ ИГР В БИЛЬЯРД
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: '#b0b0b0',
                mb: 4,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Записывай результаты, отслеживай прогресс, соревнуйся с друзьями
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: '#41B3A3',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#369488',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                НАЧАТЬ ВЕСТИ СЧЕТ
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                endIcon={<KeyboardArrowDown />}
                onClick={() => scrollToSection('about')}
                sx={{
                  borderColor: '#85DCB',
                  color: '#85DCB',
                  px: 4,
                  py: 2,
                  '&:hover': {
                    borderColor: '#6BC7A8',
                    bgcolor: 'rgba(133, 220, 203, 0.1)'
                  }
                }}
              >
                Узнать больше
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* About Section */}
      <Container maxWidth="lg" id="about" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          sx={{
            fontWeight: 'bold',
            mb: 6,
            color: '#85DCB'
          }}
        >
          ЗАЧЕМ ВЕСТИ СТАТИСТИКУ?
        </Typography>
        
        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  bgcolor: '#1a1a1a',
                  border: '1px solid #333',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: '#85DCB',
                    boxShadow: '0 10px 20px rgba(133, 220, 203, 0.2)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: '#E27D60', mr: 2, fontSize: '2rem' }}>
                      {benefit.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#85DCB', fontWeight: 'bold' }}>
                      {benefit.title}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#b0b0b0' }}>
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Statistics Section */}
      <Box sx={{ bgcolor: 'linear-gradient(135deg, #1a1a1a 0%, rgba(65, 179, 163, 0.1) 50%, #1a1a1a 100%)', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: '#85DCB'
            }}
          >
            ДЕТАЛЬНАЯ СТАТИСТИКА КАЖДОЙ ИГРЫ
          </Typography>
          
          <Typography
            textAlign="center"
            sx={{
              color: '#b0b0b0',
              mb: 6,
              fontSize: '1.1rem'
            }}
          >
            ЧТО МЫ ОТСЛЕЖИВАЕМ В РЕАЛЬНОМ ВРЕМЕНИ:
          </Typography>
          
          <Grid container spacing={3}>
            {statisticsFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    bgcolor: '#0a0a0a',
                    border: '1px solid #333',
                    height: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#E8A87C',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '3rem', mb: 2 }}>
                      {feature.icon}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#E8A87C',
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography sx={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Stats Preview */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Card sx={{ bgcolor: '#0a0a0a', border: '1px solid #85DCB', display: 'inline-block', p: 3 }}>
              <Typography variant="h6" sx={{ color: '#85DCB', mb: 2 }}>
                📊 ТВОЯ СТАТИСТИКА
              </Typography>
              <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box>
                  <Typography sx={{ color: '#E27D60', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    84%
                  </Typography>
                  <Typography sx={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                    Точность
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: '#E8A87C', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    68%
                  </Typography>
                  <Typography sx={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                    Побед
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: '#C38D9E', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    12
                  </Typography>
                  <Typography sx={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                    Лучшая серия
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* How it works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          sx={{
            fontWeight: 'bold',
            mb: 6,
            color: '#85DCB'
          }}
        >
          КАК ЭТО РАБОТАЕТ?
        </Typography>
        
        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box textAlign="center">
                <Typography
                  sx={{
                    fontSize: '3rem',
                    mb: 2
                  }}
                >
                  {step.number}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#E27D60',
                    fontWeight: 'bold',
                    mb: 1
                  }}
                >
                  {step.title}
                </Typography>
                <Typography sx={{ color: '#b0b0b0' }}>
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, rgba(195, 141, 158, 0.2) 50%, #1a1a1a 100%)',
          py: 8,
          textAlign: 'center',
          borderTop: '1px solid #333'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 3,
              color: '#85DCB'
            }}
          >
            СТАНЬ ЛУЧШИМ ИГРОКОМ!
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4, flexWrap: 'wrap' }}>
            <Chip
              icon={<span>📱</span>}
              label="Удобно на телефоне"
              sx={{
                bgcolor: '#0a0a0a',
                color: '#E8A87C',
                border: '1px solid #E8A87C'
              }}
            />
            <Chip
              icon={<span>⚡</span>}
              label="Быстрое ведение счета"
              sx={{
                bgcolor: '#0a0a0a',
                color: '#E27D60',
                border: '1px solid #E27D60'
              }}
            />
            <Chip
              icon={<span>🎯</span>}
              label="Точная статистика"
              sx={{
                bgcolor: '#0a0a0a',
                color: '#C38D9E',
                border: '1px solid #C38D9E'
              }}
            />
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<Groups />}
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: '#41B3A3',
              color: 'white',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#369488',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            ВОЙТИ ЧЕРЕЗ TELEGRAM
          </Button>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage 