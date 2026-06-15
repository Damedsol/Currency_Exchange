# TODO — Pending Improvements (~5%)

Items restantes del plan maestro que no son críticos para el MVP pero deben abordarse para alcanzar cobertura ≥95% y tener el proyecto completo.

---

## 🎯 Objetivo de Cobertura: ≥95%

Configurar y alcanzar **95% de cobertura** en líneas, ramas, funciones y statements.

### Pasos:
1. Añadir `thresholds` en `vitest.config.ts`:
   ```ts
   coverage: {
     thresholds: { lines: 95, branches: 95, functions: 95, statements: 95 },
   }
   ```
2. Ejecutar `pnpm test:coverage` para identificar gaps
3. Añadir tests hasta alcanzar el threshold en cada categoría

---

## 🧪 Tests Faltantes (prioridad alta)

### 1. E2E specs completos (4 archivos)
**Archivo:** `e2e/` (solo existe `smoke.spec.ts` con 3 tests)
**Cambio:** Crear los 4 spec files del plan:

**`e2e/conversion.spec.ts`** (5 casos):
- API key → seleccionar monedas → amount → Calculate → resultado visible
- Swap recalcula tasa
- Repeat restaura valores y recalcula
- Limpiar historial con diálogo de confirmación
- Limpiar todo con diálogo de confirmación

**`e2e/theme.spec.ts`** (4 casos):
- Toggle dark/light cambia apariencia visual
- Tema persiste tras recargar página
- `prefers-color-scheme` dark se respeta sin preferencia guardada
- Contraste mínimo 7:1 en ambos temas (verificación visual)

**`e2e/error-handling.spec.ts`** (6 casos):
- API key inválida → mensaje de error + estado invalid
- Sin API key → Calculate deshabilitado
- Misma moneda → rate 1.0 sin llamar API
- Amount = 0 → Calculate deshabilitado
- API caída (mock network error) → rateSource error + mensaje
- Caché expirado → refresh rates llama a API

**`e2e/accessibility.spec.ts`** (6 casos):
- Navegación completa por teclado (Tab por todos los elementos)
- Foco visible en todos los elementos interactivos
- Diálogos atrapan foco (focus trap)
- ESC cierra diálogos
- `aria-live` anuncia cambios de conversión
- App operable completamente sin mouse

**Requisito técnico:** `pnpm exec playwright install chromium firefox` para instalar navegadores.
**Dependencia:** Playwright browsers requieren ~400MB en disco.
**Esfuerzo:** ~200 líneas en total
**Prioridad:** 🔴 Alta

### 2. Tests unitarios faltantes por servicio

**`src/services/LocalStorage.test.ts`** — tests actuales: 13. Faltantes del plan (casos 1-18):
| # | Caso | Estado |
|---|---|---|
| 1 | `localStorageStoreService` guarda key válida | ❌ |
| 2 | `localStorageStoreService` rechaza key inválida | ❌ |
| 3 | `localStorageFetchService` recupera key guardada | ❌ |
| 4 | `localStorageFetchService` aplica trim al recuperar | ❌ |
| 5 | `localStorageFetchService` retorna null si no existe | ❌ |
| 6 | `saveRatesToCache` guarda tasas con timestamp | ❌ |
| 7-11 | Tests de `loadRatesFromCache` (válido, expirado, JSON corrupto, estructura inválida) | ❌ |
| 12 | `saveConversionHistoryService` trunca a máximo 10 | ❌ |
| 13-14 | `loadConversionHistoryService` (corrupto, no existe) | ❌ |
| 15 | `clearLocalStorage` solo borra claves propias | ❌ |
| 16 | `clearRatesCache` solo borra clave de caché | ❌ |
| 17-18 | Type guard rechaza `amount` string / `timestamp` null | ❌ |

**Esfuerzo:** ~120 líneas

**`src/hooks/useApiKey.test.ts`** — tests actuales: 6. Faltantes del plan (casos 28-42):
- Debounce 1s (2 tests), validación formato inválido, error localStorage, input vacío, cleanup unmount, trim(), escritura rápida cancela timeout, carga key desde init, warning key con formato inválido

**Esfuerzo:** ~80 líneas

**`src/hooks/useConversion.test.ts`** — tests actuales: ~8. Faltantes del plan (casos 43-58):
- `fetchRate` error → `showMessage` llamado, swap desestima mensaje activo, transición rápida loading→api, `onConversionComplete` llamado con entry correcta

**Esfuerzo:** ~40 líneas

**`src/hooks/useConversionHistory.test.ts`** — tests actuales: 5. Faltantes del plan (casos 59-67):
- Type guard campos faltantes, type guard amount no numérico, localStorage inaccesible → array vacío, addEntry persiste en localStorage

**Esfuerzo:** ~40 líneas

**`src/hooks/useAppMessage.test.ts`** — tests actuales: 5. Faltantes del plan (casos 68-76):
- Timeout 5s auto-dismiss, cleanup unmount cancela timeout, múltiples show cancelan timeout anterior, intent error/warning/success

**Esfuerzo:** ~40 líneas

### 3. Tests de integración faltantes por componente

