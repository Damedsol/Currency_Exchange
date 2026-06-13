/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

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

	it("applies security headers in SPA location block", () => {
		const locationBlock = nginxConfig.match(
			/location \/\s*\{[^}]*add_header\s+Content-Security-Policy/s,
		);
		expect(locationBlock).not.toBeNull();
	});
});
