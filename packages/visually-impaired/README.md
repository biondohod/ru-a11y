# ru-a11y-toolkit-visually-impaired

[![npm version](https://badge.fury.io/js/ru-a11y-toolkit-visually-impaired.svg)](https://www.npmjs.com/package/ru-a11y-toolkit-visually-impaired)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Модуль повышенной читабельности для пользователей с нарушениями зрения. Часть [ru-a11y-toolkit](https://www.npmjs.com/package/ru-a11y-toolkit).

> **⚠️ Важно:** этот модуль **не является** заменой соответствию ГОСТ Р 52872-2019 / WCAG на уровне верстки. Он — дополнение к [`ru-a11y-toolkit-eslint`](https://www.npmjs.com/package/ru-a11y-toolkit-eslint) и [`ru-a11y-toolkit-overlay`](https://www.npmjs.com/package/ru-a11y-toolkit-overlay), которое даёт конечному **пользователю сайта** возможность переключиться в режим повышенной читабельности.
>
> Для полноценного соответствия ГОСТ Р 52872-2019 используйте `ru-a11y-toolkit-eslint` (статический анализ) и `ru-a11y-toolkit-overlay` (runtime-проверка). Лучший результат достигается при вёрстке сайта с относительными единицами (`rem`/`em`).

---

## Что это

`ru-a11y-toolkit-visually-impaired` — лёгкий React-хук + CSS-файл, которые позволяют добавить на сайт кнопку «Версия для слабовидящих». При нажатии на кнопку на `<html>` добавляется CSS-класс `ru-a11y-visually-impaired`, который активирует режим повышенной читабельности:

- чёрный текст на белом фоне (высокий контраст)
- увеличенный шрифт (от 1.5rem)
- усиленный индикатор фокуса
- обесцвеченные изображения с повышенным контрастом
- отключённые анимации и переходы

---

## Установка

```bash
npm install ru-a11y-toolkit-visually-impaired
# или
yarn add ru-a11y-toolkit-visually-impaired
# или
pnpm add ru-a11y-toolkit-visually-impaired
```

React `>=17` и `react-dom` `>=17` — обязательные peer-зависимости.

---

## Быстрый старт

1. Подключите CSS-файл один раз (например, в корневом компоненте или `main.tsx`):

```tsx
import 'ru-a11y-toolkit-visually-impaired/styles/visually-impaired.css';
```

2. Используйте хук в компоненте кнопки:

```tsx
import { useVisuallyImpaired } from 'ru-a11y-toolkit-visually-impaired';

function AccessibilityButton() {
  const { toggle, isEnabled } = useVisuallyImpaired();

  return (
    <button onClick={toggle} aria-pressed={isEnabled}>
      {isEnabled ? 'Обычная версия' : 'Версия для слабовидящих'}
    </button>
  );
}
```

> CSS импортируется отдельно и **не инжектируется через JS** — это сделано намеренно для совместимости с SSR и для явного контроля разработчика над стилями.

---

## Что делает режим

| Что меняется                                 | Зачем                                                           | Связь с ГОСТ / №102                             |
| -------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| Белый фон, чёрный текст для всех элементов   | Обеспечивает контрастность минимум 21:1 (максимально возможный) | ГОСТ Р 52872, п. 7.2; WCAG 1.4.3 Contrast (AA)  |
| Шрифт от 1.5rem для основного текста         | Читабельность для людей с пониженной остротой зрения            | Постановление №102: размер шрифта не менее 18pt |
| Шрифт заголовков от 1.75rem до 3rem          | Визуальная иерархия страницы                                    | WCAG 1.4.4 Resize text                          |
| Межстрочный интервал 1.6                     | Снижение нагрузки при чтении длинных текстов                    | WCAG 1.4.12 Text Spacing                        |
| Кнопки и поля форм min-height 3rem           | Крупные touch-цели для пользователей с нарушениями моторики     | WCAG 2.5.5 Target Size                          |
| Outline 3px на всех элементах в фокусе       | Видимая навигация с клавиатуры                                  | ГОСТ Р 52872, п. 6.6; WCAG 2.4.7, 2.4.11        |
| Изображения: grayscale + повышенный контраст | Читабельность при нарушениях цветовосприятия                    | WCAG 1.4.11 Non-text Contrast                   |
| Текст aria-label вместо SVG-иконок в кнопках | Текстовое обозначение для кнопок без видимой подписи            | WCAG 1.1.1 Non-text Content                     |
| Отключены анимации и переходы                | Исключение мигания контента                                     | ГОСТ Р 52872, п. 6.11; WCAG 2.3.1               |

---

## Ограничения

> Перед использованием прочитайте этот раздел — он поможет избежать неожиданного поведения.

1. **Горизонтальный скролл** — если сайт свёрстан с фиксированными размерами в `px`, увеличенный шрифт может вызвать горизонтальный скролл. **Рекомендация:** используйте `rem`/`em` при вёрстке. Модуль работает наилучшим образом в изначально доступно свёрстанном проекте.

2. **Кнопки с иконками** — замена SVG-иконки на текст работает **только при наличии атрибута `aria-label`** на кнопке или ссылке. Без `aria-label` иконка скроется, но текст не появится. Используйте [`ru-a11y-toolkit-eslint`](../eslint-preset) для проверки наличия `aria-label` на этапе разработки.

3. **Размер системного курсора** — CSS-свойство `cursor` меняет вид курсора, но не его **системный размер**. Увеличение размера курсора — ограничение браузера, оно доступно только через настройки ОС пользователя.

4. **Состояние сбрасывается при перезагрузке страницы** — по умолчанию состояние не сохраняется. Реализуйте сохранение самостоятельно (см. раздел «Опциональное сохранение состояния»).

5. **Конфликт со стилями `!important`** — если в проекте уже используются стили с `!important`, они могут переопределить стили режима. Проверьте специфичность ваших стилей.

---

## Связь с другими модулями ru-a11y-toolkit

Все три модуля дополняют друг друга на разных уровнях:

```
Этап разработки          Runtime (в браузере)       Конечный пользователь
       │                         │                          │
       ▼                         ▼                          ▼
ru-a11y-toolkit-eslint   ru-a11y-toolkit-overlay   ru-a11y-toolkit-visually-impaired
  Найти нарушения          Увидеть нарушения          Переключить удобный
  в коде на этапе          прямо в браузере           режим просмотра
  написания                во время разработки        на боевом сайте
```

| Модуль                                        | Для кого                    | Когда работает                        |
| --------------------------------------------- | --------------------------- | ------------------------------------- |
| [`ru-a11y-toolkit-eslint`](https://www.npmjs.com/package/ru-a11y-toolkit-eslint)  | Разработчик                 | Во время написания кода (lint)        |
| [`ru-a11y-toolkit-overlay`](https://www.npmjs.com/package/ru-a11y-toolkit-overlay) | Разработчик                 | В dev-режиме в браузере               |
| `ru-a11y-toolkit-visually-impaired`           | Конечный пользователь сайта | В production, по запросу пользователя |

---

## Опциональное сохранение состояния

По умолчанию хук не сохраняет состояние — это намеренное решение: разработчик сам выбирает механизм хранения (localStorage, cookie, пользовательские настройки аккаунта и т.д.).

Пример сохранения в `localStorage`:

```tsx
import { useState, useCallback, useEffect } from 'react';

const CLASS = 'ru-a11y-visually-impaired';
const STORAGE_KEY = 'ru-a11y-vi-enabled';

function useVisuallyImpairedPersisted() {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    // Читаем состояние при инициализации
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  // Применяем класс при первом рендере (восстановление из localStorage)
  useEffect(() => {
    document.documentElement.classList.toggle(CLASS, isEnabled);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle(CLASS, next);
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { toggle, isEnabled };
}
```

> Пример выше можно скопировать в свой проект и адаптировать под нужный механизм хранения.

---

## Лицензия

MIT © [biondohod](https://github.com/biondohod)
