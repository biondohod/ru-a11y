# ru-a11y-toolkit

[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit)](https://www.npmjs.com/package/ru-a11y-toolkit)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit)](./LICENSE)

**Toolkit** для автоматизированной проверки веб-доступности React/JS-приложений под **российские нормативы**:

- [ГОСТ Р 52872-2019](https://meganorm.ru/Data/547/54797.pdf) — требования доступности интернет-ресурсов
- [Постановление Правительства РФ №102](http://publication.pravo.gov.ru/document/0001202602100010?index=1) — доступность официальных сайтов для инвалидов по зрению _(вступает в силу 01.03.2026)_

> Все сообщения — на **русском языке** с указанием конкретных пунктов ГОСТ и Постановления №102.

---

## Варианты установки

Все инструменты сразу:
```bash
npm install --save-dev ru-a11y-toolkit
```

Или только нужный модуль:
```bash
npm install --save-dev ru-a11y-toolkit-eslint   # только ESLint-плагин
npm install --save-dev ru-a11y-toolkit-cli       # только CLI (скоро)
npm install --save-dev ru-a11y-toolkit-overlay   # только React Overlay
npm install ru-a11y-toolkit-visually-impaired    # только режим для слабовидящих
```

---

## Состав пакета

| Пакет | Статус | Назначение |
|-------|--------|------------|
| [`ru-a11y-toolkit-eslint`](#-eslint-плагин) | ✅ Готов | Статическая проверка JSX/HTML в процессе разработки |
| [`ru-a11y-toolkit-overlay`](#-react-overlay) | ✅ Готов | Runtime-визуализация ошибок в браузере |
| [`ru-a11y-toolkit-visually-impaired`](#-режим-для-слабовидящих) | ✅ Готов | Режим повышенной читабельности для конечного пользователя |
| [`ru-a11y-toolkit-cli`](#-cli-сканер) | 🚧 В разработке | Проверка готовых страниц по URL |

---

## 📦 ESLint-плагин

### Установка

```bash
npm install --save-dev ru-a11y-toolkit-eslint eslint
# или через umbrella:
npm install --save-dev ru-a11y-toolkit eslint
```

### Настройка

**`eslint.config.js`** (ESLint 9 Flat Config):
```js
const ruA11yEslint = require('ru-a11y-toolkit-eslint');

module.exports = [
  ruA11yEslint.configs['gost-aa'],
];
```

**`.eslintrc.js`** (ESLint 8 Legacy):
```js
module.exports = {
  extends: ['ru-a11y-toolkit-eslint/gost-aa'],
};
```

### Уровни конфигурации

| Конфиг | Уровень | Для кого |
|--------|---------|----------|
| `/recommended` | ГОСТ A | Все проекты — базовая доступность |
| `/gost-aa` | ГОСТ AA + №102 | Гос. органы, порталы под Постановление №102 |
| `/strict` | ГОСТ AAA | Критически важные сервисы |

### Пример вывода

```
✖  Отсутствует ссылка пропуска навигации (ГОСТ Р 52872-2019 §5.2.3.1, уровень A).
   Добавьте <a href="#main">Перейти к содержанию</a> в начало <body>.
   [Постановление №102 п. а)]
   src/App.jsx:3:5  @ru-a11y/gost-a11y/require-skip-link

✖  Элемент <html> должен иметь атрибут lang (например, lang="ru").
   [ГОСТ Р 52872-2019 §5.2.4; Постановление №102 п. а)]
   src/index.jsx:1:1  @ru-a11y/gost-a11y/jsx-a11y/html-has-lang

⚠  Значение maximum-scale=1.0 ограничивает масштабирование ниже 200%.
   [Постановление №102 п. б)]
   public/index.html:7:3  @ru-a11y/gost-a11y/zoom-200-warning
```

### Что проверяет

**7 кастомных правил** (специфика РФ):

| Правило | Нормативная база |
|---------|----------------|
| `require-skip-link` — ссылка «Перейти к содержанию» | ГОСТ §5.2.3.1; №102 п. а) |
| `require-lang-attr` — `lang="ru"` на `<html>` | ГОСТ §5.2.4; №102 п. а), д) |
| `require-title-semantic` — информативный `<title>` | ГОСТ §5.2.3; №102 п. е) |
| `no-frame-structure` — запрет `<frame>`/`<frameset>` | ГОСТ §5.1.1; №102 п. а) |
| `table-requires-th` — `<th scope>` в таблицах данных | ГОСТ §5.1.5; №102 п. а) |
| `no-table-layout` — запрет таблиц для вёрстки | ГОСТ §5.1.5; №102 п. а) |
| `zoom-200-warning` — масштабирование 200% | №102 п. б) |

