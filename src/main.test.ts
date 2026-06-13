/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const srcDir = dirname(fileURLToPath(import.meta.url));
const mainPath = resolve(srcDir, "main.tsx");
const mainContent = readFileSync(mainPath, "utf-8");

describe("main.tsx theme integration", () => {
	it("imports neonDarkTheme and neonLightTheme", () => {
		expect(mainContent).toMatch(
			/import.*neonDarkTheme.*from\s+["'].*\/theme\/neonTheme["']/,
		);
		expect(mainContent).toMatch(
			/import.*neonLightTheme.*from\s+["'].*\/theme\/neonTheme["']/,
		);
	});

	it("uses prefers-color-scheme for initial theme", () => {
		expect(mainContent).toMatch(/prefers-color-scheme/);
	});

	it("no longer imports webDarkTheme or webLightTheme", () => {
		expect(mainContent).not.toMatch(/webDarkTheme/);
		expect(mainContent).not.toMatch(/webLightTheme/);
	});
});
