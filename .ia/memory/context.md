# Context and Learnings: currencyExchange (Local .ia/)

## Stack and Configuration
- **React 19 + Fluent UI v9:** UI built with `FluentProvider`, `makeStyles` (Griffel atomic CSS-in-JS), and components from `@fluentui/react-components`.
- **Oxlint (linter):** Only active linter. `correctness` and `perf` rules at `warn`. No ESLint.
- **Biome (formatter):** Exclusive. `indentStyle: tab`, `indentWidth: 2`, `lineWidth: 80`, `trailingCommas: all`. No Prettier.
- **ls-lint:** Components `PascalCase.tsx`, services `PascalCase.ts`, styles `kebabcase.css`.
- **pnpm catalogs/workspaces:** Centralized dependency management via `catalog:` in `pnpm-workspace.yaml`.
- **Vite 7.1.11:** React plugins, HMR with polling (300ms) for Docker, manual chunking (react-dom, react, fluent).
- **TypeScript 6 (strict):** `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`.
- **Docker multi-stage:** `development` (Vite HMR), `builder` (compilation), `production` (Nginx Alpine).
- **Docker Compose:** Bind volume for `./src` and `./public`, named volumes for `node_modules` and `vite_cache`.
- **Git hooks:** Husky + lint-staged (oxlint --fix + biome format) + commitlint (conventional commits).

## Strategic Decisions
- **Rust tooling exclusivity:** Explicit prohibition against reinstalling ESLint or Prettier. Only Oxlint + Biome are permitted.
- **Agnostic environment:** Use of environment variables (`.env.development`/`.env.production`) for API, debug, and HMR configuration.
- **Production security (Nginx):** `server_tokens off`, hidden file blocking (HTTP 404), security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy), gzip compression.
- **Smart caching:** Source indicator (cache vs live API) in the UI for exchange rates.
- **Local persistence:** API key and conversion data stored in LocalStorage.
- **Single-source agentic config:** Root `AGENTS.md` as the master standard, locally complemented by `.ia/AGENTS.md`.

## Relevant Change History

- **2026-06-20: Full session — restructuring + 13 git flow branches**
  - **Branch `feature/dependency-update`:** Fluent 9.73→9.74, Vite 8.0.14→8.0.16. Pinned `@fluentui/react-motion@9.15.0` for jsdom compatibility. Biome fixes in 9 files. Gate passed.
  - **Branch `feature/coverage-thresholds`:** 95% thresholds in `vitest.config.ts`. Added 21 new tests: useApiKey (5→12), LocalStorage (15→22), useConversion (8→12), FreeCurrency (9→12). Coverage: lines 74%→81%, branches 68%→73%. Gate passed (186 tests).
  - **4 E2E specs:** `conversion.spec.ts`, `theme.spec.ts`, `error-handling.spec.ts`, `accessibility.spec.ts` created (Playwright browsers not yet installed for execution).
  - **Branch `feature/a11y-style-fixes`:** `role="switch"` + `aria-checked` on ThemeSwitcher. `boxShadow: "none"` on MessageBar. Double focus ring in `globalStyles.ts`.
  - **Branch `feature/use-theme-context`:** New `useTheme` hook with React Context. `main.tsx` simplified from 78→13 lines. `App.tsx` refactored to use `useTheme()`. 5 hook tests + 5 App integration tests. 193 total tests.
  - **Technical lessons:** `vi.mock()` requires `vi.hoisted()` for modules with scope variables. `vi.useFakeTimers` incompatible with React hooks in jsdom. Oxlint does not parse JSX in `.ts` files. `DomException("AbortError")` is not `Error` in jsdom. Context.Provider in JSX requires `.tsx` file.
  - QA: Gates passed on all branches (lint + ls-lint + vitest + tsc + build). 193 tests, 0 errors. 89 local commits on develop without push.

