# Plan: UI — automatic currency load on API key + jump-free fixed-size controls

> Change: `ui-autoload-and-fixed-layout` · Cycles: **A** (R1, R2) → **B** (R3, R4)
> Spec: `.agents/docs/specs/change_spec.yaml` · Domain: `.agents/docs/specs/security.md` (unchanged by this change)

## GRILL: Alineación de Dominio
- Canonical terms reused (no new vocabulary) · Consistencia [✓]
  - Keep: `useCurrencies` (`isLoaded`, `isUpdating`, `updateError`, `updateCurrencies`), `storedApiKey`, `currencies: Record<string, CurrencyMetadata>`, `rateSource`, `ConversionControls`, `CurrencySelector` (`isEmpty`), `ResultSection`, `AppHeader.currencyUpdateRow`, `AppMessageBar` (`appMessage.visible`).
  - New names (minimal, no synonyms): `currenciesLoaded` (derived boolean in `ConversionControls`), `autoLoadKeyRef` (internal ref in `useCurrencies`), `hint` slot reuse, `resultSlot` / `statusRow` reserved slots. No new type, no new prop on `App.tsx`.
  - ⚠️ Inconsistencia detectada: `AppHeader` says *"Load currencies to select them"* (manual action) and `CurrencySelector` hint says *"Set an API key and click **Update** to load currencies"* — both contradict the new automatic behavior. Resolved by R4 (copy), no synonym introduced.
- ADRs/decisions: `.agents/docs/adr/002-agentic-memory-layout.md` (harness only, untouched); no ADR needed for a pure UI/layout fix → ADR candidate **rejected** (no architecture boundary crossed).
- Precedent consulted for "fixed size" verification: `src/components/CurrencyRow/CurrencyRow.test.tsx:28-32` reads declared `minWidth`/`minHeight` from `getComputedStyle` in jsdom — jsdom **does** resolve Griffel `minHeight`, so the contract tests use that, never `getBoundingClientRect` (always 0 in jsdom).

## PROPOSE: Intención, Alcance y Approach
- **Intención (user report):** (1) with an API key entered but currencies not loaded, the app still allows a conversion; the currency load must be automatic as soon as the API key is available; (2) elements change size/reflow when their content changes — sizes must be fixed so there are no layout jumps.
- **Root cause 1 (verified):** `useCurrencies` only reads the cache on mount; `updateCurrencies()` is invoked *only* from the AppHeader "Update" button. `useApiKey` saves the key after a 1 s debounce → `storedApiKey` becomes truthy → `ConversionControls` enables **Calculate** (`disabled={!storedApiKey || amount <= 0 || isLoading}`) while `CurrencySelector` still renders its disabled `---` placeholder and `currencies = {}`. Nothing triggers the load, and nothing blocks the conversion.
- **Root cause 2 (verified, four jump sources):** every one is a *conditional element* (or a conditional height/margin) inside a flex column, so the shift propagates to everything below:
  1. `CurrencySelector` — the `hint` `<Text>` exists **only** when `isEmpty` (empty branch adds ~32 px).
  2. `ResultSection` — `resultRow` swaps `<Spinner size="small" label="Calculating..." />` (≈20 px) for `<Text size={600}>` (≈28 px), and `rateRow` swaps a spinner/null for indicator text.
  3. `AppHeader.renderCurrencyUpdate()` returns `null` when no key (row appears/disappears) and its status `Text` can wrap on narrow widths.
  4. `AppMessageBar` — `max-height: 0 → 60px` + `marginBottom` only in the visible class: revealing a message pushes down the whole card and the height differs between states.
