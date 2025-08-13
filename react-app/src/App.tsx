import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Layout
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TemplatesPage from './pages/TemplatesPage'
import SessionPage from './pages/SessionPage'
import GamePage from './pages/GamePage'
import StatsPage from './pages/StatsPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

// Create Material UI theme
import buildTheme from './styles/theme'
const theme = buildTheme()

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Auth routes - без layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Public routes - доступны всем с layout */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Protected routes - требуют авторизации */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
            </Route>
            
            <Route 
              path="/templates" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TemplatesPage />} />
            </Route>
            
            <Route 
              path="/session" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path=":sessionId?" element={<SessionPage />} />
              <Route index element={<SessionPage />} />
            </Route>
            
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path=":gameId" element={<GamePage />} />
            </Route>
            
            <Route 
              path="/stats" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StatsPage />} />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
