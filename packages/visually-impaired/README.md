# ru-a11y-toolkit-visually-impaired

[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit-visually-impaired)](https://www.npmjs.com/package/ru-a11y-toolkit-visually-impaired)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit-visually-impaired)](../../LICENSE)

The "version for the visually impaired" that Russian public sector sites are expected to offer,
as a React package: a ready-made settings panel, hooks to build your own controls, and a
stylesheet that applies the settings to any page. Part of [ru-a11y-toolkit](../../README.md).

Settings are stored in `localStorage`, survive reloads and stay in sync across open tabs.

## Install

```bash
npm install ru-a11y-toolkit-visually-impaired
```

Peer dependencies: `react` and `react-dom` 17, 18 or 19.

## Quick start

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

The panel is pinned to the left edge, uses large text buttons and is excluded from the
stylesheet itself, so it stays readable whatever the visitor picks.

## Two layers

| Layer               | Applied as                        | Effect                                                                                  |
| ------------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| Individual settings | `data-ru-a11y-vi-*` on `<html>`   | Each setting works on its own: e.g. only underline links                                |
| Full mode           | `ru-a11y-visually-impaired` class | A preset on top: larger text, high contrast, alt captions, reduced motion, strong focus |

Full mode never downgrades a stronger choice: with `fontSize: 'xlarge'` it keeps 150%.

## Settings

| Setting                     | Hook                                             | Values                                                                |
| --------------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| Full mode                   | `useVisuallyImpairedMode`, `useVisuallyImpaired` | on / off                                                              |
| Text size                   | `useFontSize`                                    | `normal`, `large` (125%), `xlarge` (150%)                             |
| Line height, letter spacing | `useVisuallyImpairedSettings`                    | `normal`, `wide`, `extra`; `normal`, `wide`                           |
| Color scheme                | `useColorScheme`                                 | `default`, `white-black`, `black-white`, `blue-yellow`, `beige-brown` |
| Links                       | `useLinkSettings`                                | underline, highlight                                                  |
| Images                      | `useImageSettings`                               | `normal`, `grayscale`, `hidden`; visible `alt` captions               |
| Motion                      | `useMotionSettings`                              | disable animations and transitions                                    |
| Focus                       | `useFocusSettings`                               | thick focus outline                                                   |

## Custom controls

```tsx
import {
  useColorScheme,
  useFontSize,
  useVisuallyImpaired,
} from 'ru-a11y-toolkit-visually-impaired';

function AccessibilityMenu() {
  const { isEnabled, toggle, reset } = useVisuallyImpaired();
  const { increaseFontSize, decreaseFontSize } = useFontSize();
  const { setColorScheme } = useColorScheme();

  return (
    <div role="group" aria-label="Настройки отображения">
      <button onClick={toggle} aria-pressed={isEnabled}>
        Версия для слабовидящих
      </button>
      <button onClick={decreaseFontSize}>A−</button>
      <button onClick={increaseFontSize}>A+</button>
      <button onClick={() => setColorScheme('black-white')}>Чёрный фон</button>
      <button onClick={reset}>Сбросить</button>
    </div>
  );
}
```

Outside React (for example, to sync with a user profile):

```ts
import {
  getVisuallyImpairedSettings,
  setVisuallyImpairedSettings,
  resetVisuallyImpairedSettings,
  initializeVisuallyImpaired,
} from 'ru-a11y-toolkit-visually-impaired';

initializeVisuallyImpaired(); // apply saved settings before React mounts
setVisuallyImpairedSettings({ fontSize: 'large', underlineLinks: true });
```

Stored data is validated on read: unknown keys are dropped and invalid values fall back to
defaults. Storage key: `ru-a11y-visually-impaired-settings`.

## Limitations

The mode helps visitors adjust the presentation; it does not make an inaccessible page
accessible. It works best on sites that size text in `rem`/`em`, survive 200% zoom and have
correct semantics, which [`ru-a11y-toolkit-eslint`](../eslint-preset) and
[`ru-a11y-toolkit-overlay`](../react-overlay) help verify.

## Source layout

```text
src/
  model/   setting types, defaults, validation, full mode preset, theme tokens
  store/   localStorage access, shared settings store with cross-tab sync
  dom/     applying settings to <html>, alt caption observer
  hooks/   public hooks
  ui/      VisuallyImpairedOverlay panel
styles/visually-impaired.css
```

## License

MIT