- **In-scope:** `src/hooks/useCurrencies.ts`, `src/components/ConversionControls/ConversionControls.tsx`, `src/components/CurrencySelector/CurrencySelector.tsx`, `src/components/ResultSection/ResultSection.tsx`, `src/components/AppHeader/AppHeader.tsx`, `src/components/AppMessageBar/AppMessageBar.tsx` + their co-located tests + `e2e/ui-enhancements.spec.ts`.
- **Out-of-scope:** `useConversion` (rate fetch is API-driven, not metadata-driven — no hook change), `App.tsx` (derives `currenciesLoaded` locally; no new prop threading), `useApiKey` (debounce + `clearRatesCache()` unchanged), `HistoryPanel`/`ConversionHistory` (right column legitimately grows with history), theme tokens, `FreeCurrency.ts`, `LocalStorage.ts`, the pending security cycles (SEC-13..SEC-16).
- **Approach:** TDD, extend existing hooks/components (no new file, no new dependency). Cycle A = behavior (R1, R2). Cycle B = reserved-size slots + copy (R3, R4).
- **Deps:** none → no `/audit` needed (no `package.json`/lockfile change, no infra, no `.env`).
- **Workload split (SLO ≤5 files/cycle):** Cycle A = 5 files (`useCurrencies.ts`, `useCurrencies.test.ts`, `ConversionControls.tsx`, `ConversionControls.test.tsx`, `e2e/ui-enhancements.spec.ts`) ≈ 130 lines. Cycle B = 9 files (4 components + 4 co-located tests + the same e2e file) ≈ 180 lines → **exceeds the 5-file SLO**: declared WARNING; splitting further would create two 4-file ceremonial cycles for a single coherent "reserved slots" concept. Split option B1 (CurrencySelector + ResultSection) / B2 (AppHeader + AppMessageBar + e2e) is offered if the user or reviewer prefers strict SLO compliance. Each file delta is <25 lines.

## SPEC: Requisitos y Escenarios
- **R1 (Cycle A) — Automatic currency load when the API key is available.** When `storedApiKey` is present and no valid (<7 days) metadata cache exists, `useCurrencies` fetches `/v1/currencies` + `/v1/latest` **exactly once** with no user action; selectors populate. With a valid cache or without a key: **zero** network calls. A failed automatic attempt is not retried in a loop; a *different* key triggers a new automatic attempt; the "Update" button still forces a manual refresh.
  - Happy: type a key → after the 1 s debounce both selectors populate; status text reaches "Currency data loaded".
  - Edge: invalid/fake key → one failed attempt, `updateError` shown, no retry loop, Update still usable.
  - Side: `isLoaded` from a valid cache suppresses the automatic call (no needless API quota spend); React 19 StrictMode double-effect must not double-fetch.
- **R2 (Cycle A) — Conversion only once currencies are loaded.** `ConversionControls`' Calculate button is disabled while `storedApiKey` is set but `currencies` is empty (also while `amount <= 0` or a rate fetch is in flight), and enabled once metadata is available.
- **R3 (Cycle B) — Fixed-size slots: no jumps from content changes.** Each of the four regions declares a state-independent reserved size and the reserved element is present in **every** state: (a) `CurrencySelector` hint line (empty vs loaded), (b) `ResultSection` result row + rate row (spinner vs value), (c) `AppHeader` currency status row (key absent / loading / loaded / error), (d) `AppMessageBar` message region (revealed vs dismissed). Measurable: the Calculate button's bounding box (y, height) is unchanged (≤1 px) before/after the automatic load and before/after a message reveal.
- **R4 (Cycle B) — Copy reflects automatic loading.** No user-facing string tells the user to press Update to load currencies; the header status shows the loading state and the selector hint explains the automatic load.
- **change_spec.yaml:** `.agents/docs/specs/change_spec.yaml` (status `active`); the previous change (`security-advisories-and-dependency-refresh`) is preserved as `archived_requirements` there and its pending cycles live on as SEC-13..SEC-16 in `.agents/docs/specs/security.md`.
- **Aceptación global:** `pnpm vitest run` green (346 → ~358, 0 fail) · `pnpm exec tsc --noEmit` 0 · `pnpm exec oxlint .` clean · `node scripts/check-filenames.mjs` clean · `pnpm exec biome check` on touched files clean · `pnpm exec vite build` ok · `pnpm exec playwright test e2e/ui-enhancements.spec.ts` green (auto-load, gating, layout stability).

