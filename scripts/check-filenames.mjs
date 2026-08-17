#!/usr/bin/env node
/**
 * check-filenames.mjs — Custom filename linter (replaces ls-lint).
 *
 * Validates file/directory naming conventions under src/ with full coverage
 * (components, services, styles, hooks, theme, types, config, test) plus the
 * test-suffix rule (*.test.ts(x) / *.spec.ts(x)). Zero dependencies.
 *
 * Usage: node scripts/check-filenames.mjs
 * Exit: 0 on success, 1 on violation.
 */
import { readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const SRC = join(ROOT, "src");

const IGNORE_DIRS = new Set([
	".git",
	"node_modules",
	"dist",
	"build",
	".husky",
	".idea",
	"coverage",
	"playwright-report",
	"test-results",
	"skills",
	"e2e",
]);

/** Root-level files with fixed, reserved names. */
const RESERVED_ROOT_FILES = new Set(["main.tsx", "App.tsx", "vite-env.d.ts"]);

// ── Casing helpers ────────────────────────────────────────────────────────

const isCamelCase = (s) => /^[a-z][a-zA-Z0-9]*$/.test(s);
const isPascalCase = (s) => /^[A-Z][a-zA-Z0-9]*$/.test(s);
const isKebabCase = (s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
const isLowercase = (s) => /^[a-z0-9._-]+$/.test(s);

function describeCasing(s) {
	if (isPascalCase(s)) return "PascalCase";
	if (isCamelCase(s)) return "camelCase";
	if (isKebabCase(s)) return "kebab-case";
	return "lowercase";
}

function casingMatches(name, expected) {
	switch (expected) {
		case "pascalcase":
			return isPascalCase(name);
		case "camelcase":
			return isCamelCase(name);
		case "kebabcase":
			return isKebabCase(name);
		case "lowercase":
			return isLowercase(name);
		default:
			return true;
	}
}

// ── Rules ─────────────────────────────────────────────────────────────────

/** Directory casing by parent directory (relative to src). */
function expectedDirCasing(parentRelDir) {
	return parentRelDir === "components" ? "pascalcase" : "lowercase";
}

/** File casing by parent directory (relative to src) and extension. */
function expectedFileCasing(parentRelDir, ext) {
	if (
		parentRelDir === "components" ||
		parentRelDir.startsWith("components/")
	) {
		return "pascalcase";
	}
	if (parentRelDir === "services") return "pascalcase";
	if (parentRelDir === "styles") {
		return ext === ".css" ? "kebabcase" : "camelcase";
	}
	if (parentRelDir === "test") return "lowercase";
	// hooks, theme, types, config and any future dir
	return "camelcase";
}

function extensionOf(fileName) {
	const match = fileName.match(/(\.[^.]*)$/);
	return match ? match[1] : "";
}

/** Core name: file name without extension and without .test/.spec suffix. */
function coreName(fileName) {
	const ext = extensionOf(fileName);
	const base = fileName.slice(0, fileName.length - ext.length);
	return base.replace(/\.(test|spec)$/, "");
}

function validateFile(parentRelDir, fileName) {
	if (parentRelDir === "") {
		if (RESERVED_ROOT_FILES.has(fileName)) return null;
		const core = coreName(fileName);
		if (isCamelCase(core) || isPascalCase(core)) return null;
		return `expected camelCase or PascalCase — got '${describeCasing(core)}'`;
	}
	const core = coreName(fileName);
	const expected = expectedFileCasing(parentRelDir, extensionOf(fileName));
	if (casingMatches(core, expected)) return null;
	return `expected ${expected} — got '${describeCasing(core)}'`;
}

// ── Walker ────────────────────────────────────────────────────────────────

const errors = [];

function walk(dir, parentRelDir) {
	let entries;
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (IGNORE_DIRS.has(entry.name) || entry.isSymbolicLink()) continue;
		const full = join(dir, entry.name);
		const rel = relative(ROOT, full).replaceAll("\\", "/");

		if (entry.isDirectory()) {
			const expected = expectedDirCasing(parentRelDir);
			if (!casingMatches(entry.name, expected)) {
				errors.push(
					`❌ ${rel} — directory expected ${expected}, got '${entry.name}'`,
				);
			}
			walk(
				full,
				parentRelDir ? join(parentRelDir, entry.name) : entry.name,
			);
		} else if (entry.isFile()) {
			const msg = validateFile(parentRelDir, entry.name);
			if (msg) errors.push(`❌ ${rel} — ${msg}`);
		}
	}
}

walk(SRC, "");

if (errors.length > 0) {
	console.error(`Filename convention violations (${errors.length}):\n`);
	for (const error of errors) console.error(error);
	process.exitCode = 1;
} else {
	console.log(
		"✅ check-filenames: all files and directories conform to naming conventions.",
	);
}
