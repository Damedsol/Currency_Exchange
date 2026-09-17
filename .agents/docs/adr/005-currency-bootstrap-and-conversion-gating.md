# ADR-005 — Currency bootstrap and conversion gating

- **Date:** 2026-09-17 · **Status:** accepted (Cycle A of `ui-autoload-and-fixed-layout`)
- **Deciders:** user report + plan/review of the cycle · **Supersedes:** —

## Context

The selectors only populated after pressing the AppHeader *Update* button, while *Calculate* was enabled as
soon as `storedApiKey` existed (`disabled={!storedApiKey || amount <= 0 || isLoading}`). A user could therefore
convert with `currencies = {}` and both `Select`s disabled showing `---`. The API key arrives asynchronously
(1 s debounce in `useApiKey`, or from `sessionStorage` right after mount), so "the key is ready" is an event the
currency loader has to observe.

Constraints: `freecurrencyapi.com` is quota-limited (metadata cache TTL 7 days exists for this reason), React 19
StrictMode double-invokes effects in development, and the project forbids unnecessary abstractions/new files
(KISS/YAGNI).

## Decision

1. **`useCurrencies` bootstraps itself.** An effect keyed on `storedApiKey` triggers exactly one
   `updateCurrencies()` per distinct key when `!isLoaded && !isUpdating`, guarded by a `autoLoadKeyRef` that is
   written **before** the call. `!storedApiKey` resets the ref; a failed attempt is never retried in a loop; the
   *Update* button remains the manual refresh path. A valid metadata cache suppresses the call entirely.
2. **Conversion is gated on metadata.** `ConversionControls` computes
   `canCalculate = Boolean(storedApiKey) && currenciesLoaded && amount > 0 && !isLoading` and drives the button's
   `disabled`; `currenciesLoaded` is derived locally from the already-passed `currencies` prop (same rule as
   `CurrencySelector.isEmpty`), so no prop signature or `App.tsx` change is needed.

## Consequences

- Positive: the UI can no longer convert against empty metadata; the API is called at most once per key on a cold
  cache; StrictMode double effects and failure loops are structurally impossible (ref guard precedes the call).
- Negative / accepted trade-off: if the metadata cache expires and the API is unreachable, *Calculate* stays
  disabled even when a rates cache exists — R2 requires exactly that, and the header surfaces the error text.
- Follow-ups: `useCurrencies` grew 55 → 80 lines (review O-1 — extract an internal `useAutoLoadCurrencies` if it
  grows again); the "rate fetch in flight" clause is code-read only (review O-3).
- Evidence: 6 unit tests in `useCurrencies.test.ts`, 3 in `ConversionControls.test.tsx`, the mocked e2e in
  `e2e/ui-enhancements.spec.ts`; full suite 355/355 + e2e 37/37 exit 0. Merged as UI-01/UI-02 in
  `.agents/docs/specs/ui.md`.
