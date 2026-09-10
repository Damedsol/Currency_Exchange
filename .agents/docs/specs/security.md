# Spec — Seguridad (requisitos remediados 2026-09-10)

Origen: auditoría SCA + DeepSec (`security_report.md`). Todos completados [✓].

## Cálculo de tasas (integridad financiera)

- [✓] SEC-01 — `getCurrencyRate()` debe calcular el cross-rate con `calculateRate()` en **todos** los paths incluido el cache-hit en memoria (antes devolvía la tasa USD-based). Test de regresión: valor numérico en 2.º call para par no-USD.

## Dependencias (SCA)

- [✓] SEC-02 — `fast-uri >= 4.1.3` (override; cierra 4 advisories high GHSA-5jgf/f65p/fph4/jqff).
- [✓] SEC-03 — `vitest` / `@vitest/coverage-v8 >= 4.1.11` (path traversal `@vitest/mocker`).
- [✓] SEC-04 — `pnpm audit` debe reportar 0 vulnerabilidades tras cada bump.

## Endurecimiento de despliegue (IaC)

- [✓] SEC-05 — Imágenes base pineadas por digest SHA256 (node + nginx).
- [✓] SEC-06 — Stage de producción corre como usuario no-root (`nginxinc/nginx-unprivileged`, `USER nginx`, puerto 8080).
- [✓] SEC-07 — Ningún secreto versionado (solo `.env.example`); `.deepsec/` ignorado por git.

## Aislamiento de tests

- [✓] SEC-08 — `vitest.config.ts` excluye workspaces de tooling (`.deepsec/**`) para que `pnpm test` solo ejecute tests del proyecto.
