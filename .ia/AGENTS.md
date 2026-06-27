# 🤖 Local Agent: currencyExchange (.ia/)

## 📜 COEXISTENCE RULE (Governance)
This file is complementary to the root `AGENTS.md`. It does not duplicate, replace, or physically interact with it.
- **Mandatory:** Read and assimilate the root `AGENTS.md` as the master technical standard (profile, stack, tooling, guardrails).
- **Local:** This `.ia/AGENTS.md` extends the workflow with local memory persistence policies, buffer strategy, and token optimization.
- **Forbidden:** Write, modify, overwrite, or delete the root `AGENTS.md` from this agent.

## 🧠 Knowledge Management (memory/context.md)

1. **Mandatory Reading:** Read `.ia/memory/context.md` at the start of each session to understand the current state, previous errors, and technical decisions.
2. **Continuous Updates:** Update `.ia/memory/context.md` after significant changes, critical error resolutions, or at the end of the work session.

### 🔄 Dynamic Feedback
Proactively analyze the "Relevant Change History" section in `.ia/memory/context.md`. If you identify repeated error patterns or stabilized critical architecture solutions, suggest structured proposals to the developer to update `.ia/AGENTS.md` and evolve the local workflow.

## 🛡️ Safety Gates
- **Explicit human authorization** required before:
  - Modifying environment variables (`.env`, `.env.*`).
  - Running database migrations.
  - Installing dependencies (`pnpm add`/`pnpm rm`).
- **Retry limit:** Maximum 3 automatic retries for any failed system action. Once exhausted, abort and notify the user.

## 💾 Memory Synchronization (Buffer Strategy)
- **Temporary Buffer:** Accumulate changes from multiple files in internal memory during the session. Write `.ia/memory/context.md` once at the end of the work, avoiding redundant writes.
- **Global Memory:** Use `.ia/memory/context.md` as the single source of truth for business decisions, global rules, and macro history.
- **Module Memories (Optional):** Create `.ia/memory/[module]_context.md` exclusively for ultra-specific technical logic of isolated and critical modules.

## 📏 Audit Criteria and Token Hygiene
- **`.ia/AGENTS.md` line limit:** If it exceeds 150 lines, stop adding direct guidelines and extract extensive technical documentation to independent files in `.ia/docs/`.
- **Memory Compression Algorithm** (if any `context.md` exceeds 200 lines):
  1. Keep only the last 3 recent change records with dates and learnings intact.
  2. Consolidate old records into a single "Consolidated Learning History" paragraph.
  3. Remove old granular detail to free LLM context.

## 🧩 Technical Standards (inherited from root AGENTS.md)
- **Core Linter:** Oxlint (no ESLint).
- **Formatter:** Biome (no Prettier).
- **File Linter:** ls-lint.
- **Runtime:** Node >= 24, pnpm >= 11.
- **Response language:** ENGLISH, always concise and direct.
- **Quality:** Self-review logic, types, and imports before proposing changes. Do not run `tsc` or linters automatically unless requested by the user.
