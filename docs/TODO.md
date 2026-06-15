# TODO — Pending Improvements (~5%)

Items restantes del plan maestro que no son críticos para el MVP pero pueden abordarse en futuras iteraciones.

---

## ♿ Accesibilidad (2 items)

### 1. Switch WCAG explícito
**Archivo:** `src/components/ThemeSwitcher/ThemeSwitcher.tsx`
**Cambio:** Añadir `role="switch"` y `aria-checked` explícitamente al `<Switch>` de Fluent (actualmente heredado implícitamente del componente).
**Esfuerzo:** 2 líneas
**Prioridad:** 🟢 Baja

### 2. `track()` en íconos SVG decorativos
**Archivo:** Multiples componentes
**Cambio:** Añadir `<title>` o `aria-label` descriptivo a todos los íconos decorativos con `aria-hidden="true"`.
**Esfuerzo:** 5-10 líneas
**Prioridad:** 🟢 Baja

---

## 🎨 Estilos Neon-Code (4 items)

### 3. Switch track ON/OFF personalizado
**Archivo:** `src/components/ThemeSwitcher/ThemeSwitcher.tsx`
**Cambio:** Agregar `makeStyles` para track ON (`colorBrandBackground`) y OFF (`colorNeutralBackground4`) en el Switch de Fluent.
**Nota:** El Switch actual usa colores Fluent default (brand-based). El cambio es cosmético.
**Esfuerzo:** 10 líneas
**Prioridad:** 🟢 Baja

### 4. MessageBar sombras eliminadas
**Archivo:** `src/components/AppMessageBar/AppMessageBar.tsx`
**Cambio:** Añadir `boxShadow: "none"` al `makeStyles` del MessageBar para alinearse con la Ley Anti-Decoración de Neon-Code.
**Nota:** El MessageBar de Fluent no tiene sombra por defecto en la mayoría de los casos. Verificar visualmente.
**Esfuerzo:** 1 línea
**Prioridad:** 🟢 Baja

### 5. Divider color y grosor
**Archivo:** `src/components/ConversionControls/ConversionControls.tsx` (líneas 79-82), `src/components/HistoryPanel/HistoryPanel.tsx` (líneas 65-68)
**Cambio:** Customizar el Divider de Fluent con `border-bottom: 1px solid var(--card-border-subtle)`.
**Nota:** `makeStyles` typing de Griffel no acepta `borderColor` con CSS vars directamente. Requiere usar `tokens.colorNeutralStroke2` como alternativa o una solución con `style={{}}` inline.
**Esfuerzo:** 2-4 líneas
**Prioridad:** 🟢 Baja

### 6. Doble anillo de foco
**Archivo:** `src/styles/globalStyles.ts`
**Cambio:** Reemplazar el anillo simple actual (`outline: 2px solid`) por el doble anillo del plan (`outline: 2px solid transparent`, `boxShadow: 0 0 0 2px bg, 0 0 0 4px brand`).
**Nota:** Incluir selector `:not([class*="fui-"])` para no romper el foco nativo de componentes Fluent.
**Esfuerzo:** 5 líneas
**Prioridad:** 🟢 Baja

---

## 🧪 Tests (3 items)

### 7. Coverage thresholds en vitest.config.ts
**Archivo:** `vitest.config.ts`
**Cambio:** Añadir `thresholds: { lines: 85, branches: 80, functions: 85, statements: 85 }` en la sección `coverage`.
**Esfuerzo:** 4 líneas
**Prioridad:** 🟡 Media

### 8. E2E specs completos (4 archivos)
**Archivo:** `e2e/` (solo existe `smoke.spec.ts` con 3 tests)
**Cambio:** Crear los 4 spec files del plan:
- `e2e/conversion.spec.ts` — flujo completo: API key → monedas → amount → Calculate → resultado + historial + swap + repeat + clear
- `e2e/theme.spec.ts` — toggle dark/light, persistencia tras recarga, `prefers-color-scheme`
- `e2e/error-handling.spec.ts` — API key inválida, sin key, misma moneda, amount=0, API caída, caché expirado
- `e2e/accessibility.spec.ts` — navegación teclado, foco visible, diálogos atrapan foco, ESC cierra, aria-live anuncia, operable sin mouse
**Nota:** Requiere instalar navegadores con `pnpm exec playwright install chromium firefox`.
**Esfuerzo:** ~150 líneas en total
**Prioridad:** 🟡 Media

### 9. `vitest.config.ts` `css: true`
**Archivo:** `vitest.config.ts:8`
**Cambio:** Cambiar `css: false` → `css: true` para que los tests procesen CSS real (útil para tests visuales/computed styles).
**Nota:** Puede ralentizar los tests. Evaluar si es necesario antes de cambiar.
**Esfuerzo:** 1 línea
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
| 🟡 Media | 3 (thresholds, E2E, pnpm install) | ~2-3h |
| 🟢 Baja | 8 (resto) | ~2h |
| **Total** | **11 items** | **~5h** |

*Actualizado: Junio 15, 2026*
