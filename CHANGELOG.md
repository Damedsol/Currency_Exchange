# Changelog

## [1.11.0] — 2026-06-20

### Added
- Coverage thresholds: 95%+ across all metrics (lines 98.35%, branches 96.33%, functions 98.07%, statements 98.19%)
- 244 unit/integration tests across 27 files (+21 new test files expanded)
- 24 E2E tests in 5 Playwright spec files (smoke, conversion, theme, error-handling, accessibility)
- `useTheme` hook with React Context and `ThemeProvider`
- `aria-hidden="true"` on all decorative SVG icons
- `role="switch"` + `aria-checked` on ThemeSwitcher
- Custom Switch track colors (brand ON, neutral OFF)
- Double focus ring in `globalStyles.ts`
- Custom Divider styling (colorNeutralStroke2, strokeWidthThin)
- EmptyState component with dashed border and role="status"
- Key API sent as HTTP header (security improvement)
- `.ia/` agentic system (AGENTS.md, project_manifest.yml, memory/context.md)
- `skills/` registry with fluent-ui-react and modern-linting skills

### Changed
- React 19.2.0, Vite 8.0.16, Fluent UI 9.74.1
- Dependencies: pinned security overrides (brace-expansion, flatted, picomatch, yaml, minimatch)
- `main.tsx` simplified from 78 to 13 lines
- `App.tsx` refactored from 477 to ~120 lines as pure orchestrator
- Neon-Code theme system with cool-toned surfaces and brand-based alpha borders
- Accessibility: WCAG 2.2 AAA (focus rings, skip-link, 44px targets, aria attributes)
- Agentic skills consolidated from `.agents/` and `.gemini/` to `skills/` root

### Removed
- `.agents/` and `.gemini/` directories (866 lines of duplication)
- ESLint and Prettier (fully replaced by Oxlint + Biome)
- `docs/workflow.md` (stale workflow documentation)
- `docs/TODO.md` (all items completed)
- `docs/plan-neon-code-fluent-tdd.md` (merged into context.md)
- Empty `public/assets/` directory

### Fixed
- Fluent Select onChange handler type
- ConversionHistory timestamp formatting edge cases
- Theme persistence ignoring system preference when localStorage has value
- AbortController timeout in FreeCurrency service
- localStorage error handling in all service functions
- ActionButtons and HistoryPanel dialog interaction tests
- Media query change listener coverage in useTheme

## [1.10.0] — 2026-06-15

### Added
- Oxlint as primary linter, Biome as formatter
- ls-lint for file naming consistency
- Husky + lint-staged + commitlint git hooks
- Neon-Code design system (BrandVariants, 58 token overrides)
- Docker multi-stage build (development, builder, production)
- Nginx security hardening (CSP, HSTS, server_tokens off)
- 15+ tests for services, hooks, and config files

### Changed
- ESLint → Oxlint, Prettier → Biome migration
- FluentProvider theme injection
- CSS-in-JS with makeStyles (Griffel)
- Enhanced nginx.conf with security headers
