# History — currencyExchange (changing memory)

> Stable context lives in `.agents/context/project.md`.
> Consolidated from root `context.md`, `.ia/memory/context.md` and harness cycles.
> Compression rule: latest cycles detailed; older history consolidated below.

## Recent Changes

### 2026-09-10 — Footer parity with imageTransformer (TDD)

- `src/components/Footer/Footer.tsx`: yearless attribution (`Damedsol · Licensed under CC BY 4.0`), nav order README → GitHub → LinkedIn, 16px brand icons, fixed `borderTop: 1px solid var(--card-border-subtle)`, focus `2px solid colorStrokeFocus1`.
- New `src/components/Footer/FooterIcons.tsx` (vendored Iconoir github/linkedin geometry, MIT-registered in `THIRD-PARTY-LICENSES.md`); zero new deps (Fluent has no brand icons — verified T0).
- `Footer.test.tsx`: 6 → 8 tests (no-year, nav order, 16px `aria-hidden` icons; 5-link target/rel kept).
- **QA:** `pnpm vitest run` → 34 files / 334 tests ✅ · `tsc --noEmit` ✅ · `oxlint` ✅ · `check-filenames` ✅ · `biome check` (3 files) ✅ · `vite build` 290ms ✅.
- **Reviewer (18:48):** ✅ APROBADO → /scribe. 0 hallazgos; 8 tests KEEP, 0 REMOVE.
- **Lecciones:** (1) el ciclo sobrevivió al bloqueo del harness (`SANDBOXED_GATES` + `/reload`): el diseño RED se aplicó intacto al recuperarse el shell; (2) los iconos `aria-hidden` preservan `getByText` en Testing Library.
- **ADR:** `.agents/docs/adr/003-footer-brand-icons.md`.
- **Commit:** pending (scribe).

### 2026-09-10 — Build blocked (footer cycle): shell + code-write gates down

- Task: footer parity with imageTransformer (plan `.agents/docs/plan_2026-09-10_footer-imageTransformer.md`).
- `default.bash` fails on every call (`SANDBOXED_GATES is not defined`); no vitest/tsc/oxlint execution possible.
- E3 gate-router blocks all `edit`/`write` outside `.agents/` ("Gate /plan…") despite active /build; T1 RED tests designed but NOT applied; zero production code touched (TDD rule honored).
- T0 verified via file tools: no Fluent brand icons → `FooterIcons.tsx` stays in scope (recorded in plan).
- Next: human fixes/reloads harness, re-invokes `/build` as a real command, resumes at plan T1.

### 2026-09-10 — Release 2.1.2 (version bump + docs sync)

- Bumped `package.json` `2.1.1` → `2.1.2` (SemVer patch).
- `README.md`: version badge → 2.1.2, current test counts (332 unit / 37 E2E), corrected script list (`format:check` did not exist → `typecheck` / `format` / `check-filenames`), English cleanup.
- Version recorded in `.agents/project_manifest.yaml` and `.agents/context/project.md`.

### 2026-09-10 — Init/harness: consolidate `.ia/` + `context.md` + skills into `.agents/`

**Origin:** legacy `.ia/` and root `context.md` coexisted with the newer `.agents/`; project skills sat at the repo root.

**Changes (harness only — zero business code):**
- `skills/` moved to `.agents/skills/` (`git mv`); local_skills paths updated.
- `.agents/skills/*/SKILL.md`: added required YAML frontmatter (`name`/`description`) — the skill loader ignores `SKILL.md` without a description.
- Removed the non-skill `.agents/skills/README.md` index (root `.md` files inside `.agents/skills/` are ignored by the loader; the registry lives in `project_manifest.yaml`).
- `.agents/context/project.md` (new): stable memory (stack, architecture, decisions, non-negotiables) merged from root `context.md` + `.ia/memory/context.md`.
- `.agents/context/history.md`: full change log consolidated; root `context.md` dissolved and removed.
- `.agents/project_manifest.yaml` (new): stack, layers, entrypoints, commands, `env_keys`, `ignored_paths`, and project-local skills.
- `.agents/docs/`: plan 2026-08-17; legacy `.ia/` files merged and removed; `.ia/` deleted. New ADR-002 (memory layout + public boundary).
- Root `AGENTS.md` = canonical entrypoint; knowledge block points to `.agents/context/`.
- Public-release sanitization: removed environment-specific agent-infrastructure references from the manifest and docs.
- Project code index refreshed (108 files).

