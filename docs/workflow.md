# Workflow de Implementación

Este documento captura el flujo de trabajo utilizado durante la refactorización de **currencyExchange** para fusionar **Fluent UI v9** con **Accessible Neon-Code** bajo **TDD estricto**.

## Estructura de Ramas

Se utilizó **Git Flow** local con las siguientes ramas `feature/`:

| Rama | Cambios principales |
|---|---|
| `dependency-update-plan` | Catalog de dependencias + scripts + checklist |
| `security-infrastructure` | CSP, HSTS, nginx, .dockerignore, Dockerfile NODE_VERSION |
| `neon-theme` | BrandVariants, 58 token overrides, fonts, globalStyles, main.tsx |
| `accessibility-wcag` | WCAG 2.2 AAA: skip-link, aria, target size 44px, reduced-motion |
| `component-adaptations` | Ajustes visuales neon-code en componentes existentes |
| `hook-architecture` | 5 hooks (useApiKey, useConversion, useConversionHistory, useAppMessage), ErrorBoundary, refactor App.tsx 477→162 líneas |
| `tdd-test-suite` | Vitest config, mocks (matchMedia, BroadcastChannel), 65+ tests |
| `performance-optimizations` | React.memo (4), React.lazy (HistoryPanel), useDeferredValue, useTransition, font preload |
| `color-brand-dual` | Brand tokens dual mode (dark/light), WCAG AAA contrast |
| `color-surface-system` | Cool-toned neutrals, 4-level foreground hierarchy, brand strokes |
| `color-status-semantics` | Status colors (success/danger/warning), palette red/yellow |
| `color-card-wiring` | CSS custom properties → App.tsx Card border |
| `neon-component-styling` | 14 neon-code rules en buttons, input, select, table, dialog, divider |
| `neon-a11y-gaps` | aria-valuemin, aria-describedby, text prefixes, role=alert, skip-link fix, tooltips |
| `cleanup-legacy` | Eliminación de 4 componentes muertos (ApiKeySection, Buttons legacy) |
| `missing-tests` | 10 nuevos archivos de test (hooks, componentes, App shell) |
| `neon-style-fixes` | Button hover invert, secondary buttons standard, tooltip styles |
| `neon-security-persist` | API key en header HTTP, EmptyState, tipos centralizados, persistencia tema |
| `neon-mvp-polish` | EmptyState conectado, fetch timeout 10s, E2E smoke test, CSP hardened, HEALTHCHECK |

## Reglas de Hierro

| Regla | Detalle |
|---|---|
| **Push** | PROHIBIDO. Solo el usuario hace push de `develop` o `main` |
| **Ramas** | Locales, sin número de FASE, nombres descriptivos |
| **Commits** | Uno por micro-cambio TDD. Inglés, Conventional Commits |
| **Gate** | Antes de `git flow feature finish`: `lint && biome check && ls-lint && vitest run && vite build` |
| **Context** | Actualizar `context.md` al terminar cada rama |
| **Notificación** | Al finalizar cada rama, se notifica al usuario para que haga push |

## Ciclo TDD por Micro-Cambio

Cada cambio atómico sigue tres fases:

```
1. RED   → Escribir test que falla → git commit -m "test(scope): description"
2. GREEN → Implementar código mínimo → git commit -m "feat(scope): description"
3. REFACTOR → Limpiar sin romper tests → git commit -m "refactor(scope): description"
```

### Ejemplo concreto (security-infrastructure)

```
test(config): verify CSP header is present in nginx response        ← RED
feat(config): add Content-Security-Policy header to nginx.conf      ← GREEN
refactor(config): extract CSP policy into nginx variable             ← REFACTOR
test(config): verify HSTS header with max-age=63072000               ← RED
feat(config): add Strict-Transport-Security header to nginx.conf     ← GREEN
...
─── GATE ───
pnpm run lint && biome check --linter-enabled=false . && npx ls-lint && pnpm vitest run && pnpm vite build
─── FINISH ───
git flow feature finish <rama>
git checkout develop
Actualizar context.md
─── TE NOTIFICO PARA QUE HAGAS PUSH ───
```

