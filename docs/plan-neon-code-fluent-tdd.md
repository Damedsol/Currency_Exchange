# 📋 Plan Maestro: Refactorización Fluent UI + Neon-Code + TDD Estricto

| Documento | Plan Integral de Ingeniería v1.3 |
| :--- | :--- |
| **Proyecto** | currencyExchange v1.11.0 |
| **Objetivo** | Adaptar al design system **Accessible Neon-Code** manteniendo **Fluent UI v9** como base, con **TDD estricto** |
| **Estándar** | WCAG 2.2 AAA (contraste 7:1) |
| **Auditoría** | 3 rondas completadas — 52 mejoras integradas |
| **Dependencias** | FASE 0 documenta actualización a junio 2026 (no ejecutada) |
| **Side cases** | 24 riesgos documentados con mitigación |
| **Push** | PROHIBIDO. Solo el usuario hace push de `develop`/`main` |
| **Sesión** | 2026-06-13 |

---

## 🎯 Objetivo General

Fusionar:
- **Fluent UI React v9** (9.74.x) → foundation: componentes, tokens, provider, a11y built-in
- **Accessible Neon-Code** → capa estética AAA: paleta green-first, anti-decoración, tipografía dual

**Regla de oro:** Fluent es la base. Neon-code es la personalización. No se rompe la API de Fluent ni se reimplementan sus componentes.

---

## 📊 Compatibilidad Fluent ↔ Neon-Code

| Elemento | Fluent UI (v9.73+) | Neon-Code | Estrategia |
|---|---|---|---|
| **Colores primarios** | `#115ea3` (azul) | `#b9f27c` / `#1b4332` (verde) | `createDarkTheme(brand)` + `createLightTheme(brand)` con `BrandVariants` generados |
| **Border radius** | `borderRadiusMedium=4px` (v9.73 ya cumple) | ≤ 4px | Mantener. Set explícito `borderRadiusLarge→4px`, `borderRadiusXLarge→4px` |
| **Sombras (Card)** | `shadow4/shadow8` con `box-shadow` | **Prohibido** | `makeStyles` para eliminar shadow en Card. Fluent v9.73 `Card` no tiene prop `appearance` |
| **Tipografía** | Segoe UI / system-ui | Figtree + IBM Plex Mono | `@font-face` + override `fontFamilyBase`/`fontFamilyMonospace`/`fontFamilyNumeric` |
| **Font weight** | `fontWeightSemibold` (600) | Máx 500 en dark mode | `fontWeightMedium` en dark; 600 permitido en light |
| **Focus ring** | Single outline | Doble anillo (gap 2px + ring 4px) | `makeStyles` global, no CSS global (evitar romper foco de componentes Fluent) |
| **Alertas/Toast** | Solo color + icono | Prefijos `[OK]`/`[!]`/`[?]` | Prefijos textuales en `AppMessageBar` |
| **Target size** | ~32px min | 44px mínimo | `minHeight: 44px` en inputs/buttons |
| **Gradientes** | No se usan | Prohibidos | No aplica |
| **Iconografía** | `@fluentui/react-icons` (v2.0.x) | Lucide Web Component | Mantener Fluent icons |
| **Elevación** | Sombras + color | Solo contraste superficie | `--bg-base` → `--bg-surface` → `--bg-overlay` |
| **Select** | Componente compuesto (popover+listbox) | `<select>` nativo con flecha CSS | Flecha vía slot `expandIcon` de Fluent. No se puede usar `::after` |
| **API key auth** | Query param `?apikey=` | Header HTTP | Kong API Gateway soporta ambos. Header `apikey` funciona |

---

## 📦 FASE 0 — Actualización de Dependencias (Pre-requisito)

> **NOTA:** Esta fase es solo documental. No se ejecuta `pnpm install` hasta que el usuario lo apruebe explícitamente.
> Todas las versiones verificadas contra el registro npm a 2026-06-13.

### 0.1 Estado Actual vs Última Disponible

| Paquete | Actual (instalada) | Última (junio 2026) | Cambio |
|---|---|---|---|
| `react` | 19.2.6 | 19.2.7 | Minor |
| `react-dom` | 19.2.6 | 19.2.7 | Minor |
| `scheduler` | 0.27.0 | 0.27.0 | Sin cambio |
| `vite` | 8.0.14 | 8.0.16 | Patch |
| `typescript` | 6.0.3 | 6.0.3 | Sin cambio |
| `@vitejs/plugin-react` | en catalog, no instalado | 6.0.2 | `pnpm install` requerido |
| `@fluentui/react-components` | 9.73.8 | 9.74.1 | Minor |
| `@fluentui/react-icons` | en catalog, no instalado | 2.0.330 | `pnpm install` requerido |
| `@biomejs/biome` | 2.4.15 | 2.5.0 | Minor |
| `oxlint` | 1.66.0 | 1.69.0 | Minor |
| `@commitlint/cli` | 20.5.3 | 21.0.2 | Breaking |
| `@commitlint/config-conventional` | 20.0.0 | 21.0.2 | Breaking |
| `@ls-lint/ls-lint` | 2.3.1 | 2.3.1 | Sin cambio |
| `husky` | no instalado | 9.1.7 | `pnpm install` requerido |
| `lint-staged` | 16.4.0 | 17.0.7 | Breaking |
| `@types/react` | 19.2.15 | 19.2.17 | Patch |
| `@types/react-dom` | 19.2.3 | 19.2.3 | Sin cambio |

### 0.2 Nuevas Dependencias (Testing)

| Paquete | Versión | Propósito |
|---|---|---|
| `vitest` | ^4.1.8 | Runner unitario/integración |
| `@vitest/coverage-v8` | ^4.1.8 | Cobertura V8 |
| `@testing-library/react` | ^16.3.2 | Renderizado de componentes |
| `@testing-library/jest-dom` | ^6.9.1 | Matchers DOM (toBeInTheDocument, etc.) |
| `@testing-library/user-event` | ^14.6.1 | Simulación realista de eventos |
| `jsdom` | ^29.1.1 | DOM simulado para tests |
| `@playwright/test` | ^1.60.0 | E2E cross-browser |

### 0.3 Cambios en `pnpm-workspace.yaml` (catalog)

**Actualizaciones de versiones:**
```yaml
catalog:
  # Runtime — patch/minor seguro
  react: "^19.2.7"
  react-dom: "^19.2.7"
  scheduler: "^0.27.0"
  "@fluentui/react-components": "^9.74.1"
  "@fluentui/react-icons": "^2.0.330"

  # Build
  vite: "^8.0.16"
  typescript: "^6.0.3"
  "@vitejs/plugin-react": "^6.0.2"

  # Lint / Format
  "@biomejs/biome": "^2.5.0"
  oxlint: "^1.69.0"
  "@ls-lint/ls-lint": "^2.3.1"

  # Git hooks
  husky: "^9.1.7"
  lint-staged: "^17.0.7"
  "@commitlint/cli": "^21.0.2"
  "@commitlint/config-conventional": "^21.0.2"

  # Types
  "@types/react": "^19.2.17"
  "@types/react-dom": "^19.2.3"

  # Testing — NUEVOS
  vitest: "^4.1.8"
  "@vitest/coverage-v8": "^4.1.8"
  "@testing-library/react": "^16.3.2"
  "@testing-library/jest-dom": "^6.9.1"
  "@testing-library/user-event": "^14.6.1"
  jsdom: "^29.1.1"
  "@playwright/test": "^1.60.0"
```

### 0.4 Cambios en `package.json`

**Nuevos scripts:**
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

