/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workspace = readFileSync(resolve(root, "pnpm-workspace.yaml"), "utf-8");
const lockfile = readFileSync(resolve(root, "pnpm-lock.yaml"), "utf-8");

/**
 * Security overrides (R2/R3): each one must stay inside the major it was
 * chosen for. A bare `>=X.Y.Z` is unbounded and can jump a major with
 * `resolutionMode: highest` (it already happened with js-yaml 4.x -> 5.x).
 */
const SECURITY_OVERRIDES = [
	"fast-uri",
	"js-yaml",
	"nanoid",
	"picomatch",
	"postcss",
	"undici",
	"yaml",
] as const;

/**
 * Overrides deliberately pinned to one exact version for compatibility.
 * They must be documented with a comment and are exempt from the bound rule.
 */
const DOCUMENTED_PINS = ["@fluentui/react-motion"] as const;

/** `^X.Y.Z` (caret) or `>=X.Y.Z <X+1.0.0` (range with explicit upper bound). */
const MAJOR_BOUNDED =
	/^(?:\^\d+\.\d+\.\d+|\s*>=\d+\.\d+\.\d+\s+<\d+\.0\.0\s*)$/;
const EXACT_VERSION = /^\d+\.\d+\.\d+$/;

type Override = { key: string; value: string; line: string; index: number };

function readOverrides(): Override[] {
	const lines = workspace.split("\n");
	const start = lines.findIndex((line) => /^"?overrides"?:/.test(line));
	if (start === -1) return [];

	const entries: Override[] = [];
	for (let i = start + 1; i < lines.length; i++) {
		const line = lines[i] ?? "";
		if (line.trim() !== "" && !/^\s/.test(line)) break;
		if (/^\s*#/.test(line)) continue;
		const match = line.match(/^\s{2}"?([^":]+)"?:\s*"?([^"#]+?)"?\s*(?:#.*)?$/);
		if (match) {
			entries.push({
				key: match[1]!.trim(),
				value: match[2]!.trim(),
				line,
				index: i,
			});
		}
	}
	return entries;
}

/**
 * Advisory fix versions (OSV / GitHub Advisory DB, checked 2026-09-17).
 * An override must never be able to resolve below these floors — this is the
 * regression guard for the Dependabot alerts (picomatch 2.x, yaml 2.8.2,
 * js-yaml 4.1.x, minimatch 3.x, flatted 3.x, vite 7.1.x).
 */
const ADVISORY_FLOORS: Record<string, string> = {
	picomatch: "4.0.4", // GHSA-3v7f-55p6-f55p (also fixes 2.3.2)
	yaml: "2.8.3", // GHSA-48c2-rrv3-qjmp
	"js-yaml": "4.3.2", // GHSA-2883-xcg3-v3hh, GHSA-52cp-r559-cp3m, GHSA-5p4m-2wfm-xmqj, GHSA-h67p-54hq-rp68
	"fast-uri": "4.1.3", // GHSA-5jgf/f65p/fph4/jqff
	postcss: "8.5.18", // 2026-08 round (path traversal / parsing)
	undici: "7.29.0", // 7 fixes from 2026-06 (SOCKS5 / WebSocket DoS / TLS)
	nanoid: "3.3.18", // CWE-835 loop guard
};

/** `^X.Y.Z` or `>=X.Y.Z …` → the numeric floor of the range. */
function floorOf(value: string): string {
	return value.match(/(?:\^|>=)(\d+\.\d+\.\d+)/)?.[1] ?? "";
}

/** Numeric comparison of two X.Y.Z versions (-1, 0, 1). */
function compareVersions(a: string, b: string): number {
	const pa = a.split(".").map(Number);
	const pb = b.split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
		if (diff !== 0) return diff;
	}
	return 0;
}

const overrides = readOverrides();
const overrideOf = (key: string) => overrides.find((o) => o.key === key);
const isDocumentedPin = (key: string) =>
	(DOCUMENTED_PINS as readonly string[]).includes(key);

describe("pnpm-workspace.yaml overrides", () => {
	it("declares every security override (no silent removal)", () => {
		for (const key of SECURITY_OVERRIDES) {
			expect(overrideOf(key), `missing override for ${key}`).toBeDefined();
		}
	});

	it("keeps every override inside its intended major (R2)", () => {
		const unbounded = overrides
			.filter((o) => !isDocumentedPin(o.key))
			.filter((o) => !MAJOR_BOUNDED.test(o.value))
			.map((o) => `${o.key}: ${o.value}`);
		expect(unbounded, "unbounded override (can jump a major)").toEqual([]);
	});

	it("bounds js-yaml to the 4.x line that @commitlint declares (R3)", () => {
		const value = overrideOf("js-yaml")?.value ?? "";
		expect(value, "js-yaml must stay on 4.x (commitlint API)").toMatch(
			/^(?:\^4\.|>=4\.[\d.]+\s+<5\.0\.0)/,
		);
	});

	it("only pins exact versions for documented compat pins (R2)", () => {
		const exact = overrides
			.filter((o) => EXACT_VERSION.test(o.value))
			.filter((o) => !isDocumentedPin(o.key))
			.map((o) => o.key);
		expect(exact, "exact pin without a documented reason").toEqual([]);
	});

	it("documents every exact pin with a comment (R5)", () => {
		for (const key of DOCUMENTED_PINS) {
			const entry = overrideOf(key);
			expect(entry, `missing override for ${key}`).toBeDefined();
			const previous = overrides[entry!.index - 1]?.line ?? "";
			const documented = entry!.line.includes("#") || previous.includes("#");
			expect(documented, `${key} pin is undocumented`).toBe(true);
		}
	});

	it("never resolves below a known advisory fix version (R3)", () => {
		const regressions = Object.entries(ADVISORY_FLOORS)
			.map(([key, floor]) => ({
				key,
				floor,
				actual: floorOf(overrideOf(key)?.value ?? ""),
			}))
			.filter(
				({ floor, actual }) => !actual || compareVersions(actual, floor) < 0,
			)
			.map(
				({ key, floor, actual }) =>
					`${key}: floor ${actual || "?"} < fix ${floor}`,
			);
		expect(regressions, "override below an advisory fix version").toEqual([]);
	});

	it("resolves js-yaml to the 4.x line in the lockfile (R3)", () => {
		const resolved = lockfile.match(/^\s{2}js-yaml@(\d+)\./gm) ?? [];
		expect(resolved.length, "js-yaml not found in lockfile").toBeGreaterThan(0);
		const resolvesMajorFive = /^\s{2}js-yaml@5\./m.test(lockfile);
		expect(resolvesMajorFive, "lockfile still resolves js-yaml 5.x").toBe(
			false,
		);
	});
});
