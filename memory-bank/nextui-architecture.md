# 🎨 NEXTUI АРХИТЕКТУРА - Artel Billiards

**Дата создания:** 15.08.2025  
**Статус:** 🔄 В ПРОЦЕССЕ ВНЕДРЕНИЯ  
**Приоритет:** Высокий  

---

## 🎯 ОБЗОР РЕШЕНИЯ

### Принятое решение
**NextUI** выбран как единая библиотека компонентов для всех дальнейших разработок в проекте Artel Billiards.

### Причины выбора
- ✅ **Современный дизайн** - красивый и интуитивный UI
- ✅ **TypeScript поддержка** - полная типизация компонентов
- ✅ **Производительность** - оптимизированный рендеринг
- ✅ **Темы** - встроенная поддержка темной/светлой темы
- ✅ **Responsive** - автоматическая адаптация под устройства
- ✅ **Accessibility** - встроенная поддержка доступности

---

## 🏗️ АРХИТЕКТУРА NEXTUI

### Структура компонентов
```
NextUI Components/
├── 🎯 Основные компоненты
│   ├── Button (solid, bordered, light, flat, faded, shadow, ghost)
│   ├── Card (flat, bordered, shadow, solid)
│   ├── Input (flat, bordered, underlined, filled)
│   ├── Select (default, bordered, underlined, filled)
│   └── Modal (default, bordered, shadow)
├── 📊 Данные и таблицы
│   ├── Table (default, bordered, shadow)
│   ├── Pagination (default, bordered, shadow)
│   ├── Tabs (default, bordered, shadow)
│   └── Accordion (default, bordered, shadow)
├── 🎨 Специальные компоненты
│   ├── Autocomplete (default, bordered, underlined, filled)
│   ├── DatePicker (default, bordered, shadow)
│   ├── TimeInput (default, bordered, underlined)
│   ├── Slider (default, bordered, shadow)
│   ├── Switch (default, bordered, shadow)
│   ├── Checkbox (default, bordered, shadow)
│   └── Radio (default, bordered, shadow)
└── 📱 Состояния и индикаторы
    ├── Progress (default, bordered, shadow)
    ├── Spinner (default, bordered, shadow)
    └── Skeleton (default, bordered, shadow)
```

### Дизайн-система

#### Цветовая палитра
```typescript
// Основные цвета проекта (адаптированные под NextUI)
const colors = {
  // Primary colors
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#41B3A3', // darkTeal - основной цвет
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  
  // Secondary colors
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#E27D60', // coral - вторичный цвет
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Accent colors
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#E8A87C', // peach - акцентный цвет
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
}
```

#### Типографика
```typescript
// Единая система шрифтов
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  }
}
```

#### Spacing система
```typescript
// Единая система отступов
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
}
```

---

## 🔄 ПЛАН МИГРАЦИИ

### Этап 1: Подготовка (1-2 недели)
- [ ] **Анализ совместимости**
  - Сопоставление MUI → NextUI компонентов
  - Выявление критических различий в API
  - Планирование миграции компонент за компонентом

- [ ] **Создание миграционной карты**
  - Приоритизация компонентов по сложности
  - Оценка временных затрат на каждый компонент
  - План тестирования после каждой миграции

### Этап 2: Базовая инфраструктура (1 неделя)
- [ ] **Обновление провайдеров**
  - Убрать MUI ThemeProvider
  - Настроить NextUI провайдер с кастомной темой
  - Обновить глобальные стили и CSS переменные

- [ ] **Адаптация дизайн-токенов**
  - Создание единой системы цветов под NextUI
  - Стандартизация типографики
  - Настройка spacing системы

### Этап 3: Миграция основных компонентов (2-3 недели)
- [ ] **Базовые UI компоненты**
  - Button, Card, Input, Select
  - Modal, Dialog, Drawer
  - Navigation компоненты (Tabs, Breadcrumbs)

- [ ] **Основные страницы**
  - DashboardPage
  - HomePage
  - Auth страницы (Login, Register)

### Этап 4: Миграция сложных компонентов (2-3 недели)
- [ ] **Игровые компоненты**
  - PlayerManagement
  - ActiveGamesSection
  - GamePage
  - ActiveGamePage