**Lessons:** (1) project skills under `.agents/skills/` only load once the project is trusted; (2) root `.md` files inside `.agents/skills/` are ignored, so an index README there is inert; (3) a `SKILL.md` without frontmatter is silently skipped.

**QA:** no code changes → tests not re-run. `AGENTS.md` = 38 lines (≤150); skill loader returns 2 skills / 0 diagnostics.
**ADR:** `.agents/docs/adr/002-agentic-memory-layout.md`.
**Commit:** `7ff1474` — docs(agents): consolidate and sanitize harness for public release.

### 2026-09-10 — Security fixes (TDD)

**Source:** `.agents/docs/security_report.md` (audit gate).

**Changes:**
- `src/services/FreeCurrency.ts` — in-memory cache-hit now uses `calculateRate()` (HIGH cross-rate bug fix).
- `src/services/FreeCurrency.test.ts` — non-USD cache-hit regression test.
- `pnpm-workspace.yaml` — `fast-uri >=4.1.3`, `vitest`/`@vitest/coverage-v8 ^4.1.11`.
- `Dockerfile` — digest-pinned bases (`node:24-alpine`, `nginx-unprivileged:alpine`), `USER nginx`, `EXPOSE 8080`; `nginx.conf` `listen 8080`.
- `src/config/dockerfile.test.ts` (+3), `nginx.test.ts` (+1); `vitest.config.ts` excludes `.deepsec/**` + `vitestConfig.test.ts`.

**QA:** 34 files / 332 tests ✅ · `tsc` ✅ · `oxlint` ✅ · `check-filenames` ✅ · `biome check` ✅ · `vite build` 293ms ✅ · `pnpm audit` 0 vulns.
**Reviewer:** ✅ APPROVED (6 KEEP / 0 REMOVE).
**Lessons:** `exclude: ["node_modules/**"]` misses nested `node_modules` (use `**/node_modules/**`); pnpm v11 auto-syncs the lockfile on drift; `imagetools inspect --format '{{.Manifest.Digest}}'` yields the pinnable multi-arch digest.

### 2026-08-17 — Dependabot config + transient cleanup

- Added `.github/dependabot.yml` (npm/pnpm v9, weekly, 3 critical `ignore` rules: `undici >=8` breaks jsdom 29, `nanoid >=4` breaks postcss 8.5, `@fluentui/react-motion >=9.16` pinned for jsdom). New `src/config/dependabot.test.ts` (8 tests).
- Removed stale plan files, build artifacts (`coverage/`, `playwright-report/`, `test-results/`) and `/tmp` session temp files (user-authorized).
- **QA:** 326/326 unit tests (33 files); full gate green.

## Consolidated Learning History (2026-05 → 2026-08)

