# 🎨 Creative Phase: HTML to React Integration Strategy

## Overview
Документация по интеграции 11 HTML прототипов в существующую React архитектуру с сохранением дизайна и добавлением новой функциональности.

## Component Architecture Analysis

### 1. Design System Foundation

#### Design Tokens Expansion
```typescript
// src/styles/design-tokens.ts - ОБНОВЛЕНИЯ
export const colors = {
  // Добавляем новые цвета из HTML прототипов
  coral: '#E27D60',      // secondary/accent 
  peach: '#E8A87C',      // highlight
  rosePurple: '#C38D9E', // special
  darkTeal: '#41B3A3',   // primary/cta (уже есть)
  mint: '#85DCCB',       // accent light
  
  // Расширенная палитра статусов
  online: '#22c55e',     // зеленый для онлайн
  offline: '#6b7280',    // серый для офлайн
  inGame: '#f59e0b',     // оранжевый для "в игре"
  away: '#8b5cf6',       // фиолетовый для "отошел"
}

export const spacing = {
  // Добавляем spacing из HTML
  '2xs': '0.125rem',  // 2px
  xs: '0.25rem',      // 4px
  sm: '0.5rem',       // 8px
  md: '1rem',         // 16px
  lg: '1.5rem',       // 24px
  xl: '2rem',         // 32px
  '2xl': '3rem',      // 48px
  '3xl': '4rem',      // 64px
}

export const borderRadius = {
  none: '0',
  sm: '0.375rem',     // 6px
  md: '0.5rem',       // 8px
  lg: '0.75rem',      // 12px
  xl: '1rem',         // 16px
  '2xl': '1.5rem',    // 24px
  full: '9999px',
}
```

#### Material UI Theme Integration
```typescript
// src/styles/theme.ts - ОБНОВЛЕНИЯ
export function buildTheme(): ReturnType<typeof createTheme> {
  const t = tokens
  
  const themeOptions: ThemeOptions = {
    palette: {
      mode: 'dark',
      primary: { main: t.colors.darkTeal },
      secondary: { main: t.colors.coral },
      // Добавляем новые цвета
      tertiary: { main: t.colors.peach },
      quaternary: { main: t.colors.rosePurple },
      
      // Статус цвета
      success: { main: t.colors.online },
      warning: { main: t.colors.inGame },
      info: { main: t.colors.mint },
      
      background: {
        default: t.colors.black,
        paper: t.colors.gray800,
        surface: t.colors.gray700, // новый уровень
      }
    },
    
    components: {
      // Кастомные компоненты для HTML элементов
      MuiCard: {
        styleOverrides: {
          root: {
            background: t.colors.gray800,
            border: `1px solid ${t.colors.gray700}`,
            borderRadius: t.borderRadius.xl,
            boxShadow: t.shadows.lg,
          }
        }
      }
    }
  }
  
  return createTheme(themeOptions)
}
```

### 2. Atomic Design Components

#### Level 1: Atoms
```typescript
// src/shared/ui/Button/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

// src/shared/ui/Avatar/Avatar.tsx
interface AvatarProps {
  src?: string
  alt?: string
  size: 'sm' | 'md' | 'lg' | 'xl'
  initials?: string
  status?: 'online' | 'offline' | 'in-game' | 'away'
  showStatus?: boolean
}

// src/shared/ui/BallIcon/BallIcon.tsx
interface BallIconProps {
  color: 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black'
  size: 'sm' | 'md' | 'lg'
  variant: '2d' | '3d'
  count?: number // для отображения количества
}

// src/shared/ui/StatusIndicator/StatusIndicator.tsx
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'in-game' | 'away'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  lastSeen?: string
}
```

#### Level 2: Molecules
```typescript
// src/shared/ui/PlayerCard/PlayerCard.tsx
interface PlayerCardProps {
  player: {
    id: string
    name: string
    avatar?: string
    score: number
    money?: number
    status?: PlayerStatus
    pottedBalls?: Ball[]
    fouls?: number
  }
  variant: 'game' | 'session' | 'friend'
  actions?: PlayerAction[]
  onClick?: () => void
}

// src/shared/ui/GameEventItem/GameEventItem.tsx
interface GameEventItemProps {
  event: {
    id: string
    type: 'pot' | 'foul' | 'miss' | 'penalty'
    player: string
    description: string
    timestamp: Date
    author?: string
    editable?: boolean
  }
  onEdit?: (eventId: string) => void
}

// src/shared/ui/StatsCard/StatsCard.tsx
interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon?: React.ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning'
}
```

### 3. Feature-Specific Components

#### Game Feature
```typescript
// src/features/game/ui/ScoreModal/ScoreModal.tsx
interface ScoreModalProps {
  isOpen: boolean
  onClose: () => void
  player: Player
  availableBalls: Ball[]
  onScoreSubmit: (score: ScoreEvent) => void
}

// src/features/game/ui/GameTimer/GameTimer.tsx
interface GameTimerProps {
  gameId: string
  startTime: Date
  isPaused: boolean
  onPause: () => void
  onResume: () => void
}

// src/features/game/ui/SessionProgress/SessionProgress.tsx
interface SessionProgressProps {
  currentStep: number
  totalSteps: number
  steps: StepConfig[]
  onStepClick?: (step: number) => void
}
```

