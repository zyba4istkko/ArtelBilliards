import { Container, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Home } from '@mui/icons-material'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        py: 4
      }}
    >
      <Box>
        <Typography 
          variant="h1" 
          sx={{ fontSize: { xs: '4rem', md: '6rem' }, fontWeight: 'bold', color: 'primary.main', mb: 2 }}
        >
          404
        </Typography>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Страница не найдена
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          Запрашиваемая страница не существует или была перемещена
        </Typography>
        
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<Home />}
          onClick={() => navigate('/')}
          sx={{ mt: 3 }}
        >
          На главную
        </Button>
      </Box>
    </Container>
  )
}

export default NotFoundPage 