## DESIGN: Arquitectura
- [✓] **DRY** — extend `useCurrencies` (one effect + one ref) and 4 existing components; reuse `tokens.*`, `mergeClasses`, the existing `isEmpty` derivation; `currenciesLoaded` derived locally in `ConversionControls` instead of threading a 5th prop through `App.tsx`.
- [✓] **YAGNI/KISS** — no new file, no new dependency, no new hook, no `App.tsx` change, no theme token, correct override, no history-panel change, Update label kept as-is (still a valid manual refresh).
- [✓] **TDD** — unit contract tests first (jsdom), e2e layout test second (Playwright + `page.route` API mock).
- **Cycle A files:**
  - Modify `src/hooks/useCurrencies.ts`:
    ```ts
    const autoLoadKeyRef = useRef<string | null>(null);

    // R1: load currencies as soon as a key is available (once per key, no retry loop)
    useEffect(() => {
      if (!storedApiKey) { autoLoadKeyRef.current = null; return; }
      if (isLoaded || isUpdating) return;
      if (autoLoadKeyRef.current === storedApiKey) return;
      autoLoadKeyRef.current = storedApiKey;
      void updateCurrencies();
    }, [storedApiKey, isLoaded, isUpdating, updateCurrencies]);
    ```
    No other hook change: `updateCurrencies` keeps its `if (!storedApiKey) return;` guard, its `isUpdating`/`updateError`/`lastUpdated` contract and its `useCallback` deps.
  - Modify `src/components/ConversionControls/ConversionControls.tsx`:
    ```ts
    const currenciesLoaded = Object.keys(currencies ?? {}).length > 0;   // same rule as CurrencySelector.isEmpty
    const canCalculate = Boolean(storedApiKey) && currenciesLoaded && amount > 0 && !isLoading;
    // <Button ... disabled={!canCalculate}>
    ```
    Reuse the existing `isLoading` const; no new prop, no signature change (keeps `ConversionControlsProps` intact).
  - Modify `src/hooks/useCurrencies.test.ts`: add the 5 R1 cases; existing cases that mount with a valid key get explicit `await waitFor(() => expect(...))` settling (the auto-load now fires on mount) — assertions on call *arguments* stay valid.
  - Modify `src/components/ConversionControls/ConversionControls.test.tsx`: strengthen the weak "Calculate button disabled when no API key" assertion (`toBeDisabled()`) + 2 new gating cases.
  - Modify `e2e/ui-enhancements.spec.ts`: add a `mockFreeCurrencyApi(page)` helper (`page.route("https://api.freecurrencyapi.com/**")` → `{ data: {...} }`, shape verified against `fetchCurrencies`/`fetchLatestRates` in `src/services/FreeCurrency.ts:33-146`) and register it **before** `page.goto`; the two API-key tests assert the status reaches "Currency data loaded" **without clicking Update** and that both selects become enabled.
- **Cycle B files:**
  - `src/components/CurrencySelector/CurrencySelector.tsx` — render the hint slot **unconditionally** (`role="status"`, content only when `isEmpty`) with `minHeight: "32px"` (2 × `fontSizeBase200` line box); keeps both `Select` branches at `minHeight: 44px`.
  - `src/components/ResultSection/ResultSection.tsx` — keep one result slot (`display:inline-flex`, `minHeight: "44px"`, `minWidth: "10ch"`, `justifyContent: flex-end`) and put the `Spinner size="tiny"` **inside it** instead of swapping the whole row; add `minHeight: "32px"` to `rateRow`; wrap `RateSourceIndicator` in a fixed-size slot so `null` (idle) reserves the same box.
  - `src/components/AppHeader/AppHeader.tsx` — render `currencyUpdateRow` **always** (empty when `!storedApiKey`, `aria-hidden`) with `minHeight: "32px"`; status/error `Text` gets `whiteSpace: "nowrap"` + `overflow: hidden` + `textOverflow: ellipsis` so a long error cannot wrap and grow the row.
  - `src/components/AppMessageBar/AppMessageBar.tsx` — reserve the band: base container `minHeight` = measured single-line MessageBar height (start at `"56px"`, tune T7/T8), constant `marginBottom` (no margin in the visible class), only `opacity` transitions; the inner `<MessageBar>` stays conditionally rendered (required by the existing "does not render message when hidden" test and by a11y).
  - Co-located tests for the 4 components: jsdom contract assertions (`getComputedStyle(slot).minHeight`) + "slot present in both states" (R3) + copy assertions (R4).
  - `e2e/ui-enhancements.spec.ts` — reuse the Cycle A mock; add a layout-stability test asserting the Calculate button's `boundingBox()` y/height is stable across (i) the automatic currency load and (ii) reveal+dismiss of the "Rates cache cleared." info message (Refresh-rates click needs no key, so the message path has no API dependency).
