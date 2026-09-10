# ADR-002 — Agentic memory layout and public-repo boundaries

- **Date:** 2026-09-10 · **Status:** accepted.
- **Context:** the repo accumulated two overlapping agentic layouts (legacy `.ia/` + root `context.md`, and the newer `.agents/`), plus environment-specific infrastructure references (agent skill runtime, MCP servers) that must not ship in a public repository.
- **Decision:**
  1. **Single governance entrypoint:** root `AGENTS.md` is the canonical, team-owned standard; it is the only entrypoint and points memory to `.agents/context/`.
  2. **Memory split:** `.agents/context/project.md` (stable: stack, architecture, decisions, non-negotiables) and `.agents/context/history.md` (changing: recent cycles detailed, older history consolidated, compressed when > 200 lines).
  3. **Skills location:** project skills live in `.agents/skills/<name>/SKILL.md` with Agent-Skills-compliant frontmatter (`name` + `description`); the skills root contains only skill packages.
  4. **Public boundary:** documentation committed to the repo must not reference environment-specific agent infrastructure (host skill runtime, MCP servers, local audit workspaces). Project-local skills only.
  5. **Legacy retirement:** `.ia/`, root `context.md` and duplicated skill copies are removed after their content is merged into `.agents/`.
- **Consequences:** initialization is idempotent; the memory has one stable file and one compressed log; public releases expose only project-relevant agent configuration. Historical engineering records remain under `.agents/docs/`.
- **Discarded alternatives:** keep the dual `.ia/` + `.agents/` layout (duplication, drift); keep root `context.md` as the live memory (contradicts the `.agents/` convention); publish harness/MCP references (leaks local infrastructure).