| Componente | Tests actuales | Faltantes del plan |
|---|---|---|
| `AppHeader` | ~3 | Toggle muestra/oculta input, `aria-expanded`, icono estado, Tooltip "set"/"missing" |
| `CurrencySelector` | ~3 | 33 opciones, Label asociado vía `htmlFor`, altura 44px |
| `CurrencyRow` | ~3 | Swap `aria-label`, swap target size 44px |
| `ConversionControls` | ~3 | `<h1>` visuallyHidden, amount input aria-valuemin/now |
| `ResultSection` | ~3 | `aria-live="assertive"` en error, `aria-atomic`, refresh llama callback |
| `ConversionHistory` | ~3 | Tabla 7 columnas, zebra striping, role region + aria-label, tabIndex |
| `ActionButtons` | ~3 | Diálogo borde sólido verde |
| `HistoryPanel` | ~4 | `aria-modal` en diálogo, ESC cierra, foco atrapado |
| `RateSourceIndicator` | ~3 | "(cached)" + tooltip, "(live)" + tooltip, "Error fetching rate" |
| `EmptyState` | 3 | Borde dashed, botón acción clickeable |
| `ErrorBoundary` | ~2 | Muestra fallback en error |
| `App` | 2 | Layout columna ≤768px, Card sin box-shadow, Card con borde |

**Esfuerzo total integración:** ~150 líneas

---

## ♿ Accesibilidad (2 items)

### 4. Switch WCAG explícito
**Archivo:** `src/components/ThemeSwitcher/ThemeSwitcher.tsx`
**Cambio:** Añadir `role="switch"` y `aria-checked` explícitamente al `<Switch>` de Fluent (actualmente heredado implícitamente del componente).
**Esfuerzo:** 2 líneas
**Prioridad:** 🟢 Baja

### 5. `track()` en íconos SVG decorativos
**Archivo:** Multiples componentes
**Cambio:** Añadir `<title>` o `aria-label` descriptivo a todos los íconos decorativos con `aria-hidden="true"`.
**Esfuerzo:** 5-10 líneas
**Prioridad:** 🟢 Baja

---

## 🎨 Estilos Neon-Code (4 items)

### 6. Switch track ON/OFF personalizado
**Archivo:** `src/components/ThemeSwitcher/ThemeSwitcher.tsx`
**Cambio:** Agregar `makeStyles` para track ON (`colorBrandBackground`) y OFF (`colorNeutralBackground4`) en el Switch de Fluent.
**Nota:** El Switch actual usa colores Fluent default (brand-based). El cambio es cosmético.
**Esfuerzo:** 10 líneas
**Prioridad:** 🟢 Baja

### 7. MessageBar sombras eliminadas
**Archivo:** `src/components/AppMessageBar/AppMessageBar.tsx`
**Cambio:** Añadir `boxShadow: "none"` al `makeStyles` del MessageBar para alinearse con la Ley Anti-Decoración de Neon-Code.
**Nota:** El MessageBar de Fluent no tiene sombra por defecto en la mayoría de los casos. Verificar visualmente.
**Esfuerzo:** 1 línea
**Prioridad:** 🟢 Baja

### 8. Divider color y grosor
**Archivo:** `src/components/ConversionControls/ConversionControls.tsx` (líneas 79-82), `src/components/HistoryPanel/HistoryPanel.tsx` (líneas 65-68)
**Cambio:** Customizar el Divider de Fluent con `border-bottom: 1px solid var(--card-border-subtle)`.
**Nota:** `makeStyles` typing de Griffel no acepta `borderColor` con CSS vars directamente. Requiere usar `tokens.colorNeutralStroke2` como alternativa o una solución con `style={{}}` inline.
**Esfuerzo:** 2-4 líneas
**Prioridad:** 🟢 Baja

### 9. Doble anillo de foco
**Archivo:** `src/styles/globalStyles.ts`
**Cambio:** Reemplazar el anillo simple actual (`outline: 2px solid`) por el doble anillo del plan (`outline: 2px solid transparent`, `boxShadow: 0 0 0 2px bg, 0 0 0 4px brand`).
**Nota:** Incluir selector `:not([class*="fui-"])` para no romper el foco nativo de componentes Fluent.
**Esfuerzo:** 5 líneas
**Prioridad:** 🟢 Baja

---

## 🔧 Arquitectura (1 item)

### 10. Hook `useTheme` con Context
**Archivo:** Nuevo: `src/hooks/useTheme.ts`, modificar: `src/main.tsx`, `src/App.tsx`
**Cambio:** Extraer la lógica de tema de `main.tsx` (AppContainer) a un hook `useTheme` que:
- Retorne `{ isDarkMode, toggleTheme, theme }`
- Use React Context para evitar prop drilling a componentes profundos
- Maneje `localStorage` persistencia y `prefers-color-scheme` sync
**Estado actual:** Tema manejado en `main.tsx` AppContainer con props pasadas a App. Funciona OK.
**Esfuerzo:** ~40 líneas (hook) + refactor de imports
**Prioridad:** 🟢 Baja (no urgente)

---

## 📦 Infraestructura (1 item)

### 11. `pnpm install` actualizado (FASE 0 del plan)
**Archivo:** `pnpm-workspace.yaml`, `package.json`
**Cambio:** El plan documenta actualizaciones de dependencias (Fluent 9.73→9.74, Vite 8.0.14→8.0.16, husky, lint-staged, commitlint) que requieren:
1. Actualizar versiones en `pnpm-workspace.yaml` catalog
2. Ejecutar `pnpm install`
3. Verificar build + lint post-update
**Nota:** Requiere aprobación explícita del usuario (política del proyecto).
**Esfuerzo:** 10-15 líneas + `pnpm install`
**Prioridad:** 🟡 Media

---

## Resumen

| Prioridad | Items | Esfuerzo estimado |
|---|---|---|
| 🔴 Alta | 3 (E2E, coverage 95%, tests faltantes) | ~8-10h |
| 🟡 Media | 1 (pnpm install) | ~30min |
| 🟢 Baja | 7 (resto) | ~2h |
| **Total** | **11 items** | **~12h** |

*Actualizado: Junio 15, 2026*
