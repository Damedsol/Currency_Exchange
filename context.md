# 🧠 Project Context and Learnings: currencyExchange (Root)

This document dynamically records technical learnings, architectural decisions, and the active history of changes during the development of the project.

## 🚀 Stack and Configuration (Learnings)

- **Primary Linter:** **Oxlint** for ultra-fast static analysis without ESLint. Correctness, performance, and suspicious rules are enabled in `.oxlintrc.json`.
- **Exclusive Formatter:** **Biome** to aesthetically format JS, TS, TSX, CSS, and JSON files in record time. Biome's internal linter is disabled to prevent conflicts.
  - *Configuration:* Absolute precision in tab usage, width of 2, line width of 80, double quotes, and trailing commas.
- **Filename Linter:** **ls-lint** guarantees consistency in naming conventions: components in `PascalCase.tsx`, utilities/services in `camelCase.ts`, and configurations in `kebab-case`/`dot-notation`.
- **UI & Framework:** **React 19** and **Fluent UI React Components v9** (`@fluentui/react-components`), injecting the theme via `FluentProvider` and using `makeStyles` (atomic CSS-in-JS from Griffel).
- **Package Management:** **pnpm** with absolute priority in the environment (using pnpm workspaces/catalogs).

## 🧠 Strategic Decisions

- **Exclusivity of Rust-based Linters/Formatters:** ESLint and Prettier were completely removed from the project. Reinstalling them is strictly forbidden.
- **Local Agentic Configuration:** Adopted the "Agentic Standard" via `/AGENTS.md` (single root master file, less than 150 lines) and the `context.md` memory system.
- **Local Technical Skills:** Separating local knowledge into `.gemini/` (CLI) and `.agents/` (Antigravity IDE), with documented skills of over 400 lines for `modern-linting` and `fluent-ui-react`.

## 📈 Relevant Change History

- **2026-05-30: Project Agentic System Initialization**
  - **Change Details:**
    - Created the `AGENTS.md` master file in the root (PROFILE, CONTEXT, INSTRUCTIONS, TOOLS & GUARDRAILS).
    - Created the local skills system in `.gemini/skills/` and `.agents/skills/` for `modern-linting` and `fluent-ui-react`.
    - Updated the strategic memory file `context.md` in the root.
  - **QA Lessons:** Verified that `AGENTS.md` and `context.md` do not violate line limits (<150 and <200 lines respectively).
  - **Branch / Associated Commit:** `feature/agentic-system`

- **2026-05-31: Unified Docker Refactoring and Security Hardening**
  - **Change Details:**
    - Removed the duplicate `docker/` directory and its internal files.
    - Created the `.env.example` file with generic configurations and recursively ignored all real `.env` files in `.gitignore`.
    - Created and unified `nginx.conf` in the root with SPA optimization, gzip compression, and advanced security directives (`server_tokens off`, hidden files blocking).
    - Modified the `Dockerfile` to use the unified Nginx configuration in the root.
    - Simplified `docker-compose.yml` by removing the obsolete version directive and unifying services into a single dynamic container with safe, generic defaults.
  - **QA Lessons:**
    - Validated Docker Compose syntax with `docker compose config` without warnings.
    - Keep VPS-specific internal networks and configurations (`private_services`) 100% private and locally injected to guarantee the **security by obscurity** principle in public repositories.
  - **Branch / Associated Commit:** `refactor/docker-vps-adaptability`

