# Plan: Footer, Favicon "CEX" y Reemplazo de ls-lint

> Gate: plan (1-6) → build (7). Fecha: 2026-08-13.

## Contexto

- **Footer:** nuevo componente React `Footer` (theme-aware) inspirado en `imageTransformer` (copyright + enlaces externos + licencia).
- **ls-lint → script propio:** `scripts/check-filenames.mjs` (Node puro, cero deps) con cobertura completa de `src/` y sufijos de test; elimina `@ls-lint/ls-lint` y `.ls-lint.yml`.
- **Favicon:** monograma "CEX" en estética neon-code (neon lime `#b9f27c` sobre `#0d1117`, cyberpunk-flat) + regeneración de los 5 PNG.

## Decisiones confirmadas

1. Footer como componente React (`src/components/Footer/Footer.tsx`).
2. Favicon: rediseñar SVG + regenerar todos los PNG (16/32/192/512/favicon.png).
3. Script: cobertura total de `src/` + sufijo de test, salida clara y exit codes.

## Tareas (TDD)

### Feature 1 — Footer
- [✓] T1: RED — `src/components/Footer/Footer.test.tsx` (copyright, hrefs GitHub/LinkedIn/CC BY 4.0, target/rel, `<footer>` semántico).
- [✓] T2: GREEN — implementar `src/components/Footer/Footer.tsx` (makeStyles + tokens, mono, hover neón, foco visible).
- [✓] T3: GREEN — integrar `<Footer/>` en `App.tsx`; ajustar `App.test.tsx` si procede.
- [✓] T4: REFACTOR — suite completa + lint verdes.

### Feature 2 — Reemplazo de ls-lint
- [✓] T5: RED — `src/config/lintScript.test.ts` (package.json sin `@ls-lint/ls-lint`; `lint` usa `scripts/check-filenames.mjs`).
- [✓] T6: GREEN — crear `scripts/check-filenames.mjs` (tabla de reglas, recursión, ignore, exit codes, symlinks).
- [✓] T7: GREEN — `package.json` (quitar dep, actualizar `lint`, añadir `check-filenames`), `pnpm-workspace.yaml` (quitar catalog), borrar `.ls-lint.yml`.
- [✓] T8: GREEN — `pnpm install` (regenera lockfile); `node scripts/check-filenames.mjs` → exit 0.
- [✓] T9: REFACTOR — actualizar docs (AGENTS.md root, .ia/AGENTS.md, project_manifest.yml, README.md, skills/*, context.md root) + memoria.

### Feature 3 — Favicon "CEX"
- [✓] T10: RED — extender test de config para favicon (SVG con monograma + 5 PNG existen).
- [✓] T11: GREEN — rediseñar `favicon.svg` (CEX trazado a paths, neon lime sobre dark, sin externos).
- [✓] T12: GREEN — regenerar PNGs (16/32/192/512/favicon.png).
- [✓] T13: REFACTOR — build verificado (assets en dist) + suite completa verde.

## Reglas del script (check-filenames)

| Ruta | Regla |
|---|---|
| `src/` y subdirectorios | lowercase |
| `src/components/*` (dirs) | PascalCase |
| `src/components/**/*.tsx` (+test) | PascalCase |
| `src/services/*.ts` (+test) | PascalCase |
| `src/hooks/*.ts(x)` (+test) | camelCase |
| `src/theme/*`, `src/types/*`, `src/config/*` | camelCase |
| `src/styles/*.css` | kebabcase |
| `src/styles/*.ts` | camelCase |
| `src/App.tsx` | PascalCase |
| `src/main.tsx`, `src/test/*` | lowercase |
| Reservados (`index.*`, `setup.*`, `vite-env.d.ts`) | permitidos |
| Sufijo de test | `*.test.ts(x)` / `*.spec.ts(x)` |

## Riesgos

- R1: rotura de tests al insertar Footer → ajustar aserciones.
- R2: reglas estrictas del script → nombres reservados permitidos + doc en skill.
- R3: PNGs sin regenerar → usar rasterizador único para todos los tamaños.
- R4: nueva dep (resvg) → por defecto generación one-time sin dep permanente; si se añade, pasar `audit`.
