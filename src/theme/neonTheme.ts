import type { BrandVariants, Theme } from "@fluentui/react-components";
import { createDarkTheme, createLightTheme } from "@fluentui/react-components";

const brandVariants: BrandVariants = {
	10: "#f0ffe0",
	20: "#e1ffc0",
	30: "#d0ffa0",
	40: "#c2f280",
	50: "#b9f27c",
	60: "#a6df6a",
	70: "#8ecb50",
	80: "#76b738",
	90: "#5ea320",
	100: "#468f08",
	110: "#347000",
	120: "#235000",
	130: "#143500",
	140: "#0a1f00",
	150: "#040f00",
	160: "#010500",
};

const baseDark: Theme = { ...createDarkTheme(brandVariants) };
const baseLight: Theme = { ...createLightTheme(brandVariants) };

const fontFamilyBase =
	"'Figtree', 'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif";

const fontFamilyMonospace =
	"'IBM Plex Mono', Consolas, 'Courier New', Courier, monospace";

const shadowReset = "none";

const baseOverrides: Partial<Theme> = {
	fontFamilyBase,
	fontFamilyMonospace,
	fontFamilyNumeric: fontFamilyMonospace,
	shadow2: shadowReset,
	shadow4: shadowReset,
	shadow8: shadowReset,
	shadow16: shadowReset,
	shadow28: shadowReset,
	shadow64: shadowReset,
	borderRadiusLarge: "4px",
	borderRadiusXLarge: "4px",
};

const darkOverrides: Partial<Theme> = {
	...baseOverrides,
	fontWeightSemibold: 500,
	colorBrandForeground1: "#b9f27c",
	colorBrandBackground: "#1a2e1a",
	colorBrandBackgroundHover: "#23402a",
	colorBrandBackgroundPressed: "#0f1a0f",
	colorCompoundBrandStroke: "#b9f27c",
	colorBrandStroke1: "#b9f27c",
	colorBrandStroke2: "#8ecb50",
	colorNeutralBackground1: "#0f1a0f",
	colorNeutralBackground2: "#141f14",
	colorNeutralBackground3: "#1a251a",
	colorSubtleBackgroundHover: "#1e2e1e",
};

const lightOverrides: Partial<Theme> = {
	...baseOverrides,
	colorBrandForeground1: "#1b4332",
	colorBrandBackground: "#d4eed4",
	colorBrandBackgroundHover: "#c0e6c0",
	colorBrandBackgroundPressed: "#a8d8a8",
	colorCompoundBrandStroke: "#1b4332",
	colorBrandStroke1: "#1b4332",
	colorBrandStroke2: "#5ea320",
	colorNeutralBackground1: "#f2f9f2",
	colorNeutralBackground2: "#eaf5ea",
	colorNeutralBackground3: "#e0f0e0",
	colorSubtleBackgroundHover: "#d4e8d4",
};

export const neonDarkTheme: Theme = { ...baseDark, ...darkOverrides };
export const neonLightTheme: Theme = { ...baseLight, ...lightOverrides };
