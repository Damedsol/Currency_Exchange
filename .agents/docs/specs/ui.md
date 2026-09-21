# Spec — UI / UX (arranque de divisas y gating de conversión)

Origen: change `ui-autoload-and-fixed-layout` (Cycles A/B). Ciclo A cerrado y aprobado el **2026-09-17**
(plan `.agents/docs/plan_2026-09-18_ui-autoload-fixed-layout.md`, review
`.agents/docs/review_2026-09-18_ui-autoload-fixed-layout.md`). ADR relacionada: `adr/005-currency-bootstrap-and-conversion-gating.md`.

## Arranque de divisas y conversión (Cycle A — [✓])

- [✓] **UI-01 — La carga de divisas es automática al disponer de API key.** Con `storedApiKey` presente
  (tecleada y guardada tras el debounce de 1 s, o leída de `sessionStorage` en el mount) y sin metadatos
  cargados, `useCurrencies` llama una sola vez a `/v1/currencies` + `/v1/latest` sin acción del usuario y los
  selectores se pueblan. Una caché válida (<7 días) o la ausencia de key ⇒ **cero** llamadas (cuota de API).
  Un intento fallido **no** se reintenta en bucle (`autoLoadKeyRef` = última key intentada); una key distinta
  sí relanza el intento; el botón *Update* del header sigue siendo refresco manual. El doble efecto de React 19
  StrictMode no produce doble fetch (el ref se asigna antes de `void updateCurrencies()`).
  Tests: `src/hooks/useCurrencies.test.ts` (6, incluye caché/ausencia de key/no-loop/key distinta/error
  no-`Error`) + e2e `e2e/ui-enhancements.spec.ts` (mock de `api.freecurrencyapi.com` registrado antes del
  `goto` porque el fetch sale en el mount).
- [✓] **UI-02 — La conversión solo es posible con los metadatos de divisa cargados.** El botón *Calculate* de
  `ConversionControls` está deshabilitado mientras haya API key pero el record `currencies` esté vacío (y
  mientras `amount <= 0` o una petición de tasa esté en vuelo): `canCalculate = Boolean(storedApiKey) &&
  currenciesLoaded && amount > 0 && !isLoading`, con `currenciesLoaded` derivado localmente
  (`Object.keys(currencies ?? {}).length > 0`, la misma regla que usa `CurrencySelector.isEmpty`). Sin cambios
  en `ConversionControlsProps` ni en `App.tsx`.
  Tests: `src/components/ConversionControls/ConversionControls.test.tsx` (+3 y la aserción pre-existente
  "disabled when no API key" reforzada con `toBeDisabled()`).

## Slots fijos y copy automático (Cycle B — [✓])

- [✓] **UI-03 — Slots de tamaño fijo y sin saltos por cambio de contenido.** Tamaño reservado
  declarado e independiente del estado, presente en todos los estados: (a) hint de `CurrencySelector`
  (`role="status"`, `minHeight: 32px`, vacío cuando hay divisas); (b) `ResultSection` con un único
  `result-slot` (`minHeight: 44px`, `minWidth: 10ch`, spinner *dentro* en loading), `rate-row`
  (`minHeight: 32px`) y `rate-indicator-slot` (existe con `rateSource="idle"`); (c) fila de estado de
  `AppHeader` siempre renderizada (`minHeight: 32px`, `aria-hidden` sin key) con texto `nowrap`/ellipsis;
  (d) banda de `AppMessageBar` reservada (`minHeight: 56px`, margen constante, solo transición de
  `opacity`; el `<MessageBar>` interior sigue condicional). Medido: bounding box de *Calculate* (y, height)
  estable ≤1 px ante el autoload y ante reveal+dismiss del mensaje.
  Tests: 12 contratos jsdom (`getComputedStyle().minHeight`, precedente `CurrencyRow.test.tsx`) + e2e R3 de
  estabilidad en `e2e/ui-enhancements.spec.ts`. Incidencia: el `minHeight: 44px` del `Select` vive en el
  wrapper (no en el `<select>` nativo); el hint `role="status"` obligó a re-enfocar una aserción de
  `CurrencyRow.test.tsx` a `[aria-live="polite"]` explícito.
- [✓] **UI-04 — Copy acorde al load automático.** Estado idle del header → "Loading currencies…"; hint del
  selector → "Currencies load automatically when an API key is set."; ninguna cadena menciona *Update*
  para cargar. (Review: `.agents/docs/review_2026-09-21_ui-cycle-b.md`, ✅ APROBADO, 13+1 KEEP / 0 REMOVE.)
