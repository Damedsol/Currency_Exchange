# Plan: Security Audit + Dependabot Config (2026-08-17)

## Objetivo
1. Auditar seguridad del proyecto (SCA/CVEs, secretos, XSS, infra, licencias) según reportes Dependabot y hallazgos propios.
2. Remediar hallazgos: 7 CVEs (3 HIGH + 4 MODERATE, todos dev-only) + endurecer almacenamiento de API key.
3. Configurar Dependabot (GitHub) para actualizaciones automáticas seguras.
4. Limpiar archivos transitorios (planes antiguos, artefactos de build, temporales).

## Alcance aprobado (usuario)
- 3 overrides SCA: `undici ^7.29.0`, `fast-uri >=4.1.2`, `nanoid ^3.3.18` (nuevo).
- API key: `localStorage` → `sessionStorage` (solo el apiKey; cachés no sensibles permanecen).
- `pnpm install` autorizado.
- Dependabot mínimo acorde al proyecto.
- Limpieza de transitorios (conservando los 326 tests del proyecto).

## Ejecución (TDD)
- **RED:** `src/config/dependabot.test.ts` (8 tests) falla (no existe `.github/dependabot.yml`).
- **GREEN:** `.github/dependabot.yml` (npm/pnpm v9, weekly, limit 5, 3 ignore críticos).
- **Bloque B:** `LocalStorage.ts` + `LocalStorage.test.ts` migrados a sessionStorage (318→326 tests).
- **Reviewer round 1:** 4 hallazgos (E2E localStorage, huérfanos node_modules, overrides inertes, comentarios) → corregidos en round 2.
- **Reviewer round 2:** APROBADO.

## Resultado
- `pnpm audit` → 0 advisories (baseline: 3 high / 4 moderate).
- 326/326 unit tests (33 files) · oxlint 0 err · tsc 0 err · build OK.
- Dependabot config con 3 ignore rules que evitan PRs que rompen el build (undici 8.x, nanoid 4.x, react-motion >9.15.0).

## Lecciones
- `>=` override con `resolutionMode: highest` puede saltar major fuera del rango declarado → preferir `^`.
- `pnpm install --force`/`prune` NO purgan huérfanos del virtual store local → eliminación manual.
- Verificar con `grep -E "^  <pkg>@" pnpm-lock.yaml` antes de eliminar overrides (casi se elimina `picomatch` por error).
- Dependabot `ignore` rules son esenciales para este repo (evitan PRs que rompen build).