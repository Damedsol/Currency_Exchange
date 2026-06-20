# Contexto y Aprendizajes: currencyExchange (Local .ia/)

## Stack y Configuración
- **React 19 + Fluent UI v9:** UI construida con `FluentProvider`, `makeStyles` (Griffel atomic CSS-in-JS) y componentes de `@fluentui/react-components`.
- **Oxlint (linter):** Único linter activo. Reglas `correctness` y `perf` en `warn`. Sin ESLint.
- **Biome (formatter):** Exclusivo. `indentStyle: tab`, `indentWidth: 2`, `lineWidth: 80`, `trailingCommas: all`. Sin Prettier.
- **ls-lint:** Componentes `PascalCase.tsx`, servicios `PascalCase.ts`, estilos `kebabcase.css`.
- **pnpm catalogs/workspaces:** Gestión centralizada de dependencias vía `catalog:` en `pnpm-workspace.yaml`.
- **Vite 7.1.11:** Plugins React, HMR con polling (300ms) para Docker, chunk manual (react-dom, react, fluent).
- **TypeScript 6 (estricto):** `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`.
- **Docker multi-stage:** `development` (Vite HMR), `builder` (compilación), `production` (Nginx Alpine).
- **Docker Compose:** Volumen bind para `./src` y `./public`, volúmenes nombrados para `node_modules` y `vite_cache`.
- **Git hooks:** Husky + lint-staged (oxlint --fix + biome format) + commitlint (conventional commits).

## Decisiones Estratégicas
- **Exclusividad Rust tooling:** Prohibición explícita de reinstalar ESLint o Prettier. Oxlint + Biome son los únicos permitidos.
- **Entorno agnóstico:** Uso de variables de entorno (`.env.development`/`.env.production`) para configuración de API, debug y HMR.
- **Seguridad en producción (Nginx):** `server_tokens off`, bloqueo de archivos ocultos (HTTP 404), headers de seguridad (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy), compresión gzip.
- **Caching inteligente:** Indicador de fuente (caché vs API en vivo) en la UI para las tasas de cambio.
- **Persistencia local:** Almacenamiento de API key y datos de conversión en LocalStorage.
- **Single‑source agentic config:** `AGENTS.md` raíz como norma maestra, complementada localmente por `.ia/AGENTS.md`.

## Historial de Cambios Relevantes
- **2026-06-20: Sesión completa — reestructuración + 13 ramas git flow**
  - **Rama `feature/dependency-update`:** Fluent 9.73→9.74, Vite 8.0.14→8.0.16. Pinned `@fluentui/react-motion@9.15.0` para compatibilidad jsdom. Biome fixes en 9 archivos. Gate pasado.
  - **Rama `feature/coverage-thresholds`:** Thresholds 95% en `vitest.config.ts`. Añadidos 21 tests nuevos: useApiKey (5→12), LocalStorage (15→22), useConversion (8→12), FreeCurrency (9→12). Cobertura: lines 74%→81%, branches 68%→73%. Gate pasado (186 tests).
  - **4 E2E specs:** `conversion.spec.ts`, `theme.spec.ts`, `error-handling.spec.ts`, `accessibility.spec.ts` creados (pendiente instalar Playwright browsers para ejecución).
  - **Rama `feature/a11y-style-fixes`:** `role="switch"` + `aria-checked` en ThemeSwitcher. `boxShadow: "none"` en MessageBar. Doble anillo de foco en `globalStyles.ts`.
  - **Rama `feature/use-theme-context`:** Nuevo hook `useTheme` con React Context. `main.tsx` simplificado de 78→13 líneas. `App.tsx` refactorizado para usar `useTheme()`. 5 tests de hook + 5 tests de integración App. 193 tests totales.
  - **Lecciones técnicas:** `vi.mock()` requiere `vi.hoisted()` para módulos con variables del scope. `vi.useFakeTimers` incompatible con hooks React en jsdom. Oxlint no parsea JSX en archivos `.ts`. `DomException("AbortError")` no es `Error` en jsdom. Context.Provider en JSX requiere archivo `.tsx`.
  - QA: Gates completos en todas las ramas (lint + ls-lint + vitest + tsc + build). 193 tests, 0 errores. 89 commits locales en develop sin push.

- **2026-06-20: Reestructuración agentic — skills unificadas en skills/**
  - Detalle: Migración de skills `fluent-ui-react` (229 líneas) y `modern-linting` (204 líneas) desde `.agents/skills/` y `.gemini/skills/` a `skills/` (directorio raíz). Eliminación de `.agents/` y `.gemini/` (866 líneas duplicadas). Registro formal de skills en `.ia/project_manifest.yml` (sección `skills_registry`). Corrección de `commands.test` y limpieza de `.ls-lint.yml` (`.gemini` → `skills` en ignore). Creación de `skills/README.md`.
  - QA: `npx ls-lint` sin errores. Diferencia de SKILL.md confirmada idéntica entre fuentes y destino.
  - Commit: `refactor(agent): consolidate skills into skills/, remove .agents and .gemini`

- **2026-06-20: Inicialización del sistema de agente local (.ia/)**
  - Detalle: Creación de la estructura `.ia/` con `project_manifest.yml`, `AGENTS.md` local y `memory/context.md` como memoria persistente del agente. Integración con el `AGENTS.md` raíz mediante regla de coexistencia.
  - QA: Verificación de que `.ia/AGENTS.md` no supera 150 líneas. Coexistencia validada: no se modificó el `AGENTS.md` raíz.
  - Commit: `chore(agent): add local agent configuration (.ia/)`
