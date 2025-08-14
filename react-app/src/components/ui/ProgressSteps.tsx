import { Box, Typography } from '@mui/material'
import tokens from '../../styles/design-tokens'

interface ProgressStepsProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}

export function ProgressSteps({ currentStep, totalSteps, stepLabels }: ProgressStepsProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <Box sx={{ mb: 6 }}>
      {/* Progress Steps */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 2, 
        position: 'relative' 
      }}>
        {/* Progress Fill Line */}
        <Box sx={{
          position: 'absolute',
          top: 15,
          left: 0,
          height: 2,
          background: tokens.colors.mint,
          width: `${progressPercentage}%`,
          zIndex: 2,
          transition: 'width 0.3s ease'
        }} />
        
        {/* Background Line */}
        <Box sx={{
          position: 'absolute',
          top: 15,
          left: 0,
          right: 0,
          height: 2,
          background: tokens.colors.gray700,
          zIndex: 1
        }} />

        {/* Step Circles */}
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          
          return (
            <Box
              key={stepNumber}
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                position: 'relative',
                zIndex: 3,
                transition: 'all 0.3s ease',
                background: isCompleted 
                  ? tokens.colors.success 
                  : isActive 
                    ? tokens.colors.mint 
                    : tokens.colors.gray600,
                color: isCompleted || isActive ? tokens.colors.black : tokens.colors.white
              }}
            >
              {isCompleted ? '✓' : stepNumber}
            </Box>
          )
        })}
      </Box>

      {/* Step Labels */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between' 
      }}>
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          
          return (
            <Typography
              key={stepNumber}
              variant="caption"
              sx={{
                fontSize: 12,
                color: isActive ? tokens.colors.mint : tokens.colors.gray300,
                fontWeight: isActive ? 600 : 400,
                textAlign: 'center',
                flex: 1,
                transition: 'all 0.3s ease'
              }}
            >
              {label}
            </Typography>
          )
        })}
      </Box>
    </Box>
  )
}
