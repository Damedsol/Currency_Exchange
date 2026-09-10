# History — build

## 2026-09-10: Security fixes (TDD)

**Origen:** `.agents/docs/security_report.md` (gate audit).

**Cambios:**
- `src/services/FreeCurrency.ts` — cache-hit en memoria usa `calculateRate()` (fix HIGH_BUG cross-rate).
- `src/services/FreeCurrency.test.ts` — nuevo test de regresión (valor numérico EUR→GBP en 2.º call).
- `pnpm-workspace.yaml` — `fast-uri >=4.1.3`, `vitest`/`@vitest/coverage-v8 ^4.1.11` (lockfile auto-sincronizado: vitest 4.1.11, fast-uri 4.1.4).
- `Dockerfile` — pins por digest (`node:24-alpine@sha256:50c8…`, `nginx-unprivileged:alpine@sha256:2dde…`), `USER nginx`, `EXPOSE 8080`.
- `nginx.conf` — `listen 8080`.
- `src/config/dockerfile.test.ts` (+3 tests), `src/config/nginx.test.ts` (+1 test).
- `vitest.config.ts` + `src/config/vitestConfig.test.ts` (nuevo) — excluye `.deepsec/**`.

**QA:**
- `pnpm vitest run` → 34 ficheros, 332 tests ✅ (tras excluir `.deepsec/**`; sin el fix, 55 fallos ajenos en `.deepsec/node_modules`)
- `tsc --noEmit` ✅ · `oxlint` ✅ · `check-filenames` ✅ · `biome check` (6 ficheros) ✅ · `vite build` 293ms ✅
- Comandos: `pnpm vitest run`, `pnpm exec tsc --noEmit`, `pnpm exec oxlint .`, `node scripts/check-filenames.mjs`, `pnpm exec vite build`

**Cierre 17:09 (tras aprobación):** `pnpm install` ✅ (fast-uri 4.1.4, vitest 4.1.11 en disco), `pnpm audit` → 0 vulns ✅, suite 332/332 con binarios nuevos ✅.

**Reviewer (17:16):** ✅ APROBADO → /scribe. 0 hallazgos; 6 tests KEEP, 0 REMOVE. Sugerencias no bloqueantes: `**/node_modules/**` en vitest exclude, `console.log:69` pre-existente sin guarda DEV.

**Lecciones:** (1) `exclude: ["node_modules/**"]` no cubre `node_modules` anidados — cualquier workspace tool (DeepSec) rompe `pnpm test`; (2) pnpm v11 auto-sincroniza el lockfile al detectar el workspace desactualizado (sin tocar `node_modules`); (3) `docker build` valida pins por digest; `imagetools inspect --format '{{.Manifest.Digest}}'` da el digest pineable del índice multi-arch.
