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
- **2026-06-20: Reestructuración agentic — skills unificadas en skills/**
  - Detalle: Migración de skills `fluent-ui-react` (229 líneas) y `modern-linting` (204 líneas) desde `.agents/skills/` y `.gemini/skills/` a `skills/` (directorio raíz). Eliminación de `.agents/` y `.gemini/` (866 líneas duplicadas). Registro formal de skills en `.ia/project_manifest.yml` (sección `skills_registry`). Corrección de `commands.test` y limpieza de `.ls-lint.yml` (`.gemini` → `skills` en ignore). Creación de `skills/README.md`.
  - QA: `npx ls-lint` sin errores. Diferencia de SKILL.md confirmada idéntica entre fuentes y destino.
  - Commit: `refactor(agent): consolidate skills into skills/, remove .agents and .gemini`

- **2026-06-20: Inicialización del sistema de agente local (.ia/)**
  - Detalle: Creación de la estructura `.ia/` con `project_manifest.yml`, `AGENTS.md` local y `memory/context.md` como memoria persistente del agente. Integración con el `AGENTS.md` raíz mediante regla de coexistencia.
  - QA: Verificación de que `.ia/AGENTS.md` no supera 150 líneas. Coexistencia validada: no se modificó el `AGENTS.md` raíz.
  - Commit: `chore(agent): add local agent configuration (.ia/)`
