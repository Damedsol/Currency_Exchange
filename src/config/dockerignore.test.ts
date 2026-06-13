/// <reference types="node" />

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const dockerignorePath = resolve(rootDir, ".dockerignore");

describe(".dockerignore", () => {
	it("exists", () => {
		expect(existsSync(dockerignorePath)).toBe(true);
	});

	it("excludes .env files from Docker image", () => {
		const content = readFileSync(dockerignorePath, "utf-8");
		expect(content).toContain(".env");
	});

	it("excludes node_modules from Docker image", () => {
		const content = readFileSync(dockerignorePath, "utf-8");
		expect(content).toContain("node_modules");
	});

	it("excludes dist directory from Docker image", () => {
		const content = readFileSync(dockerignorePath, "utf-8");
		expect(content).toContain("dist");
	});

	it("excludes .git directory from Docker image", () => {
		const content = readFileSync(dockerignorePath, "utf-8");
		expect(content).toContain(".git");
	});
});
