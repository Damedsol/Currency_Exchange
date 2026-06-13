/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const dockerfile = readFileSync(resolve(rootDir, "Dockerfile"), "utf-8");

describe("Dockerfile", () => {
	it("uses Node.js 22-alpine as base image", () => {
		expect(dockerfile).toMatch(/NODE_VERSION=22-alpine/);
	});
});
