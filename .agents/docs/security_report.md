# Security report — advisory audit + remediation (2026-09-17)

Gate: `/build` Cycle A · Analysis: `.agents/docs/analysis_2026-09-17_security-advisories.md` · Plan: `.agents/docs/plan_2026-09-17_security-advisories-deps.md`

## 1. Where the advisories come from (root cause of the discrepancy)

`pnpm audit` (npm registry DB) reported **0** on this lockfile, yet the repository *does* have advisory
history. Cause: the alerts were raised against an **older dependency tree** of the default branch and
what remains today is the **stale Dependabot branches/PRs**, not live exposure:

```
origin/dependabot/npm_and_yarn/{brace-expansion-1.1.13, flatted-3.4.1, flatted-3.4.2,
                               minimatch-3.1.5, picomatch-2.3.2, vite-7.3.2, yaml-2.8.3}
origin/hotfix/security-dependabot-18  →  "fix(security): resolve js-yaml prototype pollution (Dependabot #18)"
```

`git show origin/main:pnpm-lock.yaml` and `git show HEAD:pnpm-lock.yaml` are **identical** for every
package named by those branches (vite 8.0.16, picomatch 4.0.4, yaml 2.8.3, js-yaml 5.2.2→4.3.2, and
`minimatch` / `flatted` / `brace-expansion` absent entirely) → the vulnerable versions no longer exist.

## 2. Advisory table (source: OSV / GitHub Advisory DB, the DB behind Dependabot)

Reproduce: `node .agents/.state/scan-advisories.mjs <pkg@version> …` (queries OSV `querybatch`, no writes).
Second, independent source — the GitHub Advisory API itself (same DB Dependabot uses), no auth:
`curl -s "https://api.github.com/advisories?ecosystem=npm&affects=pkg@version"` → all 7 resolved override
versions report `clean`; the historical versions below reproduce the advisories listed.

| Vulnerable | Advisories | Severity | Fix | Resolved today |
|---|---|---|---|---|
| `picomatch@2.3.1` | GHSA-3v7f-55p6-f55p (CVE-2026-33672), GHSA-c2c7-rcm5-vvqj | moderate | 2.3.2 / **4.0.4** | **4.0.4** ✅ |
| `minimatch@3.1.2` | GHSA-23c5-xmqv-rm74 (CVE-2026-27904), GHSA-3ppc-4f35-3m26 (CVE-2026-26996), GHSA-7r86-cg39-jmmj (CVE-2026-27903) | high | 3.1.3+ | not present ✅ |
| `brace-expansion@1.1.12` | GHSA-3jxr-9vmj-r5cp (CVE-2026-13149) + 3 | high | 1.1.16 | not present ✅ |
| `flatted@3.3.3` | GHSA-25h7-pfq9-p65f (CVE-2026-32141), GHSA-rf6f-7fwh-wjgh | high | 3.4.0 | not present ✅ |
| `yaml@2.8.2` | GHSA-48c2-rrv3-qjmp (CVE-2026-33532) | moderate | **2.8.3** | **2.8.3** ✅ |
| `vite@7.1.11` | GHSA-4w7w-66w2-5vf9, GHSA-fx2h-pf6j-xcff, GHSA-p9ff-h696-f583, GHSA-v2wj-q39q-566r, GHSA-v6wh-96g9-6wx3 | moderate–high | 7.3.2 / 8.0.5 | **8.0.16** ✅ |
| `js-yaml@4.1.1` | GHSA-2883-xcg3-v3hh, GHSA-52cp-r559-cp3m, GHSA-5p4m-2wfm-xmqj, GHSA-h67p-54hq-rp68 | high | 3.15.2 / **4.3.2** | **4.3.2** ✅ |

**Verdict: 0 open advisories.** Full sweep of every resolved version in `pnpm-lock.yaml`
via OSV `querybatch` → **385/385 packages clean**; `pnpm audit --audit-level=low` → `No known vulnerabilities found`.

## 3. What Cycle A changed (regression guards added because of the above)

| Change | Why |
|---|---|
| `js-yaml: ^4.3.0` → **`^4.3.2`** | 4.3.2 is the advisory fix head of the 4.x line; the old `>=4.3.0` had already jumped to 5.x |
| `picomatch: 4.0.4` (exact) → **`^4.0.4`** | keeps the GHSA-3v7f fix as floor, allows later patches |
| `yaml: 2.8.3` (exact) → **`^2.8.3`** | keeps the GHSA-48c2 fix as floor |
| `fast-uri: >=4.1.3` → `>=4.1.3 <5.0.0` · `postcss: >=8.5.18` → `>=8.5.18 <9.0.0` | no silent major jump (`resolutionMode: highest`) |
| **New test**: "never resolves below a known advisory fix version (R3)" | encodes the 7 advisory floors above as an executable contract (floors: picomatch 4.0.4, yaml 2.8.3, js-yaml 4.3.2, fast-uri 4.1.3, postcss 8.5.18, undici 7.29.0, nanoid 3.3.18) — RED showed exactly `js-yaml: floor 4.3.0 < fix 4.3.2` |
| Dependabot `groups.minor-and-patch` + documented ignores | patch/minor fixes arrive in one reviewable PR; majors stay individual |

## 4. Recommended follow-up (needs your action / approval)

1. **Close the 7 stale Dependabot PRs/branches** listed in §1 — 5 of them are single-line lockfile bumps for packages
   that no longer exist (flatted, brace-expansion, minimatch, picomatch 2.x) and `vite-7.3.2` / `minimatch-3.1.5`
   are based on the pre-Vite-8 tree; merging them would downgrade the stack.
2. **Re-check the alerts page** (`github.com/Damedsol/currencyExchange/security/dependabot`) after the next Dependabot
   scan of `main`: alerts whose fixed version is already in the default branch close automatically. If any alert is
   **still Open**, paste its GHSA id here — I cannot read that page without a token (`gh` is not installed).
3. **Not visible from here:** the `gitea` remote is two minors behind (`v2.1.1`). If the advisories you saw come from
   *Gitea's* dependency scanning, they correspond to that old tree; a merge `develop → gitea/main` is needed.
4. **Deferred (approval):** `pnpm up undici fast-uri postcss picomatch yaml nanoid` (patch freshness above the floors) ·
   Cycle B catalog refresh · Cycle C CI (`pnpm audit` on every PR) + `.deepsec/` decision.

## 5. Evidence

```
pnpm audit --audit-level=low        → No known vulnerabilities found            (exit 0)
node .agents/.state/scan-advisories.mjs → scanned 385 packages · 0 advisories
curl "api.github.com/advisories?ecosystem=npm&affects=<pkg>@<ver>"  → clean on all 7 override versions
pnpm vitest run                     → 36 files / 346 tests passed               (exit 0)
pnpm typecheck                      → exit 0
pnpm exec oxlint .                  → clean (exit 0)
node scripts/check-filenames.mjs    → all files conform
pnpm build                          → built in 293 ms (react-dom gzip 127.77 kB)
pnpm exec commitlint (dry-run)      → 0 problems, 0 warnings
git check-ignore -v .agents/.state/audit_cache.json → .gitignore:43:.agents/.state/
```

**Pre-existing, out of scope:** `pnpm exec biome check .` still fails on `scripts/check-filenames.mjs`
(formatting, untouched by this cycle) — the only remaining repo-wide biome failure after ID-01.

**Lesson (harness):** an advisory sweep must cover **scoped packages** — the first version of the sweep script
stripped quotes after the trailing colon and silently skipped all 194 `@scope/*` entries (191/385 scanned → false
"clean"). Fixed with a parser assertion that throws on malformed pairs.
