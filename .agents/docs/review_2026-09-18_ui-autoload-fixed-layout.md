# Review — UI Cycle A: automatic currency load + conversion gating

- **Date:** 2026-09-18 · **Gate:** /reviewer · **Scope reviewed:** `review_scope: [R1, R2]` (Cycle A)
- **Plan:** `.agents/docs/plan_2026-09-18_ui-autoload-fixed-layout.md` (T1..T7)
- **Spec:** `.agents/docs/specs/change_spec.yaml` (`ui-autoload-and-fixed-layout`, status `active`)
- **Build handoff:** `.agents/.state/build_state.json` (`build_hash: ui-autoload-fixed-layout-2026-09-18`)
- **Frozen candidate (evidence, not narration):** `HEAD = d737de9` + working tree
  `git diff --stat -- src e2e` → **5 files changed, 249 insertions(+), 12 deletions(-)** (261 diff lines)
  `git status --short` → 5 code files modified + `.agents/docs/plan_2026-09-18_*.md` untracked
- **Workload:** 5 files / 261 lines → within the 5-file / 400-line SLO ✅ (R2 enforced, no split needed)
- **Deferred, out of this review:** R3 (fixed-size slots) + R4 (copy) → plan T8..T20; **the change stays `active`**

## 1. VERIFY — R1..R2

### R1 — Automatic currency load as soon as an API key is available → [✓]

| Acceptance clause | Verdict | Evidence |
|---|---|---|
| Loads `/v1/currencies` + `/v1/latest` with **no user action** when a key is present and no valid cache | [✓] | `src/hooks/useCurrencies.ts:72-90` (effect + `autoLoadKeyRef`); unit `R1 auto-fetches currencies and rates when a key is available and no cache exists`; e2e `AppHeader shows currency update section…` asserting `Currency data loaded` **without** clicking Update (`e2e/ui-enhancements.spec.ts:64-71`) |
| Exactly **one** attempt (no StrictMode double-fetch) | [✓] | ref is set *before* `void updateCurrencies()` (`:87-88`) so the double-invoked effect short-circuits at `:85`; unit asserts `toHaveBeenCalledTimes(1)` |
| Valid cache ⇒ **zero** network calls (API quota) | [✓] | `isLoaded` short-circuit `:80-82`; unit `R1 does not auto-fetch when the cached metadata is already loaded` |
| No key ⇒ **zero** network calls | [✓] | ref reset + early return `:74-77`; unit `R1 does not auto-fetch when there is no stored API key` |
| Failed attempt is **not** retried in a loop | [✓] | `:85` compares the ref; unit `R1 does not retry the same failed key automatically but allows a manual update` (asserts 1 call after a 50 ms window, then 2 after a manual call) |
| A **different** key triggers a new automatic attempt | [✓] (see observation O-2) | unit `R1 auto-fetches again when the stored API key changes` (key A fails → key B loads) |
| The **Update** button still forces a manual refresh | [✓] | effect never replaces `updateCurrencies`; `AppHeader.tsx:200` wiring untouched; `AppHeader.test.tsx` `calls onUpdateCurrencies when Update button is clicked` still green |
| Selectors populate automatically | [✓] | `isLoaded → setCurrencies` `:59-63` ⇒ same rule `CurrencySelector` uses (`isEmpty`); e2e asserts both `combobox`es `toBeEnabled()` (`:73-74`) |

**Edge/side cases:** invalid key → one failed attempt + `updateError` shown (unit `sets updateError when fetchCurrencies returns null`/`when fetch throws`); thrown non-Error → generic message (new unit test); no state update when a guard returns (no render loop — guards precede `void updateCurrencies()`); `useCallback` deps unchanged (`[storedApiKey]`).

### R2 — Conversion is only possible once currency data is loaded → [✓]

