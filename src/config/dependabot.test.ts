/// <reference types="node" />

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dependabotConfig = readFileSync(
	resolve(
		dirname(fileURLToPath(import.meta.url)),
		"../../.github/dependabot.yml",
	),
	"utf-8",
);

describe(".github/dependabot.yml", () => {
	it("uses version 2 of the Dependabot config schema", () => {
		expect(dependabotConfig).toMatch(/^version:\s*2/m);
	});

	it("configures the npm ecosystem (pnpm lockfile v9 support)", () => {
		expect(dependabotConfig).toMatch(/package-ecosystem:\s*["']?npm["']?/);
	});

	it("targets the repository root directory", () => {
		expect(dependabotConfig).toMatch(/directory:\s*["']?\/["']?/);
	});

	it("schedules updates on a weekly cadence", () => {
		expect(dependabotConfig).toMatch(/interval:\s*["']?weekly["']?/);
	});

	it("sets a bounded open pull-requests limit", () => {
		expect(dependabotConfig).toMatch(/open-pull-requests-limit:\s*\d+/);
	});

	it("ignores undici major bumps (8.x breaks jsdom 29 wrap-handler.js)", () => {
		expect(dependabotConfig).toMatch(
			/dependency-name:\s*["']?undici["']?[\s\S]*?versions:\s*\[[^\]]*>=8\.0\.0/,
		);
	});

	it("ignores nanoid major bumps (postcss 8.5.x requires ^3.3.16)", () => {
		expect(dependabotConfig).toMatch(
			/dependency-name:\s*["']?nanoid["']?[\s\S]*?versions:\s*\[[^\]]*>=4\.0\.0/,
		);
	});

	it("ignores @fluentui/react-motion bumps (pinned for jsdom compatibility)", () => {
		expect(dependabotConfig).toMatch(
			/dependency-name:\s*["']?@fluentui\/react-motion["']?[\s\S]*?versions:\s*\[[^\]]*>=9\.16\.0/,
		);
	});
});
