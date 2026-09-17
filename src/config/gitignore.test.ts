/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const gitignore = readFileSync(
	resolve(dirname(fileURLToPath(import.meta.url)), "../../.gitignore"),
	"utf-8",
);

describe(".gitignore", () => {
	it("ignores the agent harness runtime state (ID-01)", () => {
		expect(gitignore).toMatch(/^\.agents\/\.state\/$/m);
	});

	it("documents why the harness state must not be committed (ID-01)", () => {
		const lines = gitignore.split("\n");
		const index = lines.findIndex((line) => line.startsWith(".agents/.state"));
		expect(index).toBeGreaterThan(-1);
		const context = lines.slice(Math.max(0, index - 3), index + 1);
		expect(
			context.some((line) => /never commit|nunca commitear/i.test(line)),
		).toBe(true);
	});

	it("keeps the committed harness artifacts tracked", () => {
		expect(gitignore).not.toMatch(/^\.agents\/$/m);
		expect(gitignore).not.toMatch(/^\.agents\/(docs|context|skills)/m);
	});
});
