# Руководство по стилю

## Язык документации
- Основной язык: Русский
- Комментарии в коде: Русский
- Названия переменных: Английский (стандарт программирования)
- Документация: Русский

## Правила именования
- Файлы: английский (kebab-case)
- Компоненты: английский (PascalCase)
- Функции: английский (camelCase)
- Комментарии: русский

## Формат документации
- Заголовки: русский
- Описания: русский
- Технические термины: русский с английским в скобках при необходимости

---

## Дизайн‑система (Design System)
Единый источник правды для фронтенда: токены лежат в `react-app/src/styles/design-tokens.ts`, тема MUI в `react-app/src/styles/theme.ts`.

### Палитра (Brand Palette)
- Primary (CTA): `#41B3A3`
- Mint (Accent): `#85DCCB`
- Coral (Secondary): `#E27D60`
- Peach (Highlight): `#E8A87C`
- Rose Purple (Special): `#C38D9E`
- Neutrals: `#0A0A0A`, `#1A1A1A`, `#333333`, `#B0B0B0`, `#FFFFFF`
- Status: Success `#22C55E`, Warning `#F59E0B`, Error `#EF4444`, Info `#0EA5E9`

### Типографика (Typography)
- Шрифт: `Inter, system-ui`
- h1: 48/56, 800
- h2: 32/40, 800
- h3: 24/32, 700
- h4: 20/28, 700
- body1: 16/24, 400
- body2: 14/20, 400

### Отступы (Spacing)
- Базовая единица: 8px
- Шкала: 4, 8, 12, 16, 24, 32, 48

### Скругления (Radii)
- xs 6, sm 10, md 14, lg 18, xl 24, pill 999

### Тени (Shadows)
- sm: `0 1px 2px rgba(0,0,0,0.08)`
- md: `0 6px 16px rgba(0,0,0,0.16)`
- lg: `0 12px 28px rgba(0,0,0,0.22)`
- glow-mint: мягкое свечение `mint`
- glow-coral: мягкое свечение `coral`

### Переходы (Transitions)
- fast 150ms, normal 250ms, slow 400ms (ease-in-out)

### Брейкпоинты
- xs 0, sm 600, md 900, lg 1200, xl 1536

### Принципы UI
- Mobile-first
- Контрастные CTA на `primary`
- Карточки на `gray800` с бордером `gray600`
- Hover: лёгкое увеличение и свечение
- Фокус: видимая обводка (outline) `mint`
- Доступность: контраст AA, клавиатурная навигация

### Компоненты (гайды)
- Button: pill, 700, без uppercase; contained/outlined/text
- Card: скругление `lg`, тень `md`, бордер `gray600`
- Chip: pill, нейтральный фон, цвет — по контексту
- Layout: секции с вертикальным отступом 64–96px, maxWidth `lg`

### Использование
- Импортируйте тему из `styles/theme` в `App.tsx`
- Для цветов используйте токены из `styles/design-tokens`
- Не используйте «магические числа», берите из токенов