**Nuevas devDependencies:**
```json
"devDependencies": {
  "vitest": "catalog:",
  "@vitest/coverage-v8": "catalog:",
  "@testing-library/react": "catalog:",
  "@testing-library/jest-dom": "catalog:",
  "@testing-library/user-event": "catalog:",
  "jsdom": "catalog:",
  "@playwright/test": "catalog:"
}
```

### 0.5 Cambios en `.gitignore`

Añadir:
```
# Testing
coverage/
e2e/test-results/
playwright-report/
```

### 0.6 ⚠️ Notas de Compatibilidad

| Riesgo | Paquete | Mitigación |
|---|---|---|
| **Breaking** | `@commitlint/cli` 20→21 | Verificar que `.commitlintrc.json` (conventional) sigue siendo compatible. v21 cambia a ESM-only |
| **Breaking** | `lint-staged` 16→17 | Verificar compatibilidad de `.lintstagedrc.json`. v17 requiere Node ≥18. Cumple |
| **CSS** | Fluent UI v9.73→9.74 | `borderRadiusMedium` ya es 4px desde v9.73. Verificar que no haya regresiones visuales |
| **Vite** | 8.0.14→8.0.16 | `rolldownOptions` puede cambiar. Verificar build post-update |
| **Playwright** | 1.60.0 | Requiere `pnpm exec playwright install` para instalar navegadores |

### 0.7 Post-Install Verification Checklist

```
□ pnpm install — sin errores de peer deps
□ pnpm run typecheck — sin errores TypeScript
□ pnpm run lint — oxlint + ls-lint pasan
□ pnpm run format — biome sin cambios pendientes
□ pnpm run build — bundle compila
□ pnpm exec playwright install chromium firefox — navegadores E2E disponibles
□ ls node_modules/@vitejs/plugin-react — paquete presente
□ ls node_modules/@fluentui/react-icons — paquete presente
□ ls node_modules/husky — paquete presente
□ git diff .commitlintrc.json — sin cambios que rompan conventional commits
```

---

## 🔴 FASE 1 — Seguridad de Infraestructura (Pre-requisito)

### 1.1 Content-Security-Policy

**nginx.conf:**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.freecurrencyapi.com; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'" always;
```

**index.html** (fallback dev):
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.freecurrencyapi.com; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'">
```

El `'unsafe-inline'` en `style-src` es necesario: Fluent UI (Griffel) inyecta `<style>` tags dinámicamente.

### 1.2 Headers de Seguridad Adicionales

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Cross-Origin-Resource-Policy "same-origin" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
# Ya existentes — no modificar:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Referrer-Policy: strict-origin-when-cross-origin
# server_tokens off
```

### 1.3 .dockerignore + Dockerfile

Crear `.dockerignore`:
```
**/.env*
!**/.env.example
.git
.gitattributes
.gitignore
.husky
node_modules
dist
logs
*.log
coverage
e2e/test-results
playwright-report
```

**Dockerfile:** Fijar `NODE_VERSION` (actualmente `lts-alpine` flotante):
```dockerfile
ARG NODE_VERSION=22-alpine
```

### 1.4 Variables de Entorno

- Verificar `git ls-files .env.development` → si tracked: `git rm --cached .env.development`
- Crear `.env.production` con `VITE_DEBUG=false`, `VITE_LOG_LEVEL=error`
- Eliminar uso de `VITE_DEBUG` o condicionarlo a `import.meta.env.DEV`

### 1.5 API Key — Mitigación de Exposición

- `FreeCurrency.ts`: header HTTP `apikey: ${apiKey}` (Kong API Gateway lo soporta — verificado)
- `LocalStorage.ts`: ofuscar con Web Crypto API (`SubtleCrypto`)
- `autocomplete="new-password"` en inputs de API key (navegadores ignoran `off` en password)

---

## 🧱 FASE 2 — Tema Custom Neon-Code sobre Fluent

### 2.1 API Real de Fluent para Custom Themes

Fluent UI v9.73+ usa `BrandVariants` (tupla de 10 colores) + `createDarkTheme(brand)` / `createLightTheme(brand)`:

```ts
// src/theme/neonTheme.ts
import {
  createDarkTheme,
  createLightTheme,
  type Theme,
  type BrandVariants,
} from '@fluentui/react-components'

// BrandVariants: 10-colores desde el primario #b9f27c (dark) / #1b4332 (light)
// Se generan con herramienta de Fluent o manualmente
const neonDarkBrand: BrandVariants = {
  10: '#040503',
  20: '#0d1a06',
  30: '#102d0a',
  40: '#12400d',
  50: '#1a5415',
  60: '#2a6a20',
  70: '#3d802b',
  80: '#559635',
  90: '#73ad40',
  100: '#94c34c',
  110: '#b9f27c', // Neon Lime — primario
  120: '#c5fa8a',
  130: '#d2fb99',
  140: '#ddfba9',
  150: '#e7fcbb',
  160: '#f0fdce',
} as BrandVariants

const neonLightBrand: BrandVariants = {
  10: '#f5faf7',
  20: '#e3f2e9',
  30: '#cee9d8',
  40: '#b5dfc4',
  50: '#99d4ae',
  60: '#7ac795',
  70: '#58b77a',
  80: '#35a560',
  90: '#1b913f',
  100: '#1b4332', // Neon Forest — primario
  110: '#173c2c',
  120: '#133526',
  130: '#0f2d20',
  140: '#0c2619',
  150: '#081e12',
  160: '#040d08',
} as BrandVariants

const sharedTokenOverrides: Partial<Theme> = {
  // Border radius — Fluent v9.73+ ya tiene borderRadiusMedium=4px por defecto
  borderRadiusNone: '0px',
  borderRadiusSmall: '2px',
  borderRadiusLarge: '4px',
  borderRadiusXLarge: '4px',

  // Tipografía
  fontFamilyBase: "'Figtree', 'Segoe UI', system-ui, sans-serif",
  fontFamilyMonospace: "'IBM Plex Mono', Consolas, monospace",
  fontFamilyNumeric: "'IBM Plex Mono', Consolas, monospace",
  fontWeightSemibold: 500, // Forzar 500 en dark mode (Ley de Irradiación)

  // Sombras eliminadas (neon-code anti-decoración)
  shadow2: 'none',
  shadow4: 'none',
  shadow8: 'none',
  shadow16: 'none',
  shadow28: 'none',
  shadow64: 'none',

  // Fondos — mapeados a paleta neon-code
  colorNeutralBackground1: '#0f1016', // --bg-base
  colorNeutralBackground2: '#161b22', // --bg-surface (usado en App.tsx root)
  colorNeutralBackground3: '#1a1b26', // --bg-overlay
  colorSubtleBackgroundHover: '#1e2330', // hover sutil sobre bg-base

  // Stroke / bordes — mapeados a brand-primary
  colorCompoundBrandStroke: '#b9f27c', // focus ring en inputs
  colorBrandStroke1: '#b9f27c',
  colorBrandStroke2: '#94c34c',

  // Status colors — mapeados a paleta neon-code
  colorStatusSuccessForeground1: '#b9f27c',
  colorStatusDangerForeground1: '#ff96a7',
  colorStatusWarningForeground1: '#ffc777',
}

export const neonDarkTheme: Theme = {
  ...createDarkTheme(neonDarkBrand),
  ...sharedTokenOverrides,
  // Override específicos dark
  colorStatusSuccessForeground1: '#b9f27c',
  colorStatusDangerForeground1: '#ff96a7',
  colorStatusWarningForeground1: '#ffc777',
}

