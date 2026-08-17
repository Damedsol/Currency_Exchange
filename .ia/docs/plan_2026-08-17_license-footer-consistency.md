# Plan: License Consistency — Footer Attribution, SPDX, Third-Party Licenses

> Gate: plan (1-6) → build (7). Fecha: 2026-08-17. Estado: COMPLETED (build).

## Contexto

- **Footer:** `src/components/Footer/Footer.tsx` renderizaba `© {year} Created by Damedsol · Licensed under CC BY 4.0` — el símbolo `©` (copyright "all rights reserved") es incongruente con una licencia Creative Commons ("some rights reserved").
- **README.md:** 2 URLs apuntaban al repo antiguo `Currency_Exchange` (no existe); el remote `origin` y el footer usan `currencyExchange`.
- **package.json:** `"license": "CC BY 4.0"` no es un identificador SPDX válido (correcto: `CC-BY-4.0`).
- **Licencias de terceros:** no existía ningún archivo de notificaciones (NOTICE/THIRD-PARTY) para fuentes (Figtree, IBM Plex Mono — OFL 1.1) ni dependencias runtime (MIT).

## Decisiones confirmadas

1. Footer: quitar `©` y "Created by" → atribución CC pura `{year} Damedsol · Licensed under CC BY 4.0`.
2. Footer: añadir enlace "README" al README de GitHub (`#readme` anchor).
3. Normalizar URLs de GitHub en README a `currencyExchange`.
4. `package.json` → SPDX `CC-BY-4.0`.
5. Crear `THIRD-PARTY-LICENSES.md` (fuentes OFL + deps runtime MIT) y referenciarlo desde README.

## Tareas (TDD)

### Feature 1 — Footer attribution + README link
- [✓] T1: RED — `src/components/Footer/Footer.test.tsx` (atribución sin `©`/`Created by`, presencia Damedsol/CC BY 4.0/Licensed under, enlace README, 5 links).
- [✓] T2: GREEN — `Footer.tsx` (texto `{year} Damedsol · Licensed under CC BY 4.0`, `styles.attribution`, `README_URL` + enlace README).
- [✓] T3: REFACTOR — Biome format + suite verde.

### Feature 2 — Metadatos de licencia
- [✓] T4: RED — `src/config/license.test.ts` (SPDX `CC-BY-4.0`, THIRD-PARTY-LICENSES.md contenido, README sin `Currency_Exchange`, OFL.txt presentes).
- [✓] T5: GREEN — `package.json` (`CC-BY-4.0`), `THIRD-PARTY-LICENSES.md` (creado), `README.md` (URLs + secciones).
- [✓] T6: REFACTOR — Biome format + tsc + suite completa.

### Feature 3 — Memoria y QA
- [✓] T7: Actualizar `context.md` raíz y `.ia/memory/context.md`.
- [✓] T8: QA final — oxlint 0 err, check-filenames ✅, tsc 0 err, vitest 317/317, build OK.

## QA Final
- **Tests:** 317/317 (32 files) — 6 nuevos (1 footer README + 5 license).
- **Gate:** oxlint 0 err · check-filenames ✅ · tsc 0 err · vitest 317/317 · Vite build 295ms.