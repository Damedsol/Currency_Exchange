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

## Pendiente (Cycle B — no fusionado aún)

- **UI-03 (R3)** — Slots de tamaño fijo y sin saltos por cambio de contenido: hint de `CurrencySelector`,
  filas de `ResultSection`, fila de estado de `AppHeader`, banda de `AppMessageBar`; verificación por contrato
  jsdom (`minHeight` declarado) + e2e de estabilidad del bounding box de *Calculate*.
- **UI-04 (R4)** — Copy acorde al load automático (nada de "click Update to load currencies").
- Tareas T8..T20 del plan; `change_spec.yaml` sigue `active` con `pending_requirements: [R3, R4]`.
