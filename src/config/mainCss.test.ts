// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function readMainCss(): string {
	const path = resolve(
		dirname(fileURLToPath(import.meta.url)),
		"../styles/main.css",
	);
	expect(existsSync(path), "main.css should exist").toBe(true);
	return readFileSync(path, "utf-8");
}

describe("main.css card borders", () => {
	const css = readMainCss();

	it("defines --card-border in :root (dark mode)", () => {
		expect(css).toMatch(/:root\s*\{[\s\S]*?--card-border/);
	});

	it("dark card border aligns with theme palette", () => {
		const match = css.match(/:root\s*\{[\s\S]*?--card-border:\s*([^;\n]+)/);
		expect(match).not.toBeNull();
		const val = match![1]!.trim();
		expect(val).toContain("rgba");
	});

	it("does not use old green-tinted hex values", () => {
		expect(css).not.toMatch(/#2a3d2a/);
		expect(css).not.toMatch(/#1e2e1e/);
		expect(css).not.toMatch(/#c8d8c8/);
	});

	it("defines --card-border in [data-theme='light']", () => {
		expect(css).toMatch(/\[data-theme="light"\]\s*\{[\s\S]*?--card-border/);
	});

	it("defines --card-border-subtle in both modes", () => {
		expect(css).toMatch(/:root[\s\S]*--card-border-subtle/);
		expect(css).toMatch(
			/\[data-theme="light"\]\s*\{[\s\S]*--card-border-subtle/,
		);
	});
});
