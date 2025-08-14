import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Divider
} from '@mui/material'
import { 
  CheckCircle,
  Cancel,
  EmojiEvents,
  FiberManualRecord
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

function DashboardPage() {
  const navigate = useNavigate()

  // Моковые данные для демонстрации
  const activeGames = [
    {
      id: 1,
      name: '🎱 Колхоз с Игорем',
      type: 'active',
      status: 'В процессе',
      startedAt: '15 минут назад'
    },
    {
      id: 2,
      name: '⚫ Американка',
      type: 'waiting',
      status: 'Ожидание',
      startedAt: 'Ожидает игроков'
    }
  ]

  const recentResults = [
    {
      id: 1,
      outcome: 'win',
      game: '🔺 Пирамида: Победа',
      opponents: 'vs Игорь, Алексей',
      time: 'вчера'
    },
    {
      id: 2,
      outcome: 'loss',
      game: '🎱 Колхоз: Поражение',
      opponents: 'vs Михаил',
      time: '2 дня назад'
    },
    {
      id: 3,
      outcome: 'tournament',
      game: 'Турнир "Золотой кий": 2 место',
      opponents: '8 участников',
      time: 'неделя назад'
    }
  ]

  const quickActions = [
    {
      icon: '🎮',
      title: 'Быстрая игра',
      description: 'Создай новую игру и пригласи игроков',
      action: () => navigate('/session/create'),
      color: 'primary'
    },
    {
      icon: '📋',
      title: 'Шаблоны игр',
      description: 'Выбери из готовых настроек',
      action: () => navigate('/templates'),
      color: 'secondary'
    },
    {
      icon: '📊',
      title: 'Статистика',
      description: 'Посмотри свой прогресс',
      action: () => navigate('/stats'),
      color: 'tertiary'
    },
    {
      icon: '👥',
      title: 'Друзья',
      description: 'Играй с друзьями',
      action: () => navigate('/friends'),
      color: 'quaternary'
    }
  ]

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'win':
        return <CheckCircle sx={{ color: 'success.main' }} />
      case 'loss':
        return <Cancel sx={{ color: 'error.main' }} />
      case 'tournament':
        return <EmojiEvents sx={{ color: 'warning.main' }} />
      default:
        return null
    }
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Quick Actions */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h1" sx={{ 
            color: 'primary.main', 
            fontWeight: 700, 
            mb: 4,
            textAlign: { xs: 'center', md: 'left' }
          }}>
            Быстрые действия
          </Typography>
          
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8,
                      borderColor: `${action.color}.main`
                    },
                    border: 1,
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    {/* Top accent line */}
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${action.color === 'primary' ? 'coral' : action.color === 'secondary' ? 'peach' : action.color === 'tertiary' ? 'mint' : 'rosePurple'}, ${action.color === 'primary' ? 'peach' : action.color === 'secondary' ? 'mint' : action.color === 'tertiary' ? 'coral' : 'peach'})`
                    }} />
                    
                    <Typography variant="h3" sx={{ mb: 2 }}>
                      {action.icon}
                    </Typography>
                    
                    <Typography variant="h6" component="h3" sx={{ 
                      fontWeight: 700, 
                      mb: 1,
                      color: 'text.primary'
                    }}>
                      {action.title}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                      color: 'text.secondary', 
                      mb: 3,
                      minHeight: '2.5em'
                    }}>
                      {action.description}
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      size="small"
                      sx={{ 
                        borderRadius: '999px',
                        px: 3,
                        py: 1,
                        fontWeight: 700,
                        textTransform: 'none'
                      }}
                    >
                      {action.title === 'Быстрая игра' ? 'Играть сейчас' : 
                       action.title === 'Шаблоны игр' ? 'Посмотреть' :
                       action.title === 'Статистика' ? 'Открыть' : 'Управлять'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Active Games */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ 
            color: 'primary.main', 
            fontWeight: 700, 
            mb: 3,
            textAlign: { xs: 'center', md: 'left' }
          }}>
            Активные игры
          </Typography>
          
          <Card sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              {activeGames.map((game, index) => (
                <Box key={game.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 2,
                    px: 2,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    mb: index < activeGames.length - 1 ? 2 : 0,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FiberManualRecord sx={{ 
                        fontSize: 12,
                        color: game.type === 'active' ? 'success.main' : 'warning.main'
                      }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {game.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {game.startedAt}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Chip 
                      label={game.status}
                      size="small"
                      sx={{
                        bgcolor: game.type === 'active' ? 'success.main' : 'warning.main',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>

        {/* Recent Results */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" sx={{ 
            color: 'primary.main', 
            fontWeight: 700, 
            mb: 3,
            textAlign: { xs: 'center', md: 'left' }
          }}>
            Недавние результаты
          </Typography>
          
          <Card sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              {recentResults.map((result, index) => (
                <Box key={result.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 2,
                    px: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getOutcomeIcon(result.outcome)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {result.game}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {result.opponents}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {result.time}
                    </Typography>
                  </Box>
                  
                  {index < recentResults.length - 1 && (
                    <Divider sx={{ mx: 2 }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}

export default DashboardPage
