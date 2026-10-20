# Contributing

## Setup

```bash
npm install
npm run build   # builds core first; other packages import its dist/
npm run check   # format check, lint, typecheck and tests — the same steps CI runs
```

Node.js 22+ is required. Set `PUPPETEER_SKIP_DOWNLOAD=true` before `npm install` if you do not
need to run the CLI against real pages.

## Where things go

- **Rule texts and references** belong in `packages/core/src/catalog/`. Other packages must not
  hard-code Russian descriptions of a rule; they read them through `getRuleMeta()`.
- **A new ESLint rule**: `packages/eslint-preset/rules/<name>.js` built with `createRule()` and the
  helpers from `rules/utils/jsx.js`, registered in `rules/index.js`, enabled in
  `configs/levels/*`, documented in the package README, with a RuleTester suite in `tests/`.
- **A new overlay check**: add it to the matching file in `packages/react-overlay/src/rules/` and
  the rule metadata to the core catalog.
- Changing the number of rules means updating `RU_A11Y_TOOLKIT_STATS`; tests in each package
  fail until the numbers match.

## Conventions

- TypeScript is strict; avoid `any` and non-null assertions where a type guard works.
- User-facing texts (messages, UI, reports) are in Russian. Code, comments, commit messages and
  docs are in English.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat(eslint): …`, `fix(overlay): …`, `refactor(cli)!: …` for breaking changes.
- Every bug fix comes with a test that fails without it.