**26 правил jsx-a11y** — переведены на русский с привязкой к нормативам.

→ [Подробная документация ESLint-плагина](https://www.npmjs.com/package/ru-a11y-toolkit-eslint)

---

## 🔧 CLI-сканер _(в разработке)_

Планируется: проверка готовых страниц по URL через Puppeteer + axe-core с отчётом, привязанным к пунктам ГОСТ и Постановления №102.

```bash
# Будущий API:
npx ru-a11y-toolkit-cli scan https://example.gov.ru --format html --out report.html
```

→ [README](./packages/cli/README.md)

---

## 🖥 React Overlay

React-компонент, который в **dev-режиме** добавляет поверх приложения панель с отчётом о нарушениях доступности, найденных через [axe-core](https://github.com/dequelabs/axe-core).

### Установка

```bash
npm install --save-dev ru-a11y-toolkit-overlay
```

### Подключение

```jsx
import { RuA11yOverlay } from 'ru-a11y-toolkit-overlay';

function App() {
  return (
    <>
      {process.env.NODE_ENV === 'development' && <RuA11yOverlay />}
      <YourApp />
    </>
  );
}
```

### Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `preset` | `'recommended' \| 'gost-aa' \| 'strict'` | `'recommended'` | Набор правил проверки (см. ниже) |
| `autoScan` | `boolean` | `true` | Отслеживать изменения DOM и пересканировать автоматически |
| `debounceMs` | `number` | `1000` | Задержка в мс перед повторным сканированием после изменений DOM |
| `excludeSelector` | `string` | — | CSS-селектор элементов, которые нужно исключить из сканирования |

#### Пресеты (`preset`)

Соответствуют уровням ESLint-плагина:

| Пресет | Уровень | Для кого |
|--------|---------|----------|
| `recommended` | WCAG 2.1 AA | Все проекты — базовые критические проверки |
| `gost-aa` | WCAG 2.1 AA + best-practice | Гос. органы, порталы под Постановление №102 |
| `strict` | WCAG 2.1 AAA | Максимальная строгость, включая экспериментальные правила |

```jsx
// Пример с пресетом под Постановление №102
<RuA11yOverlay preset="gost-aa" debounceMs={500} />
```

### Что делает

- 🔍 **Автоматическое сканирование** — запускается при загрузке и при изменениях DOM (MutationObserver)
- 🇷🇺 **Русскоязычные описания** — что нарушено, почему это проблема, как исправить
- 📋 **Нормативные ссылки** — ГОСТ Р 52872-2019, Постановление №102, WCAG 2.1
- 📊 **Группировка по принципам WCAG**: Воспринимаемость / Управляемость / Понятность / Надёжность
- 🎯 **Навигация по ошибкам** — клик на ошибку плавно прокручивает к элементу и кратко подсвечивает его
- 🖱️ **Перетаскиваемая панель** — не мешает работе с приложением
- ⚡ **Только dev-режим** — никакого влияния на production-бандл

→ [Подробная документация Overlay](https://www.npmjs.com/package/ru-a11y-toolkit-overlay)

---

## 👁 Режим для слабовидящих

React-хук + CSS-файл, которые позволяют добавить на сайт кнопку «Версия для слабовидящих». При активации на `<html>` добавляется класс `ru-a11y-visually-impaired`, переключающий страницу в высококонтрастный режим с увеличенным шрифтом.

> **Важно:** модуль не заменяет соответствие ГОСТ/WCAG на уровне вёрстки. Используйте совместно с `ru-a11y-toolkit-eslint` и `ru-a11y-toolkit-overlay` для полноценного покрытия.

### Установка

```bash
npm install ru-a11y-toolkit-visually-impaired
```

### Подключение

```tsx
import { useVisuallyImpaired } from 'ru-a11y-toolkit-visually-impaired';
import 'ru-a11y-toolkit-visually-impaired/styles/visually-impaired.css';

function Header() {
  const { toggle, isEnabled } = useVisuallyImpaired();
  return (
    <button onClick={toggle} aria-pressed={isEnabled}>
      {isEnabled ? 'Обычная версия' : 'Версия для слабовидящих'}
    </button>
  );
}
```

CSS импортируется отдельно и не инжектируется через JS — для совместимости с SSR и явного контроля над стилями.

### Что делает режим

| Что меняется | Нормативная база |
|---|---|
| Белый фон, чёрный текст (контраст 21:1) | ГОСТ Р 52872, п. 7.2; WCAG 1.4.3 |
| Шрифт от 1.5rem, межстрочный интервал 1.6 | Постановление №102; WCAG 1.4.12 |
| Заголовки от 1.75rem до 3rem | WCAG 1.4.4 |
| Кнопки и поля форм min-height 3rem | WCAG 2.5.5 |
| Outline 3px на элементах в фокусе | ГОСТ Р 52872, п. 6.6; WCAG 2.4.7 |
| Изображения: grayscale + контраст 120% | WCAG 1.4.11 |
| SVG-иконки заменяются текстом `aria-label` | WCAG 1.1.1 |
| Анимации и переходы отключены | ГОСТ Р 52872, п. 6.11; WCAG 2.3.1 |

### API

```ts
const { toggle, isEnabled } = useVisuallyImpaired();
// toggle()    — переключает режим
// isEnabled   — текущее состояние (boolean)
```

Состояние не сохраняется в localStorage по умолчанию — разработчик решает механизм хранения самостоятельно (пример с localStorage есть в документации пакета).

→ [Подробная документация visually-impaired](https://www.npmjs.com/package/ru-a11y-toolkit-visually-impaired)

---

## Нормативная база

### ГОСТ Р 52872-2019
Введён в действие с 01.04.2020. Устанавливает требования доступности для интернет-ресурсов и приложений. Основан на WCAG 2.1, адаптирован для РФ.

### Постановление Правительства РФ №102 от 07.02.2026
Вступает в силу **01.03.2026**. Обязательно для официальных сайтов государственных органов:

| Пункт | Требование | Что проверяет |
|-------|-----------|--------------|
| п. а) | Доступ с клавиатуры, корректное считывание скринридерами | `require-skip-link`, `no-frame-structure`, `no-table-layout` и др. |
| п. б) | Масштабирование текста не менее 200% | `zoom-200-warning` |
| п. г) | Текстовые альтернативы для нетекстового контента | `jsx-a11y/alt-text`, `jsx-a11y/media-has-caption` |
| п. д) | CAPTCHA на государственном языке РФ | `require-lang-attr` (enforceRussian) |
| п. е) | Информативные заголовки страниц | `require-title-semantic` |
| п. ж) | Цель ссылок определяется из их текста | `jsx-a11y/anchor-has-content` |
| п. м) | Подписи к полям форм | `jsx-a11y/label-has-associated-control` |

---

## Разработка

```bash
git clone https://github.com/biondohod/ru-a11y.git
cd ru-a11y
npm install
npm test          # тесты ESLint-плагина
npm run test:all  # тесты всех пакетов
```

### Структура репозитория

```
ru-a11y/
├── index.js                    # umbrella-реэкспорт (ru-a11y-toolkit)
├── package.json                # ru-a11y-toolkit
├── packages/
│   ├── eslint-preset/          # ru-a11y-toolkit-eslint            ✅
│   ├── cli/                    # ru-a11y-toolkit-cli               🚧
│   ├── react-overlay/          # ru-a11y-toolkit-overlay           ✅
│   └── visually-impaired/      # ru-a11y-toolkit-visually-impaired ✅
├── README.md                   # этот файл
└── LICENSE
```

### Публикация отдельного пакета

```bash
# ESLint-плагин
cd packages/eslint-preset
npm publish --access public

# umbrella (после публикации всех зависимостей)
cd ../..
npm publish --access public
```

## Лицензия

MIT © [biondohod](https://github.com/biondohod)

