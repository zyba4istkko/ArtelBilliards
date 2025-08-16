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
  FiberManualRecord
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { ActiveGamesSection, RecentResultsSection } from '../components/ui'

function DashboardPage() {
  const navigate = useNavigate()



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

        {/* Active Games - теперь с реальными данными */}
        <ActiveGamesSection />

        {/* Recent Results - теперь с реальными данными и пагинацией */}
        <RecentResultsSection />
      </Container>
    </Box>
  )
}

export default DashboardPage