export const neonLightTheme: Theme = {
  ...createLightTheme(neonLightBrand),
  ...sharedTokenOverrides,
  // Override específicos light
  colorStatusSuccessForeground1: '#1b4332',
  colorStatusDangerForeground1: '#9e0021',
  colorStatusWarningForeground1: '#855c00',
}
```

### 2.2 Fuentes

Copiar de `/projects/Gitea/neon-code/assets/fonts/` a `assets/fonts/`:
- `Figtree/` (WOFF2 + TTF, OFL License)
- `IBM_Plex_Mono/` (WOFF2 + TTF, OFL License)
- Incluir `OFL.txt` en cada directorio

`src/styles/fonts.css` con `@font-face` para pesos: 300, 400, 500, 600, 700 (Figtree) y 300, 400, 500, 600, 700 (IBM Plex Mono).

### 2.3 Sincronización con `prefers-color-scheme`

```ts
// main.tsx — dentro de AppContainer, en un useEffect
useEffect(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const stored = localStorage.getItem('themePreference')
  if (!stored) {
    setTheme(mq.matches ? neonDarkTheme : neonLightTheme)
    setIsDarkMode(mq.matches)
  }
  const handler = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('themePreference')) {
      setTheme(e.matches ? neonDarkTheme : neonLightTheme)
      setIsDarkMode(e.matches)
    }
  }
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}, [])
```

Toggle manual persiste en localStorage: `localStorage.setItem('themePreference', isDark ? 'dark' : 'light')`.

### 2.4 Estilos Globales — Estrategia Mixta

**IMPORTANTE:** `makeStyles` (Griffel) no puede estilizar `body` ni `:root` porque están fuera del árbol React. Usar estrategia mixta:

**`src/styles/main.css`** — solo estilos que afectan elementos fuera de React:
```css
@import './fonts.css';

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  min-height: 100dvh;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}
```

**`src/styles/globalStyles.ts`** — estilos de componentes FluentProvider-scope:
```ts
import { makeStyles } from '@fluentui/react-components'

export const useGlobalStyles = makeStyles({
  // Doble anillo de foco para elementos nativos (no componentes Fluent)
  nativeFocusVisible: {
    '& :focus-visible:not([class*="fui-"])': {
      outline: '2px solid transparent',
      outlineOffset: '2px',
      boxShadow: '0 0 0 2px var(--bg-base, #0f1016), 0 0 0 4px #b9f27c',
      borderRadius: '2px',
    },
  },
  // No dependencia del color: prefijos textuales en lugar de solo color
  textPrefix: {
    fontFamily: "'IBM Plex Mono', Consolas, monospace",
    fontWeight: 700,
  },
})
```

El selector `:not([class*="fui-"])` evita romper el foco nativo de componentes Fluent que ya gestionan su propio `:focus-visible`.

**Nota sobre `--card-border`:** Este no es un token Fluent, es una CSS custom property definida en `main.css`:
```css
:root {
  --card-border: rgba(185, 242, 124, 0.1);
}
```

---

## ♿ FASE 3 — Accesibilidad WCAG 2.2 AAA

| Componente | Cambios |
|---|---|
| **Global** | `lang="en"` en `<html>` de `index.html`. Skip-link: `<a href="#main-content" class="skipLink">Skip to main content</a>` visible en foco. Doble anillo de foco vía `globalStyles.ts` (sin romper foco de componentes Fluent). Contraste 7:1 verificado con axe DevTools |
| `AppMessageBar` | `role="alert"` activado. Prefijos `[!]`/`[OK]`/`[?]`. Borde izquierdo `4px` coloreado |
| `AppHeader` | `aria-expanded` en toggle API key. `autocomplete="new-password"` en input |
| `ConversionControls` | `<input type="number">` añade `aria-valuemin="0"`, `aria-valuenow={amount}`, `aria-label="Amount in source currency"` |
| `ConversionHistory` | `role="region"` + `aria-label="Conversion history table"`. `tabIndex={0}`. Datos en monospace, numéricos derecha. Header con fondo `--brand-primary` y `scope="col"` en cada `<th>` |
| `Dialog` (confirmación) | `aria-describedby` apuntando a `DialogContent.id`. `aria-modal="true"` (nativo de Fluent). AutoFocus en botón cancelar. Borde `2px solid --brand-primary`. Solo uno abierto a la vez |
| `ResultSection` | `aria-live="assertive"` en error, `"polite"` en éxito. `aria-atomic="true"` en contenedor de tasa también |
| `CurrencyRow` | Swap anuncia cambio vía callback que dispara `aria-live` region con "Swapped currencies: {from} ↔ {to}" |
| `ThemeSwitcher` | `role="switch"` + `aria-checked` |
| `Tooltip` | `aria-describedby` obligatorio. Borde `--brand-primary` |
| `Divider` | `role="separator"` + `aria-orientation`. `1px` sólido |
| `Card` | `aria-label="Currency converter application"` en el Card principal |
| `EmptyState` | `role="status"`. Borde `dashed`. Texto en Mono. Botón de acción |

---

## 🧩 FASE 4 — Adaptación de Componentes a Neon-Code

### 4.1 Definiciones CSS Custom Properties (`main.css :root`)

```css
:root {
  --card-border: rgba(185, 242, 124, 0.1);
  --card-border-subtle: rgba(185, 242, 124, 0.05);
}

