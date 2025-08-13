import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Home, Description, BarChart, Person, AccountCircle, Login, Dashboard } from '@mui/icons-material'
import { useAuthStore, useUser, useIsAuthenticated } from '../../store/authStore'

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const user = useUser()
  const isAuthenticated = useIsAuthenticated()
  const { logout } = useAuthStore()

  // DEBUG: Логи для отладки состояния авторизации
  console.log('AppLayout DEBUG:', {
    user,
    isAuthenticated,
    location: location.pathname
  })

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // В любом случае перенаправляем на логин
      navigate('/login')
    }
    handleMenuClose()
  }

  const handleLogin = () => {
    navigate('/login')
  }

  // Публичные страницы - доступны всем
  const publicNavItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/profile', label: 'Профиль', icon: Person }
  ]

  // Защищенные страницы - только для авторизованных
  const protectedNavItems = [
    { path: '/app/dashboard', label: 'Дашборд', icon: Dashboard },
    { path: '/app/templates', label: 'Шаблоны', icon: Description },
    { path: '/app/stats', label: 'Статистика', icon: BarChart },
  ]

  // Объединяем элементы навигации в зависимости от авторизации
  const navItems = isAuthenticated 
    ? [...publicNavItems, ...protectedNavItems]
    : publicNavItems

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎱 Artel Billiards
          </Typography>
          
          {isAuthenticated ? (
            <>
              {/* Авторизованный пользователь */}
              {/* User info */}
              {user && (
                <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                  {user.first_name || user.username || 'Пользователь'}
                </Typography>
              )}
              
              {/* Navigation buttons */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Button
                      key={item.path}
                      color="inherit"
                      startIcon={<Icon />}
                      onClick={() => navigate(item.path)}
                      sx={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)'
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </Box>

              {/* User menu */}
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ ml: 2 }}
              >
                <AccountCircle />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose() }}>
                  Профиль
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Выйти
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* Неавторизованный пользователь */}
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Login />}
                onClick={handleLogin}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.8)',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Войти
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, bgcolor: 'background.default' }}>
        <Outlet />
      </Box>

      {/* Mobile Navigation (Bottom) - только для авторизованных */}
      {isAuthenticated && (
        <Box 
          sx={{ 
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            px: 1,
            py: 1
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  flex: 1,
                  flexDirection: 'column',
                  py: 1,
                  color: isActive ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <Icon sx={{ fontSize: 20, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontSize: 10 }}>
                  {item.label}
                </Typography>
              </Button>
            )
          })}
        </Box>
      )}
    </Box>
  )
}

export default AppLayout 