# Spec — Seguridad (requisitos remediados 2026-09-10, ampliado 2026-09-17)

Origen: auditoría SCA + DeepSec (`security_report.md`). SEC-01..SEC-08 completados [✓] el 2026-09-10; SEC-09..SEC-12 añadidos por el ciclo de advisories del 2026-09-17 (`change_spec.yaml: security-advisories-and-dependency-refresh`).

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

## Advisories + política de overrides (2026-09-17)

- [✓] SEC-09 — `pnpm audit` debe reportar 0 vulnerabilidades **y** el barrido completo del lockfile contra OSV/GitHub Advisory DB debe salir limpio (385/385 el 2026-09-17). Evidencia reproducible: `.agents/.state/scan-advisories.mjs` + `GET api.github.com/advisories?affects=`.
- [✓] SEC-10 — Todo `override` de `pnpm-workspace.yaml` está **acotado a su major** (`^X.Y.Z` o `>=X.Y.Z <X+1.0.0`); los pins exactos requieren comentario justificativo (`@fluentui/react-motion 9.15.0`). Contrastado por `src/config/overrides.test.ts`.
- [✓] SEC-11 — El floor de cada override es **≥ la versión que corrige el advisory conocido**: `js-yaml ^4.3.2` (GHSA-2883/52cp/5p4m/h67p), `picomatch ^4.0.4` (GHSA-3v7f-55p6-f55p), `yaml ^2.8.3` (GHSA-48c2-rrv3-qjmp), `fast-uri >=4.1.3 <5.0.0`, `postcss >=8.5.18 <9.0.0`, `undici ^7.29.0`, `nanoid ^3.3.18`. Guard: test "never resolves below a known advisory fix version".
- [✓] SEC-12 — El estado runtime del arnés (`.agents/.state/`) **nunca se commitea** (`.gitignore:43`), verificado por efecto con `git check-ignore` y por contrato (`src/config/gitignore.test.ts`). Dependabot agrupa minor/patch (`groups.minor-and-patch`) y documenta cada `ignore`.

### Pendiente (fuera de este ciclo)

- SEC-13 (Cycle B) — refresco de catálogo dentro de major: `@fluentui/react-components` 9.74.1→9.74.7, `@fluentui/react-icons` 2.0.328→2.0.341, `react`/`react-dom` 19.2.6→19.3.0, `vite` 8.0.16→8.3.0, `@vitejs/plugin-react` 6.0.2→6.1.1, `playwright`/`@playwright/test` 1.60.0→1.63.0, `@biomejs/biome` 2.4.15→2.5.x, `oxlint` 1.66.0→1.8x, `@testing-library/*`; requiere aprobación (`pnpm install`).
- SEC-14 (Cycle B) — frescura de parches en los overrides (`pnpm up undici fast-uri postcss picomatch yaml nanoid`); `minimumReleaseAge` puede diferirlo; nunca `--force`.
- SEC-15 (Cycle C) — CI que ejecute `pnpm audit` + tests en cada PR (`.github/workflows/ci.yml`, requiere aprobación de infra).
- SEC-16 (Cycle C) — decisión sobre `.deepsec/` (761 MB, workspace de tooling no auditado): borrado pendiente de OK explícito; si se borra, el `exclude` de `vitest.config.ts` queda inerte y debe retirarse.
