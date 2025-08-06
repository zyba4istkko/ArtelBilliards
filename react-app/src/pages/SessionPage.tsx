import { Card, CardContent, Button, Container, Typography, Grid, Box, Chip } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { PlayArrow, Group, AccessTime, Settings } from '@mui/icons-material'

function SessionPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  // Mock data - will be replaced with real API calls
  const mockSession = sessionId ? {
    id: sessionId,
    name: '8-Ball Championship',
    template: '8-Ball Pool',
    players: ['Игрок 1', 'Игрок 2'],
    status: 'waiting',
    createdAt: new Date().toISOString()
  } : null

  const handleStartGame = () => {
    if (sessionId) {
      navigate(`/game/${sessionId}`)
    }
  }

  if (!sessionId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center">
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Создание новой игры
          </Typography>
          
          <Card sx={{ mt: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Выберите шаблон игры или настройте параметры вручную
              </Typography>
              
              <Box display="flex" gap={2} justifyContent="center" mt={3}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/templates')}
                >
                  Выбрать шаблон
                </Button>
                <Button variant="outlined" size="large">
                  Настроить вручную
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Сессия: {mockSession?.name}
      </Typography>

      <Grid container spacing={3} mb={4}>
        {/* Session Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Group color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {mockSession?.players.length} игроков
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <AccessTime color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Ожидание
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Settings color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {mockSession?.template}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Session Controls */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Управление сессией
            </Typography>
            <Chip 
              label={mockSession?.status === 'waiting' ? 'Ожидание' : 'В игре'}
              color="warning"
              variant="outlined"
            />
          </Box>

          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Игроки:
            </Typography>
            <Box display="flex" gap={1}>
              {mockSession?.players.map((player, index) => (
                <Chip key={index} label={player} variant="outlined" />
              ))}
            </Box>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button 
              variant="contained" 
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleStartGame}
            >
              Начать игру
            </Button>
            <Button variant="outlined" size="large">
              Настройки
            </Button>
            <Button color="error" variant="outlined" size="large">
              Завершить сессию
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default SessionPage 