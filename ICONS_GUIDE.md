# 🎨 РУКОВОДСТВО ПО ИКОНКАМ

## 📋 **ПРАВИЛО: ТОЛЬКО `lucide-react`**

**В проекте Artel Billiards для всех UI элементов используются иконки ТОЛЬКО из библиотеки `lucide-react`**

### ✅ **Что использовать:**
- **Импорт:** `import { IconName } from 'lucide-react'`
- **Примеры:** `Clock`, `Timer`, `Watch`, `Calendar`, `ArrowLeft`, `ArrowRight`
- **Размеры:** `size={16}`, `size={18}`, `size={20}`, `size={24}` (стандартные)
- **Стили:** CSS классы для цветов и эффектов

### ❌ **Что НЕ использовать:**
- Другие библиотеки иконок (Material Icons, Font Awesome, etc.)
- Эмодзи для UI элементов (кнопки, навигация, формы)
- Собственные SVG иконки (кроме специальных случаев)

### 🎯 **Исключения:**
- Эмодзи можно использовать только для:
  - Статусов (⏳, ✅, ❌, 🎮)
  - Эмоциональных индикаторов
  - Заголовков и описаний

### 📚 **Полезные ссылки:**
- **Официальный сайт:** https://lucide.dev/icons
- **Документация:** https://lucide.dev/guide/packages/lucide-react
- **Примеры использования:** https://lucide.dev/examples

### 🔧 **Пример кода:**
```typescript
import { Clock, Timer, Watch, Calendar } from 'lucide-react'

// Правильно:
<Clock className="text-mint" size={16} />
<Timer className="text-white" size={18} />

// Неправильно:
<span>⏰</span>  // Эмодзи для UI
<MaterialIcon /> // Другая библиотека
```

---
**Обновлено:** 16.08.2025  
**Статус:** Активно  
**Ответственный:** Команда разработки
