/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcDir = dirname(fileURLToPath(import.meta.url));
const mainPath = resolve(srcDir, "main.tsx");
const mainContent = readFileSync(mainPath, "utf-8");

describe("main.tsx theme integration", () => {
	it("imports ThemeProvider from hooks/useTheme", () => {
		expect(mainContent).toMatch(
			/import.*ThemeProvider.*from\s+["'].*\.\/hooks\/useTheme["']/,
		);
	});

	it("imports styles/main.css for global styles", () => {
		expect(mainContent).toMatch(/import\s+["'].*\.\/styles\/main\.css["']/);
	});

	it("no longer imports webDarkTheme or webLightTheme", () => {
		expect(mainContent).not.toMatch(/webDarkTheme/);
		expect(mainContent).not.toMatch(/webLightTheme/);
	});

	it("renders App inside ThemeProvider and StrictMode", () => {
		expect(mainContent).toMatch(/ThemeProvider/);
		expect(mainContent).toMatch(/StrictMode/);
	});

	it("uses ReactDOM.createRoot to mount the app", () => {
		expect(mainContent).toMatch(/createRoot/);
	});
});
