# Review — Security advisories + dependency refresh · Cycle A (2026-09-17)

Plan: `.agents/docs/plan_2026-09-17_security-advisories-deps.md` · Spec: `.agents/docs/specs/change_spec.yaml` · Handoff: `/build` (Cycle A, T1–T5) · Review: 2026-09-17 14:05

## Candidato congelado (evidencia, no narración)

`git diff --stat` → **6 tracked / +110 −26** · untracked nuevo: `src/config/overrides.test.ts` **160 líneas**.
Código/config no generado = **4 ficheros ≈ 205 líneas** (`pnpm-workspace.yaml`, `.github/dependabot.yml`, `src/config/dependabot.test.ts`, `src/config/overrides.test.ts`); `pnpm-lock.yaml` es generado. **Workload ≤5/400 ✅** (R2).

## VERIFY

| Req | Estado | Evidencia verificada |
|---|---|---|
| **R1** SCA evidence antes/después | ✅ | `pnpm audit --audit-level=low` → `No known vulnerabilities found` (exit 0, re-ejecutado por el reviewer). `node .agents/.state/scan-advisories.mjs` → **385/385 paquetes, 0 advisories** (OSV). **2.ª fuente independiente**: `GET api.github.com/advisories?ecosystem=npm&affects=` sobre los 7 overrides → `clean` en los 7. Informe en `.agents/docs/security_report.md`. |
| **R2** overrides con cota de major | ✅ | `pnpm-workspace.yaml:47-58`: `fast-uri >=4.1.3 <5.0.0`, `postcss >=8.5.18 <9.0.0`, resto con `^`; único pin exacto `@fluentui/react-motion 9.15.0` documentado. Contrato: `overrides.test.ts` (test "keeps every override inside its intended major"). |
| **R3** floors ≥ advisory fix | ✅ | Resuelto: `js-yaml@4.3.2`, `picomatch@4.0.4`, `yaml@2.8.3`, `fast-uri@4.1.4`, `postcss@8.5.23`, `undici@7.29.0`, `nanoid@3.3.18`. Guard ejecutable "never resolves below a known advisory fix version" (7 floors). El test **encontró un hueco real** en su primer RED (`js-yaml: floor 4.3.0 < fix 4.3.2`) y el floor se subió a `^4.3.2`. Amplitud de spec: `/build` reescribió el *acceptance* de R3 (frescura de parches → `pnpm up` aprobado aparte) — **cuestionable en gobernanza** (es decisión de `/plan`), pero está declarado en el plan ("Deviation from R3 (documented, not silent)") y el spec lo refleja: se acepta como ⚠️ no bloqueante. |
| **R4** catálogo | ⏸ fuera de alcance | Cycle B (T6–T7) por diseño del plan; `change_spec.yaml` sigue `active`. No es gap de este ciclo. |
| **R5** Dependabot | ✅ | `groups.minor-and-patch` (patterns `*`, update-types minor+patch) + los 3 `ignore` con comentario de causa. Contrato: `dependabot.test.ts` 10 tests. |
| **R6/R7** | ⏸ fuera de alcance | Cycle C (T8–T10), requieren aprobación de infra/E1. |

**TASKS del plan:** Cycle A T1–T5 **5/5 [✓]** con evidencia; T6–T10 intactos (Cycles B/C).
Edges cubiertos: drift de lockfile (auto-sync de pnpm documentado), `minimumReleaseAge` (no se usa `--force`), resolubilidad de rangos (floor = versión instalada), y `commitlint` smoke test para el downgrade de `js-yaml` (`0 problems`).

## QA (higiene sobre los ficheros tocados)

✅ Sin `catch` silenciosos, sin `console.*` en los ficheros tocados (grep), sin secretos, sin TODO/FIXME.
✅ `overrides.test.ts` 160 líneas (<300), funciones ≤22 líneas (`readOverrides`), anidamiento ≤3, un solo propósito.
✅ Ningún fichero de producción `src/**` tocado — solo `src/config/*.test.ts` (riesgo runtime 0 salvo la resolución de deps, validada con 343 tests + commitlint).