- **2026-05-30 — Agentic system initialization:** root `AGENTS.md`, `context.md`, local skills.
- **2026-05-31 — Docker refactor + hardening:** removed duplicate `docker/`, added `.env.example`, unified `nginx.conf` (security directives), simplified compose.
- **2026-06-13 — Fluent + neon-code refactor plan:** pinned catalog versions (`minimumReleaseAge: 7200`), added 8 devDeps + 5 test scripts, fixed 15 Biome import warnings. Lesson: `biome format` has no `--check` (use `biome check --linter-enabled=false`).
- **2026-06-13 — Security infra hardening:** CSP/HSTS/Permissions-Policy/CORP headers, `.dockerignore` for `.env*`. Lessons: `add_header` does not inherit across nginx levels (repeat per location); `import.meta.dirname` unsupported with `moduleResolution: bundler`; `@types/node` changes `setTimeout` to `NodeJS.Timeout` (use `ReturnType<typeof setTimeout>`).
- **2026-06-13 — Neon-code theme:** `neonTheme.ts` (16-shade BrandVariants, dark/light overrides), fonts.css, globalStyles (double focus ring). Lessons: BrandVariants has 16 shades; `fontWeightSemibold` is numeric; `GlobalStylesSlot` pattern; `useLayoutEffect` for `data-theme`.
- **2026-06-13 — WCAG 2.2 AAA:** skip-link, regions, `scope="col"`, 44px targets, `prefers-reduced-motion`. Lessons: jsdom `getComputedStyle` returns `auto` (assert `minWidth`/`minHeight`); prefer `getByRole` over `getByLabelText`.
- **2026-06-13 — Hook architecture refactor:** `App.tsx` 477→120 lines; extracted `useApiKey`, `useConversion`, `useConversionHistory`, `useAppMessage`, `ErrorBoundary`. Lessons: `vi.hoisted()` for `vi.mock` factories; API key = 28 chars after `fca_live_`; `useCallback` dep arrays; StrictMode double-render needs `getAllBy*[0]`.
- **2026-06-13 — Test infrastructure:** `vitest.config.ts`, `setup.ts` (matchMedia/BroadcastChannel mocks), Playwright config. Lessons: import `vi` in setup for types; clean fake timers in `afterEach`; `localStorage.clear()` in `beforeEach`.
- **2026-06-13 — Performance:** `React.memo`, `useDeferredValue`, `useTransition`, 5-min in-memory rates cache, `React.lazy` HistoryPanel, font preload. Lessons: `React.memo` needs a value import; lazy creates its own chunk; gzip target <200 kB.
- **2026-06-15 — Color palette system (4 branches) + final A11y/style/security push:** brand dual-mode tokens, cool-toned surfaces, status semantics, card border wiring. Lessons: light-mode brand `#1b4332` (10.3:1) vs `#b9f27c` (1.5:1); Fluent status and palette token systems are separate and both need overrides.
- **2026-06-20 — Full session, 13 git-flow branches:** Fluent 9.73→9.74 / Vite 8.0.14→8.0.16 (pinned `react-motion@9.15.0`), 95% coverage thresholds (+21 tests), 4 E2E specs, a11y fixes, `useTheme` context (`main.tsx` 78→13). Lessons: Oxlint does not parse JSX in `.ts`; `Context.Provider` in JSX requires `.tsx`; `DomException("AbortError")` is not `Error` in jsdom.
- **2026-06-20 — Skills unified into `skills/`** (from `.agents/skills/` + `.gemini/skills/`, 866 duplicate lines removed).
- **2026-06-20 — 95% coverage achieved:** 244 tests, coverage 98%/96%/98%.
- **2026-06-20 — Divider styling + cleanup** and **security audit (js-yaml, undici)**: 3 vulns fixed; undici pinned in 7.x for jsdom 29 compatibility.
- **2026-06-20 — `.ia/` local agent system initialized** (later consolidated into `.agents/`).
- **2026-06-21 — FreeCurrency dynamic currencies:** `/v1/currencies` + `/v1/latest`, `CurrencyMetadata` (`decimal_digits`), `useCurrencies`, 7-day currencies cache, removed static JSON, currency-aware formatting. Lessons: `exactOptionalPropertyTypes` needs `T | undefined`; `vi.fn()` takes 1 type param; `noUncheckedIndexedAccess` needs `obj!["key"]!`.
- **2026-06-27 — undici 7.27.2→8.5.0 (7 CVEs)**, **UX polish** (theme icons, spinners, custom scrollbars, moved currency update to header, E2E +9), and **removed Dockerfile HEALTHCHECK** (external monitoring).
- **2026-07-30 — Dependabot alerts (js-yaml/fast-uri/postcss)** fixed via overrides; **pre-publication audit**: replaced 16 corrupt WOFF2 fonts, CSP delegated to nginx header, gated `console.log` behind `import.meta.env.DEV`, `ErrorBoundary.componentDidCatch`, `.nvmrc` Node 24, `SECURITY.md`.
- **2026-08-13 — Footer + custom filename checker + neon "CEX" favicon:** removed ls-lint for `scripts/check-filenames.mjs`; footer attribution component.
- **2026-08-17 — License consistency** (SPDX `CC-BY-4.0`, `THIRD-PARTY-LICENSES.md`), **favicon "CEX"→"EX"**, **security audit + API key → `sessionStorage`** (7 CVEs fixed via overrides; `>=` with `resolutionMode: highest` can jump majors — prefer `^`), **reviewer round 2** (E2E sync, purged orphan `node_modules` packages, removed inert overrides, fixed stale comments).
