import { Card, CardContent, Container, Typography, Grid, Box, Chip, LinearProgress } from '@mui/material'
import { EmojiEvents, Person, LocalFireDepartment } from '@mui/icons-material'

function StatsPage() {
  // Mock stats data
  const stats = {
    overview: [
      { label: 'Всего игр', value: 47, icon: '🎮' },
      { label: 'Побед', value: 32, icon: '🏆' },
      { label: 'Поражений', value: 15, icon: '😔' },
      { label: 'Процент побед', value: '68%', icon: '📊' }
    ],
    recentGames: [
      { opponent: 'Игрок А', result: 'Победа', score: '8-3', date: '2025-01-15' },
      { opponent: 'Игрок Б', result: 'Поражение', score: '4-8', date: '2025-01-14' },
      { opponent: 'Игрок В', result: 'Победа', score: '8-1', date: '2025-01-13' },
      { opponent: 'Игрок Г', result: 'Победа', score: '8-6', date: '2025-01-12' },
      { opponent: 'Игрок Д', result: 'Поражение', score: '2-8', date: '2025-01-11' }
    ],
    achievements: [
      { title: 'Первая победа', description: 'Выиграй первую игру', completed: true },
      { title: 'Серия из 5 побед', description: 'Выиграй 5 игр подряд', completed: true },
      { title: 'Мастер 8-ball', description: 'Выиграй 50 игр в 8-ball', completed: false },
      { title: 'Снайпер', description: 'Забей шар с первого удара 10 раз', completed: false }
    ]
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom fontWeight="bold">
        Моя статистика
      </Typography>

      {/* Overview Stats */}
      <Grid container spacing={3} mb={4}>
        {stats.overview.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  {stat.icon}
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Games */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <EmojiEvents color="primary" />
                <Typography variant="h5" fontWeight="bold">
                  Последние игры
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.recentGames.map((game, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1 
                  }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Person color="action" />
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {game.opponent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {game.date}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Chip 
                        label={game.result}
                        color={game.result === 'Победа' ? 'success' : 'error'}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {game.score}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <LocalFireDepartment color="warning" />
                <Typography variant="h5" fontWeight="bold">
                  Достижения
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.achievements.map((achievement, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 2,
                      borderRadius: 2,
                      border: 2,
                      borderColor: achievement.completed ? 'success.main' : 'grey.300',
                      bgcolor: achievement.completed ? 'success.light' : 'grey.50'
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                      <Box flex={1}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          color={achievement.completed ? 'success.dark' : 'text.primary'}
                        >
                          {achievement.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {achievement.description}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 2 }}>
                        {achievement.completed ? (
                          <Box 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: 'success.main', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}
                          >
                            <Typography variant="body2" color="white">
                              ✓
                            </Typography>
                          </Box>
                        ) : (
                          <Box 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: 'grey.300', 
                              borderRadius: '50%' 
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    {achievement.completed && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={100} 
                          color="success" 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default StatsPage 