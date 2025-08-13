import { useState, useEffect } from 'react'
import { Card, CardContent, Button, TextField, Container, Typography, Grid, Box, Avatar, Switch, FormControlLabel, MenuItem } from '@mui/material'
import { Person, Settings, Notifications } from '@mui/icons-material'
import { useAuthStore } from '../store/authStore'

function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  
  // Используем реальные данные пользователя или дефолтные значения
  const [profile, setProfile] = useState({
    name: user?.first_name || user?.username || 'Игрок',
    email: user?.email || 'Не указано',
    level: 5,
    experience: 750,
    nextLevelExp: 1000
  })

  // Обновляем профиль при изменении данных пользователя
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.first_name || user.username || 'Игрок',
        email: user.email || 'Не указано'
      }))
    }
  }, [user])

  const [preferences, setPreferences] = useState({
    difficulty: 'medium',
    soundEnabled: true,
    notifications: true,
    emailNotifications: false,
    achievementNotifications: true
  })

  const handleSaveProfile = () => {
    setIsEditing(false)
    // TODO: Save to API
  }

  // Если не авторизован, показываем сообщение
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" textAlign="center">
          Для просмотра профиля необходимо войти в систему
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom fontWeight="bold">
        Мой профиль
      </Typography>

      {/* Profile Info */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={4} mb={4}>
            <Avatar
              sx={{ width: 96, height: 96, bgcolor: 'primary.main' }}
            >
              <Person sx={{ fontSize: 48 }} />
            </Avatar>
            
            <Box flex={1}>
              {isEditing ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Имя"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    fullWidth
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {profile.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {profile.email}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Уровень {profile.level}
                    </Typography>
                    <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8, mt: 1 }}>
                      <Box 
                        sx={{ 
                          width: `${(profile.experience / profile.nextLevelExp) * 100}%`,
                          bgcolor: 'primary.main',
                          height: 8,
                          borderRadius: 1
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {profile.experience}/{profile.nextLevelExp} XP
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box display="flex" gap={1}>
              {isEditing ? (
                <>
                  <Button variant="contained" color="success" onClick={handleSaveProfile}>
                    Сохранить
                  </Button>
                  <Button variant="outlined" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => setIsEditing(true)}>
                  Редактировать
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Game Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Settings color="primary" />
                <Typography variant="h5" fontWeight="bold">
                  Настройки игры
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  select
                  label="Уровень сложности"
                  value={preferences.difficulty}
                  onChange={(e) => setPreferences({...preferences, difficulty: e.target.value})}
                  fullWidth
                >
                  <MenuItem value="easy">Легкий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                  <MenuItem value="hard">Сложный</MenuItem>
                </TextField>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.soundEnabled}
                      onChange={(e) => setPreferences({...preferences, soundEnabled: e.target.checked})}
                    />
                  }
                  label="Звуки"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Notifications color="warning" />
                <Typography variant="h5" fontWeight="bold">
                  Уведомления
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.notifications}
                      onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Уведомления о играх
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Получать уведомления о новых играх
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Email уведомления
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Получать уведомления на email
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.achievementNotifications}
                      onChange={(e) => setPreferences({...preferences, achievementNotifications: e.target.checked})}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Достижения
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Уведомления о новых достижениях
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box display="flex" gap={2} justifyContent="center" mt={4}>
        <Button variant="contained" size="large">
          Сохранить все настройки
        </Button>
        <Button color="error" variant="outlined" size="large">
          Выйти из аккаунта
        </Button>
      </Box>
    </Container>
  )
}

export default ProfilePage 