# Plan de Arquitectura: Footer parity with imageTransformer

## GRILL: Alineación de Dominio
- Canonical terms (code + history + ADRs) · Consistencia [✓]
  - Keep: `Footer`, `useStyles`, slots `attribution` / `links` / `link`, URL constants (`GITHUB_URL`, `README_URL`, `LINKEDIN_URL`, `LICENSE_URL`), nav `aria-label="External links"`, texts `Damedsol` / `Licensed under` / `CC BY 4.0`.
  - New names: `GithubIcon`, `LinkedinIcon` (PascalCase components, per `scripts/check-filenames.mjs`) in `src/components/Footer/FooterIcons.tsx`.
  - ⚠️ Do NOT port imageTransformer's `TnIcon` web component (framework mismatch: vanilla-TS custom element vs Fluent React). Replicate its *behavior/geometry* as inline React SVG, mirroring its normalization rule (strip `<svg>` wrapper + presentation attrs; `stroke="currentColor"`, `aria-hidden`).
- ADRs: imageTransformer ADR-0001 (no `©` / no bare `Created by`) is already mirrored by currencyExchange `src/config/license.test.ts`; ADR-0002 (Iconoir migration) informs sourcing.
- 📝 ADR candidate for scribe: ADR-003 footer brand-icon sourcing (vendored Iconoir geometry, no new dep).

## PROPOSE: Intención, Alcance y Approach
- **Intención:** make the currencyExchange footer visually/behaviorally identical to imageTransformer's (yearless attribution, link order, 16px brand icons, spacing, focus), while staying in Fluent v9 tokens.
- **In-scope:** `src/components/Footer/Footer.tsx`, `Footer.test.tsx`, new `src/components/Footer/FooterIcons.tsx`, `THIRD-PARTY-LICENSES.md` (Iconoir MIT entry).
- **Out-of-scope:** `src/App.tsx` (renders `<Footer />` with no props, line 186), `index.html`, theme tokens (already exist), e2e specs, other components, README copy (hrefs unchanged), any new npm dependency.
- **Approach:** extend the existing Footer component (no new route/module); vendor the two Iconoir path geometries (github.svg, linkedin.svg — source of truth in imageTransformer `src/assets/icons/`) as React components; TDD.
- **Deps:** none → no `/audit` required. Icon attribution goes to `THIRD-PARTY-LICENSES.md` (docs edit by build).

## SPEC: Requisitos y Escenarios
- **R1** — Attribution renders `Damedsol · Licensed under CC BY 4.0` with NO year.
- **R2** — Nav order becomes README → GitHub → LinkedIn; hrefs, `target="_blank"` and `rel="noopener noreferrer"` unchanged (currencyExchange URLs).
- **R3** — GitHub/LinkedIn links show a 16px brand icon before the label (`aria-hidden`, aligned via inline-flex + small gap).
- **R4** — Hover → brand color + underline; `:focus-visible` → 2px outline + offset (token `colorStrokeFocus1`: `#8ecb50` dark / `#2d6a4f` light); spacing matches imageTransformer (footer gap S, wrapping content row, nav gap L).
- **R5** — Fix `borderTop`: current `borderTop: "var(--card-border-subtle)"` is invalid (no width/style → renders nothing); use `1px solid var(--card-border-subtle)`.
- **R6** — Attribution stays CC-compliant: existing `src/config/license.test.ts` must stay green.
- **R7** — Zero new npm dependencies; vendored Iconoir MIT geometry registered in `THIRD-PARTY-LICENSES.md`.
- **Happy:** footer renders, links open in new tabs, tab-focus shows the outline.
- **Edge:** narrow viewports (flex-wrap retained), text-only zoom (icons decorative, labels intact).
- **Side:** jsdom `getByText("GitHub")` still matches with an `aria-hidden` icon inside the link.
- **Aceptación:** `Footer.test.tsx` (6 tests, exactly 5 links) + `license.test.ts` green; full gate (`vitest run`, `tsc --noEmit`, `oxlint`, `check-filenames`, `vite build`) green; visual order/icons/gaps match imageTransformer.