- **2026-06-13: Fluent + Neon-Code Refactor Plan and Dependency Catalog Update**
  - **Change Details:**
    - Created comprehensive 7+1 phase refactoring plan (`docs/plan-neon-code-fluent-tdd.md`, 1272 lines) merging Fluent UI v9 with Accessible Neon-Code design system under strict TDD and WCAG 2.2 AAA.
    - Updated `pnpm-workspace.yaml` catalog with precise version ranges pinned to currently installed versions (not bleeding edge) to respect `minimumReleaseAge` constraint.
    - Added 8 new devDependencies to `package.json`: vitest, @vitest/coverage-v8, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, playwright, @playwright/test.
    - Added 5 new scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`, `test:e2e:ui`.
    - Fixed 15 biome import organization warnings across all source files.
  - **QA Lessons:**
    - `biome format` has no `--check` flag in v2.x; use `biome check --linter-enabled=false` instead.
    - `pnpm-workspace.yaml` `minimumReleaseAge: 7200` prevents installing packages published less than 2 hours ago. Catalog versions must resolve to mature versions.
    - husky pre-commit hook triggers `lint-staged` → `oxlint` + `biome` → `tsc --noEmit`. No auto-install unless lint-staged detects unresolvable catalog entries.
  - **Branch / Associated Commit:** `feature/dependency-update-plan`

- **2026-06-13: Security Infrastructure Hardening**
  - **Change Details:**
    - Added Content-Security-Policy header to nginx.conf with strict directives (default-src 'self', connect-src restricted to api.freecurrencyapi.com, frame-ancestors 'none').
    - Added HSTS (max-age=63072000), Permissions-Policy (camera/mic/geolocation off), and Cross-Origin security headers to all nginx location blocks.
    - Extracted CSP policy string into a reusable nginx `$csp_header` variable to avoid duplication across location blocks.
    - Fixed critical nginx bug: `add_header` in `location /` and `location ~*` was wiping server-level security headers. Security headers now explicit in every location block.
    - Updated `.dockerignore` to exclude `.env`, `.env.*` files (keeping `.env.example`).
    - Pinned Dockerfile `NODE_VERSION` from floating `lts-alpine` to fixed `22-alpine`.
    - Added `@types/node` (v24.13.1) to devDependencies and catalog for config file tests.
    - Fixed 3 `useRef<number>` type errors in App.tsx by using `ReturnType<typeof setTimeout>` (conflict with `@types/node`).
    - Created 3 config validation tests: nginx security headers (4 cases), .dockerignore (5 cases), Dockerfile (1 case).
  - **QA Lessons:**
    - `import.meta.dirname` not recognized by TypeScript with `moduleResolution: "bundler"` — used `fileURLToPath` + `dirname` instead.
    - `/// <reference types="node" />` required at top of test files using `node:fs`, `node:path`, `node:url`.
    - `setTimeout` return type changes from `number` to `NodeJS.Timeout` when `@types/node` is installed — use `ReturnType<typeof setTimeout>` for refs.
  - **Branch / Associated Commit:** `feature/security-infrastructure`

