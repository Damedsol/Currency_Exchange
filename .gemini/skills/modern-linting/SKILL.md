# 🛠️ Skill: Modern Linting & Formatting (Oxlint, Biome, ls-lint)

This skill documents the guidelines, standards, and static analysis workflows of the project. It completely replaces traditional workflows based on ESLint and Prettier with high-performance tools written in Rust/Go.

---

## 📖 Table of Contents
1. [Core Philosophy & Architecture](#-core-philosophy--architecture)
2. [Quick Start](#-quick-start)
3. [Standard Pattern (Standard Configuration)](#-standard-pattern-standard-configuration)
4. [Advanced / Edge Cases (Troubleshooting)](#-advanced--edge-cases-troubleshooting)
5. [The Do Not List / Common Mistakes](#-the-do-not-list--common-mistakes)

---

## 🎯 Core Philosophy & Architecture
The project's static analysis system relies on a strict separation of concerns to maximize CPU performance and code hygiene:
*   **Oxlint (Linter):** Exclusively responsible for analyzing the AST to detect logical errors, bad practices, and potential bugs in milliseconds.
*   **Biome (Formatter):** Exclusively responsible for the aesthetics and format of the code (spacing, quotes, tabs, commas) and organizing imports. Its internal linter is **disabled**.
*   **ls-lint (File Linter):** Exclusively responsible for maintaining file naming style consistency.
*   **Husky + Lint-Staged:** Automates fast verification during pre-commit, running only on modified files.

---

## ⚡ Quick Start

To format and verify the code locally, use the following `package.json` scripts:

```bash
# Run Oxlint and ls-lint to check for syntax and file naming errors
pnpm run lint

# Run Biome to format and organize imports across the workspace
pnpm run format

# Run TypeScript type check without emitting files
pnpm run typecheck
```

### Surgical Individual Commands

```bash
# Run oxlint on a specific file or directory with safe rule auto-fixing
pnpm exec oxlint ./src/components/MyComponent.tsx --fix

# Instantly format a specific file with Biome
pnpm exec biome format --write ./src/components/MyComponent.tsx
```

---

## ⚙️ Standard Pattern (Standard Configuration)

### 1. Biome Configuration (`biome.json`)
Biome acts as a direct replacement for Prettier. Its configuration perfectly maps the specifications of the old `.prettierrc.json` but with 100x superior performance:

```json
{
	"$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
	"vcs": {
		"enabled": true,
		"clientKind": "git",
		"useIgnoreFile": true
	},
	"files": {
		"ignoreUnknown": false,
		"ignore": ["dist/**", "node_modules/**", ".next/**", "pnpm-lock.yaml"]
	},
	"formatter": {
		"enabled": true,
		"formatWithErrors": false,
		"indentStyle": "tab",
		"indentWidth": 2,
		"lineEnding": "lf",
		"lineWidth": 80,
		"attributePosition": "auto"
	},
	"linter": {
		"enabled": false
	},
	"javascript": {
		"formatter": {
			"jsxQuoteStyle": "double",
			"quoteProperties": "asNeeded",
			"trailingCommas": "all",
			"semicolons": "always",
			"arrowParentheses": "always",
			"bracketSpacing": true,
			"bracketSameLine": false,
			"quoteStyle": "double"
		}
	},
	"json": {
		"formatter": {
			"trailingCommas": "none"
		}
	}
}
```

### 2. Oxlint Configuration (`.oxlintrc.json`)
Oxlint is used in its recommended high-performance mode, ensuring code analysis is instantaneous.

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"rules": {
		"correctness": "warn",
		"perf": "warn",
		"suspicious": "warn",
		"restriction": "off",
		"style": "off"
	}
}
```

### 3. ls-lint Configuration (`.ls-lint.yml`)
ls-lint restricts filenames to maintain absolute visual consistency across the directory tree:

```yaml
ls:
  .dir: kebab-case
  .js: camelCase
  .ts: camelCase
  .tsx: PascalCase
  .css: camelCase
  .scss: camelCase
  .yml: dot-notation | kebab-case
  .yaml: dot-notation | kebab-case
  .json: dot-notation | kebab-case | camelCase

ignore:
  - node_modules
  - dist
  - .git
  - .idea
  - LICENSE.md
```

### 4. Integrated Git Hooks (`.lintstagedrc.json`)
Ensures buggy or poorly formatted code never makes it to the repository:

```json
{
	"src/**/*.{js,jsx,ts,tsx}": [
		"pnpm exec oxlint --fix",
		"pnpm exec biome format --write"
	],
	"src/**/*.css": [
		"pnpm exec biome format --write"
	],
	"*.json": [
		"pnpm exec biome format --write"
	]
}
```

---

## 🚀 Advanced / Edge Cases (Troubleshooting)

### Case 1: Oxlint rule conflicts with external dependencies
Occasionally, third-party dependencies can trigger false positives in Oxlint's `correctness` or `override` rules. To solve this without globally disabling the rule, use TypeScript inline disable comments:

```typescript
// oxlint-disable-next-line correctness/no-unused-vars
const externalLegacyValue = legacyLibrary.getValue();
```

Or disable them surgically in `.oxlintrc.json` if they affect an entire module:

```json
{
	"rules": {
		"correctness": "warn",
		"no-unused-vars": "off"
	}
}
```

### Case 2: Conditional Formatting of Complex JSON Files
Biome might fail or error when trying to format JSON files containing comments or special formats (like `tsconfig.json` with comments). To prevent Biome from failing on these files, add them to the individual files exclusion section, or use the Biome ignore directive in block comments if the format supports it:

```json
{
	// biome-ignore format: Avoid formatting on dense config arrays
	"compilerOptions": {
		"target": "ESNext"
	}
}
```

---

## 🚫 The Do Not List / Common Mistakes

*   **❌ DO NOT use Prettier or ESLint:** Both packages have been completely replaced. Installing ESLint dependencies or extensions in this project will break the pre-commit system and performance.
*   **❌ DO NOT enable the Biome linter:** Biome has linter capabilities, but they have been explicitly disabled (`linter.enabled: false` in `biome.json`) to avoid redundancy and collisions with Oxlint's ultra-fast suggestions.
*   **❌ DO NOT ignore ls-lint:** If you rename a `.tsx` component to lowercase or a `.ts` service file to PascalCase, the pre-commit suite will abort the push. Follow the conventions: Components in `PascalCase.tsx`, utilities/services in `camelCase.ts`.
*   **❌ DO NOT bypass Git hooks (`git commit --no-verify`):** Bypassing local linters introduces buggy code into continuous integration (CI). Solve issues locally using `pnpm run lint` and `pnpm run format`.

---

*Updated: May 30, 2026 - 21:45*
