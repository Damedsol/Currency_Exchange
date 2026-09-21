# History — currencyExchange (changing memory)

> Stable context lives in `.agents/context/project.md`.
> Consolidated from root `context.md`, `.ia/memory/context.md` and harness cycles.
> Compression rule: latest cycles detailed; older history consolidated below.

## Recent Changes

### 2026-09-21 — UI Cycle B: fixed-size slots + copy (R3/R4, T8..T20, TDD)

- Reserved-size slots in 4 components: `CurrencySelector` unconditional `role="status"` hint (`minHeight 32px`); `ResultSection` single `result-slot` (`44px`, spinner inside) + `rate-row` (`32px`) + `rate-indicator-slot` (idle-safe); `AppHeader` always-rendered `currency-status-row` (`32px`, `aria-hidden` when keyless) + nowrap/ellipsis status; `AppMessageBar` reserved band (`minHeight 56px`, constant margin, opacity-only transition).
- Copy (R4): header idle → "Loading currencies…", selector hint → automatic-load wording; no string references the Update button for loading.
- Tests: 12 new R3/R4 unit contracts (declaration via `getComputedStyle`, per `CurrencyRow` precedent) + e2e R3 stability (`Calculate` box ≤1px across autoload and message reveal/dismiss) → suite **367/367** (was 355), e2e **38/38**, tsc 0, oxlint/filenames/biome clean, build 254 ms. The `56px` guess needed no tuning (T18).
- Fixes on the way: Fluent `Select` minHeight lives on the wrapper span (test targets `parentElement`); always-rendered hint `role="status"` collided with `CurrencyRow`'s `getByRole("status")` → that assertion rescoped to explicit `[aria-live="polite"]` (only behavioral change to a pre-existing test).
- Workload: 10 files / 322 lines — SLO WARNING (>5 files, declared in plan; +1 unplanned `CurrencyRow.test.tsx` rescope).
- Note: built on branch `feature/update-dependencies` atop the uncommitted dep refresh (suite green on the combined tree).

### 2026-09-21 — Dependency refresh: 13 safe minors + Fluent hold (TDD gate)

- Branch `feature/update-dependencies` (from `develop`, user-created via git flow, ADELANTE approved).
- `pnpm up` on 14 minors: react 19.2.6→19.3.0, react-dom, vite 8.0.16→8.3.0, plugin-react 6.0.2→6.1.1, playwright 1.60→1.63, biome 2.4.15→2.5.14, oxlint 1.66→1.83, testing-library react/user-event, @types/react+react-dom 19.2→19.3, fluent-icons 2.0.328→2.0.341.
- **Fluent components HELD at 9.74.1** (catalog exact pin): 9.74.7 pulls react-tabster 9.26.17, which dropped the `"node"` CJS condition → vitest natively imports tabster's exports-less CJS → `SyntaxError: createTabster` in 16 suites. `server.deps.inline` (tabster, react-tabster, `/^@fluentui\//`) does NOT fix it (externalized parents bypass Vite). Revisit with vitest 5 or upstream tabster exports fix.
- `biome.json` $schema 2.4.15→2.5.14 (Biome CLI bump). `pnpm audit` 0 vulns; remaining outdated = majors only (vitest 5, TS 7, jsdom 30, jest-dom 7, lint-staged 17, commitlint 21, @types/node 26) — out of scope.
- **QA:** 36 files / 355 tests ✅ · `tsc` 0 · `oxlint` + `check-filenames` ✅ · `vite build` 261 ms ✅ · `biome check .` clean except pre-existing `scripts/check-filenames.mjs` format. E2E not re-run (playwright 1.63 needs fresh chromium download).

### 2026-09-18 — Release 2.2.0 (version bump + docs sync)

- SemVer **minor** bump `2.1.3` → `2.2.0` after finishing `feature/minor-fixes-and-security` into `develop` (new functionality: currency auto-load + conversion gating, dependency override policy).
- Synced sources of truth: `package.json`, `.agents/project_manifest.yaml` (`project.version`), `.agents/context/project.md`, `README.md` version badge. No runtime/infra files touched.
- No version-consistency test exists (`src/config/` covers nginx/dockerfile/license/dependabot but not `package.json.version`), so the sync is manual.

### 2026-09-18 — UI Cycle A: automatic currency load + conversion gating (TDD)

