// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const packageJson = JSON.parse(
	readFileSync(resolve(rootDir, "package.json"), "utf-8"),
) as { license?: string };
const readme = readFileSync(resolve(rootDir, "README.md"), "utf-8");
const thirdPartyPath = resolve(rootDir, "THIRD-PARTY-LICENSES.md");

describe("license metadata consistency", () => {
	it("package.json uses a valid SPDX license identifier (CC-BY-4.0)", () => {
		expect(packageJson.license).toBe("CC-BY-4.0");
	});

	it("THIRD-PARTY-LICENSES.md exists and lists font licenses (OFL)", () => {
		expect(existsSync(thirdPartyPath)).toBe(true);
		const content = readFileSync(thirdPartyPath, "utf-8");
		expect(content).toContain("Figtree");
		expect(content).toContain("IBM Plex Mono");
		expect(content).toContain("SIL Open Font License");
	});

	it("THIRD-PARTY-LICENSES.md lists runtime dependencies (MIT)", () => {
		const content = readFileSync(thirdPartyPath, "utf-8");
		expect(content).toContain("react");
		expect(content).toContain("react-dom");
		expect(content).toContain("@fluentui/react-components");
		expect(content).toContain("@fluentui/react-icons");
		expect(content).toContain("MIT");
	});

	it("README.md no longer references the old repo name Currency_Exchange", () => {
		expect(readme).not.toContain("Currency_Exchange");
	});

	it("font OFL license files are bundled with the fonts", () => {
		expect(
			existsSync(resolve(rootDir, "public/assets/fonts/Figtree/OFL.txt")),
		).toBe(true);
		expect(
			existsSync(resolve(rootDir, "public/assets/fonts/IBM_Plex_Mono/OFL.txt")),
		).toBe(true);
	});
});
