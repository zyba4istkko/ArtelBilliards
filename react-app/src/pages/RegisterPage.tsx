import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Avatar, 
  Alert, 
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Link
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Telegram, Google, Visibility, VisibilityOff, Email, Person, Lock } from '@mui/icons-material'
import { useAuthStore, useAuthLoading, useAuthError } from '../store/authStore'
import { telegramWebApp } from '../api/telegram'

function RegisterPage() {
  const navigate = useNavigate()
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  
  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Auth state
  const isLoading = useAuthLoading()
  const error = useAuthError()
  
  // Auth actions
  const { clearError } = useAuthStore()

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.username.trim()) {
      errors.username = 'Имя пользователя обязательно'
    } else if (formData.username.length < 3) {
      errors.username = 'Имя пользователя должно быть не менее 3 символов'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Имя пользователя может содержать только буквы, цифры и подчеркивания'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Введите корректный email'
    }
    
    if (!formData.password) {
      errors.password = 'Пароль обязателен'
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен быть не менее 6 символов'
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают'
    }
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'Имя обязательно'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      // TODO: Implement registration API call
      console.log('Registration data:', formData)
      
      // For now, show success and redirect to login
      alert('Регистрация успешна! Теперь вы можете войти в систему.')
      navigate('/login')
      
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle social login
  const handleTelegramLogin = async () => {
    try {
      // TODO: Implement Telegram registration
      alert('Регистрация через Telegram будет доступна позже')
    } catch (error) {
      console.error('Telegram registration failed:', error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // TODO: Implement Google OAuth registration
      alert('Регистрация через Google будет доступна позже')
    } catch (error) {
      console.error('Google registration failed:', error)
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
            Создайте аккаунт для начала игры
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Registration Form */}
        <Card sx={{ boxShadow: 4, mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Username */}
              <TextField
                label="Имя пользователя"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                error={!!formErrors.username}
                helperText={formErrors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                fullWidth
                required
              />

              {/* First Name */}
              <TextField
                label="Имя"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                fullWidth
                required
              />

              {/* Last Name */}
              <TextField
                label="Фамилия"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                fullWidth
              />

              {/* Email */}
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                fullWidth
                required
              />

              {/* Password */}
              <TextField
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
                required
              />

              {/* Confirm Password */}
              <TextField
                label="Подтвердите пароль"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
                required
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ 
                  py: 1.5,
                  mt: 2
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Создать аккаунт'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Social Registration */}
        <Card sx={{ boxShadow: 2, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
              Или зарегистрируйтесь через
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              {/* Telegram Registration */}
              <Button
                variant="outlined"
                size="large"
                startIcon={<Telegram />}
                onClick={handleTelegramLogin}
                disabled={isLoading || !isInTelegram}
                sx={{ 
                  py: 1.5,
                  borderColor: '#0088cc',
                  color: '#0088cc',
                  '&:hover': {
                    borderColor: '#0077bb',
                    backgroundColor: 'rgba(0, 136, 204, 0.04)'
                  }
                }}
              >
                {isInTelegram ? 'Регистрация через Telegram' : 'Доступно только в Telegram'}
              </Button>

              {/* Google Registration */}
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
                Регистрация через Google
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Login Link */}
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Уже есть аккаунт?{' '}
            <Link 
              href="/login" 
              sx={{ 
                color: 'primary.main', 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Войти в систему
            </Link>
          </Typography>
        </Box>

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

export default RegisterPage
