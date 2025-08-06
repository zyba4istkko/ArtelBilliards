import { Card, CardContent, Button, Container, Typography, Grid, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PlayArrow, Description, BarChart, Star, Group } from '@mui/icons-material'

function HomePage() {
  const navigate = useNavigate()

  const quickActions = [
    {
      title: 'Быстрая игра',
      description: 'Начни игру с случайными настройками',
      icon: PlayArrow,
      action: () => navigate('/session'),
      count: '2 мин'
    },
    {
      title: 'Шаблоны игр',
      description: 'Выбери из готовых настроек',
      icon: Description,
      action: () => navigate('/templates'),
      count: '8 шаблонов'
    },
    {
      title: 'Статистика',
      description: 'Посмотри свои результаты',
      icon: BarChart,
      action: () => navigate('/stats'),
      count: '47 игр'
    },
    {
      title: 'Достижения',
      description: 'Прогресс и награды',
      icon: Star,
      action: () => navigate('/stats'),
      count: '12 наград'
    },
    {
      title: 'Друзья',
      description: 'Играй с друзьями',
      icon: Group,
      action: () => navigate('/profile'),
      count: '5 друзей'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Artel Billiards
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          Лучшая игра в бильярд онлайн
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<PlayArrow />}
          onClick={() => navigate('/session')}
          sx={{ px: 4, py: 1.5 }}
        >
          Начать играть
        </Button>
      </Box>

      {/* Quick Actions */}
      <Typography variant="h4" component="h2" gutterBottom>
        Быстрые действия
      </Typography>
      
      <Grid container spacing={3}>
        {quickActions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
                onClick={action.action}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <IconComponent color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="caption" color="primary">
                      {action.count}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {action.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Stats Section */}
      <Box mt={6}>
        <Typography variant="h4" component="h2" gutterBottom>
          Твоя статистика
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  47
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Всего игр
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h3" color="success.main" fontWeight="bold">
                  32
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Побед
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h3" color="warning.main" fontWeight="bold">
                  68%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Процент побед
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default HomePage 