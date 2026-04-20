# ru-a11y-toolkit-visually-impaired

Модуль пользовательских настроек отображения для версии сайта для слабовидящих. Часть `ru-a11y-toolkit`.

Пакет решает две задачи:

- дает готовый минимальный левый overlay `VisuallyImpairedOverlay`;
- экспортирует хуки и низкоуровневые функции, чтобы разработчик мог встроить те же настройки в собственную шапку, профиль пользователя или дизайн-систему.

Настройки сохраняются в `localStorage` и автоматически применяются ко всем страницам SPA между сессиями.

Важно: отдельные настройки можно использовать без полного режима `ru-a11y-visually-impaired`. Например, пользователь может только подчеркнуть ссылки или увеличить интервал, не включая черно-белую версию сайта. Полный режим остается отдельной кнопкой и включает готовый набор усилений.

## Быстрый Старт

```tsx
import { VisuallyImpairedOverlay } from 'ru-a11y-toolkit-visually-impaired';
import 'ru-a11y-toolkit-visually-impaired/styles/visually-impaired.css';

export function App() {
  return (
    <>
      <Routes />
      <VisuallyImpairedOverlay />
    </>
  );
}
```

Overlay закреплен слева, имеет крупные текстовые кнопки и исключен из собственных глобальных стилей через `data-ru-a11y-vi-overlay`, поэтому панель остается читаемой после применения пользовательских настроек.

## Два Слоя

| Слой | Как включается | Что делает |
| --- | --- | --- |
| Отдельные настройки | `data-ru-a11y-vi-*` на `<html>` | Размер текста, интервал, ссылки, изображения, motion, фокус и цветовая схема применяются независимо |
| Полный режим | класс `ru-a11y-visually-impaired` | Включает готовый пресет: крупный текст, высокий контраст, ссылки, alt-подписи, reduced motion и сильный фокус |

Пример: `useLinkSettings().setUnderlineLinks(true)` добавит только `data-ru-a11y-vi-underline-links`, но не добавит класс `ru-a11y-visually-impaired`.

## Что Настраивается

| Настройка | API | Что меняется | Нормативная логика |
| --- | --- | --- | --- |
| Полный режим | `useVisuallyImpairedMode`, `useVisuallyImpaired` | Класс `ru-a11y-visually-impaired` на `<html>` | Пользователь должен иметь доступ к версии/режиму повышенной читаемости |
| Размер текста | `useFontSize` | `normal`, `large`, `xlarge` | Размер шрифта для слабовидящих, масштабирование текста |
| Межстрочный интервал | `setSettings({ lineHeight })` | `normal`, `wide`, `extra` | Читаемость длинного текста, WCAG Text Spacing |
| Межбуквенный интервал | `setSettings({ letterSpacing })` | `normal`, `wide` | Дополнительная читаемость при низкой остроте зрения |
| Цветовая схема | `useColorScheme` | `default`, белая, черная, синяя, бежевая схемы | Пользовательская настройка контраста и цветового восприятия |
| Ссылки | `useLinkSettings` | Подчеркивание и дополнительное выделение | Ссылки различимы не только цветом |
| Изображения | `useImageSettings` | Обычные, ч/б, скрытые | Учет цветового восприятия; возможность убрать визуальный шум |
| Alt-подписи | `useImageSettings` | Выводит подписи из `alt` под изображениями | Текстовая альтернатива становится видимой пользователю |
| Анимации | `useMotionSettings` | Отключает transitions/animations | Требования к отсутствию мигания и снижению движения |
| Фокус | `useFocusSettings` | Крупный контур фокуса | Видимая клавиатурная навигация |

## Хуки

```tsx
import {
  useVisuallyImpaired,
  useFontSize,
  useColorScheme,
  useLinkSettings,
} from 'ru-a11y-toolkit-visually-impaired';

function CustomControls() {
  const { isEnabled, toggle, reset } = useVisuallyImpaired();
  const { fontSize, setFontSize } = useFontSize();
  const { colorScheme, setColorScheme } = useColorScheme();
  const { underlineLinks, toggleUnderlineLinks } = useLinkSettings();

  return (
    <section>
      <button onClick={toggle} aria-pressed={isEnabled}>
        {isEnabled ? 'Выключить полный режим' : 'Полный режим'}
      </button>
      <button onClick={() => setFontSize('xlarge')}>Текст 150%</button>
      <button onClick={() => setColorScheme('default')}>Цвета сайта</button>
      <button onClick={() => setColorScheme('black-white')}>Черная схема</button>
      <button onClick={toggleUnderlineLinks} aria-pressed={underlineLinks}>
        Подчеркнуть ссылки
      </button>
      <button onClick={reset}>Сброс</button>
      <p>Текущий размер: {fontSize}. Цветовая схема: {colorScheme}.</p>
    </section>
  );
}
```

Основной хук `useVisuallyImpaired()` возвращает:

```ts
{
  settings,
  setSettings,
  reset,
  isEnabled,
  enable,
  disable,
  toggle
}
```

Дополнительные хуки:

- `useVisuallyImpairedSettings()`
- `useVisuallyImpairedMode()`
- `useFontSize()`
- `useColorScheme()`
- `useLinkSettings()`
- `useImageSettings()`
- `useMotionSettings()`
- `useFocusSettings()`

## Низкоуровневый API

```ts
import {
  getVisuallyImpairedSettings,
  setVisuallyImpairedSettings,
  resetVisuallyImpairedSettings,
  initializeVisuallyImpaired,
} from 'ru-a11y-toolkit-visually-impaired';
```

Эти функции полезны, если настройки нужно синхронизировать с профилем пользователя, cookie consent или серверным состоянием.

## Объектный Экспорт

```tsx
import { visuallyImpaired } from 'ru-a11y-toolkit-visually-impaired';

const Overlay = visuallyImpaired.Overlay;
const { useFontSize } = visuallyImpaired.hooks;
```

## Формат Настроек

```ts
type VisuallyImpairedSettings = {
  enabled: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  lineHeight: 'normal' | 'wide' | 'extra';
  letterSpacing: 'normal' | 'wide';
  colorScheme: 'default' | 'white-black' | 'black-white' | 'blue-yellow' | 'beige-brown';
  underlineLinks: boolean;
  highlightLinks: boolean;
  imageMode: 'normal' | 'grayscale' | 'hidden';
  showImageAlt: boolean;
  reducedMotion: boolean;
  strongFocus: boolean;
};
```

Ключ localStorage: `ru-a11y-visually-impaired-settings`.

## Ограничения

Модуль не заменяет доступную верстку. Он помогает пользователю настроить отображение, но сайт все равно должен быть семантичным, масштабируемым, управляемым с клавиатуры и проверенным через `ru-a11y-toolkit-eslint` и `ru-a11y-toolkit-overlay`.

Лучший результат будет на сайтах, где размеры заданы в `rem`/`em`, layout не ломается при увеличении текста, а интерактивные элементы имеют корректные имена и фокус.

## Проверка

```bash
npm test -w ru-a11y-toolkit-visually-impaired -- --runInBand
npm run build -w ru-a11y-toolkit-visually-impaired
```