@media (prefers-color-scheme: light) {
  :root {
    --card-border: rgba(27, 67, 50, 0.1);
    --card-border-subtle: rgba(27, 67, 50, 0.05);
  }
}
```

### 4.2 Adaptaciones por Componente

| Componente Fluent | Adaptación |
|---|---|
| `Card` | `makeStyles` para eliminar `box-shadow` y añadir `border: 1px solid var(--card-border)`. Fondo via token `colorNeutralBackground2` (mapeado a `--bg-surface`) |
| `Button` | `fontWeight: tokens.fontWeightMedium` (500). `textTransform: 'uppercase'`. `minHeight: '44px'`. `borderRadius: tokens.borderRadiusMedium`. **Hover:** invertir colores — fondo `--bg-base`, texto `--brand-primary`, borde `--brand-primary`. **Active:** `transform: 'scale(0.98)'` (feedback sin sombra, Ley Anti-Decoración). **Disabled:** `opacity: 0.4` |
| `Input` | `minHeight: 44px`. `borderWidth: 2px`. Placeholder `colorNeutralForeground3`. **Focus:** doble anillo heredado de `globalStyles` si es nativo; si es Fluent `Input`, usar `:focus-within` con `borderColor: tokens.colorBrandStroke1` |
| `Select` | `minHeight: 44px`. Flecha vía slot `expandIcon` con `color: tokens.colorBrandForeground1`. Body en monospace |
| `Table` header | Fondo `tokens.colorBrandBackground`, texto `tokens.colorNeutralForegroundOnBrand`. Body en `IBM Plex Mono`. Zebra striping con `colorNeutralBackground4` |
| `Dialog` | `border: '2px solid'` + `tokens.colorBrandStroke1`. Fondo via `colorNeutralBackground3`. Título en IBM Plex Mono |
| `MessageBar` | Sin sombras. Borde izquierdo `4px` coloreado según intent |
| `Switch` | Track ON: `tokens.colorBrandBackground`, OFF: `tokens.colorNeutralBackground4` |
| `Tooltip` | Fondo `colorNeutralBackground3`, borde `1px solid colorBrandStroke1`. Font: `fontFamilyBase`, `fontSize: 12px` |
| `Divider` | `role="separator"`. `1px`, color: `var(--card-border-subtle)`. Márgenes `1.5rem 0` |
| `EmptyState` | Nuevo componente. `border: '2px dashed var(--card-border)'`. `borderRadius: tokens.borderRadiusMedium`. Texto en IBM Plex Mono. Botón acción primario |
| `RateSourceIndicator` | Textos en Figtree. Iconos con `colorBrandForeground1` (success) y `colorStatusDangerForeground1` (error) |
| Eliminar | `ApiKeySection.tsx`, `Buttons/primary/`, `Buttons/secondary/`, `Buttons/danger/` |

---

## 🏗️ FASE 5 — Arquitectura: Hooks (Eliminar Prop Drilling)

### 5.1 Extracción desde `App.tsx` (479 → ~100 líneas)

| Hook | Responsabilidades | Retorna |
|---|---|---|
| `useApiKey` | `apiKeyInput`, `storedApiKey`, `isApiKeyValid`, `apiKeySaveStatus`, debounce 1s, validación regex, guardado en localStorage. Carga inicial desde localStorage. `AbortController`. `trim()` delegado al servicio | `{ apiKeyInput, storedApiKey, isApiKeyValid, apiKeySaveStatus, isApiKeyHeaderInputVisible, handleApiKeyChange, toggleApiKeyHeaderInput, handleApiKeyInputBlur }` |
| `useConversion` | `amount`, `fromCurrency`, `toCurrency`, `rate`, `rateSource`, `fetchRate`, `swapCurrencies`. Validación `Number.isFinite`. Debounce 150ms en loading. Recibe callback `onConversionComplete` y `apiKey` | Params: `{ apiKey, onConversionComplete, showMessage }`. Retorna: `{ amount, fromCurrency, toCurrency, rate, rateSource, handleAmountChange, handleFromCurrency, handleToCurrency, fetchRate, swapCurrencies }` |
| `useConversionHistory` | `conversionHistory`, `addEntry`, `clearHistory`, `repeatConversion`. Type guard por entrada. Máximo 10. Persistencia. Carga inicial desde localStorage | `{ conversionHistory, addEntry, clearHistory, repeatConversion }`. `repeatConversion` retorna `{ fromCurrency, toCurrency, amount }` — el orchestrator los pasa a `useConversion` |
| `useAppMessage` | `appMessage`, `showAppMessage`, `dismissMessage`. Timeout 5s. Solo `string`. Cleanup en unmount | `{ appMessage, showAppMessage(text: string, intent: MessageBarIntent, duration?: number), dismissMessage }` |
| `useTheme` (Context) | `isDarkMode`, `toggleTheme`, `theme`. Expone a hijos. No duplica `Theme` — estado en `AppContainer` | `{ isDarkMode, toggleTheme, theme }` |

### 5.2 Interfaces de Hooks

```ts
// useApiKey
interface UseApiKeyReturn {
  apiKeyInput: string
  storedApiKey: string | null
  isApiKeyValid: boolean
  apiKeySaveStatus: ApiKeySaveStatus
  isApiKeyHeaderInputVisible: boolean
  handleApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  toggleApiKeyHeaderInput: () => void
  handleApiKeyInputBlur: () => void
}

// useConversion params
interface UseConversionParams {
  apiKey: string | null
  onConversionComplete: (entry: ConversionHistoryEntry) => void
  showMessage: (text: string, intent: MessageBarIntent) => void
}

// useConversion return
interface UseConversionReturn {
  amount: number
  fromCurrency: string
  toCurrency: string
  rate: number
  rateSource: RateSource
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFromCurrency: (value: string) => void
  handleToCurrency: (value: string) => void
  fetchRate: () => Promise<void>
  swapCurrencies: () => void
}

// useConversionHistory
interface UseConversionHistoryReturn {
  conversionHistory: ConversionHistoryEntry[]
  addEntry: (entry: ConversionHistoryEntry) => void
  clearHistory: () => void
  repeatConversion: (entry: ConversionHistoryEntry) => {
    fromCurrency: string; toCurrency: string; amount: number
  }
}
```

### 5.3 Acoplamiento entre Hooks

`useConversion.fetchRate` → callback `onConversionComplete(entry)` → `App.tsx` conecta con `useConversionHistory.addEntry(entry)`.

`useConversionHistory.repeatConversion(entry)` → retorna `{fromCurrency, toCurrency, amount}` → `App.tsx` pasa valores a `handleFromCurrency`, `handleToCurrency`, `handleAmountChange`, luego llama `fetchRate()`.

```
App.tsx (orchestrator):
  const apiKey = useApiKey()
  const msg = useAppMessage()
  const history = useConversionHistory()
  const conversion = useConversion({
    apiKey: apiKey.storedApiKey,
    onConversionComplete: history.addEntry,
    showMessage: msg.showAppMessage,
  })

  const handleRepeatConversion = (entry: ConversionHistoryEntry) => {
    const restored = history.repeatConversion(entry)
    conversion.handleFromCurrency(restored.fromCurrency)
    conversion.handleToCurrency(restored.toCurrency)
    conversion.handleAmountChange({ target: { value: String(restored.amount) } } as any)
    void conversion.fetchRate()
  }
```

### 5.4 Error Boundary para Lazy Components

Crear `src/components/ErrorBoundary/ErrorBoundary.tsx`:
```tsx
// Captura errores en HistoryPanel (lazy) y muestra fallback
class ErrorBoundary extends React.Component<{fallback: React.ReactNode; children: React.ReactNode}> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}
```

### 5.5 Tipos Centralizados

`src/types/index.ts`:
```ts
import type { MessageBarIntent } from '@fluentui/react-components'

