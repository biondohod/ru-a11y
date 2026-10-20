# Changelog

All notable changes to this project are documented here. The packages are versioned
independently; the format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Breaking

- **eslint**: `configs.recommended`, `configs['gost-aa']` and `configs.strict` are flat configs
  now. The previous eslintrc objects referenced a non-existent plugin package and could not be
  loaded; on ESLint 9 the documented `[ruA11y.configs['gost-aa']]` threw. The `*/flat` names
  remain as aliases. Rules are addressed as `ru-a11y/<rule>`.

### Fixed

- **eslint**: `require-h1` and `require-title-semantic` reported `<h1>{title}</h1>` and
  `<title>{page}</title>` as empty.
- **eslint**: `zoom-200-warning` ignored the `minFontSizePx` option.
- **overlay**: findings on different elements with the same tag were merged into one and could
  highlight the wrong element; selectors are unique now.
- **overlay**: the same issue reported by axe-core and by a ru-a11y check appeared twice.
- **overlay**: a custom `excludeSelector` stopped excluding the overlay itself.
- **overlay**: `select-name` flagged selects wrapped in a `<label>`.
- **overlay**: violation cards nested a button inside `role="button"`.
- **overlay**: a scan started while another was running briefly showed "no violations".
- **visually-impaired**: the stylesheet restyled the ru-a11y dev overlay.
- **cli**: `--version` printed a hard-coded `2.0.3`.
- **cli**: `--output --format json` consumed `--format` as the output path; `--timeout 5abc` was
  accepted as `5`.
- **cli**: `package.json#main` pointed at the CLI script instead of the library entry.
- `npm install` failed because the CLI required an unpublished `ru-a11y-toolkit-core@1.3.3`.

### Changed

- **overlay**: axe-core is no longer bundled into `dist` (1.4 MB → 62 KB); it was already a
  dependency. Console logging is opt-in through the new `debug` prop. Violations have a
  `source: 'axe' | 'ru-a11y'` field.
- **visually-impaired**: settings stay in sync across browser tabs. Option groups in the panel
  are labelled for screen readers.
- **cli**: the run summary is printed once instead of once per report format.
- Internal restructuring of every package; public APIs are unchanged unless listed above.

### Tooling

- ESLint (typescript-eslint, react-hooks) and a shared `tsconfig.base.json` for the monorepo.
- GitHub Actions: format, lint, build, typecheck and tests on Node 20, 22 and 24.
