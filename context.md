# 🧠 Project Context & Learnings: currencyExchange (Root)

This document dynamically records technical learnings, architectural decisions, and the active change history during the project development.

## 🚀 Stack & Configuration (Learnings)

- **Primary Linter:** **Oxlint** for ultra-fast static analysis without ESLint. Correctness, performance, and suspicious rules are enabled in `.oxlintrc.json`.
- **Exclusive Formatter:** **Biome** to aesthetically format JS, TS, TSX, CSS, and JSON files in record time. Biome's internal linter has been disabled to prevent conflicts.
- **File Naming Linter:** **ls-lint** guarantees naming consistency: components in `PascalCase.tsx`, utilities/services in `camelCase.ts`, and configs in `kebab-case`/`dot-notation`.
- **UI & Framework:** **React 19** and **Fluent UI React Components v9** (@fluentui/react-components), injecting the theme via `FluentProvider` and using `makeStyles` (Griffel atomic CSS-in-JS).
- **Package Management:** **pnpm** (with absolute priority in the environment).

## 🧠 Strategic Decisions

- **Exclusivity of Rust Linters/Formatters:** ESLint and Prettier were completely removed. Reinstalling them is strictly prohibited.
- **Local Agentic Configuration:** Adopted the "Agentic Standard" via `/AGENTS.md` (single root master file, under 150 lines) and the `context.md` memory system.
- **Local Technical Skills:** Separation of local knowledge into `.gemini/` (CLI) and `.agents/` (Antigravity IDE), with documented skills exceeding 400 lines for `modern-linting` and `fluent-ui-react`.

## 📈 Relevant Change History

- **2026-05-30: Initialized Project Agentic System**
  - **Change Details:**
    - Created master `AGENTS.md` in the root (PROFILE, CONTEXT, INSTRUCTIONS, TOOLS & GUARDRAILS).
    - Created local skills system in `.gemini/skills/` and `.agents/skills/` for `modern-linting` and `fluent-ui-react`.
    - Updated strategic memory file `context.md` in the root.
  - **QA Lessons:** Verified that `AGENTS.md` and `context.md` do not violate line limits (<150 and <200 lines respectively).
  - **Associated Branch / Commit:** `feature/agentic-system`
