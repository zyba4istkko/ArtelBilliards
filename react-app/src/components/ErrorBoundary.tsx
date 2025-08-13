import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import tokens from '../styles/design-tokens'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          background: tokens.colors.gray800,
          borderRadius: '18px',
          border: `1px solid ${tokens.colors.error}`,
          maxWidth: 600,
          mx: 'auto',
          mt: 4
        }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Произошла ошибка при загрузке компонента
          </Alert>
          
          <Typography variant="h6" color={tokens.colors.error} gutterBottom>
            Что-то пошло не так
          </Typography>
          
          <Typography variant="body2" color={tokens.colors.gray300} sx={{ mb: 3 }}>
            Произошла ошибка при рендеринге компонента. Попробуйте перезагрузить страницу.
          </Typography>

          {this.state.error && (
            <Box sx={{ 
              background: tokens.colors.gray900, 
              p: 2, 
              borderRadius: '8px',
              mb: 3,
              textAlign: 'left',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              overflow: 'auto'
            }}>
              <Typography variant="caption" color={tokens.colors.error}>
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={this.handleReset}
              sx={{ 
                background: tokens.colors.mint,
                color: tokens.colors.black
              }}
            >
              Попробовать снова
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
              sx={{ 
                borderColor: tokens.colors.gray600,
                color: tokens.colors.white
              }}
            >
              Перезагрузить страницу
            </Button>
          </Box>
        </Box>
      )
    }

    return this.props.children
  }
}
