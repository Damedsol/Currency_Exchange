// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const svgPath = resolve(rootDir, "favicon.svg");
const svg = readFileSync(svgPath, "utf-8");

const PNG_FAVICONS = [
	"favicon-16x16.png",
	"favicon-32x32.png",
	"favicon-192x192.png",
	"favicon-512x512.png",
	"favicon.png",
];

describe("favicon assets", () => {
	it("favicon.svg exists and references the EX monogram", () => {
		expect(existsSync(svgPath)).toBe(true);
		expect(svg).toMatch(/<title>Currency Exchange \(EX\)<\/title>/);
		expect(svg).not.toContain("CEX");
	});

	it("favicon.svg draws exactly two letters (E and X)", () => {
		const paths = svg.match(/<path/g) ?? [];
		expect(paths).toHaveLength(2);
	});

	it("favicon.svg uses the neon-code palette (neon lime on dark)", () => {
		expect(svg).toContain("#b9f27c");
		expect(svg).toContain("#0d1117");
	});

	it("favicon.svg has no external references (safe static asset)", () => {
		expect(svg).not.toMatch(/<script/i);
		expect(svg).not.toMatch(/<image[^>]+href/i);
		expect(svg).not.toMatch(/(?:href|src)\s*=\s*["']https?:\/\//i);
		expect(svg).not.toContain("@font-face");
	});

	it("all PNG favicon sizes exist at project root", () => {
		for (const png of PNG_FAVICONS) {
			expect(existsSync(resolve(rootDir, png)), png).toBe(true);
		}
	});
});