export type RateSource = 'idle' | 'cache' | 'api' | 'error' | 'loading'
export type ApiKeySaveStatus = 'idle' | 'validating' | 'saving' | 'saved' | 'invalid' | 'error'
export interface AppMessage { text: string; intent: MessageBarIntent; visible: boolean }
export interface ConversionHistoryEntry {
  fromCurrency: string; toCurrency: string; amount: number
  rate: number; result: number; timestamp: number
}
```

---

## 🧪 FASE 6 — TDD Estricto (RED → GREEN → REFACTOR)

### 6.0 Dependencias de Testing

```yaml
# pnpm-workspace.yaml catalog additions:
vitest: "^4.1.8"
@vitest/coverage-v8: "^4.1.8"
@testing-library/react: "^16.3.2"
@testing-library/jest-dom: "^6.9.1"
@testing-library/user-event: "^14.6.1"
jsdom: "^29.1.1"
@playwright/test: "^1.60.0"
```

### 6.1 Configuración

**`vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    mockReset: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/vite-env.d.ts', 'src/types/**'],
      thresholds: { lines: 85, branches: 80, functions: 85, statements: 85 },
    },
  },
})
```

**`src/vite-env.d.ts`** — añadir tipos para test globals:
```ts
/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
```

**`src/test/setup.ts`:**
```ts
import '@testing-library/jest-dom/vitest'

beforeEach(() => {
  localStorage.clear()
})

// Mock matchMedia para tests de tema
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }),
})
```

**`playwright.config.ts`:**
```ts
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './e2e',
  webServer: { command: 'pnpm dev', port: 5173, reuseExistingServer: true },
  use: { baseURL: 'http://localhost:5173', viewport: { width: 1280, height: 720 } },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
})
```

**Scripts en `package.json`:**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

### 6.2 Tests de Caracterización — Servicios (casos 1-25, 27)

Ejecutar sobre código ACTUAL sin modificar. Deben pasar (GREEN).

`src/services/LocalStorage.test.ts`:

| # | Caso | Tipo |
|---|---|---|
| 1 | `localStorageStoreService` guarda key con formato válido | Happy |
| 2 | `localStorageStoreService` rechaza key con formato inválido | Error |
| 3 | `localStorageStoreService` lanza error si regex no coincide | Error |
| 4 | `localStorageFetchService` recupera key guardada | Happy |
| 5 | `localStorageFetchService` aplica trim al recuperar | Edge |
| 6 | `localStorageFetchService` retorna null si no existe | Edge |
| 7 | `saveRatesToCache` guarda tasas con timestamp | Happy |
| 8 | `loadRatesFromCache` retorna tasas válidas no expiradas | Happy |
| 9 | `loadRatesFromCache` retorna null si expiradas (>24h) | Edge |
| 10 | `loadRatesFromCache` retorna null si JSON corrupto | Edge |
| 11 | `loadRatesFromCache` retorna null si estructura inválida | Edge |
| 12 | `saveConversionHistoryService` trunca a máximo 10 | Edge |
| 13 | `loadConversionHistoryService` retorna [] si corrupto | Edge |
| 14 | `loadConversionHistoryService` retorna [] si no existe | Edge |
| 15 | `clearLocalStorage` solo borra claves propias | Edge |
| 16 | `clearRatesCache` solo borra clave de caché | Happy |
| 17 | `loadConversionHistoryService` type-guard rechaza entrada con `amount` string | Edge |
| 18 | `loadConversionHistoryService` type-guard rechaza entrada con timestamp null | Edge |

`src/services/FreeCurrency.test.ts`:
> Estrategia: mock de `globalThis.fetch` con `vi.fn()`. Alternativa: instalar `msw` si se requiere simular respuestas HTTP más realistas.

| # | Caso | Tipo |
|---|---|---|
| 17 | `calculateRate` convierte EUR→USD usando USD base | Happy |
| 18 | `calculateRate` retorna 1.0 para misma moneda | Edge |
| 19 | `calculateRate` retorna null si fromRate es 0 | Edge |
| 20 | `getCurrencyRate` usa caché válido sin llamar API | Happy |
| 21 | `getCurrencyRate` llama API si no hay caché | Happy |
| 22 | `getCurrencyRate` guarda respuesta en caché tras API | Happy |
| 23 | `getCurrencyRate` retorna error en HTTP 429 | Error |
| 24 | `getCurrencyRate` retorna error en network failure | Error |
| 25 | `getCurrencyRate` retorna error en respuesta no-OK | Error |
| 27 | URL de API usa HTTPS | Security |

### 6.3 Tests de Nuevo Comportamiento — Servicios (caso 26)

Ejecutar DESPUÉS de modificar `FreeCurrency.ts`. Debe fallar inicialmente (RED).

| # | Caso | Tipo |
|---|---|---|
| 26 | API key se envía como header HTTP `apikey`, no query param | Security |

### 6.4 Tests Unitarios — Hooks (TDD estricto: RED primero)

Usar `renderHook` de `@testing-library/react`. Escribir antes de implementar hooks.

`src/hooks/useApiKey.test.ts`:

| # | Caso | Tipo |
|---|---|---|
| 28 | Estado inicial: `apiKeySaveStatus === 'idle'` | Happy |
| 29 | `handleApiKeyChange` actualiza `apiKeyInput` inmediatamente | Happy |
| 30 | No guarda inmediatamente: debounce de 1s | Edge |
| 31 | Guarda tras 1s si formato válido → `saved` | Happy |
| 32 | Tras guardar, `storedApiKey` se actualiza | Happy |
| 33 | Formato inválido → `invalid` | Error |
| 34 | Error localStorage → `error` | Error |
| 35 | Input vacío → `idle` | Edge |
| 36 | Cleanup unmount cancela timeout | Edge |
| 37 | `trim()` aplicado antes de validar | Edge |
| 38 | Escritura rápida cancela timeout anterior | Edge |
| 39 | `AbortController` previene setState post-unmount | Edge |
| 40 | Carga key desde localStorage en init si existe | Happy |
| 41 | No carga key en init si localStorage vacío | Edge |
| 42 | Muestra warning si key en localStorage tiene formato inválido | Error |

`src/hooks/useConversion.test.ts`:

| # | Caso | Tipo |
|---|---|---|
| 43 | Estado inicial: `rateSource === 'idle'`, `rate === 0` | Happy |
| 44 | `fetchRate` misma moneda → 1.0, no llama API | Edge |
| 45 | `fetchRate` con API key válida obtiene tasa | Happy |
| 46 | `fetchRate` error → `rateSource === 'error'` + `showMessage` llamado | Error |
| 47 | `fetchRate` amount=0 no llama API | Edge |
| 48 | `fetchRate` con `apiKey === null` no llama API | Edge |
| 49 | `handleAmountChange` acepta números positivos | Happy |
| 50 | `handleAmountChange` rechaza `Infinity` | Edge |
| 51 | `handleAmountChange` rechaza `NaN` | Edge |
| 52 | `handleAmountChange` rechaza negativos | Edge |
| 53 | `handleAmountChange` acepta decimales | Happy |
| 54 | `swapCurrencies` intercambia y resetea rate | Happy |
| 55 | `swapCurrencies` desestima mensaje activo | Edge |
| 56 | Transición rápida loading→api no causa inconsistencia | Edge |
| 57 | `onConversionComplete` llamado con entrada correcta tras fetchRate | Happy |
| 58 | `fetchRate` con `fromCurrency === toCurrency` y amount=0 retorna 1.0 | Edge |

`src/hooks/useConversionHistory.test.ts`:

| # | Caso | Tipo |
|---|---|---|
| 59 | Carga historial vacío inicial | Happy |
| 60 | `addEntry` añade al inicio del array | Happy |
| 61 | Máximo 10 entradas: 11ª elimina la más antigua | Edge |
| 62 | `clearHistory` vacía y persiste en localStorage | Happy |
| 63 | `repeatConversion` restaura `{fromCurrency, toCurrency, amount}` | Happy |
| 64 | Type guard rechaza entrada con campos faltantes | Edge |
| 65 | Type guard rechaza entrada con `amount` no numérico | Edge |
| 66 | localStorage inaccesible → array vacío, sin crash | Edge |
| 67 | `addEntry` con entrada válida persiste en localStorage | Happy |

`src/hooks/useAppMessage.test.ts`:

| # | Caso | Tipo |
|---|---|---|
| 68 | `showAppMessage` activa `visible: true` con texto correcto | Happy |
| 69 | `dismissMessage` establece `visible: false` | Happy |
| 70 | Timeout 5s auto-dismiss | Edge |
| 71 | Cleanup unmount cancela timeout pendiente | Edge |
| 72 | Múltiples `showAppMessage` cancelan timeout anterior | Edge |
| 73 | Rechaza `React.ReactNode` — solo strings | Security |
| 74 | `showAppMessage(text, 'error')` establece intent error | Happy |
| 75 | `showAppMessage(text, 'warning')` establece intent warning | Happy |
| 76 | `showAppMessage(text, 'success')` establece intent success | Happy |

### 6.5 Tests de Integración — Componentes

`src/components/AppHeader/AppHeader.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 68 | Renderiza botón API key + ThemeSwitcher | Happy |
| 69 | Toggle muestra/oculta input | Happy |
| 70 | Input `type="password"` | Security |
| 71 | Input `autocomplete="new-password"` | Security |
| 72 | `aria-expanded` correcto en toggle | A11y |
| 73 | Icono estado cambia según `apiKeySaveStatus` | Edge |
| 74 | Tooltip "API Key is set" / "missing" | Edge |

`src/components/CurrencySelector/CurrencySelector.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 75 | Renderiza 33 opciones | Happy |
| 76 | Label "Convert From" / "Convert To" | Edge |
| 77 | `onChange` notifica código | Happy |
| 78 | Label asociado vía `htmlFor` | A11y |
| 79 | Altura mínima 44px | A11y |

`src/components/CurrencyRow/CurrencyRow.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 80 | Renderiza 2 selectores + swap | Happy |
| 81 | Swap llama `onSwap` | Happy |
| 82 | Swap `aria-label` | A11y |
| 83 | Swap target size 44px | A11y |

`src/components/ConversionControls/ConversionControls.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 84 | Calculate deshabilitado sin API key | Edge |
| 85 | Calculate deshabilitado amount ≤ 0 | Edge |
| 86 | "Calculating..." en loading | Edge |
| 87 | `fetchRate` llamado al clic | Happy |
| 88 | `<h1>` visuallyHidden presente | A11y |
| 89 | Amount input tiene `aria-valuemin` y `aria-valuenow` | A11y |

`src/components/ResultSection/ResultSection.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 90 | Muestra resultado formateado con rate > 0 | Happy |
| 91 | Muestra "--" con rate = 0 | Edge |
| 92 | `aria-live="polite"` en no-error | A11y |
| 93 | `aria-live="assertive"` en error | A11y |
| 94 | `aria-atomic="true"` | A11y |
| 95 | Muestra fuente (cache/api/error) | Edge |
| 96 | Refresh llama `onRefreshRates` | Happy |

`src/components/ConversionHistory/ConversionHistory.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 97 | Tabla con 7 columnas | Happy |
| 98 | Zebra striping | Edge |
| 99 | "No conversion history yet." vacío | Edge |
| 100 | Repeat llama `onRepeat` | Happy |
| 101 | Datos numéricos alineados derecha | A11y |
| 102 | `role="region"` + `aria-label` | A11y |
| 103 | `tabIndex={0}` en contenedor | A11y |

`src/components/AppMessageBar/AppMessageBar.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 104 | Visible cuando `visible=true` | Happy |
| 105 | Oculto cuando `visible=false` | Happy |
| 106 | `role="alert"` presente | A11y |
| 107 | Prefijo `[!]` en error | Edge |
| 108 | Prefijo `[OK]` en success | Edge |
| 109 | Prefijo `[?]` en warning | Edge |
| 110 | Dismiss llama `dismissMessage` | Happy |

`src/components/ThemeSwitcher/ThemeSwitcher.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 111 | `role="switch"` presente | A11y |
| 112 | `aria-checked` refleja `isDarkMode` | A11y |
| 113 | Toggle llama `toggleTheme` | Happy |

`src/components/ActionButtons/ActionButtons.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 114 | Abre diálogo confirmación | Happy |
| 115 | Confirmar ejecuta `onClearAll` | Happy |
| 116 | Cancelar cierra diálogo | Edge |
| 117 | Diálogo borde sólido verde | Edge |

`src/components/HistoryPanel/HistoryPanel.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 118 | Renderiza historial + clear button | Happy |
| 119 | `aria-modal="true"` en diálogo abierto | A11y |
| 120 | ESC cierra diálogo | A11y |
| 121 | Foco atrapado en diálogo | A11y |
| 122 | Un solo diálogo abierto (exclusión mutua) | Edge |

`src/components/RateSourceIndicator/RateSourceIndicator.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 123 | "Loading..." en loading | Happy |
| 124 | "(cached)" + tooltip | Edge |
| 125 | "(live)" + tooltip | Edge |
| 126 | "Error fetching rate" rojo | Error |
| 127 | `null` en idle | Edge |

`src/components/EmptyState/EmptyState.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 128 | Renderiza mensaje | Happy |
| 129 | `role="status"` | A11y |
| 130 | Borde dashed | Edge |
| 131 | Botón de acción clickeable | Happy |

`src/App.test.tsx`:

| # | Caso | Tipo |
|---|---|---|
| 132 | Renderiza sin errores | Happy |
| 133 | Layout columna en ≤768px | Edge |
| 134 | Card sin box-shadow | Edge |
| 135 | Card con borde sutil | Edge |

### 6.6 Tests E2E — Playwright

`e2e/conversion.spec.ts`:

| # | Caso | Tipo |
|---|---|---|
| 136 | Flujo: API key → monedas → amount → Calculate → resultado + historial | Happy |
| 137 | Swap recalcula | Happy |
| 138 | Repeat restaura valores | Happy |
| 139 | Limpiar historial con diálogo | Edge |
| 140 | Limpiar todo con diálogo | Edge |

`e2e/theme.spec.ts`:

| # | Caso | Tipo |
|---|---|---|
| 141 | Toggle dark/light cambia apariencia | Happy |
| 142 | Tema persiste tras recargar | Edge |
| 143 | `prefers-color-scheme` respetado | Edge |
| 144 | Contraste 7:1 en ambos temas | A11y |

`e2e/error-handling.spec.ts`:

| # | Caso | Tipo |
|---|---|---|
| 145 | API key inválida → mensaje + invalid | Error |
| 146 | Sin key → Calculate deshabilitado | Edge |
| 147 | Misma moneda → 1.0 sin API | Edge |
| 148 | Amount=0 → deshabilitado | Edge |
| 149 | API caída → error + rateSource error | Error |
| 150 | Caché expirado → refresh refetch | Edge |

`e2e/accessibility.spec.ts`:

| # | Caso | Tipo |
|---|---|---|
| 151 | Navegación completa por teclado | A11y |
| 152 | Foco visible en todos los interactivos | A11y |
| 153 | Diálogos atrapan foco | A11y |
| 154 | ESC cierra diálogos | A11y |
| 155 | `aria-live` anuncia cambios | A11y |
| 156 | App operable sin mouse | A11y |

---

## ⚡ FASE 7 — Rendimiento

| Acción | Detalle |
|---|---|
| `React.lazy` + `Suspense` | `HistoryPanel` + `ErrorBoundary` fallback |
| `React.memo` | `CurrencySelector`, `CurrencyRow`, `ResultSection`, `RateSourceIndicator` |
| `useDeferredValue` | Aplicar a `conversionHistory` para evitar bloqueo de renderizado de tabla |
| `useTransition` | Envolver `toggleTheme` para cambio de tema no bloqueante |
| Cache en memoria | `FreeCurrency.ts`: evitar `JSON.parse` repetido de localStorage. Mapa `Map<string, {timestamp, rates}>` en módulo |
| `manualChunks` | Ya separa `react`, `react-dom`, `fluent`. Verificar que fonts no dupliquen bundle (cargar vía `@font-face` en CSS, no inline) |
| `preload` fonts | `<link rel="preload" as="font" crossorigin>` para Figtree y IBM Plex Mono en `index.html` |
| Bundle size | `vite build` con `--debug` para verificar que Fluent UI tree-shaking funciona. Peso objetivo: <200KB gzip total |

---

## 🔁 Workflow de Implementación por Ramas

### Reglas de hierro

| Regla | Detalle |
|---|---|
| **Git** | `git flow feature start <rama>` en local. Ramas descriptivas, sin número de FASE |
| **Push** | **PROHIBIDO ejecutar `git push`**. Solo el usuario hace push de `develop` o `main` |
| **Commit** | Uno por cada micro-cambio TDD. Inglés, Conventional Commits, imperativo |
| **Ciclo TDD** | RED (test + commit) → GREEN (código + commit) → REFACTOR (limpieza + commit) |
| **Gate** | Antes de `git flow feature finish`: `pnpm run lint && biome format --check && ls-lint && vitest run && vite build` |
| **Context** | Actualizar `context.md` al terminar `git flow feature finish` |
| **Notificación** | Al finalizar cada rama, se notifica al usuario para que haga `git flow feature publish` y push |

### Ramas (locales, en orden de ejecución)

| Rama | FASE | Cambios principales |
|---|---|---|
| `feature/dependency-update-plan` | 0 | Documentar versiones en catalog + package.json + checklist. No ejecuta `pnpm install` |
| `feature/security-infrastructure` | 1 | CSP, HSTS, headers nginx, .dockerignore, Dockerfile NODE_VERSION, .env check |
| `feature/neon-theme` | 2 | `neonTheme.ts` (BrandVariants + tokens), `fonts.css`, `globalStyles.ts`, `main.tsx`, `main.css` |
| `feature/accessibility-wcag` | 3 | `lang`, skip-link, `aria-*`, `role`, `prefers-reduced-motion`, target size 44px |
| `feature/component-adaptations` | 4 | Estilos neon-code en componentes existentes, sin romper Fluent |
| `feature/hook-architecture` | 5 | `useApiKey`, `useConversion`, `useConversionHistory`, `useAppMessage`, `useTheme`, `ErrorBoundary`, tipos, refactor `App.tsx` |
| `feature/tdd-test-suite` | 6 | Tests unitarios (servicios + hooks), tests integración (componentes 68-135), mocks (`matchMedia`, `BroadcastChannel`), `vitest.config.ts`, `playwright.config.ts` |
| `feature/performance-optimizations` | 7 | `React.lazy`, `React.memo`, `useDeferredValue`, `useTransition`, font preload, bundle size |

### Ejemplo de secuencia de commits en `feature/security-infrastructure`

```
test(config): verify CSP header is present in nginx response    ← RED
feat(config): add Content-Security-Policy header to nginx.conf  ← GREEN
refactor(config): extract CSP policy into nginx variable         ← REFACTOR
test(config): verify HSTS header with max-age=63072000           ← RED
feat(config): add Strict-Transport-Security header to nginx.conf ← GREEN
test(config): verify Permissions-Policy restricts camera/mic     ← RED
feat(config): add Permissions-Policy header to nginx.conf        ← GREEN
test(config): verify Cross-Origin headers block MIME sniffing    ← RED
feat(config): add X-Content-Type-Options + X-Frame-Options       ← GREEN
test(config): verify .dockerignore excludes .env from image      ← RED
feat(config): create .dockerignore with security exclusions      ← GREEN
refactor(docker): fix Dockerfile NODE_VERSION=22-alpine          ← REFACTOR
─── GATE ───
pnpm run lint && biome format --check && ls-lint && vitest run && vite build
─── FINISH ───
git flow feature finish security-infrastructure
git checkout develop && npm version patch --no-git-tag-version
Actualizar context.md
─── TE NOTIFICO PARA QUE HAGAS PUSH ───
```

### Verificación pre-finish (por rama)

Antes de `git flow feature finish`, ejecutar en este orden:

```bash
pnpm run lint              # oxlint sin errores
biome format --check .     # formato consistente
npx ls-lint                # naming de archivos correcto
pnpm vitest run            # suite completa en verde
pnpm vite build            # build sin errores
```

Si algo falla, arreglar con nuevos commits. **Nunca amend ni rebase.**

---

## 📐 Orden de Ejecución (deprecado por 🔁 Workflow de Implementación por Ramas)

<details>
<summary>Referencia histórica — hacer clic para expandir</summary>

```
  0. Actualizar dependencias: pnpm-workspace.yaml catalog + package.json + .gitignore
     → pnpm install (aprobación explícita requerida)
     → Verificar build + lint post-update
  1. Seguridad infra (CSP, HSTS, .dockerignore, .env check, Dockerfile NODE_VERSION)
  2. Configurar vitest.config.ts + playwright.config.ts + setup
  ─── INICIO CICLO TDD ───
  4. RED   → Escribir tests de caracterización de servicios (casos 1-25, 27)
  5. GREEN → Verificar que pasan con código ACTUAL (sin modificar)
  6. RED   → Escribir tests de hooks (casos 28-67) — FALLAN
  7. RED   → Escribir tests de nuevo comportamiento (caso 26, API key en header)
  8. RED   → Escribir tests de integración (casos 68-135) — FALLAN
  9. GREEN → Implementar hooks (useApiKey, useConversion, useConversionHistory, useAppMessage)
  10. GREEN → Implementar tema neon-code (neonTheme.ts, fonts, main.tsx, globalStyles)
  11. GREEN → Adaptar componentes a neon-code
  12. GREEN → Todos los tests unitarios + integración deben pasar
  13. REFACTOR → Limpiar App.tsx, eliminar código muerto, centralizar tipos, añadir ErrorBoundary
  14. RED   → Escribir tests E2E (casos ~136-156+)
  15. GREEN → Ejecutar E2E, ajustar hasta que pasen
  ─── FIN CICLO TDD ───
  16. oxlint + biome format --check
  17. ls-lint (verificar naming de nuevos archivos: hooks=camelCase, componentes=PascalCase, config=kebab-case)
  18. vite build + verificar bundle size <200KB gzip
  19. docker compose config
  20. axe DevTools → contraste 7:1 en ambos temas
  21. Verificar CSP sin errores en consola
  22. Lighthouse audit en producción → ≥95 perf, ≥100 a11y, ≥90 best practices
  23. Actualizar context.md
```
</details>

---

## 🗂️ Archivos

### Crear

| Archivo | Propósito |
|---|---|
| `src/theme/neonTheme.ts` | Tema Fluent + neon-code (BrandVariants) |
| `src/styles/fonts.css` | @font-face Figtree + IBM Plex Mono |
| `src/styles/globalStyles.ts` | makeStyles globales (reemplaza main.css) |
| `src/hooks/useApiKey.ts` | API key state + debounce |
| `src/hooks/useConversion.ts` | Conversión state + fetchRate |
| `src/hooks/useConversionHistory.ts` | Historial state + CRUD |
| `src/hooks/useAppMessage.ts` | Toast messages state |
| `src/hooks/useTheme.ts` | Theme context |
| `src/types/index.ts` | Tipos centralizados |
| `src/components/EmptyState/EmptyState.tsx` | Estado vacío |
| `src/components/ErrorBoundary/ErrorBoundary.tsx` | Captura errores lazy components |
| `src/services/LocalStorage.test.ts` | Tests unitarios (18 casos) |
| `src/services/FreeCurrency.test.ts` | Tests unitarios (11 casos) |
| `src/hooks/useApiKey.test.ts` | Tests hook (15 casos) |
| `src/hooks/useConversion.test.ts` | Tests hook (16 casos) |
| `src/hooks/useConversionHistory.test.ts` | Tests hook (9 casos) |
| `src/hooks/useAppMessage.test.ts` | Tests hook (9 casos) |
| `src/components/AppHeader/AppHeader.test.tsx` | Tests integración (7) |
| `src/components/CurrencySelector/CurrencySelector.test.tsx` | Tests integración (5) |
| `src/components/CurrencyRow/CurrencyRow.test.tsx` | Tests integración (4) |
| `src/components/ConversionControls/ConversionControls.test.tsx` | Tests integración (6) |
| `src/components/ResultSection/ResultSection.test.tsx` | Tests integración (7) |
| `src/components/ConversionHistory/ConversionHistory.test.tsx` | Tests integración (7) |
| `src/components/AppMessageBar/AppMessageBar.test.tsx` | Tests integración (7) |
| `src/components/ThemeSwitcher/ThemeSwitcher.test.tsx` | Tests integración (3) |
| `src/components/ActionButtons/ActionButtons.test.tsx` | Tests integración (4) |
| `src/components/HistoryPanel/HistoryPanel.test.tsx` | Tests integración (5) |
| `src/components/RateSourceIndicator/RateSourceIndicator.test.tsx` | Tests integración (5) |
| `src/components/EmptyState/EmptyState.test.tsx` | Tests integración (4) |
| `src/components/ErrorBoundary/ErrorBoundary.test.tsx` | Tests integración (2: renderiza children, muestra fallback en error) |
| `src/App.test.tsx` | Tests integración (4) |
| `src/test/setup.ts` | Setup testing-library |
| `vitest.config.ts` | Config Vitest |
| `playwright.config.ts` | Config Playwright |
| `e2e/conversion.spec.ts` | E2E (5) |
| `e2e/theme.spec.ts` | E2E (4) |
| `e2e/error-handling.spec.ts` | E2E (6) |
| `e2e/accessibility.spec.ts` | E2E (6) |
| `.dockerignore` | Excluir .env |
| `assets/fonts/Figtree/` | Fuente sans-serif + OFL.txt |
| `assets/fonts/IBM_Plex_Mono/` | Fuente monospace + OFL.txt |

### Modificar

| Archivo | Cambios |
|---|---|
| `src/main.tsx` | neonDarkTheme/neonLightTheme, prefers-color-scheme, useGlobalStyles |
| `src/App.tsx` | Orchestrator (~100 líneas), conectar hooks |
| `src/styles/main.css` | Reducir a import de fonts.css |
| `src/services/LocalStorage.ts` | Cifrado API key, trim interno, type guard historial |
| `src/services/FreeCurrency.ts` | API key en header HTTP |
| `src/components/AppHeader/AppHeader.tsx` | autocomplete, aria-expanded, estilos neon |
| `src/components/AppMessageBar/AppMessageBar.tsx` | role alert, prefijos |
| `src/components/ConversionControls/ConversionControls.tsx` | Hooks, aria-valuemin/now, estilos neon |
| `src/components/HistoryPanel/HistoryPanel.tsx` | Hooks, estilos neon, exclusión diálogos |
| `src/components/CurrencyRow/CurrencyRow.tsx` | Estilos neon |
| `src/components/CurrencySelector/CurrencySelector.tsx` | Estilos neon |
| `src/components/ResultSection/ResultSection.tsx` | aria-live condicional, Number.isFinite |
| `src/components/RateSourceIndicator/RateSourceIndicator.tsx` | Estilos neon |
| `src/components/ThemeSwitcher/ThemeSwitcher.tsx` | role switch, aria-checked |
| `src/components/ActionButtons/ActionButtons.tsx` | Limpiar props no usadas |
| `src/components/History/ConversionHistory.tsx` | role region, tabIndex, monospace |
| `nginx.conf` | CSP, HSTS, Permissions-Policy, Cross-Origin headers |
| `index.html` | CSP meta tag, `<link rel="preload">` para fonts, `lang="en"`, skip-link |
| `Dockerfile` | Fijar NODE_VERSION=22-alpine |
| `package.json` | Scripts test + dependencias |
| `pnpm-workspace.yaml` | Catalog: test deps, versiones actualizadas |
| `vite.config.ts` | Sin cambios estructurales |
| `.gitignore` | coverage/, e2e/test-results/, playwright-report/ |
| `src/vite-env.d.ts` | Añadir `/// <reference types="vitest/globals" />` |

### Eliminar

| Archivo | Razón |
|---|---|
| `src/components/ApiKeySection/ApiKeySection.tsx` | No usado |
| `src/components/Buttons/primary/ButtonPrimary.tsx` | No usado |
| `src/components/Buttons/secondary/ButtonSecondary.tsx` | No usado |
| `src/components/Buttons/danger/ButtonDanger.tsx` | No usado |

---

## 📊 Cobertura Objetivo

| Capa | Líneas | Ramas | Funciones |
|---|---|---|---|
| Servicios | ≥ 95% | ≥ 90% | ≥ 95% |
| Hooks | ≥ 90% | ≥ 85% | ≥ 90% |
| Componentes | ≥ 85% | ≥ 80% | ≥ 85% |
| E2E | 100% user journeys | N/A | N/A |

---

## ⚠️ Riesgos y Decisiones

1. **Shadow tokens a `'none'`**: Si `DialogSurface` pierde backdrop visual, restaurar shadow solo para ese componente
2. **Border radius**: Fluent v9.73 ya tiene `borderRadiusMedium=4px`. Solo sobrescribir Large/XLarge
3. **Font weight 500**: Solo dark mode. Light permite 600 (Ley de Irradiación no aplica)
4. **Lucide icons**: NO reemplazar Fluent icons. Fluent provee accesibilidad built-in
5. **Griffel vs CSS global**: Priorizar `makeStyles` sobre `main.css`
6. **Node engine**: `>=24.0.0` en package.json — verificar si es typo. Node 22 es el actual LTS
7. **API key header**: Kong API Gateway lo soporta — verificado
8. **Select flecha**: No se puede usar `::after` CSS. Usar slot `expandIcon` de Fluent
9. **Card appearance**: No existe prop `appearance` en v9.73. Usar `makeStyles`
10. **lint-staged v17**: Breaking changes vs v16. Verificar compatibilidad con `.lintstagedrc.json`
11. **`autocomplete="new-password"`**: Workaround para navegadores que ignoran `off`
12. **Dialog exclusión mutua**: Estado global o ref compartido para evitar 2 diálogos simultáneos
13. **globalStyles.ts vs body**: `body` está fuera del árbol React → `makeStyles` no lo alcanza. Mantener estilos de body en `main.css`
14. **Font preload**: Cargar Figtree + IBM Plex Mono sin bloquear render. Usar `<link rel="preload">` con `font-display: swap`
15. **@vitejs/plugin-react + @fluentui/react-icons**: Catalog los incluye pero `node_modules` no los tiene → `pnpm install` obligatorio post-actualización
16. **skip-link visible-on-focus**: Implementar como primer elemento del body, oculto hasta `:focus-visible`
17. **`prefers-reduced-motion`**: Respetar preferencia del SO. Deshabilitar animaciones CSS (`transition`, `transform scale`, fade-in de tabla) cuando `prefers-reduced-motion: reduce`
18. **Fonts no cargan**: Si Figtree/IBM Plex Mono fallan (red lenta, bloqueadas), el fallback `system-ui` y `Consolas` en `fontFamilyBase`/`fontFamilyMonospace` mantiene la app funcional
19. **`Number.MAX_SAFE_INTEGER`**: Amounts > `9,007,199,254,740,991` pierden precisión. Validar con `Number.isSafeInteger()` o `BigInt` para montos financieros
20. **Paste en API key**: El evento `onPaste` debe disparar `handleApiKeyChange` para validar inmediatamente. Actualmente solo `onChange` reacciona
21. **Multi-tab localStorage race**: Dos pestañas escribiendo `localStorage` simultáneamente. Usar `BroadcastChannel` API para sincronizar estado entre tabs (API key, tema, historial)
22. **FluentProvider sin tema**: Si `theme` es `undefined`/`null`, Fluent usa `webLightTheme` como fallback. La UI se vuelve azul Fluent por defecto. Proteger con valor inicial garantizado
23. **Screen reader anuncios duplicados**: `aria-live` regions múltiples pueden causar anuncios redundantes. Consolidar en una sola `aria-live` region en `ResultSection` con prioridad `assertive` > `polite`
24. **`vite build` sin `.env.production`**: Si no existe, `VITE_DEBUG` y `VITE_LOG_LEVEL` se heredan de `.env.development`. Documentar que `.env.production` es obligatorio para deploy

---

*Plan v1.3 — 2026-06-13. 52 mejoras en 3 rondas de auditoría. 24 side cases documentados con mitigación. 8 ramas git flow feature locales, sin push automático. FASE 0 documental (no ejecutada sin aprobación explícita).*
