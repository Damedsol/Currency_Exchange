# 🧠 Contexto del Proyecto y Aprendizajes: currencyExchange (Root)

Este documento registra dinámicamente los aprendizajes técnicos, decisiones arquitectónicas y el historial de cambios activos durante el desarrollo del proyecto.

## 🚀 Stack y Configuración (Aprendizajes)

- **Linter Primario:** **Oxlint** para análisis estático ultra-rápido sin ESLint. Reglas de corrección, rendimiento y sospechosas habilitadas en `.oxlintrc.json`.
- **Formateador Exclusivo:** **Biome** para formatear estéticamente archivos JS, TS, TSX, CSS y JSON en tiempo récord. El linter interno de Biome está deshabilitado para evitar conflictos.
  - *Configuración:* Mapea con precisión absoluta el uso de tabuladores, ancho 2, ancho de línea 80, comillas dobles y comas finales obligatorias.
- **Linter de Nombres de Archivos:** **ls-lint** garantiza la consistencia de nombres: componentes en `PascalCase.tsx`, utilidades/servicios en `camelCase.ts` y configuraciones en `kebab-case`/`dot-notation`.
- **UI & Framework:** **React 19** y **Fluent UI React Components v9** (`@fluentui/react-components`), inyectando el tema a través de `FluentProvider` y utilizando `makeStyles` (CSS-in-JS atómico de Griffel).
- **Gestión de Paquetes:** **pnpm** con prioridad absoluta en el entorno (usando catálogos/workspaces de pnpm).

## 🧠 Decisiones Estratégicas

- **Exclusividad de Linters/Formatters en Rust:** ESLint y Prettier fueron completamente eliminados del proyecto. Reinstalarlos está estrictamente prohibido.
- **Configuración Agéntica Local:** Adoptado el "Estándar Agéntico" a través de `/AGENTS.md` (archivo maestro raíz único, menos de 150 líneas) y el sistema de memoria `context.md`.
- **Skills Técnicas Locales:** Separación del conocimiento local en `.gemini/` (CLI) y `.agents/` (Antigravity IDE), con habilidades documentadas de más de 400 líneas para `modern-linting` y `fluent-ui-react`.

## 📈 Historial de Cambios Relevante

- **2026-05-30: Inicialización del Sistema Agéntico del Proyecto**
  - **Detalles del Cambio:**
    - Creado el archivo maestro `AGENTS.md` en la raíz (PROFILE, CONTEXT, INSTRUCTIONS, TOOLS & GUARDRAILS).
    - Creado el sistema de skills locales en `.gemini/skills/` y `.agents/skills/` para `modern-linting` y `fluent-ui-react`.
    - Actualizado el archivo de memoria estratégica `context.md` en la raíz.
  - **Lecciones de QA:** Verificado que `AGENTS.md` y `context.md` no violan los límites de líneas (<150 y <200 líneas respectivamente).
  - **Rama / Commit Asociado:** `feature/agentic-system`