#### Friends Feature
```typescript
// src/features/friends/ui/FriendCard/FriendCard.tsx
interface FriendCardProps {
  friend: Friend
  variant: 'list' | 'grid' | 'compact'
  actions: FriendAction[]
  showStats?: boolean
  onClick?: () => void
}

// src/features/friends/ui/FriendRequest/FriendRequest.tsx
interface FriendRequestProps {
  request: FriendRequest
  type: 'incoming' | 'outgoing'
  onAccept?: () => void
  onReject?: () => void
  onCancel?: () => void
}
```

#### Profile Feature
```typescript
// src/features/profile/ui/ProfileHeader/ProfileHeader.tsx
interface ProfileHeaderProps {
  user: User
  stats: UserStats
  editable?: boolean
  onAvatarChange?: (file: File) => void
  onEdit?: () => void
}

// src/features/profile/ui/SettingsSection/SettingsSection.tsx
interface SettingsSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
}
```

### 4. Page Components Migration Plan

#### HomePage.tsx → Landing Integration
```typescript
// BEFORE: Simple dashboard-style page
// AFTER: Rich landing with 5 sections

interface LandingSection {
  id: string
  title: string
  description: string
  content: React.ReactNode
  background?: string
}

const sections: LandingSection[] = [
  {
    id: 'hero',
    title: 'Стань мастером бильярда',
    description: 'Играй, улучшайся, побеждай с друзьями',
    content: <HeroSection />
  },
  {
    id: 'about',
    title: 'О приложении',
    description: 'Artel Billiards - твой персональный трекер статистики',
    content: <AboutSection />
  },
  // ... остальные секции
]
```

#### SessionPage.tsx → Multi-step Form
```typescript
// BEFORE: Single form
// AFTER: 3-step wizard

interface SessionCreationStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<StepProps>
  validation: ValidationSchema
}

const steps: SessionCreationStep[] = [
  {
    id: 'template',
    title: 'Выбери тип игры',
    description: 'Колхоз, Американка или создай свой',
    component: TemplateSelectionStep,
    validation: templateValidation
  },
  {
    id: 'players',
    title: 'Добавь игроков',
    description: 'Пригласи друзей или добавь вручную',
    component: PlayersStep,
    validation: playersValidation
  },
  {
    id: 'confirmation',
    title: 'Подтверждение',
    description: 'Проверь настройки перед началом',
    component: ConfirmationStep,
    validation: confirmationValidation
  }
]
```

#### GamePage.tsx → Live Game Interface
```typescript
// BEFORE: Static game view
// AFTER: Live score tracking with modals

interface GamePageState {
  game: GameState
  currentPlayer: Player
  scoreModalOpen: boolean
  selectedPlayer?: Player
  gameLog: GameEvent[]
  timer: TimerState
}

// Новые хуки для game state
const useGameState = (gameId: string) => {
  // WebSocket подключение для real-time updates
  // State management для игровых событий
  // Optimistic updates для UI
}

const useScoreInput = () => {
  // Логика ввода очков
  // Валидация забитых шаров
  // Подсчет штрафов
}
```

### 5. State Management Updates

#### Friends Store
```typescript
// src/store/friendsStore.ts
interface FriendsState {
  friends: Friend[]
  requests: FriendRequest[]
  onlineStatus: Record<string, OnlineStatus>
  searchQuery: string
  activeTab: 'all' | 'online' | 'requests'
  
  // Actions
  addFriend: (identifier: string) => Promise<void>
  removeFriend: (friendId: string) => Promise<void>
  acceptRequest: (requestId: string) => Promise<void>
  rejectRequest: (requestId: string) => Promise<void>
  updateOnlineStatus: (updates: OnlineStatusUpdate[]) => void
  setSearchQuery: (query: string) => void
  setActiveTab: (tab: string) => void
}
```

#### Profile Store
```typescript
// src/store/profileStore.ts
interface ProfileState {
  profile: UserProfile
  preferences: GamePreferences
  settings: AppSettings
  privacy: PrivacySettings
  hasChanges: boolean
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void
  updatePreferences: (preferences: GamePreferences) => void
  updateSettings: (settings: AppSettings) => void
  updatePrivacy: (privacy: PrivacySettings) => void
  saveChanges: () => Promise<void>
  discardChanges: () => void
}
```

#### Game Store Enhancements
```typescript
// src/store/gameStore.ts - РАСШИРЕНИЯ
interface GameState {
  // Существующие поля...
  
  // Новые поля из HTML прототипов
  playerCards: PlayerGameCard[]
  gameEvents: GameEvent[]
  currentScoreInput?: ScoreInput
  ballsVisualization: BallState[]
  gameTimer: TimerState
  
  // Новые actions
  updatePlayerScore: (playerId: string, score: ScoreUpdate) => void
  addGameEvent: (event: GameEvent) => void
  openScoreModal: (playerId: string) => void
  closeScoreModal: () => void
  updateBallState: (ballId: string, state: BallState) => void
}
```

