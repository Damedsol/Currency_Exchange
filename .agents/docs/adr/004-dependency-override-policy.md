# ADR-004 — Política de overrides de dependencias: major acotado + floor de advisory

- **Fecha:** 2026-09-17
- **Estado:** aceptada
- **Contexto del ciclo:** `.agents/docs/plan_2026-09-17_security-advisories-deps.md` · review aprobado `review_2026-09-17_security-advisories-deps.md`
- **Supera/historia:** lección de `.agents/docs/plan_2026-08-17_security-audit-dependabot.md` (`>=` + `resolutionMode: highest` puede saltar de major)

## Contexto

`pnpm-workspace.yaml` usa `resolutionMode: highest` y una sección `overrides` como herramienta de seguridad (fuerza versiones parcheadas en dependencias transitivas). El 2026-08-17 se añadió `"js-yaml": ">=4.3.0"` con la intención de quedarse en la línea 4.x; con `highest`, pnpm resolvió **5.2.2** — un major distinto del previsto, en una librería que `@commitlint/*` consume con la API 4.x. El fallo era silencioso: los tests de la SPA no ejercitan commitlint.

En paralelo, el usuario reportó "security advisories" en el repositorio. La investigación (ciclo 2026-09-17) mostró que esos advisories eran reales pero **históricos**: `picomatch@2.3.1`, `minimatch@3.1.2`, `brace-expansion@1.1.12`, `flatted@3.3.3`, `yaml@2.8.2`, `vite@7.1.11`, `js-yaml@4.1.1` (pre-Vite-8). Ninguna de esas versiones existía ya en el lockfile: lo que quedaba vivo eran 6 ramas `origin/dependabot/*` y `hotfix/security-dependabot-18`.

## Decisión

1. **Todo override está acotado a su major**: `^X.Y.Z` o `>=X.Y.Z <X+1.0.0`. Un `>=` desnudo está prohibido.
2. **Todo override sensible a seguridad tiene un floor ≥ la versión que corrige el advisory conocido**; ese floor es un requisito ejecutable, no un comentario.
3. **Pins exactos solo con justificación en línea** (caso vigente: `@fluentui/react-motion 9.15.0`, incompatibilidad de jsdom 29 con ≥9.16).
4. **El floor nunca exige una versión más nueva que la instalada**: `minimumReleaseAge: 7200` filtra releases recientes y un floor inalcanzable haría fallar la resolución. La frescura de parches se consigue con un `pnpm up` aprobado, no subiendo el rango.
5. **La fuente de verdad de advisories es GitHub Advisory DB / OSV** (lo que alimenta Dependabot), no `pnpm audit`: `pnpm audit` puede dar 0 mientras el repositorio muestra alertas.

## Consecuencias

- **Guard ejecutable:** `src/config/overrides.test.ts` (7 tests): acotado de major, pins documentados, floors de advisory, y el lockfile resolviendo js-yaml en 4.x. El guard encontró un hueco real en su primer RED (`floor 4.3.0 < fix 4.3.2`).
- **Coste:** cada bump de un override exige actualizar el test si cambia el floor; es intencional (obliga a decidir la versión de forma explícita).
- **Comportamiento:** `pnpm install` **no** refresca resoluciones existentes (`preferFrozenLockfile`); `pnpm up` es una acción explícita y aprobada.
- **Riesgo aceptado:** la línea 4.x de `js-yaml` es mantenimiento (`v4-legacy` en el registro) y está parcheada (4.3.2 cubre GHSA-2883/52cp/5p4m/h67p); migrar a 5.x es un cambio de major que requiere su propio ciclo.
- **No aplica al runtime de la app:** ninguno de estos paquetes entra en el bundle (dev/build-time), pero sí en la cadena de suministro de CI/commits.
