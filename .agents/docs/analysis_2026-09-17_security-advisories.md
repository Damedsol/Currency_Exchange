# Analysis — Security advisories & dependency freshness (2026-09-17)

Method: read-only gate `/do` (bash allowlist `ls|find|grep|rg|wc|pwd|which|head|tail|cat|git status|diff|log|branch|show|fetch`).
`pnpm audit` / `pnpm outdated` **cannot run here** (gate-router `BASH_READONLY`, `index.ts:21`) → they are task T1 of the build cycle.
Advisory data below comes from the public `deps.dev v3alpha` API (`advisoryKeys` per exact version) and npm registry `dist-tags` (both GET, read-only).

## Baseline (evidence trail)

| Date | Source | Result |
|---|---|---|
| 2026-06-27 | `.ia/docs/security_report.md` (commit `ca6227c`) | 3 HIGH / 2 MOD / 2 LOW, all in `undici@7.27.2` (jsdom→vitest) |
| 2026-08-17 | plan `security-audit-dependabot` | 7 CVEs fixed via overrides; Dependabot config added; 326 tests green |
| 2026-09-10 | plan/review `security-fixes` + spec `security.md` | `pnpm audit` → **0 vulns**; `fast-uri >=4.1.3`, `vitest ^4.1.11`, Docker hardening; 332 tests green |
| 2026-09-17 | this analysis | **no advisory reproduced on 28 sampled packages** (see below) → the report the user refers to is *not currently verifiable in-gate* |

## F1 — Harness gap: SCA evidence is untestable in `/do`/`/plan` (root finding)

The last authoritative SCA evidence is **7 days old** (2026-09-10, 0 vulns). Any advisory raised since (Dependabot on `origin`, npm advisories, or a stale lockfile) is invisible to a plan gate. `.agents/docs/security_report.md` no longer exists on disk either → audit trail gap.
→ R1: `/build` must produce the authoritative `pnpm audit --json` + `pnpm outdated` evidence before touching dependencies.

## F2 — Sampled advisory sweep: 0 hits (deps.dev, exact resolved versions)

28 packages (direct + highest-risk transitive) resolved in `pnpm-lock.yaml` with **empty `advisoryKeys`**:
`undici@7.29.0`, `vite@8.0.16`, `vitest@4.1.11`, `jsdom@29.1.1`, `js-yaml@5.2.2`, `fast-uri@4.1.4`, `postcss@8.5.23`, `nanoid@3.3.18`, `yaml@2.8.3`, `picomatch@4.0.4`, `rolldown@1.0.3`, `typescript@6.0.3`, `oxlint@1.66.0`, `@biomejs/biome@2.4.15`, `@playwright/test@1.60.0`, `@fluentui/react-components@9.74.1`, `react@19.2.6`, `tough-cookie@6.0.1`, `parse5@8.0.1`, `semver@7.8.1`, `lightningcss@1.32.0`, `ajv@8.20.0`, `css-tree@3.2.1`, `magic-string@0.30.21`, `istanbul-reports@3.2.0`, `make-dir@4.0.0`, `cosmiconfig@9.0.1`, `es-toolkit@1.47.0`, `@griffel/core@1.21.2`.
Not sampled: ~350 remaining lockfile entries (all `@fluentui/*`, `@csstools/*`, `@babel/*`, CLI plumbing) → covered only by `pnpm audit` (T1).

## F3 — Stale pins inside the security overrides (real risk, actionable today)

`pnpm-workspace.yaml` `overrides` vs. the latest version **of the same line**:

