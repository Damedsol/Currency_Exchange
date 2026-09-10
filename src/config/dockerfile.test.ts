/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const dockerfile = readFileSync(resolve(rootDir, "Dockerfile"), "utf-8");

describe("Dockerfile", () => {
	it("uses Node.js 24-alpine as base image", () => {
		expect(dockerfile).toMatch(/NODE_VERSION=24-alpine/);
	});

	it("does not contain HEALTHCHECK instruction", () => {
		expect(dockerfile).not.toMatch(/^HEALTHCHECK\b/m);
	});

	it("pins Node.js base image by digest", () => {
		expect(dockerfile).toMatch(
			/FROM node:\$\{NODE_VERSION\}@sha256:[0-9a-f]{64} AS (development|builder)/,
		);
	});

	it("production stage uses unprivileged nginx image pinned by digest", () => {
		expect(dockerfile).toMatch(
			/FROM nginxinc\/nginx-unprivileged:alpine@sha256:[0-9a-f]{64} AS production/,
		);
	});

	it("production stage runs as non-root user", () => {
		const productionStage = dockerfile.split(/^FROM.*AS production/m)[1];
		expect(productionStage).toMatch(/^USER nginx$/m);
	});
});