| Acceptance clause | Verdict | Evidence |
|---|---|---|
| Disabled while `storedApiKey` set but `currencies` empty | [✓] | `ConversionControls.tsx:140-145` (`currenciesLoaded` + `canCalculate`), `:199` `disabled={!canCalculate}`; unit `R2 disables Calculate when an API key is set but currencies are not loaded` |
| Disabled while `amount <= 0` | [✓] | same predicate; unit `R2 disables Calculate when currencies are loaded but the amount is zero` |
| Disabled while a rate fetch is in flight | [✓] | `&& !isLoading` in the predicate (`:144`, read-verified; pre-existing term, preserved — see O-3) |
| Enabled once metadata is available | [✓] | unit `R2 enables Calculate once currencies are loaded and the amount is positive` |
| No `ConversionControlsProps`/`App.tsx` change | [✓] | `git diff` touches neither the interface nor `App.tsx`; the boolean is derived from the already-passed `currencies` (same rule as `CurrencySelector`) |
| No API key ⇒ disabled (pre-existing assertion strengthened) | [✓] | `ConversionControls.test.tsx` `Calculate button disabled when no API key` now asserts `toBeDisabled()` (was a no-op `getByText` check) |

**DESIGN/TASKS completeness (Cycle A):** T1..T7 all `[✓]` in the plan; zero new files, zero new dependencies, zero infra/`.env` writes → matches the plan's YAGNI/KISS/Último Recurso declarations. The deferred T8..T20 are correctly *not* claimed as done (plan + `change_spec.yaml` `cycle: B` + `checkpoint.pending_ids`/`deferred_ids`).

## 2. QA — code hygiene (skill: `code-hygiene`)

- **Files:** `useCurrencies.ts` 98 lines, `ConversionControls.tsx` 227, `e2e/ui-enhancements.spec.ts` 150 → all < 300 ✅
- **Functions:** `useCurrencies` = 80 lines (`useCurrencies.ts:19-98`, was 55) → ⚠️ over the 50-line guideline, under the 100-line critical (see O-1) · `canCalculate`/`currenciesLoaded` trivial ✅
- **Nesting:** effect = 1 level of guards ✅ · **Naming:** `autoLoadKeyRef`, `currenciesLoaded`, `canCalculate` follow the boolean `is/can` prefix rule ✅
- **Silent catch / swallowed errors:** none added; `updateError` still set on every failure path ✅
- **`console.log` in prod:** none added ✅ · **Secrets:** none; the e2e key is the pre-existing `fca_live_aaaa…` fixture ✅
- **Dead code / unused imports:** `tsc` + `oxlint .` clean; `autoLoadKeyRef` is read and written ✅
- **Duplication:** the "has currencies" rule now exists in two components (`ConversionControls` + `CurrencySelector`) as a one-line derivation — acceptable (a shared helper for `Object.keys(x ?? {}).length > 0` would be over-abstraction) ✅
- **Verdict:** 🟡 (1 non-blocking function-length warning + 2 pre-existing observations, listed below)

### Observations — non-blocking (no `ID-XX`)

- **O-1 [QA]** `useCurrencies.ts:19-98` grew 55 → 80 lines. Not blocking (file 98 < 300, no 100-line function), but if this hook grows again, extract the auto-load guards into an internal `useAutoLoadCurrencies(...)`. Recorded as a follow-up, **not** a reason to reject an otherwise minimal diff.
- **O-2 [VERIFY nuance]** R1's clause "a different key triggers a new automatic attempt" holds **only while no metadata is loaded** — with a valid cache/loaded metadata the effect deliberately short-circuits at `:80-82`. This is the documented decision (`checkpoint.decisions`, "a valid <7d cache suppresses the call (API quota)"), and currency metadata is key-independent, so no behavior gap; the acceptance wording could be tightened in a future spec edit.
- **O-3 [VERIFY nuance]** The "rate fetch in flight" clause of R2 is verified by code read (`&& !isLoading`, pre-existing term) and has no dedicated unit test — it had none before this cycle either. Recommend adding one whenever that predicate is touched again.
- **Pre-existing, out of scope (do not fix here):** `loadCurrenciesFromCache()` is called twice in the state initializers (`useCurrencies.ts:22-30`) → two `localStorage` reads + `JSON.parse` per mount; `vitest run --coverage` fails the 95 % branch threshold (93.46 % on `HEAD` before this cycle, 93.69 % now); `biome check .` fails on `scripts/check-filenames.mjs`.

## 3. TESTS — classification (skill: `test-classification`)

