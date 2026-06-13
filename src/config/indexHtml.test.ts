/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

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
