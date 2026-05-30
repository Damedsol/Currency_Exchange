# Contexto del Proyecto: currencyExchange

## Estado del Proyecto
Migración e integración completa y exitosa a herramientas de análisis estático modernas (**Biome** y **Oxlint**), habiendo eliminado totalmente **ESLint** y **Prettier** sin provocar regresiones ni roturas.

## Decisiones Técnicas y Herramientas

### 1. Formateador Exclusivo: Biome
- **Decisión:** Usar Biome únicamente como formateador de código para el espacio de trabajo.
- **Configuración (`biome.json`):**
  - **Formateador:** Mapea con precisión absoluta las reglas de `.prettierrc.json` (uso de tabuladores, ancho 2, ancho de línea 80, comillas dobles, comas finales en todo).
  - **Linter y Imports:** Deshabilitados por completo en Biome (`enabled: false`) a petición del usuario.

### 2. Linter Único: Oxlint
- **Decisión:** Utilizar `oxlint` como el único y exclusivo linter de código del proyecto tras la remoción de ESLint.
- **Flujo:** Las comprobaciones de análisis estático y errores comunes de JavaScript/TypeScript se delegan en su totalidad a Oxlint.

### 3. File Linter: ls-lint
- **Decisión:** Garantizar coherencia en la estructura de archivos del proyecto.
- **Reglas:** PascalCase para componentes reactivos (`.tsx`), camelCase para estilos/servicios generales y dot-notation/kebab-case para archivos de configuración en la raíz.

### 4. Git Hooks: Lint-Staged
- **Configuración (`.lintstagedrc.json`):** Optimizado para ejecutar `oxlint` y `biome format --write` secuencialmente en el pre-commit de archivos de código, y `biome format --write` en estilos y JSON.

## Aprendizajes y Notas
- Biome y Oxlint reemplazan completamente la necesidad de ESLint y Prettier.
- Para limpiar completamente el espacio de trabajo local se deben borrar los archivos antiguos de configuración: `eslint.config.js` y `.prettierrc.json`.
