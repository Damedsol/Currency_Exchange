# Project Context — currencyExchange (stable)

> Stable memory: stack, architecture, decisions and non-negotiables.
> Changing history lives in `.agents/context/history.md`.

## Stack & Configuration

- **React 19 + Fluent UI v9:** UI built with `FluentProvider`, `makeStyles` (Griffel atomic CSS-in-JS), components from `@fluentui/react-components`.
- **TypeScript 6 (strict):** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`.
- **Vite 8.0.16:** React plugin, HMR polling (300ms) for Docker, manual chunking (react-dom, react, fluent).
- **Testing:** Vitest 4.1.11 + Testing Library + jsdom (unit); Playwright (E2E). 332 unit tests / 34 files at last green gate.
- **Oxlint 1.66 (linter, no ESLint):** `correctness` = error, `perf` = warn.
- **Biome 2.4 (formatter, no Prettier):** tabs, indent width 2, line width 80, double quotes, trailing commas.
- **Custom filename linter** `scripts/check-filenames.mjs` (replaces ls-lint): components `PascalCase.tsx`, services `PascalCase.ts`, hooks `camelCase.ts`, styles `kebab-case.css`, tests `*.test.ts(x)`/`*.spec.ts(x)`.
- **pnpm 11** with catalogs/workspaces (`pnpm-workspace.yaml`), Node >= 24 (`.nvmrc` = 24), `engineStrict`.
- **Git hooks:** Husky + lint-staged (oxlint --fix + biome format) + commitlint (Conventional Commits).
- **Docker multi-stage:** `development` (Vite HMR), `builder` (compile), `production` (nginx-unprivileged, non-root, port 8080, digest-pinned).

## Architecture (layers)

- `src/components/` — React components (PascalCase, 14 subdirectories).
- `src/services/` — business logic (`FreeCurrency.ts`, `LocalStorage.ts`).
- `src/hooks/` — `useApiKey`, `useConversion`, `useTheme`.
- `src/theme/` — `neonTheme.ts` (BrandVariants + base/status/palette overrides, 58 tokens).
- `src/config/` — config **contract tests** (nginx, Dockerfile, favicon, license, dependabot…).
- `src/styles/` — `main.css` + `globalStyles.ts`.
- `e2e/` — Playwright specs; `scripts/` — tooling; `.agents/skills/` — local project skills.

## Strategic Decisions

- **Rust tooling exclusivity:** ESLint and Prettier are forbidden; only Oxlint + Biome.
- **Agnostic environment:** env vars `.env.development`/`.env.production` for API/debug/HMR (never commit real `.env`).
- **Production security (Nginx):** `server_tokens off`, hidden-file blocking, CSP via header (no meta tag), HSTS, X-Frame-Options, X-Content-Type-Options, CORP/COOP, Referrer-Policy, gzip.
- **Non-root production:** `nginxinc/nginx-unprivileged:alpine` + `USER nginx` + `listen/EXPOSE 8080` (see ADR-001).
- **Digest-pinned base images** for supply-chain safety; tests fail if pins are removed.
- **Financial integrity:** `getCurrencyRate()` computes cross-rates via `calculateRate()` on all paths, including in-memory cache hits.
- **Local persistence:** API key + conversion data in the browser; API key sent as HTTP header (not query param).
- **SCA baseline:** `pnpm audit` must report 0 vulnerabilities; overrides in `pnpm-workspace.yaml`.
- **Single-source governance:** root `AGENTS.md` is the master standard; project memory in `.agents/`.

## Relevant Files

- `src/theme/neonTheme.ts` — brand + WCAG contrast tokens.
- `src/services/FreeCurrency.ts` — rates, cross-rate calculation, caching.
- `src/App.tsx` — shell, card surface, ARIA landmarks.
- `src/types/index.ts` — centralized types (`AppMessage`, `ConversionHistoryEntry`).
- `Dockerfile` / `nginx.conf` — hardened production image.
- `.github/dependabot.yml` — weekly npm/pnpm updates with ignore rules.
- `LICENSE.md` (CC BY 4.0) / `THIRD-PARTY-LICENSES.md` — licensing.
- `favicon.svg` + generated PNGs — neon "EX" monogram.
- `.agents/skills/fluent-ui-react/SKILL.md`, `.agents/skills/modern-linting/SKILL.md` — local skills.

## Non-negotiables

- Never reinstall ESLint or Prettier.
- Never commit real `.env` files (`.env.example` only).
- Explicit human approval before: editing `.env*`, installing/updating deps, changing Docker/infra config.
- Abort after 3 consecutive failures of any automated task.
