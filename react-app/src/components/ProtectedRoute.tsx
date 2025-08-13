import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuthStore, useIsAuthenticated, useAuthLoading } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()
  const { initialize } = useAuthStore()

  useEffect(() => {
    // Инициализируем auth store при первом заходе
    initialize()
  }, [initialize])

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  // Если не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Если авторизован, показываем защищенный контент
  return <>{children}</>
}

export default ProtectedRoute
