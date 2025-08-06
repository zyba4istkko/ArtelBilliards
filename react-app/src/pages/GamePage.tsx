import { Card, CardContent, Button, Container, Typography, Grid, Box, LinearProgress } from '@mui/material'
import { useParams } from 'react-router-dom'
import { AccessTime, Person } from '@mui/icons-material'

function GamePage() {
  const { gameId } = useParams()

  // Mock game data
  const game = {
    id: gameId,
    currentPlayer: 'Игрок 1',
    timer: 120, // seconds
    players: [
      { id: '1', name: 'Игрок 1', balls: ['1', '3', '5'], score: 3 },
      { id: '2', name: 'Игрок 2', balls: ['2', '4', '6'], score: 3 }
    ],
    table: {
      balls: [
        { number: '7', position: { x: 100, y: 50 }, type: 'solid' },
        { number: '8', position: { x: 200, y: 100 }, type: 'black' },
        { number: '9', position: { x: 150, y: 75 }, type: 'stripe' }
      ]
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Game Header */}
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom fontWeight="bold">
        Игра #{gameId}
      </Typography>

      {/* Current Player & Timer */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Ход игрока: {game.currentPlayer}
          </Typography>
          <Box sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={(game.timer / 300) * 100} 
              color="warning"
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {game.timer} секунд
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Game Table */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Игровой стол
              </Typography>
              
              {/* Table visualization */}
              <Box 
                sx={{ 
                  bgcolor: 'green',
                  borderRadius: 2,
                  aspectRatio: '2/1',
                  position: 'relative',
                  border: '4px solid #8B4513',
                  p: 2,
                  minHeight: 300
                }}
              >
                {/* Table felt */}
                <Box sx={{ width: '100%', height: '100%', bgcolor: '#228B22', borderRadius: 1, position: 'relative' }}>
                  {/* Balls */}
                  {game.table.balls.map((ball) => (
                    <Box
                      key={ball.number}
                      sx={{
                        position: 'absolute',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        bgcolor: ball.type === 'black' ? 'black' : ball.type === 'solid' ? 'red' : 'blue',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        },
                        left: `${ball.position.x}px`,
                        top: `${ball.position.y}px`
                      }}
                    >
                      {ball.number}
                    </Box>
                  ))}
                  
                  {/* Pockets */}
                  {[
                    { top: -12, left: -12 },
                    { top: -12, right: -12 },
                    { bottom: -12, left: -12 },
                    { bottom: -12, right: -12 },
                    { top: '50%', left: -12, transform: 'translateY(-50%)' },
                    { top: '50%', right: -12, transform: 'translateY(-50%)' }
                  ].map((pocket, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'absolute',
                        width: 24,
                        height: 24,
                        bgcolor: 'black',
                        borderRadius: '50%',
                        ...pocket
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Players & Score */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {game.players.map((player) => (
              <Card key={player.id}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Person color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      {player.name}
                    </Typography>
                    {game.currentPlayer === player.name && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          bgcolor: 'success.main', 
                          color: 'white', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1 
                        }}
                      >
                        Ход
                      </Typography>
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Забитых шаров: {player.score}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {player.balls.map((ball) => (
                        <Box
                          key={ball}
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {ball}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Game Actions */}
      <Card sx={{ mt: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button variant="contained" color="success" size="large">
              Забить шар
            </Button>
            <Button variant="contained" color="warning" size="large">
              Промах
            </Button>
            <Button variant="contained" color="error" size="large">
              Фол
            </Button>
            <Button variant="outlined" size="large">
              Пауза
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default GamePage 