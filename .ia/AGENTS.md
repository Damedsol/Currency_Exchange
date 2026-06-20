# 🤖 Agente Local: currencyExchange (.ia/)

## 📜 REGLA DE COEXISTENCIA (Gobernanza)
Este archivo es complementario al `AGENTS.md` raíz. No lo duplica, no lo reemplaza y no interactúa físicamente con él.
- **Obligatorio:** Lee y asimila el `AGENTS.md` raíz como norma técnica maestra (perfil, stack, tooling, guardrails).
- **Local:** Este archivo `.ia/AGENTS.md` extiende el workflow con políticas de persistencia de memoria local, buffer strategy y optimización de tokens.
- **Prohibido:** Escribir, modificar, sobrescribir o borrar el `AGENTS.md` raíz desde este agente.

## 🧠 Gestión del Conocimiento (memory/context.md)

1. **Lectura Obligatoria:** Leer `.ia/memory/context.md` al inicio de cada sesión para entender el estado actual, errores previos y decisiones técnicas.
2. **Actualización Continua:** Actualizar `.ia/memory/context.md` tras changes significativos, resolución de errores críticos o al finalizar la jornada.

### 🔄 Retroalimentación Dinámica
Analiza proactivamente la sección "Historial de Cambios Relevantes" en `.ia/memory/context.md`. Si identificas patrones de error repetidos o soluciones de arquitectura críticas estabilizadas, sugiere propuestas estructuradas al desarrollador para actualizar `.ia/AGENTS.md` y hacer evolucionar el workflow local.

## 🛡️ Safety Gates (Puertas de Seguridad)
- **Autorización humana explícita** requerida antes de:
  - Modificar variables de entorno (`.env`, `.env.*`).
  - Ejecutar migraciones de base de datos.
  - Instalar dependencias (`pnpm add`/`pnpm rm`).
- **Límite de reintentos:** Máximo 3 reintentos automáticos para cualquier acción fallida del sistema. Agotados, abortar y notificar al usuario.

## 💾 Sincronización de Memorias (Buffer Strategy)
- **Búfer Temporal:** Acumula en memoria interna los cambios de múltiples archivos durante la sesión. Escribe `.ia/memory/context.md` una sola vez al finalizar el trabajo, evitando escrituras redundantes.
- **Memoria Global:** Usa `.ia/memory/context.md` como única fuente de verdad para decisiones de negocio, reglas globales e histórico macro.
- **Memorias de Módulos (Opcional):** Crear `.ia/memory/[modulo]_context.md` exclusivamente para lógica técnica ultra-específica de módulos aislados y críticos.

## 📏 Criterios de Auditoría e Higiene de Tokens
- **Límite de `.ia/AGENTS.md`:** Si supera 150 líneas, detener la adición de guías directas y extraer documentación técnica extensa a archivos independientes en `.ia/docs/`.
- **Algoritmo de Compresión de Memoria** (si cualquier `context.md` supera 200 líneas):
  1. Conservar intactos solo los últimos 3 registros de cambios recientes con fechas y aprendizajes.
  2. Consolidar registros antiguos en un párrafo de "Historial Consolidado de Aprendizajes".
  3. Eliminar detalle granular antiguo para liberar contexto del LLM.

## 🧩 Estándares Técnicos (heredados de AGENTS.md raíz)
- **Core Linter:** Oxlint (no ESLint).
- **Formatter:** Biome (no Prettier).
- **File Linter:** ls-lint.
- **Runtime:** Node >= 24, pnpm >= 11.
- **Lenguaje de respuesta:** ESPAÑOL, siempre conciso y directo.
- **Calidad:** Autorevisión lógica de sintaxis, tipos e imports antes de proponer cambios. No ejecutar `tsc` o linters automáticamente a menos que el usuario lo solicite.
