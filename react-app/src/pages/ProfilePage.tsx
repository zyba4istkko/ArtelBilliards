import { useState } from 'react'
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Avatar,
  Alert,
  Divider
} from '@mui/material'
import { Settings, Person, Lock } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useUser, useIsAuthenticated } from '../store/authStore'

function ProfilePage() {
  const navigate = useNavigate()
  const user = useUser()
  const isAuthenticated = useIsAuthenticated()

  // Если пользователь не авторизован, показываем приглашение войти
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h4" component="h1" gutterBottom>
              Профиль пользователя
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Для просмотра профиля необходимо войти в систему
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Войдите в аккаунт, чтобы получить доступ к настройкам профиля, 
              статистике игр и другим персональным данным.
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/login')}
                sx={{ minWidth: 120 }}
              >
                Войти
              </Button>
              
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/register')}
                sx={{ minWidth: 120 }}
              >
                Регистрация
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Button 
              variant="text" 
              onClick={() => navigate('/')}
              sx={{ color: 'text.secondary' }}
            >
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </Container>
    )
  }

  // Если пользователь авторизован, показываем профиль
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Профиль
      </Typography>
      
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </Avatar>
            
            <Box>
              <Typography variant="h5" component="h2">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username || 'Пользователь'
                }
              </Typography>
              
              {user?.username && (
                <Typography variant="body2" color="text.secondary">
                  @{user.username}
                </Typography>
              )}
              
              {user?.email && (
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Alert severity="info">
            Страница настроек профиля находится в разработке. 
            Здесь будут доступны настройки аккаунта, игровые предпочтения и статистика.
          </Alert>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<Settings />}
              disabled
            >
              Настройки (скоро)
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<Lock />}
              disabled
            >
              Безопасность (скоро)
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

export default ProfilePage 