- **Seguridad:** no new endpoint, header, storage key or secret; the mocked e2e route is test-only; `aria-hidden` empty slots stay out of the a11y tree; no `*` innerHTML.
- **Rendimiento:** one effect that fires at most once per distinct key (no polling); no extra render loop (guards precede `setState`); no bundle-size change, no new chunk.

## TASKS: Checklist TDD
### Cycle A — R1 + R2
#### Fase Red
- [✓] **T1 (R1) — RED, `useCurrencies.test.ts`:** "auto-fetches currencies and rates once when a key is available and no cache exists"; "does not auto-fetch when the cached metadata is already loaded"; "does not auto-fetch without a key" (existing test kept); "retries automatically when the stored key changes"; "does not retry the same key after a failed automatic attempt". Run `pnpm vitest run src/hooks/useCurrencies.test.ts` → must FAIL (no fetch on mount today) + settle the pre-existing cases.
- [✓] **T2 (R1) — RED, `e2e/ui-enhancements.spec.ts`:** add `mockFreeCurrencyApi` and, in the two API-key tests, assert `Currency data loaded` **without** clicking Update and both `combobox`es enabled. Run `pnpm exec playwright test e2e/ui-enhancements.spec.ts` → must FAIL.
- [✓] **T3 (R2) — RED, `ConversionControls.test.tsx`:** "Calculate is disabled with an API key but no currencies", "Calculate is enabled once currencies are loaded (amount > 0)", strengthened "…disabled without an API key" (`toBeDisabled()`). Run the file → must FAIL.
#### Fase Green
- [✓] **T4 (R1) — GREEN, `useCurrencies.ts`:** add `autoLoadKeyRef` + the auto-load effect (DESIGN snippet, exact guard order, `void updateCurrencies()`).
- [✓] **T5 (R2) — GREEN, `ConversionControls.tsx`:** derive `currenciesLoaded`, compute `canCalculate`, wire it to `disabled`.
- [✓] **T6 — Green gate Cycle A:** `pnpm vitest run` (355/355, 0 fail) · `pnpm exec tsc --noEmit` (exit 0) · `pnpm exec oxlint .` clean · `node scripts/check-filenames.mjs` clean · `pnpm exec biome check` on the 5 touched files clean · `pnpm exec vite build` 306 ms · `pnpm exec playwright test e2e/ui-enhancements.spec.ts` 9/9 passed.
#### Fase Refactor
- [✓] **T7 — Refactor Cycle A:** keep `currenciesLoaded`/`canCalculate` as named consts (no inline boolean soup); confirm the effect has no state update when a guard returns (no render loop) and that `useCallback` deps are unchanged; re-run `src/hooks/useCurrencies.test.ts` + `src/components/ConversionControls`.