**Origin:** user report — with an API key entered but currencies not loaded the app still allowed a conversion; the load must happen automatically as soon as the key is available. (Cycle B of the same change covers the fixed-size/jump-free layout split out for the 5-file workload SLO.)

**Root cause (verified):** `useCurrencies` only read the metadata cache on mount and `updateCurrencies()` was invoked **only** by the AppHeader "Update" button, while `ConversionControls` enabled Calculate as soon as `storedApiKey` existed (`disabled={!storedApiKey || amount <= 0 || isLoading}`) — so a debounce-saved key opened conversion with `currencies = {}` and disabled `---` selectors.

**Changes:**
- `src/hooks/useCurrencies.ts` — auto-load effect + `autoLoadKeyRef`: one attempt per distinct key (`!storedApiKey` resets the ref for a future key; `isLoaded || isUpdating` and `ref === storedApiKey` short-circuit) → no StrictMode double-fetch, no retry loop after a failure; the Update button remains a manual refresh.
- `src/components/ConversionControls/ConversionControls.tsx` — `currenciesLoaded = Object.keys(currencies ?? {}).length > 0`, `canCalculate = Boolean(storedApiKey) && currenciesLoaded && amount > 0 && !isLoading` wired to `disabled` (no prop-signature or `App.tsx` change).
- `e2e/ui-enhancements.spec.ts` — `mockFreeCurrencyApi(page)` (`page.route("https://api.freecurrencyapi.com/**")`, registered **before** `page.goto` because the load fires on mount) + the API-key test now asserts "Currency data loaded" **without clicking Update** and both selects enabled.
- Tests: `useCurrencies.test.ts` 10 → 16 (5 R1 cases + a pre-existing non-Error rejection branch), `ConversionControls.test.tsx` 9 → 12 (R2 gating).

**QA:** `pnpm vitest run` → **36 files / 355 tests ✅** · `tsc --noEmit` exit 0 · `oxlint .` + `check-filenames` clean · `biome check` on the 5 touched files clean · `vite build` 306 ms · `playwright test e2e/ui-enhancements.spec.ts` **9/9 ✅** (RED established first: stashing the hook made the new e2e assertions fail).

**Lessons:** (1) Playwright 1.60 needed `chromium-1223` but the cache only had 1228/1234 → `pnpm exec playwright install chromium` was required (the interrupted first attempt had to be re-run); (2) the e2e API mock must be registered before navigation, since R1 fetches during mount; (3) **pre-existing, out of scope:** `pnpm exec vitest run --coverage` fails the 95 % branch threshold (93.46 % on `HEAD`, 93.69 % after this cycle — the gap is in `LocalStorage.ts`/`globalStyles.ts`, and line 64 of `useCurrencies.ts` was uncovered before this change); the green gate is `pnpm vitest run`, as in previous cycles.

**Reviewer (✅ APROBADO, `review_2026-09-18_ui-autoload-fixed-layout.md`):** 0 blocking findings (O-1 `useCurrencies` 55→80 líneas, O-2 "key distinta ⇒ nuevo intento" solo mientras no haya metadatos cargados, O-3 la cláusula "petición de tasa en vuelo" de R2 es solo code-read) · 10 tests KEEP / 0 REMOVE · workload 5 ficheros / 261 líneas dentro del SLO · el reviewer re-ejecutó **unit 355/355 (exit 0)** y la **suite e2e completa 37/37 (exit 0)**, no solo la spec tocada.

