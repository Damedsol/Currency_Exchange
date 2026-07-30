# Context and Learnings: currencyExchange (Local .ia/)

## Stack and Configuration
- **React 19 + Fluent UI v9:** UI built with `FluentProvider`, `makeStyles` (Griffel atomic CSS-in-JS), and components from `@fluentui/react-components`.
- **Oxlint (linter):** Only active linter. `correctness` at `error`, `perf` at `warn`. No ESLint.
- **Biome (formatter):** Exclusive. `indentStyle: tab`, `indentWidth: 2`, `lineWidth: 80`, `trailingCommas: all`. No Prettier.
- **ls-lint:** Components `PascalCase.tsx`, services `PascalCase.ts`, styles `kebabcase.css`.
- **pnpm catalogs/workspaces:** Centralized dependency management via `catalog:` in `pnpm-workspace.yaml`.
- **Vite 8.0.16:** React plugins, HMR with polling (300ms) for Docker, manual chunking (react-dom, react, fluent).
- **TypeScript 6 (strict):** `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`.
- **Docker multi-stage:** `development` (Vite HMR), `builder` (compilation), `production` (Nginx Alpine).
- **Docker Compose:** Bind volume for `./src` and `./public`, named volumes for `node_modules` and `vite_cache`.
- **Git hooks:** Husky + lint-staged (oxlint --fix + biome format) + commitlint (conventional commits).

## Strategic Decisions
- **Rust tooling exclusivity:** Explicit prohibition against reinstalling ESLint or Prettier. Only Oxlint + Biome are permitted.
- **Agnostic environment:** Use of environment variables (`.env.development`/`.env.production`) for API, debug, and HMR configuration.
- **Production security (Nginx):** `server_tokens off`, hidden file blocking (HTTP 404), CSP via HTTP header (no meta tag), HSTS, X-Frame-Options, X-Content-Type-Options, Cross-Origin-Resource-Policy, Cross-Origin-Opener-Policy, Referrer-Policy, gzip compression.
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
  - **QA:** 286/286 unit tests (28 files), 24/24 E2E tests. Full gate: oxlint 0 err, ls-lint 0 err, tsc 0 err, vitest 286/286, Vite build 544ms.
  - **2026-06-21 hotfix:** Strengthened ResultSection tests to actually validate decimal digits (JPY=0, BHD=3, default=2) using locale-aware comparison instead of flaky substring match.
  - **2026-06-21 fix: History table decimal formatting — currency metadata threaded to ConversionHistory.**
    - **4 atomic commits:**
      1. `feat(ResultSection): export formatCurrencyAmount for shared use` — added `export` to the formatting utility.
      2. `fix(history): replace hardcoded formatNumber with currency-aware decimal formatting` — created `formatHistoryValue` using `decimal_digits`, reordered table columns (Amount→Result→From→To→Rate), added 7 tests (JPY=0, BHD=3, undefined=2).
      3. `feat: thread currencies prop from App through HistoryPanel to ConversionHistory` — wired `currencies` in the component chain for production data flow.
      4. `docs(context): update memory with latest fix and QA metrics` — this entry.
    - **Key technical details:**
      - `formatHistoryValue(num, currencyCode, currencies)` replaces `formatNumber(num, 3, 3)`
      - Amount column uses `entry.fromCurrency`, Result and Rate use `entry.toCurrency`
      - Column order: Amount → Result → From → To → Rate → Timestamp → Action
      - `useGrouping: false` preserved for compact table display
      - Fallback to 2 decimals when metadata unavailable
    - **Files modified:** `ResultSection.tsx` (+1), `ConversionHistory.tsx` (+99, -36), `ConversionHistory.test.tsx` (+156, -1), `HistoryPanel.tsx` (+6, -1), `HistoryPanel.test.tsx` (+1), `App.tsx` (+1), `context.md` (+memory update).
    - **QA:** 293/293 unit tests (28 files). Full gate: oxlint 0 err, ls-lint 0 err, tsc 0 err, vitest 293/293, Vite build successful.

