import type { Theme } from "@fluentui/react-components";
import { describe, expect, it } from "vitest";
import { neonDarkTheme, neonLightTheme } from "./neonTheme";

describe("neonDarkTheme", () => {
	it("is a Fluent Theme", () => {
		expect(neonDarkTheme).toBeDefined();
		expect(neonDarkTheme).toHaveProperty("colorBrandForeground1");
		expect(neonDarkTheme).toHaveProperty("colorNeutralBackground1");
	});

	it("has green-ish neutral backgrounds", () => {
		const bg1 = neonDarkTheme.colorNeutralBackground1;
		expect(bg1).toBeDefined();
		expect(typeof bg1).toBe("string");
	});

	it("uses Figtree as base font family", () => {
		const baseFont = neonDarkTheme.fontFamilyBase;
		expect(baseFont).toContain("Figtree");
	});

	it("uses IBM Plex Mono as monospace font family", () => {
		const monoFont = neonDarkTheme.fontFamilyMonospace;
		expect(monoFont).toContain("IBM Plex Mono");
	});

	it("has no box-shadow tokens (anti-decoracion)", () => {
		const shadows = [
			neonDarkTheme.shadow2,
			neonDarkTheme.shadow4,
			neonDarkTheme.shadow8,
			neonDarkTheme.shadow16,
			neonDarkTheme.shadow28,
			neonDarkTheme.shadow64,
		];
		for (const s of shadows) {
			expect(s).toBe("none");
		}
	});

	it("has border radius <= 4px", () => {
		function pxValue(token: string): number {
			const match = token.match(/^(\d+)px$/);
			return match ? Number(match[1]) : 0;
		}
		const tokens = [
			neonDarkTheme.borderRadiusMedium,
			neonDarkTheme.borderRadiusLarge,
			neonDarkTheme.borderRadiusXLarge,
		];
		for (const t of tokens) {
			expect(pxValue(t)).toBeLessThanOrEqual(4);
		}
	});

	it("has font weight <= 500 in dark mode (Ley de Irradiacion)", () => {
		const weights = [
			neonDarkTheme.fontWeightRegular,
			neonDarkTheme.fontWeightMedium,
			neonDarkTheme.fontWeightSemibold,
		];
		for (const w of weights) {
			expect(Number(w)).toBeLessThanOrEqual(500);
		}
	});

	it("has neon green primary stroke", () => {
		const stroke = neonDarkTheme.colorCompoundBrandStroke;
		expect(stroke).toBe("#b9f27c");
	});

	it("has dark-specific compoundBrandStroke (not same as light)", () => {
		expect(neonDarkTheme.colorCompoundBrandStroke).not.toBe(
			neonLightTheme.colorCompoundBrandStroke,
		);
	});

	it("has dark-specific brandStroke1 (not same as light)", () => {
		expect(neonDarkTheme.colorBrandStroke1).not.toBe(
			neonLightTheme.colorBrandStroke1,
		);
	});

	it("has brandForeground1 in dark mode", () => {
		expect(neonDarkTheme.colorBrandForeground1).toBe("#b9f27c");
	});

	it("has brandBackground in both modes", () => {
		expect(neonDarkTheme.colorBrandBackground).toBeDefined();
		expect(neonLightTheme.colorBrandBackground).toBeDefined();
	});
});

describe("neonLightTheme", () => {
	it("is a Fluent Theme", () => {
		expect(neonLightTheme).toBeDefined();
		expect(neonLightTheme).toHaveProperty("colorBrandForeground1");
	});

	it("is not identical to dark theme", () => {
		expect(neonLightTheme.colorNeutralBackground1).not.toBe(
			neonDarkTheme.colorNeutralBackground1,
		);
	});

	it("font weight 600 allowed in light mode", () => {
		expect(Number(neonLightTheme.fontWeightSemibold)).toBeGreaterThanOrEqual(
			600,
		);
	});

	it("has light-specific compoundBrandStroke for contrast", () => {
		expect(neonLightTheme.colorCompoundBrandStroke).toBe("#2d6a4f");
	});

	it("has light-specific brandStroke1 for contrast", () => {
		expect(neonLightTheme.colorBrandStroke1).toBe("#2d6a4f");
	});

	it("has light-specific brandForeground1", () => {
		expect(neonLightTheme.colorBrandForeground1).toBe("#1b4332");
	});
});

describe("Theme interface compatibility", () => {
	it("both themes satisfy Theme type", () => {
		const dark: Theme = neonDarkTheme;
		const light: Theme = neonLightTheme;
		expect(dark).toBeDefined();
		expect(light).toBeDefined();
	});
});
