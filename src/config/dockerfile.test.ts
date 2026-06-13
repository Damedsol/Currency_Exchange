/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const dockerfile = readFileSync(resolve(rootDir, "Dockerfile"), "utf-8");

describe("Dockerfile", () => {
	it("uses Node.js 22-alpine as base image", () => {
		expect(dockerfile).toMatch(/NODE_VERSION=22-alpine/);
	});
});
