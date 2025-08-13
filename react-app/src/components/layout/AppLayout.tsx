import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem } from '@mui/material'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Home, Description, BarChart, Person, AccountCircle } from '@mui/icons-material'
import { useAuthStore, useUser } from '../store/authStore'

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const user = useUser()
  const { logout } = useAuthStore()

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

  const navItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/templates', label: 'Шаблоны', icon: Description },
    { path: '/stats', label: 'Статистика', icon: BarChart },
    { path: '/profile', label: 'Профиль', icon: Person }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎱 Artel Billiards
          </Typography>
          
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
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, bgcolor: 'background.default' }}>
        <Outlet />
      </Box>

      {/* Mobile Navigation (Bottom) */}
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
    </Box>
  )
}

export default AppLayout 