## DESIGN: Arquitectura
- [✓] **DRY** — reuse `tokens.*` + existing `main.css` vars; one small icon file (~30 lines) shared by the two links; no new theme/CSS tokens.
- [✓] **YAGNI/KISS** — footer-only icons, no shared icon system, no e2e changes, no `App.tsx` change.
- [✓] **ÚLTIMO RECURSO** — new file `Footer/FooterIcons.tsx` justified: the installed `@fluentui/react-icons` set carries only functional glyphs (`*Regular`/`*Filled`, e.g. `ArrowSwapRegular`), no GitHub/LinkedIn brand logos. T1 makes build verify this in the lockfile version; if brand icons existed, drop the file and import instead.
- [✓] **TDD** — Vitest + Testing Library (jsdom), RED in `Footer.test.tsx` before touching `Footer.tsx`.
- **Archivos:**
  - Modificar: `src/components/Footer/Footer.tsx` (attribution, order, icons, gaps, focus, borderTop), `src/components/Footer/Footer.test.tsx` (year→icon/order assertions), `THIRD-PARTY-LICENSES.md` (Iconoir MIT entry).
  - Crear: `src/components/Footer/FooterIcons.tsx` (`GithubIcon`, `LinkedinIcon`: `width/height=16`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth={1.5}`, `aria-hidden="true"`, `focusable="false"`).
  - Eliminar: ninguno.
- **Deps & config:** ninguna dependencia nueva. Filename checker validates the new PascalCase file automatically.
- **Seguridad:** external-link behavior unchanged; vendored SVG is static geometry (no scripts/handlers, `aria-hidden`) — no XSS surface; THIRD-PARTY attribution keeps license compliance.
- **Rendimiento:** two tiny inline SVGs, zero network/deps/chunk impact.

## TASKS: Checklist TDD
### Fase Red: Configuración del Caso Fallido
- [✓] **T0 — Verify icon availability:** DONE (build recon): explicit probes of the installed package found no `GithubLogoRegular` / `LinkedinLogoRegular` / `GithubRegular` / `LinkedinRegular`; repo imports only functional `*Regular`/`*Filled` glyphs. Keep `FooterIcons.tsx` in scope. Final `grep -i` confirmation deferred to execution time (shell tool down).
- [✓] **T1 — Test first** (`src/components/Footer/Footer.test.tsx`): remove the year assertion (rename test to "renders CC attribution without year"); assert nav link order `["README", "GitHub", "LinkedIn"]` via `within(nav).getAllByRole("link")`; assert each brand icon `svg` has `width="16" height="16" aria-hidden="true"`; keep href/target/rel, license-link, semantic-footer and 5-link-count assertions. Run `pnpm vitest run src/components/Footer` → must FAIL.
### Fase Green: Implementación y Validación
- [✓] **T2 — Icons** (`src/components/Footer/FooterIcons.tsx`): copy geometry from imageTransformer `src/assets/icons/github.svg` + `linkedin.svg`, normalize per TnIcon rule (drop wrapper/presentation attrs); export `GithubIcon`, `LinkedinIcon`.
- [✓] **T3 — Footer** (`src/components/Footer/Footer.tsx`): remove `year`; reorder nav to README → GitHub → LinkedIn; prepend icons; adopt spacing (footer gap S, content `gap S/L` wrap, nav gap L); `borderTop: "1px solid var(--card-border-subtle)"`; focus `outline: 2px solid tokens.colorStrokeFocus1; outlineOffset: 2px` (+ keep `borderRadius`).
- [✓] **T4 — Licenses** (`THIRD-PARTY-LICENSES.md`): register Iconoir (MIT, https://iconoir.com) for the vendored github/linkedin geometry reused in `FooterIcons.tsx`.
- [✓] **T5 — Green gate:** `pnpm vitest run` (332→334 expected, 0 fail) · `pnpm exec tsc --noEmit` · `pnpm exec oxlint .` · `node scripts/check-filenames.mjs` · `pnpm exec vite build`.
### Fase Refactor: Limpieza y Optimización
- [✓] **T6 — Refactor:** deduplicate repeated link props only if a trivial helper emerges without hurting readability; re-run `pnpm vitest run src/components/Footer`.

## Riesgos
- **Fluent ships brand icons in installed version** → scope shrinks (drop T2 file, import icons); mitigated by T0 verification.
- **Iconoir geometry drift** → mitigated by copying from imageTransformer `src/assets/icons/*.svg` (source of truth) and asserting only size/`aria-hidden`, not path data.
- **Year-referencing tests elsewhere** → blast radius verified: only `Footer.*`; `license.test.ts` asserts SPDX/README/OFL, unaffected.
- **Stale `borderTop` rendering difference** → explicitly fixed in R5/T3 (visible 1px top border, matching imageTransformer).
