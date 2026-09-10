/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const vitestConfig = readFileSync(
	resolve(dirname(fileURLToPath(import.meta.url)), "../../vitest.config.ts"),
	"utf-8",
);

describe("vitest.config.ts test isolation", () => {
	it("excludes the .deepsec workspace from test discovery", () => {
		expect(vitestConfig).toMatch(/\.deepsec/);
	});
});
