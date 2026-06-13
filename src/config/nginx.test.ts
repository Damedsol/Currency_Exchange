/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const nginxConfig = readFileSync(
	resolve(dirname(fileURLToPath(import.meta.url)), "../../nginx.conf"),
	"utf-8",
);

describe("nginx.conf security headers", () => {
	it("contains Content-Security-Policy header", () => {
		expect(nginxConfig).toMatch(/Content-Security-Policy/);
	});

	it("contains CSP with frame-ancestors directive", () => {
		expect(nginxConfig).toMatch(/frame-ancestors\s+'none'/);
	});

	it("contains CSP with connect-src for freecurrencyapi", () => {
		expect(nginxConfig).toMatch(/connect-src\s+[^;]*api\.freecurrencyapi\.com/);
	});

	it("applies security headers in all location blocks", () => {
		const serverAddHeader =
			nginxConfig.match(/add_header\s+Content-Security-Policy[^;]+always;/g) ||
			[];
		expect(serverAddHeader.length).toBeGreaterThanOrEqual(1);
	});
});