```
🧪 Clasificación de Tests

✅ KEEP (regresión) — 10 tests nuevos/fortalecidos:
  - src/hooks/useCurrencies.test.ts: R1 auto-fetch (requisito R1; falla si el load automático desaparece)
  - src/hooks/useCurrencies.test.ts: R1 cache ya cargada ⇒ 0 llamadas (invariante de cuota de API, R1)
  - src/hooks/useCurrencies.test.ts: R1 sin key ⇒ 0 llamadas (edge de entrada, R1; path del efecto, distinto del guard de updateCurrencies)
  - src/hooks/useCurrencies.test.ts: R1 key distinta ⇒ nuevo intento (edge: recuperación tras fallo, R1)
  - src/hooks/useCurrencies.test.ts: R1 mismo key fallido ⇒ sin bucle + update manual (invariante anti-loop, R1)
  - src/hooks/useCurrencies.test.ts: error no-Error ⇒ "Unknown error" (edge de error visible al usuario; cubría una rama pre-existente sin test)
  - src/components/ConversionControls/ConversionControls.test.tsx: R2 sin metadata ⇒ disabled (requisito R2)
  - src/components/ConversionControls/ConversionControls.test.tsx: R2 amount 0 ⇒ disabled (edge con impacto visible, R2)
  - src/components/ConversionControls/ConversionControls.test.tsx: R2 cargado + amount > 0 ⇒ enabled (contrato positivo de R2)
  - src/components/ConversionControls/ConversionControls.test.tsx: "disabled when no API key" reforzado con toBeDisabled() (la aserción anterior no afirmaba nada)
  - e2e/ui-enhancements.spec.ts: mock de la API + load automático sin pulsar Update + ambos selectores habilitados (R1 end-to-end; sin él la e2e dependía de la cuota real)

❌ REMOVE (andamiaje) — 0 tests.

⚠️ SUGERENCIA (no bloqueante) — 1:
  - src/components/ConversionControls/ConversionControls.test.tsx: añadir "R2 disabled mientras rateSource === 'loading'" cuando se vuelva a tocar el predicado (ver O-3).
```

No redundant/implementation-detail tests: none of the new tests assert "X calls Y with Z" beyond the `toHaveBeenCalledTimes` that encode the R1 **no-loop / one-attempt** invariant (a user-visible quota guarantee, not an implementation detail).

## 4. SUITE — evidence (runner from `project_manifest.yaml`)

```
$ pnpm exec vitest run
 Test Files  36 passed (36)
      Tests  355 passed (355)        exit=0     (baseline 346/36 → +9)

$ pnpm exec playwright test        # independent full-suite re-run by /reviewer
 37 passed (9.7s)                  exit=0     (ui-enhancements 9/9 included)

$ pnpm exec tsc --noEmit           exit=0
$ pnpm exec oxlint .               clean (0 warnings/errors)
$ node scripts/check-filenames.mjs all files conform
$ pnpm exec biome check (5 touched) clean
```

Build's RED claims were re-derived where possible: the `git stash` RED experiments (hook stashed → e2e `element(s) not found`; effect absent → 3 unit tests failing) are recorded in `.agents/.state/build_state.json`; the reviewer independently reproduced all GREEN results above and the tree state matches the frozen candidate.

## 5. Verdict

**APPROVED** — R1 and R2 verified with unit + e2e evidence; 0 blocking findings; 0 tests to remove; workload inside the SLO. R3/R4 (plan T8..T20) remain **pending** and must be built in a later `/build` cycle; `change_spec.yaml` stays `active`.

```
### Reporte — ✅ APROBADO
VERIFY [✓] R1, R2 (happy/edge/side) · DESIGN + TASKS T1..T7 7/7 · QA [✓] 🟡 (O-1..O-3 non-blocking)
Tests KEEP 10 / REMOVE 0 · Suite [✓] 355/355 exit 0 + e2e 37/37 exit 0
🔄 HANDOFF → /scribe | Gate: reviewer | Artefactos: [.agents/docs/review_2026-09-18_ui-autoload-fixed-layout.md, .agents/docs/plan_2026-09-18_ui-autoload-fixed-layout.md] | Pendiente: archivar R1/R2 (mantener change_spec `active`: R3/R4 = T8..T20)
```
