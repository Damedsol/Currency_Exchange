/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const indexHtml = readFileSync(resolve(rootDir, "index.html"), "utf-8");

describe("index.html accessibility", () => {
	it("has lang attribute set to en", () => {
		expect(indexHtml).toMatch(/<html\s[^>]*lang="en"/);
	});

	it("has a skip-link to main content", () => {
		expect(indexHtml).toMatch(/skip-link|skip-to-main|skipnavigation/i);
	});
});
