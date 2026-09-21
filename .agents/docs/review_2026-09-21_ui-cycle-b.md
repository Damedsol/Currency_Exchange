# Review — UI Cycle B: fixed-size slots + copy (R3/R4)

- **Date:** 2026-09-21 · **Gate:** /reviewer · **Scope reviewed:** `review_scope: [R3, R4]` (Cycle B)
- **Plan:** `.agents/docs/plan_2026-09-18_ui-autoload-fixed-layout.md` (T8..T20 all `[✓]`)
- **Build handoff:** Cycle B HANDOFF (10 files, +284/−38) · `checkpoint.diff_stat` Cycle B entry
- **Frozen candidate (evidence, not narration):** `HEAD = d3d703b` + working tree
  `git diff --stat -- src e2e` → **10 files changed, 284 insertions(+), 38 deletions(-)** (322 diff lines)
  `git status --short` → 10 code/test files modified (+ `.agents/` + dep-refresh files, out of this review's scope)
- **Workload:** 10 files / 322 lines → ⚠️ **AVISO: over the 5-file SLO** (declared WARNING in the plan; every file <55 lines, under the 400-line limit) → aviso, not rejection.
- **Skills:** `code-hygiene@/home/david/.pi/agent/skills/code-hygiene/SKILL.md`, `test-classification@/home/david/.pi/agent/skills/test-classification/SKILL.md`, `fluent-ui-react@.agents/skills/fluent-ui-react/SKILL.md`, `modern-linting@.agents/skills/modern-linting/SKILL.md` (no `.agents/skill-registry.md` present → skills resolved directly; project skills win on Fluent/lint rules).

## 1. VERIFY — R3..R4

### R3 — Fixed-size slots, no jumps → [✓]

| Acceptance clause | Verdict | Evidence |
|---|---|---|
| (a) `CurrencySelector` hint reserved in empty **and** loaded states, `minHeight` ≥ 32px | [✓] | `CurrencySelector.tsx:85-90` (unconditional `role="status"` `data-testid="currency-hint"` slot, `minHeight: "32px"` in `hint` style); unit R3a ×2 read `getComputedStyle().minHeight` in both states |
| (a) both `Select` branches keep 44px | [✓] | `select` style unchanged (`minHeight: "44px"` on Fluent root wrapper); unit asserts via `parentElement` (wrapper carries the class — verified by probe, native `<select>` reports `auto`) |
| (b) `ResultSection` result slot is the **same node** with `minHeight` in loading + computed states, spinner **inside** | [✓] | `ResultSection.tsx:134-146` (`data-testid="result-slot"`, `minHeight: "44px"`, `minWidth: "10ch"`); unit asserts spinner `[role="progressbar"]` inside slot (loading) and `"120"` text (computed) with `minHeight` ≥ 44 in both |
| (b) `rateRow` declares `minHeight`, indicator slot exists when `idle` | [✓] | `rateRow` +32px style, `data-testid="rate-row"`/`"rate-indicator-slot"`; unit R3b ×2 |
| (c) `AppHeader` status row exists with `minHeight` with **and** without a key | [✓] | `AppHeader.tsx:194-236` (always-rendered `data-testid="currency-status-row"`, `minHeight: "32px"`, `aria-hidden` when keyless); unit R3c renders both key states |
| (c) status text cannot wrap | [✓] | `statusText` + `errorText` gain `nowrap/ellipsis`; unit reads `whiteSpace === "nowrap"` |
| (d) `AppMessageBar` band reserves `minHeight` > 0 while hidden; margin constant; opacity-only transition | [✓] | `AppMessageBar.tsx:16-30` (`minHeight: "56px"` + `marginBottom` on base, `transitionProperty: "opacity"`); unit R3d ×2 (hidden `minHeight` > 0, hidden margin === visible margin) |
| (d) inner `<MessageBar>` stays conditional | [✓] | `{appMessage.visible && (...)}` untouched; pre-existing "does not render message when hidden" still green |
| Calculate box stable ≤1px across autoload **and** message reveal+dismiss | [✓] | e2e R3 test (`boundingBox()` y/height, tolerance 1px); reviewer independently re-ran `ui-enhancements` **10/10 ✅** |

**Edge/side cases:** empty loaded-state hint renders `""` (no phantom text, `textContent === ""` asserted); keyless header row is `aria-hidden` (out of the a11y tree); `renderCurrencyUpdate` return type narrowed `ReactNode | null` → `ReactNode` (no `null` path left); `56px` first guess needed no T18 tuning (e2e green first run).

### R4 — Copy reflects automatic loading → [✓]

| Acceptance clause | Verdict | Evidence |
|---|---|---|
| No user-facing string tells the user to press Update to load | [✓] | `git diff` removes both occurrences ("Load currencies to select them", "Set an API key and click **Update**…"); unit asserts `queryByText(/click.*update/i)` null (selector) and `queryByText(/click.*update\|press.*update/i)` null (header) |
| Header idle status shows the loading state | [✓] | `"Loading currencies…"` (`AppHeader.tsx:227`); unit R4 |
| Selector hint explains the automatic load | [✓] | `"Currencies load automatically when an API key is set."`; unit asserts `/automatically/i` |

**DESIGN/TASKS completeness (Cycle B):** T8..T20 all `[✓]` in the plan; no new file, no new dependency, no `App.tsx`/`useConversion`/theme change → matches YAGNI/KISS. T20 satisfied trivially: each reserved height is a single literal in its slot's style (nothing to deduplicate without over-abstraction).

## 2. QA — code hygiene (skill: `code-hygiene` + project skills)

- **Files:** `AppHeader.tsx` ~280 lines (largest touched, < 300 ✅); `ResultSection.tsx` ~200; `CurrencySelector.tsx` ~100; `AppMessageBar.tsx` ~120 ✅
- **Functions:** `renderCurrencyUpdate` grew but stays a flat 4-branch conditional (nesting 1 ✅); no function > 50 lines added; `calculateResult`/`formatCurrencyAmount` untouched ✅
- **Nesting/naming:** max 1 level of guards/ternaries; `resultSlot`/`rateRow`/`indicatorSlot`/`currency-status-row` follow existing conventions; `data-testid` attributes (not inline styles) ✅
- **Fluent skill:** `makeStyles` + `tokens` exclusively; no Tailwind, no `style={{}}`, no v8, no deep selectors; `mergeClasses` usage untouched ✅
- **Lint skill:** `oxlint .` clean (0 output); `check-filenames` clean; `biome check` clean on all 11 touched paths (build ran `biome check --write` for formatting only); no ESLint/Prettier; filenames unchanged ✅
- **Silent catch / swallowed errors:** none added ✅ · **`console.log` in prod:** none ✅ · **Secrets:** none (e2e key is the pre-existing `fca_live_aaa…` fixture) ✅
- **Dead code / unused imports:** `tsc` + `oxlint` clean; removed `<strong>`/fragment left no orphan (JSX-only, no import change) ✅
- **Duplication:** one `minHeight` literal per slot — acceptable per plan T20 ✅
- **Verdict:** ✅ (no warnings)

### Observations — non-blocking (no `ID-XX`)

- **O-4 [QA]** `AppMessageBar`'s permanently reserved 56px band is the deliberate trade-off recorded in the plan (empty status band vs shifting layout); accepted, not a finding.
- **O-5 [VERIFY nuance]** The empty loaded-state hint keeps `role="status"` with `""` content (harmless live region, asserted empty). If it ever gains content, re-check `CurrencyRow`'s `getAllByRole("status")` count.
- **Out of scope (do not fix here):** the `feature/update-dependencies` uncommitted refresh sharing this branch (validates green but mixes concerns — commit separately); `biome check .` still fails on pre-existing `scripts/check-filenames.mjs`; coverage 95% branch threshold (pre-existing).

## 3. TESTS — classification (skill: `test-classification`)

```
🧪 Clasificación de Tests

✅ KEEP (regresión) — 13 nuevos + 1 modificado:
  - CurrencySelector.test.tsx: R3a hint slot reserved minHeight empty state (requisito R3a; falla si el slot vuelve condicional)
  - CurrencySelector.test.tsx: R3a hint slot stays reserved empty when loaded (edge: regresión del salto al poblarse)
  - CurrencySelector.test.tsx: R3a selects 44px both states (invariante de tamaño, documenta el wrapper Fluent)
  - CurrencySelector.test.tsx: R4 hint automatic-load copy (requisito R4; falla si vuelve el texto de Update)
  - ResultSection.test.tsx: R3b result slot minHeight loading+computed (requisito R3b; spinner-dentro-del-slot)
  - ResultSection.test.tsx: R3b rate row minHeight (requisito R3b)
  - ResultSection.test.tsx: R3b indicator slot exists when idle (edge: RateSourceIndicator devuelve null)
  - AppHeader.test.tsx: R3c status row reserved with/without key (requisito R3c)
  - AppHeader.test.tsx: R3c status nowrap (edge: errores largos que envolvían la fila)
  - AppHeader.test.tsx: R4 idle "Loading currencies…" (requisito R4)
  - AppMessageBar.test.tsx: R3d band minHeight hidden (requisito R3d)
  - AppMessageBar.test.tsx: R3d constant margin both states (invariante anti-salto)
  - e2e/ui-enhancements.spec.ts: R3 Calculate box stability (única prueba de layout real; jsdom no hace layout)
  - CurrencyRow.test.tsx: rescoped aria-live assertion (modificado, conserva intención original + documenta la colisión role=status)

❌ REMOVE (andamiaje) — 0 tests.
```

No implementation-detail tests: `toBeDisabled`/`minHeight`/`boundingBox` assertions all encode user-visible layout guarantees, not "X calls Y".

## 4. SUITE — evidence (reviewer independent re-run)

```
$ pnpm vitest run
 Test Files  36 passed (36)
      Tests  367 passed (367)        exit=0

$ pnpm exec tsc --noEmit           exit=0
$ pnpm exec oxlint .               clean (0 warnings/errors)
$ node scripts/check-filenames.mjs all files conform
$ pnpm exec playwright test e2e/ui-enhancements.spec.ts
 10 passed (5.1s)                  exit=0     (R3 stability included)
```

(Build reported full e2e 38/38 + `vite build` 254 ms on the same tree; reviewer re-ran the affected spec + full unit suite. RED claims re-derived from the build log: 12 unit failures pre-GREEN, all on missing testids/slots.)

## 5. Verdict

**APPROVED** — R3 and R4 verified with unit + e2e evidence; 0 blocking findings; 0 tests to remove; workload AVISO (10 files / 322 lines, declared in plan, each file <55 lines).

```
### Reporte — ✅ APROBADO
VERIFY [✓] R3, R4 (happy/edge/side) · DESIGN + TASKS T8..T20 13/13 · QA [✓] (O-4/O-5 non-blocking)
Tests KEEP 13+1 / REMOVE 0 · Suite [✓] 367/367 exit 0 + e2e ui-enhancements 10/10 exit 0 · Skills [code-hygiene@global, test-classification@global, fluent-ui-react@.agents/skills, modern-linting@.agents/skills]
🔄 HANDOFF → /scribe | Gate: reviewer | Artefactos: [.agents/docs/review_2026-09-21_ui-cycle-b.md, .agents/docs/plan_2026-09-18_ui-autoload-fixed-layout.md] | Pendiente: archivar R3/R4 (change_spec puede archivarse: T8..T20 completos)
```
