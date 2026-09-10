// @vitest-environment node

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const packageJson = JSON.parse(
	readFileSync(resolve(rootDir, "package.json"), "utf-8"),
) as {
	scripts?: Record<string, string>;
	devDependencies?: Record<string, string>;
};

describe("lint script configuration", () => {
	it("does not depend on @ls-lint/ls-lint", () => {
		expect(packageJson.devDependencies).not.toHaveProperty("@ls-lint/ls-lint");
	});

	it("lint script uses the custom filename checker instead of ls-lint", () => {
		const lint = packageJson.scripts?.["lint"] ?? "";
		expect(lint).toContain("scripts/check-filenames.mjs");
		expect(lint).not.toContain("ls-lint");
	});

	it("exposes a dedicated check-filenames script", () => {
		const script = packageJson.scripts?.["check-filenames"] ?? "";
		expect(script).toContain("scripts/check-filenames.mjs");
	});
});