### Cycle B — R3 + R4
#### Fase Red
- [✓] **T8 (R3a) — RED, `CurrencySelector.test.tsx`:** hint slot (`role="status"`) is rendered in the empty **and** loaded states and its declared `minHeight` is ≥ 32 px in both; the disabled placeholder `Select` keeps `minHeight` 44 px. → FAIL.
- [✓] **T9 (R3b) — RED, `ResultSection.test.tsx`:** the result slot node is present (same type) with a declared `minHeight` in both `rateSource="loading"` and a computed state; `rateRow` declares a `minHeight`; the indicator slot exists when `rateSource="idle"`. → FAIL.
- [✓] **T10 (R3c) — RED, `AppHeader.test.tsx`:** the currency status row exists with a declared `minHeight` when `storedApiKey` is `null` and a key is present (row present in both, content only with a key); status text is `nowrap`. → FAIL.
- [✓] **T11 (R3d) — RED, `AppMessageBar.test.tsx`:** the alert container is rendered with a declared `minHeight` > 0 in the hidden state too (the "does not render message when hidden" test stays green). → FAIL.
- [✓] **T12 (R3) — RED, `e2e/ui-enhancements.spec.ts`:** layout-stability test (`Calculate` `boundingBox()` y/height stable across the automatic load and across message reveal+dismiss). → FAIL until the reserved constants are correct.
#### Fase Green
- [✓] **T13 (R3a) — GREEN, `CurrencySelector.tsx`:** unconditional hint slot + `minHeight: "32px"`.
- [✓] **T14 (R3b) — GREEN, `ResultSection.tsx`:** single result slot (spinner inside), `minHeight` on `resultRow`/`rateRow`, fixed indicator slot.
- [✓] **T15 (R3c) — GREEN, `AppHeader.tsx`:** always-rendered `currencyUpdateRow` (`minHeight: "32px"`, `aria-hidden` when empty) + nowrap/ellipsis status text.
- [✓] **T16 (R3d) — GREEN, `AppMessageBar.tsx`:** reserved band `minHeight` (measured in T18) + constant margin + opacity-only transition.
- [✓] **T17 (R4) — GREEN, copy:** `AppHeader` idle status → "Loading currencies…"; `CurrencySelector` hint → "Currencies load automatically when an API key is set."; update the affected unit/e2e strings (`e2e/ui-enhancements.spec.ts:33` regex widened to include the loading copy).
- [✓] **T18 (R3) — GREEN, e2e tune:** run `pnpm exec vite preview` + the e2e; if the measured single-line MessageBar height ≠ `minHeight`, set the constant to the measured value and re-run until T12 is green (tolerance ≤1 px).
- [✓] **T19 — Green gate Cycle B:** full gate as T6 (unit + e2e `ui-enhancements`, `conversion`, `error-handling`, `smoke`, `theme`, `accessibility`).
#### Fase Refactor
- [✓] **T20 — Refactor Cycle B:** single source for the reserved heights (one const per component or a token), remove duplicated `minHeight` literals, no utility/abstraction beyond that; re-run the 4 component test files.

## Riesgos
- **e2e API-key tests turn red the moment R1 lands** (`useCurrencies` now fires a real call with a fake key → header shows the error text, not the old regex alternatives). Mitigation: T2 (same cycle) mocks the API via `page.route` before `goto`, making the status deterministic; the mock is registered before navigation because the fetch happens on mount.
- **React 19 StrictMode double-effect → double fetch.** Mitigation: ref guard keyed by the last attempted key (survives the effect remount, blocks the second invocation) + T1 test.
- **Failed key fanning out into a request loop** (effect re-runs on `isUpdating`/`isLoaded` changes). Mitigation: guard order (`ref` check *before* calling) + "does not retry the same key after a failure" test.
- **Reserved sizes guessed instead of measured** (`minHeight` smaller than the real Fluent `MessageBar`). Mitigation: T12/T18 measure in Chromium and tune the constant as part of the RED→GREEN loop; jsdom contract tests only guarantee the declaration, the e2e guarantees the rendered result.
- **A permanently reserved 56 px band in `AppMessageBar`** is a deliberate trade-off (an empty status band instead of a shifting layout). Rejected alternative: absolutely-positioned overlay (would cover content / break `role="alert"` flow) — decision to be recorded by scribe.
- **jsdom cannot do layout** → `getBoundingClientRect` is always 0. Mitigation: contract tests read declared `minHeight` (existing `CurrencyRow.test.tsx` precedent); real-layout proof lives in the Playwright test.
- **Coverage threshold 95 %** → every new state-independent branch (empty slot, ellipsis, loading copy) must be asserted by a test in Cycle B, otherwise `vitest` thresholds fail.
- **Widened e2e regex could mask a regression** (matching *any* status text). Mitigation: T2 asserts the terminal "Currency data loaded" state, not the union of alternatives.
- **Workload SLO**: Cycle B = 9 files (>5). Mitigation: declared WARNING; B1/B2 split available on request; no file delta >~25 lines.

🔄 HANDOFF → /build | Gate: plan | Artefactos: [.agents/docs/plan_2026-09-18_ui-autoload-fixed-layout.md, .agents/docs/specs/change_spec.yaml] | Evidencia: n/a (plan) | Pendiente: Cycle A (R1, R2 — T1..T7); Cycle B (R3, R4 — T8..T20)