- **2026-06-27: Security audit — undici 7.27.2 → 8.5.0, 7 CVEs fixed**
  - **Details:** Full SCA scan via `audit` subagent detected 7 CVEs in `undici@7.27.2` (transitive via `jsdom@29.1.1`, dev only). Added `"undici": ">=7.28.0"` override in `pnpm-workspace.yaml`. Resolution resolved to `undici@8.5.0` (latest compatible). All 7 vulnerabilities eliminated: 3 HIGH (SOCKS5 proxy routing, WebSocket DoS, TLS bypass), 2 MEDIUM (header injection, cache info disclosure), 2 LOW (SameSite downgrade, queue poisoning).
  - **License scan (387 pkgs):** 100% permissive (MIT, Apache-2.0, ISC, BSD) — no copyleft conflicts.
  - **AI skills audit (2/2):** `fluent-ui-react` (score 0) ✅, `modern-linting` (score 18, false positive) ✅.
  - **Report archived at:** `.ia/docs/security_report.md` (257 lines).
   - **QA:** `pnpm audit --json` confirms 0 advisories. `pnpm ls undici` shows 8.5.0 resolved in all 3 paths (jsdom, vitest, @vitest/coverage-v8). Full gate: oxlint 0 err, ls-lint 0 err, tsc 0 err, build OK.