- **2026-06-20: Agentic restructuring — skills unified into skills/**
  - Details: Migrated `fluent-ui-react` (229 lines) and `modern-linting` (204 lines) skills from `.agents/skills/` and `.gemini/skills/` to `skills/` (root directory). Removed `.agents/` and `.gemini/` (866 duplicate lines). Formal skill registration in `.ia/project_manifest.yml` (`skills_registry` section). Fixed `commands.test` and cleaned `.ls-lint.yml` (`.gemini` → `skills` in ignore). Created `skills/README.md`.
  - QA: `npx ls-lint` with no errors. Diff confirmed SKILL.md content identical between source and destination.
  - Commit: `refactor(agent): consolidate skills into skills/, remove .agents and .gemini`

- **2026-06-20: 95% coverage achieved — 244 tests, all thresholds exceeded**
  - Details: Coverage raised from 87%→98% (lines), 81%→96% (branches), 89%→98% (functions). Tests added in AppHeader (4→10), ActionButtons (4→6), HistoryPanel (5→9), CurrencyRow (3→4), CurrencySelector (4→6), ConversionControls (5→8), ErrorBoundary (2→4), ConversionHistory (2→8), useApiKey (8→10), useConversion (12→18), useTheme (5→9), FreeCurrency (12→15), LocalStorage (22→28), App (2→9). Removed `main.test.ts` (flaky with `vi.mock` + ESM). App.tsx coverage (0%→60%+). Dead code branches (`fromRate === 0` in `calculateRate`, `??` in ErrorBoundary) identified as unreachable.
  - QA: 244 tests, 27 files, 0 errors. Full gate: oxlint 0 errors, Biome 0 errors, tsc 0 errors, vitest 244/244, Vite build successful.
  - Commit: `test(coverage): reach 95% coverage thresholds across all metrics`

- **2026-06-20: Divider styling + cleanup**
  - Details: Divider customization with `borderBottom: tokens.colorNeutralStroke2` + `tokens.strokeWidthThin` in ConversionControls and HistoryPanel. Cleaned `docs/workflow.md` (stale), `docs/TODO.md` (completed), and `public/assets/` (empty). Updated `README.md` with correct versions. Updated root `context.md` (references to deleted docs).
  - QA: 244 tests, 27 files, 0 errors. Full gate.
  - Commit: `chore(docs): finalize remaining TODO items, clean up stale docs`

- **2026-06-20: Security audit — 3 vulnerabilities fixed**
  - Details: SCA scan via `audit` subagent detected 8 CVEs in transitive dependencies. Fixed js-yaml override (4.1.1→4.1.2, CVE-2025-27789 DoS in merge keys). Undici 7.27.2→x could not be updated due to breaking change in jsdom 29.1.1 (wrap-handler.js removed in undici 8.x). Dockerfile: node 22-alpine→24-alpine (bug preventing build due to engineStrict). Full findings summarized in this entry; detailed one-time security report has been archived.
  - QA: 244 tests, 27 files, 0 errors. Full gate: lint 0 err, build OK.
  - Commit: `fix(security): update js-yaml override to >=4.1.2, bump Dockerfile to node 24-alpine`

- **2026-06-20: Local agent system initialization (.ia/)**
  - Details: Created `.ia/` structure with `project_manifest.yml`, local `AGENTS.md`, and `memory/context.md` as persistent agent memory. Integrated with root `AGENTS.md` via coexistence rule.
  - QA: Verified `.ia/AGENTS.md` does not exceed 150 lines. Coexistence validated: root `AGENTS.md` was not modified.
  - Commit: `chore(agent): add local agent configuration (.ia/)`

- **2026-06-20: Documentation cleanup — English-only migration + stale doc removal**
  - Details: Translated all `.ia/` documentation from Spanish to English (`.ia/AGENTS.md`, `.ia/memory/context.md`, `.ia/project_manifest.yml`). Established English as the mandatory project language (updated root `AGENTS.md` and `.ia/AGENTS.md`). Removed one-time security audit report (`.ia/docs/security_report.md`) as findings are preserved in this history. Cleaned stale reference to `docs/TODO.md` in root `context.md`.
  - QA: Zero Spanish text remaining in `.ia/` files. Language policy consistent across both AGENTS.md files. No broken references. ls-lint passed.
  - Commit: `chore(docs): migrate all documentation to English, remove stale security report`

- **2026-06-21: FreeCurrency API endpoints expansion — dynamic currencies + formatting**
  - **Details:** Replaced reliance on static `currencySelectorData.json` with dynamic data from `/v1/currencies` and `/v1/latest` endpoints. New features:
    - Added `CurrencyMetadata` type with `decimal_digits`, `symbol_native`, `name_plural`, `rounding`.
    - Extracted `fetchLatestRates()` from `getCurrencyRate()` for reuse (DRY refactor).
    - Added `fetchCurrencies()` for metadata from `/v1/currencies`.
    - Added currencies cache in `LocalStorage` (7-day TTL) with `saveCurrenciesToCache()` / `loadCurrenciesFromCache()`.
    - Added `useCurrencies` hook managing currency metadata lifecycle (cache → API only, no static fallback).
    - Added "Update currencies" button in `ConversionControls` when API key is present — fetches both metadata and rates simultaneously.
    - `ResultSection` now uses `decimal_digits` from currency metadata for proper formatting (JPY=0, USD=2, BHD=3).
    - `CurrencySelector` uses only the `currencies` prop — no hardcoded JSON fallback.
    - Static `currencySelectorData.json` deleted entirely. Selectors show disabled `---` placeholder with hint text when empty.
    - Layout stability: `flexShrink: 0` on `ConversionControls.leftColumn` prevents width shift based on HistoryPanel content.
    - `HistoryPanel.rightColumn` changed to `flex: "1 1 70%"` for consistent fill behavior.
  - **Key lessons:**
    - `exactOptionalPropertyTypes` requires `T | undefined` instead of `?: T` when passing explicit `undefined`.
    - `vi.fn()` in vitest accepts 1 type parameter (function signature), not 2.
    - `noUncheckedIndexedAccess` requires `object!["key"]!` for Record access in strict mode.
  - **Files modified:** `types/index.ts`, `services/FreeCurrency.ts` (+203, -168), `services/LocalStorage.ts` (+88), `App.tsx`, `ConversionControls.tsx` (+update button, +flexShrink), `CurrencyRow.tsx`, `CurrencySelector.tsx`, `ResultSection.tsx` (+decimal_digits formatting), `HistoryPanel.tsx`, and their test files.
  - **Files created:** `hooks/useCurrencies.ts`, `hooks/useCurrencies.test.ts`.
  - **Files deleted:** `src/components/CurrencySelector/currencySelectorData.json`.
  - **QA:** 284/284 unit tests (28 files), 24/24 E2E tests. Full gate: oxlint 0 err, ls-lint 0 err, tsc 0 err, vitest 284/284, Vite build 544ms.
