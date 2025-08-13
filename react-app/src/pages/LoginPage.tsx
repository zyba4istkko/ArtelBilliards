import { useEffect } from 'react'
import { Card, CardContent, Button, Container, Typography, Box, Avatar, Alert, CircularProgress, Link } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Telegram, Google } from '@mui/icons-material'
import { useAuthStore, useIsAuthenticated, useAuthLoading, useAuthError } from '../store/authStore'
import { telegramWebApp } from '../api/telegram'

function LoginPage() {
  const navigate = useNavigate()
  
  // Auth state
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()
  const error = useAuthError()
  
  // Auth actions
  const { loginWithTelegram, loginWithGoogle, clearError } = useAuthStore()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  // Clear error on mount
  useEffect(() => {
    clearError()
  }, [clearError])

  const handleTelegramLogin = async () => {
    try {
      await loginWithTelegram()
    } catch (error) {
      console.error('Telegram login failed:', error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // TODO: Implement Google OAuth
      // const googleAuth = gapi.auth2.getAuthInstance()
      // const user = await googleAuth.signIn()
      // const idToken = user.getAuthResponse().id_token
      // await loginWithGoogle(idToken)
      
      alert('Google OAuth будет реализован позже')
    } catch (error) {
      console.error('Google login failed:', error)
    }
  }

  // Telegram WebApp capabilities
  const telegramCapabilities = telegramWebApp.getCapabilities()
  const isInTelegram = telegramWebApp.isInTelegram()

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}
    >
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '2rem'
            }}
          >
            🎱
          </Avatar>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Artel Billiards
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Добро пожаловать в игру
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Telegram Info */}
        {isInTelegram && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Запущено в Telegram WebApp
              <br />
              Версия: {telegramCapabilities.version}
              <br />
              Платформа: {telegramCapabilities.platform}
            </Typography>
          </Alert>
        )}

        {/* Login Form */}
        <Card sx={{ boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Telegram Login */}
              <Button
                variant="contained"
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Telegram />}
                onClick={handleTelegramLogin}
                disabled={isLoading || !isInTelegram}
                sx={{ 
                  py: 1.5,
                  bgcolor: '#0088cc',
                  '&:hover': {
                    bgcolor: '#0077bb'
                  }
                }}
              >
                {isLoading ? 'Вход...' : isInTelegram ? 'Войти через Telegram' : 'Доступно только в Telegram'}
              </Button>

              {/* Google Login */}
              <Button
                variant="outlined"
                size="large"
                startIcon={<Google />}
                onClick={handleGoogleLogin}
                disabled={isLoading}
                sx={{ 
                  py: 1.5,
                  borderColor: '#dd4b39',
                  color: '#dd4b39',
                  '&:hover': {
                    borderColor: '#c23321',
                    backgroundColor: 'rgba(221, 75, 57, 0.04)'
                  }
                }}
              >
                Войти через Google
              </Button>

              {/* Demo Mode for development */}
              {!isInTelegram && (
                <>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    или для демо-режима
                  </Typography>

                  <Button
                    variant="text"
                    onClick={() => navigate('/')}
                    sx={{ textTransform: 'none' }}
                  >
                    Продолжить без авторизации
                  </Button>
                </>
              )}

              {/* Registration Link */}
              <Box textAlign="center" mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Нет аккаунта?{' '}
                  <Link 
                    href="/register" 
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Зарегистрироваться
                  </Link>
                </Typography>
              </Box>

            </Box>
          </CardContent>
        </Card>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Для разработки:</strong>
              <br />
              • В Telegram: автоматическая авторизация
              <br />
              • В браузере: демо-режим доступен
              <br />
              • Telegram данные: {isInTelegram ? '✅ Доступны' : '❌ Недоступны'}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            © 2025 Artel Billiards. Все права защищены.
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default LoginPage 