**Scribe (2026-09-17):** memoria en index-mcp (`mem_save` #40 session, #41 decision `architecture/currency-bootstrap-contract`) + `mem_digest` verificado; R1/R2 fusionados en `.agents/docs/specs/ui.md` como **UI-01/UI-02** con **ADR-005** (arranque de divisas + gating); el `change_spec.yaml` sigue `active` con `pending_requirements: [R3, R4]` (Cycle B, T8..T20); manifiesto: +3 `ignored_paths` (`coverage`, `test-results`, `playwright-report`, artefactos gitignored que el reindex estaba contando); reindexado index-mcp (126 → 132 ficheros, +6: 4 docs nuevos + artefactos de test). **Commit PENDIENTE:** el gate de shell de `/scribe` es de solo lectura y deniega `git add`/`git commit` (harness gap, no del código) → los comandos exactos quedan en `checkpoint.yml:pending_commit` para ejecución humana.

**Pending:** `pnpm up` de los 6 overrides (aprobación) · cerrar los 6 PRs Dependabot obsoletos · Cycle B de deps · Cycle C CI + decisión `.deepsec/` · **Cycle B de UI (R3/R4: slots de tamaño fijo, T8..T20)**.

### 2026-09-17 — Security advisories audit + override hygiene (Cycle A, TDD)

**Origin:** user reported security-advisory problems and asked to consider updating dependencies.

**Advisories located (real, from repo history — OSV/GitHub Advisory DB):** `picomatch@2.3.1` GHSA-3v7f-55p6-f55p · `minimatch@3.1.2` GHSA-23c5-xmqv-rm74/GHSA-3ppc-4f35-3m26/GHSA-7r86-cg39-jmmj · `brace-expansion@1.1.12` GHSA-3jxr-9vmj-r5cp (+3) · `flatted@3.3.3` GHSA-25h7-pfq9-p65f · `yaml@2.8.2` GHSA-48c2-rrv3-qjmp · `vite@7.1.11` (5 GHSAs) · `js-yaml@4.1.1` (4 GHSAs, Dependabot #18). Root cause: 6 stale `origin/dependabot/*` branches + `hotfix/security-dependabot-18` opened against the **pre-Vite-8 tree**; `origin/main` and `develop` lockfiles are identical and contain **none** of those vulnerable versions. `pnpm audit` = 0 and a full OSV sweep of **385/385** resolved versions = 0 advisories. Table + reproduction commands in `.agents/docs/security_report.md`.

**Changes:**
- `pnpm-workspace.yaml` — overrides made **major-bounded** and **advisory-floored**: `js-yaml ^4.3.2` (was `>=4.3.0`, which had resolved **5.2.2**, and 4.3.2 is the advisory fix head), `fast-uri >=4.1.3 <5.0.0`, `postcss >=8.5.18 <9.0.0`; exact pins removed (`picomatch ^4.0.4` = GHSA-3v7f fix, `yaml ^2.8.3` = GHSA-48c2 fix); `@fluentui/react-motion 9.15.0` stays the only documented pin.
- `pnpm-lock.yaml` — `js-yaml 5.2.2 → 4.3.2` (re-synced implicitly by `pnpm vitest run` on manifest drift).
- `.github/dependabot.yml` — `groups.minor-and-patch` added; ignores unchanged (still valid for jsdom 29 / postcss 8.5).
- `src/config/overrides.test.ts` (new, 7 tests incl. the advisory-floor guard) + `src/config/dependabot.test.ts` (+2) — config contract tests.
- `.agents/docs/security_report.md` (recreated), `.agents/docs/analysis_2026-09-17_*.md`, plan + `change_spec.yaml`.

**QA:** `pnpm vitest run` → **35 files / 343 tests ✅** · `tsc --noEmit` ✅ · `oxlint` + `check-filenames` ✅ · `biome check` ✅ · `vite build` 293 ms (react-dom gzip 127.77 kB) ✅ · `pnpm audit` 0 before and after ✅ · OSV sweep 385/385 clean ✅ · commitlint dry-run ✅.

**Lessons:** (1) `/do`+`/plan` bash is a read-only allowlist (`BASH_READONLY`), so `pnpm audit` is only obtainable in `/build`/`/audit`; (2) the source of truth for Dependabot-style alerts is the GitHub Advisory DB/OSV, **not** `pnpm audit` — `.agents/.state/scan-advisories.mjs` sweeps the whole lockfile in one OSV `querybatch` call; (3) an advisory sweep must cover **scoped** packages: the first parser version stripped quotes *after* the trailing colon and silently skipped all 194 `@scope/*` entries (191/385 → false clean) — hence the malformed-pair assertion; (4) Dependabot keeps **branches/PRs** alive long after the alerts are fixed, so a repo can look vulnerable when the lockfile is clean — compare `git show <branch>:pnpm-lock.yaml` before acting; (5) `pnpm install` alone does **not** refresh existing resolutions — `preferFrozenLockfile` needs a deliberate `pnpm up`; (6) an override range whose floor is newer than the installed version can fail resolution under `minimumReleaseAge` → keep the installed/advisory-fix version as the floor; (7) currencyExchange was **not indexed** in index-mcp (now indexed: 117 files / 236 symbols) and its `mem_*` store is empty — memory is file-based.

**Review round 1 (❌ RECHAZADO → corregido):** ID-01 [QA] `.agents/.state/` no estaba ignorado (el propio arnés dice "nunca commitear" `audit_cache.json`; `biome check .` fallaba sobre los JSON de estado y `oxlint .` avisaba sobre el script ad-hoc) → **TDD**: nuevo `src/config/gitignore.test.ts` (3 tests, RED 2 failed) + `.gitignore` +4 líneas → verificado con `git check-ignore -v` (`.gitignore:43`) y `oxlint .` limpio (oxlint **sí** respeta `.gitignore`). ID-02 [VERIFY] tabla del informe incompleta → añadidos `GHSA-c2c7-rcm5-vvqj` (picomatch) y `GHSA-rf6f-7fwh-wjgh` (flatted) + API de GitHub Advisory como segunda fuente. Suite tras correcciones: **36 files / 346 tests ✅** · `tsc` 0 · `vite build` 252 ms. Hallazgo **pre-existente y fuera de alcance** reportado al reviewer: `biome check .` sigue fallando en `scripts/check-filenames.mjs` (sin tocar en este ciclo).

**Scribe (2026-09-17):** memoria persistida en index-mcp (`mem_save` #31 session, #32 decision `config/dependency-override-policy`, #33 config `config/agent-harness-state-gitignore`) + `mem_digest` verificado; requisitos R1/R2/R3/R5 fusionados en `.agents/docs/specs/security.md` como **SEC-09..SEC-12** (R4/R6/R7 quedan pendientes en Cycles B/C y el `change_spec.yaml` sigue `active` con `archived_requirements`); **ADR-004** (política de overrides) creado; manifiesto actualizado (`project.index_project`, `ignored_paths` + `.agents/.state`/`.deepsec`, contrato `config`); reindexado index-mcp (126 ficheros, +9). Limpieza: `dist/` eliminado (3,4 M, regenerable) · **`.deepsec/` (761 M) sigue pendiente de OK explícito del usuario** · `.agents/.state/` conservado e ignorado.

**Pending:** `pnpm up` of the 6 override packages (approval) · close the 6 stale Dependabot PRs · Cycle B catalog refresh (Fluent 9.74.7, react 19.3.0, vite 8.3.0…) · Cycle C CI workflow + `.deepsec/` decision.

### 2026-09-10 — Release 2.1.3 (version bump + docs sync)

- Bumped `package.json` `2.1.2` → `2.1.3` (SemVer patch, footer-cycle follow-up on `release/2.1.3`).
- `README.md`: version badge → 2.1.3, unit test count synced 332 → 334 (footer cycle added 2 tests).
- Version recorded in `.agents/project_manifest.yaml` and `.agents/context/project.md`.

### 2026-09-10 — Footer parity with imageTransformer (TDD)

- `src/components/Footer/Footer.tsx`: yearless attribution (`Damedsol · Licensed under CC BY 4.0`), nav order README → GitHub → LinkedIn, 16px brand icons, fixed `borderTop: 1px solid var(--card-border-subtle)`, focus `2px solid colorStrokeFocus1`.
- New `src/components/Footer/FooterIcons.tsx` (vendored Iconoir github/linkedin geometry, MIT-registered in `THIRD-PARTY-LICENSES.md`); zero new deps (Fluent has no brand icons — verified T0).
- `Footer.test.tsx`: 6 → 8 tests (no-year, nav order, 16px `aria-hidden` icons; 5-link target/rel kept).
- **QA:** `pnpm vitest run` → 34 files / 334 tests ✅ · `tsc --noEmit` ✅ · `oxlint` ✅ · `check-filenames` ✅ · `biome check` (3 files) ✅ · `vite build` 290ms ✅.
- **Reviewer (18:48):** ✅ APROBADO → /scribe. 0 hallazgos; 8 tests KEEP, 0 REMOVE.
- **Lecciones:** (1) el ciclo sobrevivió al bloqueo del harness (`SANDBOXED_GATES` + `/reload`): el diseño RED se aplicó intacto al recuperarse el shell; (2) los iconos `aria-hidden` preservan `getByText` en Testing Library.
- **ADR:** `.agents/docs/adr/003-footer-brand-icons.md`.
- **Commit:** `aca6f64` — feat(footer): mirror imageTransformer attribution, order and icons.

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