- **2026-06-13: Neon-Code Theme System Creation**
  - **Change Details:**
    - Created `src/theme/neonTheme.ts` with 16-shade `BrandVariants` centered on neon green (#b9f27c), `createDarkTheme`/`createLightTheme` wrappers, and 20 token overrides per theme (shadows → none, border-radius capped at 4px, font weights ≤500 in dark, Figtree + IBM Plex Mono fonts, green-tinted neutral surfaces).
    - Created `src/styles/fonts.css` with `@font-face` declarations for Figtree (variable weight 300-900) and IBM Plex Mono (400/700) using `font-display: swap`.
    - Created `src/styles/globalStyles.ts` with `makeStyles` hooks for WCAG double focus ring, text prefixes (`[OK]`, `[!]`, `[?]`).
    - Updated `src/styles/main.css` to import fonts, add `--card-border`/`--card-border-subtle` CSS custom properties with dark/light variants via `[data-theme]`.
    - Updated `src/main.tsx`: replaced `webDarkTheme`/`webLightTheme` with `neonDarkTheme`/`neonLightTheme`, added `prefers-color-scheme` media query listener with cleanup, `useLayoutEffect` to set `data-theme` on `<html>`, `GlobalStylesSlot` component for `useGlobalStyles` call.
  - **QA Lessons:**
    - `BrandVariants` type is `Record<10 | 20 | ... | 160, string>` (16 shades, not 10 as assumed).
    - `fontWeightSemibold` token is `number` (not `string`). Override must use numeric literal.
    - `borderRadiusMedium`/`borderRadiusLarge`/`borderRadiusXLarge` tokens are strings like `"4px"`.
    - `makeStyles` hooks must be called inside a component's render tree — created `GlobalStylesSlot` pattern.
    - `useLayoutEffect` preferred over `useEffect` for DOM attribute mutations (`data-theme`) to avoid flash of wrong styles.
  - **Branch / Associated Commit:** `feature/neon-theme`

- **2026-06-13: WCAG 2.2 AAA Accessibility Improvements**
  - **Change Details:**
    - Added skip-link to `index.html` with visible-on-focus CSS (`.skip-link` positioned off-screen, revealed on `:focus`).
    - Added `role="region"` and `aria-label="Conversion History"` to ConversionHistory table wrapper.
    - Added `scope="col"` to all `TableHeaderCell` elements in ConversionHistory.
    - Increased CurrencyRow swap button from 32px to 44px `minWidth`/`minHeight` for WCAG target size requirement.
    - Consolidated dual `aria-live="polite"` regions in ResultSection into a single parent container.
    - Added `prefers-reduced-motion: reduce` media query in `main.css` disabling all animations and transitions.
  - **QA Lessons:**
    - `getComputedStyle` in jsdom returns `auto` for `width`/`height` on elements without explicit sizes. Use `minWidth`/`minHeight` instead.
    - `getByLabelText` matches tooltip content as well as `aria-label`. Use `getByRole("button", { name })` for more precise selection.
    - Fluent `TableHeaderCell` forwards unknown props to the DOM element — `scope="col"` passed directly works.
    - `lang="en"` was already present in `index.html`, no change needed.
    - Component tests require `// @vitest-environment jsdom` pragma at file top. React imports are unnecessary with `react-jsx` JSX transform.
  - **Branch / Associated Commit:** `feature/accessibility-wcag`

- **2026-06-13: Component Adaptations for Neon-Code Aesthetics**
  - **Change Details:**
    - Added `autoComplete="new-password"` to AppHeader API key input (modern browsers ignore `autocomplete="off"` on password fields).
  - **QA Lessons:**
    - `getByLabelText` in testing-library matches multiple elements when components render twice (likely a test environment artifact). Use `getAllByLabelText()[0]` pattern.
    - Most neon-code visual adaptations (colors, shadows, border-radius, fonts) flow naturally from theme token overrides — minimal component-level CSS changes needed.
    - Fluent `Input` component supports `autoComplete` prop which maps to native `autocomplete` attribute.
  - **Branch / Associated Commit:** `feature/component-adaptations`

- **2026-06-13: Hook Architecture Refactor — Prop Drilling Elimination**
  - **Change Details:**
    - Created `src/types/index.ts` with centralized `RateSource`, `ApiKeySaveStatus`, `AppMessage`, and `ConversionState` types.
    - Extracted `useApiKey` hook: manages API key input, localStorage load/save, debounced validation (1s), blur timeout, toggle visibility. Exposes `clearApiKey()` for external reset.
    - Extracted `useConversion` hook: manages currencies, amount, fetchRate with `onConversionComplete` callback, `repeatConversion`. Calls `useCallback` with proper dependency arrays.
    - Extracted `useConversionHistory` hook: manages list CRUD, auto-save to localStorage, max 10 entries. Exposes `loadInitialHistory()` for SSR-safe hydration.
    - Extracted `useAppMessage` hook: manages message state with auto-dismiss timeout (5s), cleanup on unmount.
    - Created `ErrorBoundary` component with customizable fallback for lazy-loaded components.
    - Refactored `App.tsx` from 477 lines to ~120 lines as a pure orchestrator connecting hooks to components.
  - **QA Lessons:**
    - `vi.mock` with factory functions requires `vi.hoisted()` for variable references that need to be hoisted above the mock call.
    - API key test regex requires exactly 28 alphanumeric chars after `fca_live_` — must verify key length in test fixtures.
    - `useCallback` with empty deps `[]` in `swapCurrencies` would capture stale closure values. Must list `fromCurrency`/`toCurrency` as dependencies.
    - `React.StrictMode` double-renders in development cause `getByLabelText` to match multiple elements — use `getAllBy*` and index `[0]`.
    - Fluent `Input` `autoComplete` prop maps to native `autocomplete` HTML attribute.
  - **Branch / Associated Commit:** `feature/hook-architecture`

- **2026-06-13: Test Infrastructure Setup and Test Suite**
  - **Change Details:**
    - Created `vitest.config.ts` with jsdom environment, globals, setup file, and coverage v8 config.
    - Created `src/test/setup.ts` with `@testing-library/jest-dom/vitest` matchers, `matchMedia` mock (default `matches: false`), and `BroadcastChannel` class stub.
    - Added `src/services/LocalStorage.test.ts` (15 tests): 3 regex validation, 2 fetch, 3 store, 1 clear, 3 rates cache, 3 conversion history.
    - Added `src/hooks/useAppMessage.test.ts` (5 tests): init, show, auto-dismiss, manual dismiss, custom duration.
    - Added `src/hooks/useConversionHistory.test.ts` (5 tests): init empty, init preloaded, addEntry with persistence, 10-entry limit, clear.
    - Created `playwright.config.ts` with webServer pointing to `pnpm preview` on port 4173.
    - Added `coverage/`, `e2e/test-results/`, `playwright-report/` to `.gitignore`.
  - **QA Lessons:**
    - vitest globals (`vi`, `describe`, etc.) require `import { vi } from "vitest"` in setup files for TypeScript to resolve types, even with `globals: true` in config.
    - `vi.hoisted()` is needed for mock variables referenced inside `vi.mock()` factory callbacks to ensure proper hoisting order.
    - Fake timers with `vi.useFakeTimers()` must be cleaned up per-test with `vi.useRealTimers()`; `afterEach` ensures cleanup even on failure.
    - jsdom `localStorage` is shared across tests — `localStorage.clear()` in `beforeEach` prevents test pollution.
    - Freecurrencyapi test key requires exactly 40 alphanumeric chars after `fca_live_` prefix.
  - **Branch / Associated Commit:** `feature/tdd-test-suite`

- **2026-06-13: Performance Optimizations**
  - **Change Details:**
    - Wrapped `CurrencySelector`, `CurrencyRow`, `ResultSection`, `RateSourceIndicator` in `React.memo` to prevent unnecessary re-renders when parent state changes but props haven't.
    - Added `useDeferredValue` in `ConversionHistory` — defers high-priority history updates to avoid blocking the table render thread. Table shows 0.6 opacity during stale state.
    - Added `useTransition` in `main.tsx` — wraps `toggleTheme` in `startTransition` for non-blocking theme switching.
    - Implemented in-memory cache (`Map<string, {rates, timestamp}>`) in `FreeCurrency.ts` with 5-minute TTL to avoid repeated `JSON.parse` of localStorage on rate calculations.
    - Added `React.lazy(() => import("./components/HistoryPanel/HistoryPanel"))` in `App.tsx` with `Suspense` and `ErrorBoundary` — separates `HistoryPanel` into its own chunk (`6.41 kB / 2.07 kB gzip`).
    - Added font preload links (`<link rel="preload" as="font">`) for Figtree and IBM Plex Mono in `index.html`.
    - Removed unused `React` import from `ConversionHistory.test.tsx` and `CurrencyRow.test.tsx`.
  - **QA Lessons:**
    - `React.memo` requires `React` as a value import (`import React from "react"`), not just a type import. Files using JSX-only with React 19's `react-jsx` transform don't need `React` — `React.memo` changes this.
    - `React.lazy` creates a separate chunk automatically. Vite 8 splits the lazy component into its own output file.
    - Bundle size is tracked: `react-dom` remains the largest chunk (126.63 kB gzip); Fluent UI is 10.96 kB gzip. Total gzip target <200 kB.
  - **Branch / Associated Commit:** `feature/performance-optimizations`
