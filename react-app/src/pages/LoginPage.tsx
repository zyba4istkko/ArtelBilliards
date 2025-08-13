import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  CircularProgress,
  Link,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Telegram,
  Google,
} from '@mui/icons-material'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'
import tokens from '../styles/design-tokens'

interface LoginFormData {
  login: string
  password: string
}

interface FormErrors {
  login?: string
  password?: string
  general?: string
}

function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  
  const [formData, setFormData] = useState<LoginFormData>({
    login: '',
    password: '',
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false)
  const [telegramInfo, setTelegramInfo] = useState<string>('')

  // Check if running in Telegram WebApp
  useEffect(() => {
    const checkTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        setIsTelegramAvailable(true)
        const tg = window.Telegram.WebApp
        const user = tg.initDataUnsafe?.user
        if (user) {
          setTelegramInfo(`Пользователь: ${user.first_name} ${user.last_name || ''} (@${user.username || 'no username'})`)
        }
      }
    }
    
    checkTelegram()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.login.trim()) {
      newErrors.login = 'Введите email или имя пользователя'
    } else if (formData.login.includes('@')) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.login)) {
        newErrors.login = 'Введите корректный email адрес'
      }
    } else if (formData.login.length < 3) {
      newErrors.login = 'Имя пользователя должно содержать минимум 3 символа'
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await login(formData.login, formData.password)
      toast.success('Вход выполнен успешно!')
      navigate('/')
    } catch (error: any) {
      console.error('Login error:', error)
      
      let errorMessage = 'Ошибка входа'
      
      if (error.response?.data) {
        const data = error.response.data
        
        // Обрабатываем разные форматы ошибок
        if (typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (Array.isArray(data.detail)) {
          // Для 422 ошибок валидации
          errorMessage = data.detail.map((err: any) => err.msg).join(', ')
        } else if (data.message) {
          errorMessage = data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    }
  }

  const handleTelegramLogin = async () => {
    if (!isTelegramAvailable) {
      toast.error('Telegram WebApp недоступен')
      return
    }
    
    try {
      // Implementation for Telegram login
      toast.info('Telegram авторизация в разработке')
    } catch (error) {
      toast.error('Ошибка авторизации через Telegram')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Implementation for Google OAuth
      toast.info('Google авторизация в разработке')
    } catch (error) {
      toast.error('Ошибка авторизации через Google')
    }
  }

  const handleDemoMode = () => {
    toast.info('Демо режим включен')
    navigate('/')
  }

  const clearAuthData = () => {
    localStorage.clear()
    window.location.reload()
    toast.info('Данные авторизации очищены')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${tokens.colors.black} 0%, ${tokens.colors.gray900} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: '2rem',
                bgcolor: tokens.colors.darkTeal,
                margin: '0 auto',
                mb: 2,
              }}
            >
              🎱
            </Avatar>
            <Typography variant="h3" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Artel Billiards
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Добро пожаловать в игру
            </Typography>
          </Box>

          {/* Telegram Info Alert */}
          {isTelegramAvailable && telegramInfo && (
            <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2">
                <strong>Запущено в Telegram WebApp</strong><br />
                {telegramInfo}
              </Typography>
            </Alert>
          )}

          {/* General Error Alert */}
          {errors.general && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {errors.general}
            </Alert>
          )}

          {/* Login Form */}
          <Card sx={{ width: '100%', maxWidth: 450 }}>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Email/Username Field */}
                  <TextField
                    fullWidth
                    id="login"
                    label="Email или имя пользователя"
                    placeholder="Email или имя пользователя"
                    value={formData.login}
                    onChange={handleInputChange('login')}
                    error={!!errors.login}
                    helperText={errors.login}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: tokens.colors.gray400 }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Password Field */}
                  <Box>
                    <TextField
                      fullWidth
                      id="password"
                      label="Пароль"
                      placeholder="Пароль"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      error={!!errors.password}
                      helperText={errors.password}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: tokens.colors.gray400 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              disabled={isLoading}
                              sx={{ color: tokens.colors.gray400 }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box sx={{ textAlign: 'right', mt: 1 }}>
                      <Link
                        href="/forgot-password"
                        sx={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.darkTeal,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Забыли пароль?
                      </Link>
                    </Box>
                  </Box>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      minHeight: 48,
                      position: 'relative',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Вход...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </Button>
                </Box>
              </form>

              {/* Social Login */}
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    или
                  </Typography>
                </Divider>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Telegram Login */}
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Telegram />}
                    onClick={handleTelegramLogin}
                    disabled={isLoading}
                    sx={{
                      borderColor: '#0088cc',
                      color: '#0088cc',
                      '&:hover': {
                        borderColor: '#0077bb',
                        backgroundColor: 'rgba(0, 136, 204, 0.1)',
                      },
                    }}
                  >
                    {isTelegramAvailable ? 'Войти через Telegram' : 'Telegram недоступен'}
                  </Button>

                  {/* Google Login */}
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Google />}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    sx={{
                      borderColor: '#dd4b39',
                      color: '#dd4b39',
                      '&:hover': {
                        borderColor: '#c23321',
                        backgroundColor: 'rgba(221, 75, 57, 0.1)',
                      },
                    }}
                  >
                    Войти через Google
                  </Button>
                </Box>

                {/* Demo Mode */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    или для демо-режима
                  </Typography>
                                     <Button
                     variant="text"
                     onClick={handleDemoMode}
                     disabled={isLoading}
                     sx={{
                       color: tokens.colors.gray300,
                       '&:hover': {
                         backgroundColor: `${tokens.colors.gray700}20`,
                       },
                     }}
                   >
                     Продолжить без авторизации
                   </Button>

                   {/* Debug: Clear Auth Data */}
                   {import.meta.env.DEV && (
                     <Button
                       variant="text"
                       onClick={clearAuthData}
                       disabled={isLoading}
                       sx={{
                         color: tokens.colors.error,
                         fontSize: '0.75rem',
                         '&:hover': {
                           backgroundColor: `${tokens.colors.error}10`,
                         },
                       }}
                     >
                       Очистить данные (DEV)
                     </Button>
                   )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Registration Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Нет аккаунта?{' '}
              <Link
                href="/register"
                sx={{
                  color: tokens.colors.darkTeal,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Зарегистрироваться
              </Link>
            </Typography>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center', mt: 2 }}
          >
            © 2025 Artel Billiards. Все права защищены.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default LoginPage 