❌ **ID-01 [QA] — artefactos de estado sin ignorar, violando una regla escrita del arnés.**
`prompts/audit.md` dice literalmente: *"Cache 24h en `.agents/.state/audit_cache.json` (**nunca commitear**)"*. Hoy:
- `.agents/.state/` aparece como **untracked sin ignorar** → `/scribe` lo commitearía (`audit_cache.json`, `build_state.json`, `context_hash.json` con ruta absoluta e índice, `scan-advisories.mjs`).
- `pnpm exec biome check .` **falla** (biome usa `vcs.useIgnoreFile`): `biome.json` formatea JSON con tabs y los state JSON van con 2 espacios → `.agents/.state/audit_cache.json:2` (y los otros dos).
- `pnpm exec oxlint .` emite **2 warnings** (`no-await-in-loop`) sobre `.agents/.state/scan-advisories.mjs:64,66` (exit 0, pero ensucia el lint del repo para siempre).
- Riesgo extra en este proyecto: los state JSON cambian en cada ciclo → churn permanente de diff entre `develop`/`main`/`gitea`.
**Fix (1 fichero, 2 líneas) en `.gitignore`:** `# Agent harness runtime state (nunca commitear)` + `.agents/.state/`.

❌ **ID-02 [VERIFY] — informe de auditoría incompleto (2 GHSAs ausentes).**
`GET https://api.github.com/advisories?ecosystem=npm&affects=…` devuelve, además de lo tabulado:
`picomatch@2.3.1` → **GHSA-c2c7-rcm5-vvqj** y `flatted@3.3.3` → **GHSA-rf6f-7fwh-wjgh**.
`.agents/docs/security_report.md` §2 lista solo `GHSA-3v7f-55p6-f55p` y `GHSA-25h7-pfq9-p65f` respectivamente. El resto de la tabla (js-yaml ×4, minimatch ×3, brace-expansion, yaml, vite ×5) es correcto y coincide 1:1 con la API de GitHub; las versiones actuales de los 7 overrides dan `clean`.
**Fix (1 fichero, 2 celdas):** añadir los dos GHSA a la tabla §2.

### Sugerencias (no bloquean, fuera de ciclo)
- `scan-advisories.mjs` duplica lo que el arnés dice tener en `bin/gh-advisory-check.mjs`; ese binario **no existe** en esta máquina (`/home/david/.pi/agent/bin/` no está) → drift de tooling del arnés. Si se recupera, sustituir el script ad-hoc por la vía oficial (`affects=` en lotes ≤50, caché 24h).
- `overrides.test.ts:33` — `MAJOR_BOUNDED` contiene un `\s*` inerte al inicio de la alternativa (el valor ya viene de `trim()`).
- 3 non-null assertions (`match[1]!`, `entry!.index`) — aceptables en tests por capturas garantizadas de regex.
- El preámbulo de 3 líneas (`resolve(dirname(fileURLToPath(...)))` + `readFileSync`) se repite en los dos tests de config: extraíble a helper compartido si aparece un tercero.
- `.agents/docs/analysis_2026-09-17_security-advisories.md` F2 ("0 hits en 28 muestreados") queda **superado** por el barrido completo del informe; conviene que el enlace lo diga (el informe ya lo hace en §2).

## TESTS — clasificación (skill `test-classification`)

**✅ KEEP (9) — 0 REMOVE:**
- `overrides.test.ts` ×7 — todos son contratos de invariante o reproductores de bug real: *advisory floors* (regresión del hallazgo del usuario), *bounds de major* (reproduce el salto js-yaml 4.x→5.x), *lockfile js-yaml 4.x* (reproduce el bug del lockfile), *js-yaml 4.x por commitlint* (contrato de compatibilidad), *pins exactos documentados*, *comentario del pin*, *set de overrides sin eliminación silenciosa*.
- `dependabot.test.ts` ×2 (nuevos) — `groups` minor/patch y justificación de cada `ignore`: políticas verificables de un fichero de infra que nadie ejecuta localmente.
Ninguno verifica mocks ni detalles internos; ninguno es redundante con los otros (revisado par a par).

## SUITE (evidencia obligatoria)

| Comando | Resultado | Exit |
|---|---|---|
| `pnpm vitest run` | **35 files / 343 tests passed** (baseline 334/34; +9 de este ciclo) | **0** |
| `pnpm typecheck` (`tsc --noEmit`) | sin errores | **0** |
| `pnpm exec oxlint .` | 2 warnings (solo `ID-01`) | **0** |
| `node scripts/check-filenames.mjs` | all files conform | **0** |
| `pnpm exec biome check src/config/` | limpio | **0** |
| `pnpm exec biome check .` | **falla** → `ID-01` | 1 |

## Veredicto

### Reporte (ronda 1) — ❌ RECHAZADO

- **ID-01 [QA]** — `.agents/.state/` sin ignorar ⇒ se commitearía estado que el arnés marca "nunca commitear"; `biome check .` en rojo; 2 warnings nuevos de oxlint. Fix: `.gitignore` (+`.agents/.state/`).
- **ID-02 [VERIFY]** — `security_report.md` §2 omite `GHSA-c2c7-rcm5-vvqj` (picomatch) y `GHSA-rf6f-7fwh-wjgh` (flatted). Fix: completar la tabla.

