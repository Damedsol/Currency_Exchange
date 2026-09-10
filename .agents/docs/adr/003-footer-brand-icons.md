# ADR-003 — Footer brand icons vendored (no new dependency)

- **Date:** 2026-09-10 · **Status:** accepted.
- **Context:** the footer needed GitHub/LinkedIn brand icons to match imageTransformer; the installed `@fluentui/react-icons` carries only functional glyphs (verified: no `Github*`/`Linkedin*` brand exports).
- **Decision:** vendor the two Iconoir path geometries (MIT, https://iconoir.com) as inline React components in `src/components/Footer/FooterIcons.tsx` (16px, `currentColor`, `aria-hidden`), normalized like imageTransformer's `TnIcon` (geometry only, no presentation attributes); register Iconoir in `THIRD-PARTY-LICENSES.md`. No new npm dependency; no shared icon system (YAGNI — footer-only use).
- **Consequences:** the footer is self-contained; future brand icons follow the same pattern, or motivate extracting a shared `BrandIcon` component then.
- **Discarded alternatives:** new icon package (dependency + audit overhead for two glyphs); porting imageTransformer's `TnIcon` web component (framework mismatch: vanilla-TS custom element vs Fluent React); generic Fluent glyphs that misrepresent the brands.
