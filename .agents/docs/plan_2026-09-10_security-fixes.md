# Plan — Security fixes (auditoría 2026-09-10)

Fuente: `.agents/docs/security_report.md`. Implementación TDD en Gate 7 (build).

- [✓] **T1 (Alta):** `getCurrencyRate()` usa `calculateRate()` en cache-hit + test de valor numérico no-USD
  - RED: `FreeCurrency.test.ts` → "returns cross-rate (not USD-based rate) on in-memory cache hit" (falló: 0.73 vs 0.8588)
  - GREEN: `FreeCurrency.ts:162` → `calculateRate(memoryEntry.rates, fromCurrency, toCurrency)`
- [✓] **T2 (Media):** overrides/catálogo CVE — `fast-uri >=4.1.3`, `vitest`/`@vitest/coverage-v8 ^4.1.11`
  - Lockfile auto-sincronizado por pnpm (vitest 4.1.11, fast-uri 4.1.4). `node_modules` aún con binarios previos.
  - ✅ `pnpm install` ejecutado (aprobación usuario 17:09): `fast-uri 4.1.4` + `vitest 4.1.11` en disco; `pnpm audit` → 0 vulns
- [✓] **T3 (Baja):** Dockerfile endurecido — pins por digest + `nginxinc/nginx-unprivileged` + `USER nginx` + `listen 8080`
  - RED: 4 tests nuevos (dockerfile ×3, nginx ×1) → GREEN. Digests resueltos vía `imagetools inspect`.
  - Validado: `docker build --target production` ✅ + smoke test (user `nginx`, HTTP 200 en 8080, headers CSP/HSTS intactos)
- [✓] **T4 (Soporte):** `vitest.config.ts` excluye `.deepsec/**` (el workspace DeepSec rompía `pnpm test` con 2000+ ficheros ajenos)
  - RED: `vitestConfig.test.ts` → GREEN. Full suite: 34 ficheros, 332 tests ✅
- [ ] **T5 (Informativo):** actualización general de las 26 deps desactualizadas — NO acometido (fuera de alcance YAGNI)
