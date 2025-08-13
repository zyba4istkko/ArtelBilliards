import { Modal, Fade, Box, Typography, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import { modalStyles } from '../../styles/template-styles'
import tokens from '../../styles/design-tokens'

interface BaseModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'default' | 'large'
}

export function BaseModal({ open, onClose, title, children, size = 'default' }: BaseModalProps) {
  const styles = size === 'large' ? { ...modalStyles, width: { xs: '90%', sm: 700 } } : modalStyles

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: 'div' }}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
        }
      }}
    >
      <Fade in={open}>
        <Box sx={styles}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3, 
            pb: 2, 
            borderBottom: `1px solid ${tokens.colors.gray700}` 
          }}>
            <Typography variant="h5" fontWeight={700} color={tokens.colors.white}>
              {title}
            </Typography>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: tokens.colors.gray300,
                '&:hover': {
                  background: tokens.colors.gray700,
                  color: tokens.colors.white
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
          {children}
        </Box>
      </Fade>
    </Modal>
  )
}