### 6. Routing Updates

```typescript
// src/App.tsx - НОВЫЕ МАРШРУТЫ
const routes = [
  // Существующие маршруты...
  
  // Новые маршруты из HTML прототипов
  {
    path: '/register',
    element: <RegisterPage />,
    public: true
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    public: true
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    protected: true
  },
  {
    path: '/friends',
    element: <FriendsPage />,
    protected: true
  },
  
  // Обновленные маршруты
  {
    path: '/',
    element: <HomePage />, // Теперь с landing дизайном
    public: true
  }
]
```

### 7. Performance Considerations

#### Code Splitting
```typescript
// Lazy loading для тяжелых компонентов
const GamePage = lazy(() => import('./pages/GamePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const FriendsPage = lazy(() => import('./pages/FriendsPage'))

// Preloading для критических компонентов
const PlayerCard = lazy(() => 
  import('./features/game/ui/PlayerCard').then(module => ({
    default: module.PlayerCard
  }))
)
```

#### Bundle Optimization
```typescript
// src/shared/ui/index.ts - Barrel exports с tree shaking
export { Button } from './Button/Button'
export { Avatar } from './Avatar/Avatar'
export { BallIcon } from './BallIcon/BallIcon'
// ... только используемые компоненты
```

### 8. Testing Strategy

#### Component Testing
```typescript
// src/shared/ui/PlayerCard/PlayerCard.test.tsx
describe('PlayerCard', () => {
  it('displays player info correctly', () => {
    // Тест отображения данных игрока
  })
  
  it('shows online status indicator', () => {
    // Тест индикатора онлайн статуса
  })
  
  it('handles score updates', () => {
    // Тест обновления очков
  })
})
```

#### Integration Testing
```typescript
// src/features/game/GamePage.integration.test.tsx
describe('Game Page Integration', () => {
  it('complete score input flow', () => {
    // Тест полного флоу ввода очков
    // 1. Клик на игрока
    // 2. Открытие модала
    // 3. Выбор шаров
    // 4. Сохранение
    // 5. Обновление UI
  })
})
```

### 9. Accessibility Improvements

```typescript
// src/shared/ui/BallIcon/BallIcon.tsx
const BallIcon: React.FC<BallIconProps> = ({ color, size, ...props }) => {
  const colorMap = {
    red: { bg: '#dc2626', label: 'Красный шар' },
    yellow: { bg: '#fbbf24', label: 'Желтый шар' },
    // ... остальные цвета
  }
  
  return (
    <div
      role="img"
      aria-label={colorMap[color].label}
      style={{ backgroundColor: colorMap[color].bg }}
      {...props}
    >
      {/* Визуальное представление */}
    </div>
  )
}
```

### 10. Migration Timeline

#### Week 1: Foundation
- [ ] Design tokens update
- [ ] Material UI theme integration
- [ ] Basic UI components (Button, Input, Card, Modal)
- [ ] Avatar with status indicators
- [ ] BallIcon component

#### Week 2: Game Components
- [ ] PlayerCard variants (game, session, friend)
- [ ] ScoreModal with ball selection
- [ ] GameEventLog with filtering
- [ ] GameTimer with pause/resume
- [ ] SessionProgress stepper

#### Week 3: Social & Profile
- [ ] FriendCard with actions
- [ ] FriendRequest handling
- [ ] OnlineStatus management
- [ ] ProfileHeader with stats
- [ ] SettingsSection components

#### Week 4: Page Migrations
- [ ] HomePage → Landing integration
- [ ] LoginPage → new design
- [ ] SessionPage → multi-step form
- [ ] GamePage → live interface
- [ ] StatsPage → detailed analytics

#### Week 5: New Pages
- [ ] RegisterPage creation
- [ ] ForgotPasswordPage creation
- [ ] ProfilePage creation
- [ ] FriendsPage creation
- [ ] State management updates

#### Week 6: Polish & Testing
- [ ] Layout components update
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Testing suite completion
- [ ] Documentation update

## Success Metrics

1. **Visual Consistency**: 100% соответствие HTML прототипам
2. **Performance**: Bundle size увеличение < 20%
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Test Coverage**: > 80% для новых компонентов
5. **User Experience**: Все интерактивные элементы работают
6. **Responsive**: Корректное отображение на всех устройствах

## Risk Mitigation

1. **Component Library Conflicts**: Создание namespace для новых компонентов
2. **State Management Complexity**: Постепенное внедрение новых store
3. **Performance Regression**: Мониторинг bundle size на каждом шаге
4. **Design Inconsistencies**: Использование design tokens для всего
5. **Breaking Changes**: Feature flags для постепенного roll-out
