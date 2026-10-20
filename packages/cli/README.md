# ru-a11y-toolkit-cli

[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit-cli)](https://www.npmjs.com/package/ru-a11y-toolkit-cli)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit-cli)](../../LICENSE)

Command line auditor for live pages. It opens each URL in headless Chromium (Puppeteer),
runs axe-core, optionally lints the source with ESLint, and maps every finding to GOST
R 52872-2019 and Decree No. 102 with a Russian description and fix. Built for CI.
Part of [ru-a11y-toolkit](../../README.md).

```bash
npx ru-a11y-cli https://example.com
```

```text
ru-a11y CLI report
════════════════════════════════════════════════════════════════════════
Проверено страниц: 1
Найдено нарушений: 4

Страница https://example.com
  Воспринимаемость (2)
    Нарушение #1  КРИТИЧНОЕ  Изображение без альтернативного текста
      Где: img.hero
      Правило: RU_AXE_IMAGE_ALT / image-alt
      …
```

## Install

```bash
npm install --save-dev ru-a11y-toolkit-cli
```

Node.js 20+. Puppeteer downloads Chromium on install; set `PUPPETEER_SKIP_DOWNLOAD=true` if
you provide your own browser.

## Usage

```bash
ru-a11y-cli <url...> [options]
```

| Option                     | Default                    | Description                                                                 |
| -------------------------- | -------------------------- | --------------------------------------------------------------------------- |
| `--urls-file <path>`       | —                          | URLs, one per line; blank lines and `#` comments are ignored                |
| `--standard <level>`       | `gost-aa`                  | `gost-a`, `gost-aa` or `gost-aaa`; selects the axe-core tags                |
| `--wcag-tags <list>`       | from `--standard`          | Explicit axe-core tags, e.g. `wcag2a,wcag21aa`                              |
| `--format <type>`          | `console`                  | `console`, `json`, `html`, `junit` or `all`                                 |
| `--output <dir>`           | `ru-a11y-reports`          | Directory for file reports (`all` writes one sub-directory per format)      |
| `--max-issues <n>`         | unlimited                  | Exit with code 1 when more issues are found                                 |
| `--timeout <ms>`           | `30000`                    | Navigation timeout per page                                                 |
| `--concurrency <n>`        | `2`                        | Pages audited in parallel                                                   |
| `--include <list>`         | —                          | Keep issues whose rule code, axe id, principle or severity contains a token |
| `--exclude <list>`         | —                          | Drop issues matched the same way                                            |
| `--disable-rules <ids>`    | —                          | axe-core rules to skip                                                      |
| `--with-eslint`            | off                        | Lint the project too and merge the results into the same report             |
| `--eslint-targets <globs>` | `src/**/*.{js,jsx,ts,tsx}` | Files to lint; commas inside braces are kept (`src/**/*.{ts,tsx}`)          |
| `--eslint-config <path>`   | —                          | Explicit ESLint config                                                      |
| `--project-root <path>`    | current directory          | Where ESLint runs                                                           |
| `--help`, `--version`      |                            |                                                                             |

Numbers must be non-negative integers; a flag followed by another flag instead of a value is
an error.

### Zero-config mode

Without arguments the CLI audits the project in the current directory: URLs come from
`ru-a11y.urls.txt`, ESLint is enabled when `eslint.ru-a11y.config.mjs` exists, and all report
formats are written to `ru-a11y-reports/`. Set `RU_A11Y_BASE_URL` to rewrite
`http://localhost:3000` in those URLs, for example to point them at a staging host.

### Examples

```bash
# Several pages, JSON report
ru-a11y-cli https://example.com https://example.com/catalog --format json --output ./reports

# Only critical issues
ru-a11y-cli https://example.com --include критичное

# Runtime and static audit in one HTML report
ru-a11y-cli https://example.com --with-eslint --project-root ./app --format html

# Static audit only
ru-a11y-cli --with-eslint --project-root ./app
```

## Exit codes

| Code | Meaning                                                             |
| ---- | ------------------------------------------------------------------- |
| `0`  | Issues do not exceed `--max-issues`                                 |
| `1`  | More issues than `--max-issues`                                     |
| `2`  | Invalid arguments, or a page could not be audited (timeout, DNS, …) |

## Reports

| Format    | File                  | Contents                                                                 |
| --------- | --------------------- | ------------------------------------------------------------------------ |
| `console` | stdout                | Issues grouped by page and WCAG principle, with code snippets for ESLint |
| `json`    | `ru-a11y-report.json` | `generatedAt`, `scannedPages`, `totalIssues`, `pages[].issues[]`         |
| `html`    | `ru-a11y-report.html` | Self-contained page with summary, navigation and collapsible issue cards |
| `junit`   | `ru-a11y-junit.xml`   | One test suite per page/file, one failing test case per issue            |

Every issue carries `ruRuleCode`, `axeRuleId`, Russian `title` / `description` /
`recommendation`, `severity`, `principle`, `gostRefs`, `post102Refs`, `wcagRefs`, `origin`
(`runtime-axe` or `static-eslint`) and a `source` location (selector and HTML for runtime
issues, file, line and column for ESLint).

## CI

```yaml
# GitHub Actions
- run: npx ru-a11y-cli --urls-file urls.txt --format junit --output reports --max-issues 0
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: a11y-report
    path: reports
```

JUnit output is understood by GitHub, GitLab, Jenkins and most other CI systems.

## Programmatic API

```ts
import { runCli, parseCliArgs, runPuppeteerAudit, buildJsonReport } from 'ru-a11y-toolkit-cli';

const exitCode = await runCli(['https://example.com', '--format', 'json']);
```

All reporters, mappers and runners are exported, along with the report types
(`AuditRunResult`, `GostIssue`, …).

## Limitations

- Automated checks find a share of problems, not all; keyboard flows and screen reader
  behaviour need manual testing.
- Pages behind authentication need a reachable, pre-authorised environment.
- Runtime issues point to a selector, not to a source file; use `--with-eslint` for file
  locations.

## Source layout

```text
src/
  cli.ts          orchestration: parse, audit, filter, report
  args/           declarative flag table, help text, list parsing
  audit/          filters, merging, exit code
  runner/         Puppeteer + axe-core, ESLint
  mapping/        axe / ESLint result -> ru-a11y issue
  report/         console, JSON, HTML, JUnit and shared helpers
  utils/          terminal styling, bounded concurrency
```

## License

MIT