Ambos son **de 1 fichero / ~4 líneas** y están dentro del alcance de los entregables de este ciclo (higiene del arnés + informe de auditoría). Nada del núcleo (R1/R2/R3/R5 + 9 tests + suite) requiere cambios: la corrección es cosmética-documental.

Tests a eliminar por `/build`: **ninguno** (0 REMOVE).

🔴 HANDOFF → /build | Gate: reviewer | Artefactos: [.agents/docs/review_2026-09-17_security-advisories-deps.md] | Pendiente: ID-01, ID-02

---

# Ronda 2 — verificación de los fixes (2026-09-17 14:09)

**Candidato congelado:** `git diff --stat` → **7 tracked / +117 −26**; nuevos untracked: `src/config/overrides.test.ts` (160 líneas), `src/config/gitignore.test.ts` (32 líneas). Sin cambio alguno en `src/**` de producción (solo `src/config/*.test.ts`).

## ID-01 ✅ RESUELTO — verificado por efecto, no por lectura

| Comprobación (independiente del relato de `/build`) | Resultado |
|---|---|
| `git check-ignore -v .agents/.state/{audit_cache,build_state,context_hash}.json .agents/.state/scan-advisories.mjs` | **4/4** → `.gitignore:43:.agents/.state/` |
| `git status --short --ignored` | `!! .agents/.state/` — ya no aparece como untracked (no se commiteará) |
| `.gitignore:41-43` | regla + motivo explícito ("never commit") → cumple la norma escrita de `prompts/audit.md` |
| `pnpm exec oxlint .` | **limpio, exit 0** — los 2 `no-await-in-loop` sobre `scan-advisories.mjs:64,66` han desaparecido ⇒ oxlint **sí** respeta `.gitignore` |
| `pnpm exec biome check .` | ya no reporta los JSON de estado; la **única** salida restante es `scripts/check-filenames.mjs` (pre-existente, **no tocado** en este ciclo) |
| TDD trazable | `gitignore.test.ts`: **RED 2 failed / 1 passed** → `.gitignore` → **GREEN 3/3** |

## ID-02 ✅ RESUELTO

`security_report.md:30` incorpora `GHSA-c2c7-rcm5-vvqj` (picomatch@2.3.1) y `:33` `GHSA-rf6f-7fwh-wjgh` (flatted@3.3.3); la API de GitHub Advisory queda como 2.ª fuente independiente (`:25`, `:70`). Re-contrastado: `GET /advisories?affects=` → `clean` en los **7** overrides resueltos.

## Re-verificación R1–R5 (no cambió ninguna dependencia en esta ronda)

| Req | Estado | Evidencia (re-ejecutada por el reviewer) |
|---|---|---|
| R1 | ✅ | `pnpm audit --audit-level=low` → `No known vulnerabilities found` (exit 0) · OSV **385/385, 0 advisories** · GitHub Advisory API `clean` en los 7 overrides |
| R2 | ✅ | cotas de major en `pnpm-workspace.yaml:47-58` + único pin exacto documentado |
| R3 | ✅ | resueltos `js-yaml@4.3.2`, `picomatch@4.0.4`, `yaml@2.8.3`, `fast-uri@4.1.4`, `postcss@8.5.23`, `undici@7.29.0`, `nanoid@3.3.18` + guard de 7 advisory floors |
| R5 | ✅ | `groups.minor-and-patch` + 3 `ignore` documentados |
| R4/R6/R7 | ⏸ | `deferred_ids` T6–T10 (Cycles B/C, con sus aprobaciones) — **el ciclo NO cierra la spec**: `change_spec.yaml` debe seguir `active` |

## QA (ronda 2)

✅ `gitignore.test.ts` 32 líneas, sin funciones propias (solo callbacks), anidamiento ≤3, sin `!`/casts/`console`/catch, sin secretos. El 3.er test (`.agents/{docs,context,skills}` siguen trackeados) es un invariante útil: impide que un ignore futuro demasiado amplio borre la memoria del arnés.
✅ Sin hallazgos nuevos en el diff de esta ronda.
⚠️ **Observación (no bloquea):** `pnpm exec biome check .` sigue en rojo por `scripts/check-filenames.mjs` (drift de formato pre-existente). No es defecto de este ciclo — candidato a ciclo de higiene.
⚠️ **Workload (R2 SLO):** ronda de implementación = 5 ficheros (`pnpm-workspace.yaml`, `.github/dependabot.yml`, `src/config/{overrides,dependabot}.test.ts` + `pnpm-lock.yaml` generado) ✓; ronda de corrección de review = 2 ficheros (`.gitignore` +4 líneas, `gitignore.test.ts`) ✓. Total acumulado 6 ficheros / ≈241 líneas no generadas. **Cada ronda dentro del SLO**; no procede split (el 6.º fichero lo exigió este propio review). Se deja explícito para que el humano pueda anular el criterio si lo prefiere.