## Tipos de Commit (Conventional Commits)

| Tipo | Uso |
|---|---|
| `test` | RED: escribir o modificar tests |
| `feat` | GREEN: implementar funcionalidad |
| `refactor` | REFACTOR: limpiar código |
| `style` | Biome import organization / formato |
| `docs` | Actualizar `context.md` |
| `chore` | Dependencias, config, tooling |
| `perf` | Optimizaciones de rendimiento |

### Scopes válidos

| Scope | Archivos |
|---|---|
| `config` | nginx.conf, .dockerignore, vitest.config, playwright.config |
| `docker` | Dockerfile, .dockerignore |
| `theme` | neonTheme.ts, fonts.css, globalStyles.ts, main.css |
| `main` | src/main.tsx |
| `hooks` | src/hooks/*.ts |
| `components` | src/components/*/*.tsx |
| `services` | src/services/*.ts |
| `workspace` | pnpm-workspace.yaml |
| `test` | test infra (setup, mocks, config) |
| `a11y` | Accesibilidad WCAG |

## Verificación Pre-Finish (Gate)

Ejecutar en este orden antes de cerrar una rama:

```bash
pnpm run lint                    # oxlint sin errores
pnpm exec biome check --linter-enabled=false .  # formato limpio
npx ls-lint                     # naming de archivos correcto
pnpm vitest run                 # suite completa en verde
pnpm vite build                 # build sin errores
```

Si algo falla, arreglar con **nuevos commits** (nunca `amend` ni `rebase`).

## Aprendizajes Técnicos (QA Lessons)

### Vitest y TypeScript

- `vitest/config` provee `defineConfig` para configurar el test runner.
- Las variables de mock usadas dentro de `vi.mock()` factory deben crearse con `vi.hoisted()` para garantizar el hoisting correcto.
- `vi.useFakeTimers()` requiere `vi.useRealTimers()` en `afterEach` para evitar fugas entre tests.
- `// @vitest-environment jsdom` pragma es necesaria en archivos de test que usen DOM. Sin ella, el entorno es `node` y `document` no existe.

### Testing de Componentes

- `getByLabelText` encuentra tooltips y otros elementos ocultos además del target. Usar `getByRole("button", { name })` para selección precisa.
- jsdom no ejecuta CSS real — `getComputedStyle(button).width` retorna `auto` para elementos sin dimensiones explícitas. Usar `minWidth`/`minHeight`.
- Componentes envueltos en `React.memo` no requieren cambios en los tests existentes — solo verifican que el componente exporte.

### Fluent UI

- `BrandVariants` es `Record<10 \| 20 \| ... \| 160, string>` (16 tonos, no 10).
- `fontWeightSemibold` es tipo `number`, no `string`.
- `borderRadiusMedium`/`Large`/`XLarge` son tipo `string` (ej: `"4px"`).
- `TableHeaderCell` pasa props desconocidas al DOM — `scope="col"` funciona directamente.
- `Input` acepta `autoComplete` prop que mapea a `autocomplete` HTML.
- `add_header` en nginx se hereda del server level SOLO si el location block NO tiene su propio `add_header`. Si lo tiene, se borran todas las cabeceras del server block.

### Manejo de Estado

- `useCallback` con dependencias vacías en `swapCurrencies` captura valores stale. Listar `fromCurrency`/`toCurrency` como dependencias.
- `useLayoutEffect` es preferible a `useEffect` para mutaciones del DOM (`data-theme`) para evitar flash.
- `useDeferredValue` permite mantener la UI responsiva durante renders pesados de tabla.
- `useTransition` envuelve cambios de estado no críticos (toggleTheme) para mantener la interactividad.

### MongoDB / BroadcastChannel

- `BroadcastChannel` mock debe ser un `class` para que `new BroadcastChannel()` funcione en tests jsdom.

---

*Workflow validado durante la refactorización currencyExchange — 20+ ramas, 77 commits, 165 tests, 0 errores.*