- [ ] **Формы и управление**
  - SessionCreationPage
  - TemplatesPage
  - SettingsPanel
  - ProgressSteps

### Этап 5: Финальная очистка (1 неделя)
- [ ] **Удаление MUI зависимостей**
  - Очистка package.json
  - Удаление неиспользуемых импортов
  - Оптимизация bundle size

- [ ] **Тестирование и валидация**
  - E2E тестирование всех страниц
  - Проверка производительности
  - Валидация дизайна и UX

---

## 📱 RESPONSIVE ДИЗАЙН

### Breakpoints
```typescript
// NextUI breakpoints (адаптированные под проект)
const breakpoints = {
  xs: '320px',   // Мобильные (маленькие)
  sm: '640px',   // Мобильные (большие)
  md: '768px',   // Планшеты
  lg: '1024px',  // Десктопы (маленькие)
  xl: '1280px',  // Десктопы (большие)
  '2xl': '1536px', // Десктопы (очень большие)
}
```

### Адаптивные компоненты
- **Grid система** - автоматическая адаптация колонок
- **Flexbox** - гибкая компоновка элементов
- **Hidden/Visible** - условное отображение по breakpoint
- **Responsive значения** - адаптивные размеры и отступы

---

## 🎨 КАСТОМИЗАЦИЯ ТЕМЫ

### Светлая тема
```typescript
const lightTheme = {
  colors: {
    background: '#ffffff',
    foreground: '#11181c',
    primary: '#41B3A3',
    secondary: '#E27D60',
    accent: '#E8A87C',
    // ... остальные цвета
  },
  shadows: {
    small: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    large: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  }
}
```

### Темная тема
```typescript
const darkTheme = {
  colors: {
    background: '#0a0a0a',
    foreground: '#ffffff',
    primary: '#5eead4',
    secondary: '#fdba74',
    accent: '#fcd34d',
    // ... остальные цвета
  },
  shadows: {
    small: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
    large: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
  }
}
```

---

## 🚀 ПРОИЗВОДИТЕЛЬНОСТЬ

### Оптимизации NextUI
- **Tree Shaking** - автоматическое удаление неиспользуемого кода
- **Lazy Loading** - динамическая загрузка компонентов
- **Memoization** - кэширование результатов рендеринга
- **Bundle Splitting** - разделение кода на чанки

### Метрики производительности
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3.5s

---

## 🧪 ТЕСТИРОВАНИЕ

### Стратегия тестирования
- **Unit тесты** - тестирование отдельных компонентов
- **Integration тесты** - тестирование взаимодействия компонентов
- **E2E тесты** - тестирование полного пользовательского сценария
- **Visual regression тесты** - проверка визуальных изменений

### Инструменты тестирования
- **Jest** - unit тестирование
- **React Testing Library** - тестирование компонентов
- **Playwright** - E2E тестирование
- **Storybook** - документация и тестирование компонентов

---

## 📚 ДОКУМЕНТАЦИЯ И РЕСУРСЫ

### Официальная документация
- [NextUI Documentation](https://nextui.org/docs)
- [NextUI Components](https://nextui.org/docs/components)
- [NextUI Themes](https://nextui.org/docs/customization/themes)

### Полезные ресурсы
- [NextUI Examples](https://nextui.org/docs/components/button#examples)
- [NextUI GitHub](https://github.com/nextui-org/nextui)
- [NextUI Discord](https://discord.gg/9c6rzjxK9s)

---

## 🔮 ПЛАНЫ НА БУДУЩЕЕ

### Краткосрочные (1-2 месяца)
- [ ] Завершение миграции всех компонентов
- [ ] Создание единой дизайн-системы
- [ ] Оптимизация производительности

### Среднесрочные (3-6 месяцев)
- [ ] Создание библиотеки кастомных компонентов
- [ ] Интеграция с Design System
- [ ] Автоматизация тестирования

### Долгосрочные (6+ месяцев)
- [ ] Создание собственной темы
- [ ] Интеграция с Figma
- [ ] Экспорт компонентов как npm пакет

---

**Последнее обновление:** 15.08.2025  
**Статус:** Активная разработка  
**Ответственный:** Frontend команда