- **2026-06-27: UX Polish — transitions, loaders, icons, scrollbars**
  - **6 enhancements implemented:**
    1. **ThemeSwitcher icons:** Added `WeatherSunnyRegular` (light) / `WeatherMoonRegular` (dark) with `transition: color` on label and container. 3 new tests validating icon rendering and mode switching.
    2. **Currencies update moved to AppHeader:** Currency status text + Update button relocated from `ConversionControls` to `AppHeader` (next to API key button). 6 new AppHeader tests. Props wired through App from `currenciesManager`.
    3. **Spinner loaders:** Added `<Spinner>` in `ConversionControls` (Calculate button loading), `ResultSection` (result area loading), `RateSourceIndicator` (replaced "Loading..." text), and `Suspense` fallback (replaced "Loading history..." text).
    4. **Custom neon scrollbars:** WebKit (`::-webkit-scrollbar`) and Firefox (`scrollbar-color`) styles in `main.css` using neon green thumb on dark track, dark green on light mode.
    5. **Sun/moon icons in ThemeSwitcher:** Conditional `WeatherSunnyRegular` / `WeatherMoonRegular` icon rendered based on `isDarkMode`.
    6. **ConversionHistory hover transition:** Added `transition: background-color` on table rows for smooth hover effect.
  - **Files modified (13):**
    - `src/styles/main.css` (+scrollbar styles)
    - `src/components/ThemeSwitcher/ThemeSwitcher.tsx` (+icons, +transitions)
    - `src/components/ThemeSwitcher/ThemeSwitcher.test.tsx` (+3 icon tests)
    - `src/components/AppHeader/AppHeader.tsx` (+currency update section, +4 optional props)
    - `src/components/AppHeader/AppHeader.test.tsx` (+6 currency update tests)
    - `src/components/ConversionControls/ConversionControls.tsx` (-currency update row, +Spinner, -4 props)
    - `src/components/ConversionControls/ConversionControls.test.tsx` (-5 currency tests, +2 spinner/absence tests)
    - `src/components/ResultSection/ResultSection.tsx` (+Spinner for loading, +transition)
    - `src/components/ResultSection/ResultSection.test.tsx` (+1 Spinner test)
    - `src/components/RateSourceIndicator/RateSourceIndicator.tsx` (loading text → Spinner)
    - `src/components/RateSourceIndicator/RateSourceIndicator.test.tsx` (+1 Spinner test)
    - `src/components/History/ConversionHistory.tsx` (+transition on tableRow)
    - `src/App.tsx` (wired currencies props to AppHeader, Spinner in Suspense, removed 4 props from ConversionControls)
  - **Bug fix:** `pnpm-workspace.yaml` override `undici: ">=7.28.0"` → `"^7.28.0"` (was resolving to 8.x which breaks jsdom 29's `wrap-handler.js`).
  - **QA:** 298/298 unit tests (28 files) + 37/37 E2E tests (5 specs, 11.0s). Full gate: oxlint 0 err, ls-lint 0 err, tsc 0 err, vitest 298/298, E2E 37/37, Vite build 258ms.
  - **E2E coverage additions:**
    - `theme.spec.ts`: 4 new tests — toggle label text, data-theme attribute change, icon SVG rendering, icon path swap on mode toggle.
    - `ui-enhancements.spec.ts` (new): 9 tests — currency update section in header (with API key injection), Update button icon, Calculate button icon, aria-live region, scrollbar CSS, rate indicator, empty history, CSS variables, lazy-loaded HistoryPanel heading.
    - Coverage verified against all new features: sun/moon icons, theme toggle action, currency update relocation, Spinner loaders, custom scrollbars.

- **2026-06-27: Remove HEALTHCHECK from production Dockerfile**
  - **Details:** Removed `HEALTHCHECK` instruction from production stage (was using `wget http://localhost:80/`). Monitoring is handled externally, so built-in Docker health check is unnecessary.
  - **Files modified:** `Dockerfile` (-4 lines), `src/config/dockerfile.test.ts` (+1 test asserting no HEALTHCHECK present).
  - **QA:** 299/299 unit tests (28 files). Full gate: vitest 299/299.

- **2026-07-30: Fix 4 Dependabot alerts — js-yaml, fast-uri, postcss**
  - **Details:** Updated overrides in `pnpm-workspace.yaml` to fix 3 transitive dependency vulnerabilities:
    - `js-yaml`: `>=4.1.2` → `>=4.3.0` (resolved `4.2.0` → `5.2.2`). DoS via quadratic parsing of YAML merge chains.
    - `fast-uri`: `3.1.2` → `>=3.1.4` (resolved `3.1.2` → `4.1.1`). Fixed IDN canonicalization bypass + backslash authority delimiter bypass (2 CVEs).
    - `postcss`: _new_ override `>=8.5.18` (resolved `8.5.15` → `8.5.23`). Path traversal in source map auto-loading (arbitrary .map file disclosure).
  - **Research:** All 3 packages are dev/build-only transitive deps. `js-yaml`/`fast-uri` via `@commitlint/cli`, `postcss` via `vite@8.0.16`. No app code uses any of them directly. Vite depends on postcss `^8.5.15`, so `8.5.23` is fully compatible.
  - **Files modified:** `pnpm-workspace.yaml` (3 override lines), `pnpm-lock.yaml` (auto-generated).
  - **QA:** oxlint 0 err, ls-lint 0 err, vitest 299/299 (28 files), Vite build 247ms. `pnpm audit` reports 0 known vulnerabilities.
  - **Branch:** `bugfix/transitive-vulns-jsyaml-fasturi-postcss`
  - **Commit:** `4e954a3` `fix(security): bump js-yaml>=4.3.0, fast-uri>=3.1.4, postcss>=8.5.18`

- **2026-07-30: Pre-publication audit — security + dependencies + documentation**
  - **Fonts fixed:** Replaced 16 corrupt `.woff2` files (were TTF mislabeled) with genuine WOFF2 from neon-code. Added 16 TTF fallback files. Updated `fonts.css` with dual format (`woff2` primary, `truetype` fallback).
  - **CSP delegated to nginx:** Removed `<meta http-equiv="Content-Security-Policy">` from `index.html`. `frame-ancestors` removed from meta (only works in HTTP headers). `'unsafe-inline'` no longer needed in production CSP (nginx header is strict).
  - **nginx.conf restructured:** Each location block is self-contained with all security headers (nginx doesn't inherit `add_header` between levels). Removed global fallback block (was creating false sense of security). Removed deprecated `X-XSS-Protection`. Removed `Permissions-Policy` (not needed for currency converter). Added `no-transform` to SPA `Cache-Control`.
  - **console.log gated:** All 9 `console.log` calls in services (`FreeCurrency.ts`, `LocalStorage.ts`) wrapped with `if (import.meta.env.DEV)`.
  - **ErrorBoundary:** Added `componentDidCatch` with `console.error("[ErrorBoundary]", error, componentStack)`.
  - **E2E mock key:** `VALID_API_KEY` now reads from `process.env.E2E_API_KEY` with fallback mock.
  - **Dockerfile:** Removed `|| pnpm install` fallback (only `--frozen-lockfile`).
  - **pnpm-workspace.yaml:** Removed orphan `ls-lint` catalog entry. Removed `scheduler` catalog entry (handled by React 19). Changed `resolutionMode: lowest-direct` to `highest`.
  - **Oxlint:** `correctness` changed from `"warn"` to `"error"`.
  - **Dependencies:** Removed `scheduler` from `package.json` (React 19 handles it as peer). Updated lockfile.
  - **New files:** `.nvmrc` (Node 24), `SECURITY.md` (vulnerability reporting).
  - **Tags normalized:** 21 tags renamed from uppercase `V` to lowercase `v` (e.g. `V2.0.1` → `v2.0.1`).
  - **QA:** 299/299 unit tests (28 files). Docker build (production target) verified + nginx config test + security headers verified via curl. Full gate: oxlint 0 err, ls-lint 0 err, tsc 0 err, vitest 299/299, Vite build OK.
