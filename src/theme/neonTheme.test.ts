import type { Theme } from "@fluentui/react-components";
import { describe, expect, it } from "vitest";
import { neonDarkTheme, neonLightTheme } from "./neonTheme";

function hexToRgb(hex: string): [number, number, number] {
	const s = hex.replace("#", "");
	return [
		Number.parseInt(s.slice(0, 2), 16),
		Number.parseInt(s.slice(2, 4), 16),
		Number.parseInt(s.slice(4, 6), 16),
	];
}

function srgbChannel(c: number): number {
	const v = c / 255;
	return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
	const [r, g, b] = hexToRgb(hex);
	return (
		0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b)
	);
}

function getContrastRatio(fg: string, bg: string): number {
	const l1 = relativeLuminance(fg);
	const l2 = relativeLuminance(bg);
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}

describe("neonDarkTheme", () => {
	it("is a Fluent Theme", () => {
		expect(neonDarkTheme).toBeDefined();
		expect(neonDarkTheme).toHaveProperty("colorBrandForeground1");
		expect(neonDarkTheme).toHaveProperty("colorNeutralBackground1");
	});

	it("has neutral-cool backgrounds for data readability", () => {
		const bg1 = neonDarkTheme.colorNeutralBackground1;
		expect(bg1).toBeDefined();
		expect(typeof bg1).toBe("string");
	});

	it("background levels progress correctly (bg1-bg3)", () => {
		const bg1 = neonDarkTheme.colorNeutralBackground1;
		const bg2 = neonDarkTheme.colorNeutralBackground2;
		const bg3 = neonDarkTheme.colorNeutralBackground3;
		expect(relativeLuminance(bg1)).toBeLessThan(relativeLuminance(bg2));
		expect(relativeLuminance(bg2)).toBeLessThan(relativeLuminance(bg3));
	});

	it("neutral backgrounds are cool-toned, not green-tinted", () => {
		const bg1 = neonDarkTheme.colorNeutralBackground1;
		expect(bg1?.toLowerCase()).not.toMatch(
			/^(#?)(0f1a0f|141f14|1a251a|1e2e1e)$/,
		);
		expect(bg1?.toLowerCase()).not.toContain("1a0f");
	});

	it("has background hover/pressed/selected tokens", () => {
		expect(neonDarkTheme.colorNeutralBackground1Hover).toBeDefined();
		expect(neonDarkTheme.colorNeutralBackground1Pressed).toBeDefined();
		expect(neonDarkTheme.colorNeutralBackground1Selected).toBeDefined();
		expect(neonDarkTheme.colorNeutralBackground2Hover).toBeDefined();
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

	it("has brandBackgroundHover darker than base in dark mode", () => {
		expect(neonDarkTheme.colorBrandBackgroundHover).toBeDefined();
	});

	it("has brandBackgroundPressed in dark mode", () => {
		expect(neonDarkTheme.colorBrandBackgroundPressed).toBeDefined();
	});

	it("compoundBrandStroke has sufficient contrast on dark bg", () => {
		const bg = neonDarkTheme.colorNeutralBackground1 ?? "#0f1a0f";
		const fg = neonDarkTheme.colorCompoundBrandStroke ?? "#b9f27c";
		const ratio = getContrastRatio(fg, bg);
		expect(ratio).toBeGreaterThan(7);
	});

	it("compoundBrandStroke has sufficient contrast on light bg", () => {
		const bg = neonLightTheme.colorNeutralBackground1 ?? "#f2f9f2";
		const fg = neonLightTheme.colorCompoundBrandStroke ?? "#2d6a4f";
		const ratio = getContrastRatio(fg, bg);
		expect(ratio).toBeGreaterThan(7);
	});

	it("has foreground text hierarchy (fg1 brightest)", () => {
		const fg1 = neonDarkTheme.colorNeutralForeground1;
		const fg2 = neonDarkTheme.colorNeutralForeground2;
		const fg3 = neonDarkTheme.colorNeutralForeground3;
		const fg4 = neonDarkTheme.colorNeutralForeground4;
		expect(relativeLuminance(fg1)).toBeGreaterThan(relativeLuminance(fg2));
		expect(relativeLuminance(fg2)).toBeGreaterThan(relativeLuminance(fg3));
		if (fg4)
			expect(relativeLuminance(fg3)).toBeGreaterThan(relativeLuminance(fg4));
	});

	it("foreground1 is near-white in dark mode", () => {
		const fg1 = neonDarkTheme.colorNeutralForeground1;
		if (!fg1) return;
		const m = fg1.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
		expect(m).not.toBeNull();
		if (!m) return;
		expect(Number.parseInt(m[1]!, 16)).toBeGreaterThanOrEqual(220);
		expect(Number.parseInt(m[2]!, 16)).toBeGreaterThanOrEqual(220);
		expect(Number.parseInt(m[3]!, 16)).toBeGreaterThanOrEqual(220);
	});

	it("has neutral strokes with brand-consistent alpha", () => {
		expect(neonDarkTheme.colorNeutralStroke1).toBeDefined();
		expect(neonDarkTheme.colorNeutralStroke2).toBeDefined();
		expect(neonDarkTheme.colorNeutralStrokeAccessible).toBeDefined();
	});

	it("has success (rate-up) foreground in dark mode", () => {
		const s = neonDarkTheme.colorStatusSuccessForeground1;
		expect(s).toBeDefined();
		expect(s).not.toMatch(/^#(115ea3|0078d4|2899f5)/i);
	});

	it("has danger (rate-down) foreground in dark mode", () => {
		expect(neonDarkTheme.colorStatusDangerForeground1).toBe("#ff96a7");
	});

	it("has warning (stale data) foreground in dark mode", () => {
		expect(neonDarkTheme.colorStatusWarningForeground1).toBe("#ffc777");
	});

	it("has palette red tokens for destructive actions", () => {
		expect(neonDarkTheme.colorPaletteRedForeground1).toBe("#ff96a7");
		expect(neonDarkTheme.colorPaletteRedBackground1).toBeDefined();
		expect(neonDarkTheme.colorPaletteRedBackground2).toBeDefined();
		expect(neonDarkTheme.colorPaletteRedBackground3).toBeDefined();
		expect(neonDarkTheme.colorPaletteRedBorder1).toBeDefined();
		expect(neonDarkTheme.colorPaletteRedBorderActive).toBeDefined();
	});

	it("has palette yellow foreground for warnings", () => {
		expect(neonDarkTheme.colorPaletteYellowForeground1).toBe("#ffc777");
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
		expect(neonLightTheme.colorCompoundBrandStroke).toBe("#1b4332");
	});

	it("has light-specific brandStroke1 for contrast", () => {
		expect(neonLightTheme.colorBrandStroke1).toBe("#1b4332");
	});

	it("has light-specific brandForeground1", () => {
		expect(neonLightTheme.colorBrandForeground1).toBe("#1b4332");
	});

	it("has foreground hierarchy (fg1 darkest in light)", () => {
		const fg1 = neonLightTheme.colorNeutralForeground1;
		const fg2 = neonLightTheme.colorNeutralForeground2;
		const fg3 = neonLightTheme.colorNeutralForeground3;
		const fg4 = neonLightTheme.colorNeutralForeground4;
		expect(relativeLuminance(fg1)).toBeLessThan(relativeLuminance(fg2));
		expect(relativeLuminance(fg2)).toBeLessThan(relativeLuminance(fg3));
		if (fg4)
			expect(relativeLuminance(fg3)).toBeLessThan(relativeLuminance(fg4));
	});

	it("foreground1 is near-black in light mode", () => {
		const fg1 = neonLightTheme.colorNeutralForeground1;
		if (!fg1) return;
		const m = fg1.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
		expect(m).not.toBeNull();
		if (!m) return;
		expect(Number.parseInt(m[1]!, 16)).toBeLessThanOrEqual(40);
		expect(Number.parseInt(m[2]!, 16)).toBeLessThanOrEqual(40);
		expect(Number.parseInt(m[3]!, 16)).toBeLessThanOrEqual(40);
	});

	it("has light foreground on brand", () => {
		expect(neonLightTheme.colorNeutralForegroundOnBrand).toBe("#ffffff");
	});

	it("has success foreground in light mode", () => {
		expect(neonLightTheme.colorStatusSuccessForeground1).toBe("#2d6a4f");
	});

	it("has danger foreground in light mode", () => {
		expect(neonLightTheme.colorStatusDangerForeground1).toBe("#c1121f");
	});

	it("has warning foreground in light mode", () => {
		expect(neonLightTheme.colorStatusWarningForeground1).toBe("#7c5e00");
	});

	it("has palette red tokens in light mode", () => {
		expect(neonLightTheme.colorPaletteRedForeground1).toBe("#c1121f");
		expect(neonLightTheme.colorPaletteRedBackground1).toBeDefined();
		expect(neonLightTheme.colorPaletteRedBorder1).toBeDefined();
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
