# ru-a11y-toolkit-overlay

[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit-overlay)](https://www.npmjs.com/package/ru-a11y-toolkit-overlay)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit-overlay)](../../LICENSE)

A React component for development builds that scans the page with axe-core and 44 additional
ru-a11y checks, lists the violations in a panel and highlights the element when you pick one.
Descriptions, fixes and references to GOST R 52872-2019, Decree No. 102 and WCAG are in Russian.
Part of [ru-a11y-toolkit](../../README.md).

![Overlay preview](./preview/preview.png)

- Re-scans on DOM changes (debounced `MutationObserver`), so it keeps up with SPA navigation.
- Groups violations by WCAG principle and marks the toolkit's own checks with a `ru-a11y` badge.
- Shows actual and required ratios for contrast issues.
- Draggable panel; the overlay excludes itself from scanning.
- Has no effect on production builds when rendered behind a dev-only condition.

## Install

```bash
npm install --save-dev ru-a11y-toolkit-overlay
```

Peer dependencies: `react` and `react-dom` 17, 18 or 19.

## Usage

```tsx
import { RuA11yOverlay } from 'ru-a11y-toolkit-overlay';

root.render(
  <>
    <App />
    {process.env.NODE_ENV === 'development' && <RuA11yOverlay preset="gost-aa" />}
  </>,
);
```

With Vite, use `import.meta.env.DEV` and a dynamic import to keep the package out of the
production bundle entirely:

```tsx
const { RuA11yOverlay } = import.meta.env.DEV ? await import('ru-a11y-toolkit-overlay') : {};

root.render(
  <>
    <App />
    {RuA11yOverlay && <RuA11yOverlay />}
  </>,
);
```

## Props

| Prop              | Type                                     | Default         | Description                                                  |
| ----------------- | ---------------------------------------- | --------------- | ------------------------------------------------------------ |
| `preset`          | `'recommended' \| 'gost-aa' \| 'strict'` | `'recommended'` | Rule set, aligned with the ESLint configs                    |
| `excludeSelector` | `string`                                 | —               | Extra elements to skip; the overlay itself is always skipped |
| `debounceMs`      | `number`                                 | `1000`          | Delay before re-scanning after DOM changes                   |
| `autoScan`        | `boolean`                                | `true`          | Re-scan on DOM changes                                       |
| `customRules`     | `boolean`                                | `true`          | Run the ru-a11y DOM checks                                   |
| `axeRules`        | `boolean`                                | `true`          | Run axe-core rules                                           |
| `debug`           | `boolean`                                | `false`         | Log each scan as a table in the browser console              |

| Preset        | axe-core tags                            |
| ------------- | ---------------------------------------- |
| `recommended` | WCAG 2.0/2.1 A and AA                    |
| `gost-aa`     | WCAG 2.0/2.1 A and AA + best practices   |
| `strict`      | WCAG 2.0/2.1 A, AA, AAA + best practices |

## Runtime checks

axe-core does not cover everything GOST and Decree 102 ask for, so the overlay runs its own DOM
checks on top. They live in `src/rules/`, grouped by topic:

| Group      | Checks                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| navigation | `bypass`, `skip-link` (the target exists), `nested-interactive`, `focus-order-semantics`, `accesskeys`, `target-size`                  |
| document   | `html-has-lang`, `html-lang-valid`, `html-xml-lang-mismatch`, `document-title`, `meta-viewport`, `meta-viewport-large`, `meta-refresh` |
| headings   | `page-has-heading-one`, `heading-order`, `empty-heading`, `p-as-heading`                                                               |
| tables     | `no-table-layout`, `table-requires-th`, `empty-table-header`, `scope-attr-valid`, `table-fake-caption`                                 |
| media      | `blink`, `marquee`, `no-autoplay-audio`, `audio-caption`, `frame-title-unique`, `frame-focusable-content`                              |
| forms      | `input-button-name`, `input-image-alt`, `select-name`, `label-title-only`                                                              |
| images     | `svg-img-alt`, `role-img-alt`, `object-alt`                                                                                            |
| landmarks  | `landmark-one-main`, `landmark-no-duplicate-main`, `landmark-unique`                                                                   |
| aria       | `duplicate-id`, `duplicate-id-active`, `duplicate-id-aria`, `aria-hidden-body`, `aria-hidden-focus`, `presentation-role-conflict`      |

When axe-core and a custom check report the same rule on the same element, the overlay shows it
once. Each check declares the presets it runs in and returns the failing elements; the runner
turns them into violations with a unique CSS selector and catalog metadata.

## API

```ts
import {
  CUSTOM_RULES,
  PRESET_TAGS,
  getRuleMeta,
  RU_A11Y_RULES,
  WCAG_PRINCIPLES,
} from 'ru-a11y-toolkit-overlay';
import type { A11yViolationNode, ScanResult, AxePreset } from 'ru-a11y-toolkit-overlay';
```

The catalog exports are re-exported from [`ru-a11y-toolkit-core`](../core).

## Limitations

The overlay finds what can be detected automatically. Keyboard flows and screen reader output
(NVDA, JAWS, VoiceOver) still need manual testing. Contrast results depend on styles that have
already loaded.

## Source layout

```text
src/
  RuA11yOverlay.tsx  component: scan lifecycle, toggle button
  axeRunner.ts       axe-core run, deduplication, DOM observer
  rules/             runtime checks by topic, dom.ts helpers, types.ts
  ui/                Panel, ErrorList, ErrorItem, HighlightLayer, useDraggable, style tokens
```

## License

MIT