| Override today | Resolved | Latest of that line | Issue |
|---|---|---|---|
| `undici: ^7.29.0` | 7.29.0 | 7.29.1 (`seven`) | patch line moved after our install → lockfile drift |
| `fast-uri: >=4.1.3` | 4.1.4 | 4.1.5 | drift |
| `postcss: >=8.5.18` | 8.5.23 | 8.5.28 | drift |
| `nanoid: ^3.3.18` | 3.3.18 | 3.3.19 (`legacy`) | drift |
| `picomatch: 4.0.4` | 4.0.4 | 4.0.7 | **exact pin**, 3 patches behind |
| `yaml: 2.8.3` | 2.8.3 | 2.9.1 | **exact pin**, minor behind |
| `js-yaml: >=4.3.0` | **5.2.2** | 4.3.2 (`v4-legacy`) / 5.4.2 | unbounded `>=` **jumped a major** (the exact mistake recorded on 2026-08-17) |
| `@fluentui/react-motion: 9.15.0` | 9.15.0 | 9.16.3 | intentional (jsdom compat) — keep |

`js-yaml` is consumed by `@commitlint/*` at commit time only → the 4.x→5.x jump is a **latent** breakage that no unit test covers (commitlint is only exercised when committing).
→ R2/R3: bound overrides to their intended major and refresh the stale ones.

## F4 — Direct dependencies behind (registry dist-tags, 2026-09-17)

Safe (same major): `@fluentui/react-components` 9.74.1→9.74.7 · `@fluentui/react-icons` 2.0.328→2.0.341 · `react`/`react-dom` 19.2.6→19.3.0 · `vite` 8.0.16→8.3.0 · `@vitejs/plugin-react` 6.0.2→6.1.1 · `playwright`/`@playwright/test` 1.60.0→1.63.0 · `@biomejs/biome` 2.4.15→2.5.14 · `oxlint` 1.66.0→1.83.0 · `@testing-library/react` 16.3.2→16.3.3 · `@testing-library/user-event` 14.6.1→14.6.7 · `husky` 9.1.7 (up to date).
Majors (out of scope, own cycle): `vitest`+`@vitest/coverage-v8` 4.1.11→5.0.1 · `typescript` 6.0.3→7.0.2 · `jsdom` 29.1.1→30.1.0 · `@testing-library/jest-dom` 6.9.1→7.0.1 · `lint-staged` 16.4.0→17.5.1 · `@commitlint/cli` 20.5.3→21.2.2 · `@types/node` 24.13.1→26.6.1 (deliberate: types must track the Node 24 runtime) · pnpm 11→12.
→ R4.

## F5 — Dependabot rules suppress future security PRs

`.github/dependabot.yml` ignores `undici >=8.0.0`, `nanoid >=4.0.0`, `@fluentui/react-motion >=9.16.0`. Two of them lock us to a line that the upstream project has already superseded → if a fix lands only on 8.x/4.x, Dependabot will stay silent, and `undici`/`nanoid` currently exist only because *jsdom 29* + *postcss 8.5* need them. No `groups`, `open-pull-requests-limit: 5`.
→ R5.

## F6 — No CI: nothing validates Dependabot PRs

`.github/` contains only `dependabot.yml` — no workflows. The 2026-06-27 audit recommendation "enable `pnpm audit` in CI" is still open; also a Dependabot PR cannot be merged safely without tests.
→ R6 (infra change → explicit user approval required per `AGENTS.md`).

## F7 — `.deepsec/` local tool workspace (supply-chain surface, untracked)

`.deepsec/` is gitignored (root `.gitignore` last line) but present on disk with its **own `node_modules` + 89 KB lockfile + a `deepsec` toolchain**, excluded from tests by `vitest.config.ts`. It is never audited by the project SCA and adds ≥1 unreviewed dependency tree, plus its own agent instructions (`AGENTS.md`, `SETUP.md`).
→ R7: delete from disk (destructive → explicit approval) or pin/audit it.

## Non-findings (checked, clean)

- No secrets in tracked config; `.env.development`/`.production` are gitignored and only `.env.example` is versioned.
- `Dockerfile`/`nginx.conf` still digest-pinned, non-root, 8080 — contract tests present (`src/config/dockerfile.test.ts`, `nginx.test.ts`).
- Licenses: no GPL/AGPL (last audit: 13 distinct, 0 copyleft); `THIRD-PARTY-LICENSES.md` present.
- Dependabot config has a contract test (`src/config/dependabot.test.ts`, 8 tests).