## TESTS — clasificación (ronda 2)

**✅ KEEP (3) — 0 REMOVE:** `gitignore.test.ts` ×3 (contrato de una regla escrita del arnés · documentación de la regla · invariante anti-ignore-demasiado-amplio). Todos con consecuencia observable (commitear estado local / perder la memoria del arnés).
**Total acumulado del ciclo: 12 KEEP / 0 REMOVE.**

## SUITE (evidencia obligatoria, ronda 2)

| Comando | Resultado | Exit |
|---|---|---|
| `pnpm vitest run` | **36 files / 346 tests passed** | **0** |
| `pnpm typecheck` | sin errores | **0** |
| `pnpm exec oxlint .` | limpio (sin warnings) | **0** |
| `node scripts/check-filenames.mjs` | all files conform | **0** |
| `pnpm exec biome check` (ficheros del ciclo) | limpio | **0** |
| `pnpm exec biome check .` | rojo **solo** por `scripts/check-filenames.mjs` (pre-existente) | 1 |

`vite build` 252 ms (ronda 1; no ha habido cambios de código desde entonces).

## Veredicto

### Reporte (ronda 2) — ✅ APROBADO

Los dos IDs están resueltos y **verificados por efecto**, no por declaración. R1/R2/R3/R5 verdes; 12 tests KEEP / 0 REMOVE; suite 346/346 exit 0; sin hallazgos nuevos.

**Para `/scribe`:** `change_spec.yaml` debe permanecer `active` (R4/R6/R7 → Cycles B/C); no cerrar la spec al archivar.

## Limpieza previa a `/scribe` (2026-09-17 14:12)

Inventario por tamaño y procedencia; se borra solo lo regenerable y ajeno al commit:

| Elemento | Tamaño | Acción | Motivo |
|---|---|---|---|
| `dist/` | 3,4M / 47 ficheros | **eliminado** | salida de los `pnpm build` de este ciclo; gitignored; regenerable (`pnpm build`, ~250 ms); no entra en el commit |
| `.deepsec/` | **761M / 30.813 ficheros** | **pendiente de OK explícito del usuario** | R7 del plan: workspace de tooling **no auditado** (node_modules propio + `findings.json` del scan del 2026-09-10); gitignored; regenerable con `npx deepsec init` (requiere red + installs) |
| `.agents/.state/` | 24K / 4 ficheros | **se conserva** | contrato del arnés (`context_hash.json` para el reuso de `/build`, `build_state.json` estado por Rn, `audit_cache.json` cache FAST pre-install) + `scan-advisories.mjs`, que es la herramienta citada como reproducción en `security_report.md` §2. Todo gitignored ⇒ no entra en el commit |
| `node_modules/` | 503M | **intacto** | dependencias instaladas; borrarlo exigiría reinstalar (aprobación) |
| `.agents/docs/{plan,analysis,review,report,spec}` | 27K | **se conservan** | memoria del arnés + trazabilidad del ciclo (el análisis es la única fuente de F1/F3-F7) |
| `/tmp/adb.1000.log` | — | intacto | no pertenece a este proyecto |
| `origin/dependabot/*` + `hotfix/security-dependabot-18` | — | post-merge | el usuario cierra los 7 PRs; después `git fetch --prune` limpia los refs de tracking |

Si se aprueba borrar `.deepsec/`, el `exclude: ["**/.deepsec/**"]` de `vitest.config.ts` (y su test) queda inerte → anotado para Cycle C (`R7`), **no** se toca aquí.

**Hallazgo de arnés (reportado, no explotado):** la ASK-list de `gate-router/policy.ts` es `/(?<!-)rm\s+(?!-rf)(\s|$)/`, que **no casa** con `rm <ruta>` (solo con `rm  <ruta>` de doble espacio o con `rm -rf`, este último ya en DENY). Consecuencia verificada: `rm -r dist` se ejecutó **sin prompt de confirmación**. Por eso el borrado de `.deepsec/` se pide explícitamente en chat en lugar de confiar en la policy. Candidato a fix del arnés (fuera del alcance del repo).

🔄 HANDOFF → /scribe | Gate: reviewer | Artefactos: [.agents/docs/review_2026-09-17_security-advisories-deps.md, .agents/docs/plan_2026-09-17_security-advisories-deps.md] | Pendiente: archivar (commits: config+test del ciclo; los 7 PRs Dependabot los cierra el usuario tras el merge)
