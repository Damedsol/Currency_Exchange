/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

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
