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
	colorNeutralBackground1: "#0d1117",
	colorNeutralBackground2: "#12171d",
	colorNeutralBackground3: "#1a1f26",
	colorNeutralBackground4: "#1f2933",
	colorNeutralBackground1Hover: "#1a1f26",
	colorNeutralBackground1Pressed: "#12171d",
	colorNeutralBackground1Selected: "#1f2933",
	colorNeutralBackground2Hover: "#1a1f26",
	colorSubtleBackgroundHover: "rgba(185,242,124,0.06)",
	colorNeutralForeground1: "#f0f4fa",
	colorNeutralForeground2: "#c8d2dc",
	colorNeutralForeground3: "#8899a6",
	colorNeutralForeground4: "#55626e",
	colorNeutralForegroundDisabled: "#3d4a54",
	colorNeutralForegroundOnBrand: "#ffffff",
	colorNeutralForegroundInverted: "#0d1117",
	colorNeutralStroke1: "rgba(185,242,124,0.08)",
	colorNeutralStroke2: "rgba(185,242,124,0.05)",
	colorNeutralStrokeAccessible: "rgba(185,242,124,0.20)",
	colorStrokeFocus1: "#8ecb50",
	colorStrokeFocus2: "#b9f27c",
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
	colorNeutralBackground1: "#f6f8fa",
	colorNeutralBackground2: "#edf1f5",
	colorNeutralBackground3: "#e2e8f0",
	colorNeutralBackground4: "#d6dee6",
	colorNeutralBackground1Hover: "#edf1f5",
	colorNeutralBackground1Pressed: "#e2e8f0",
	colorNeutralBackground1Selected: "#d6dee6",
	colorNeutralBackground2Hover: "#e2e8f0",
	colorSubtleBackgroundHover: "rgba(45,106,79,0.06)",
	colorNeutralForeground1: "#1a1f26",
	colorNeutralForeground2: "#3d4a54",
	colorNeutralForeground3: "#6b7c8a",
	colorNeutralForeground4: "#94a3af",
	colorNeutralForegroundDisabled: "#b0bec5",
	colorNeutralForegroundOnBrand: "#ffffff",
	colorNeutralForegroundInverted: "#f6f8fa",
	colorNeutralStroke1: "rgba(45,106,79,0.08)",
	colorNeutralStroke2: "rgba(45,106,79,0.05)",
	colorNeutralStrokeAccessible: "rgba(45,106,79,0.20)",
	colorStrokeFocus1: "#2d6a4f",
	colorStrokeFocus2: "#1b4332",
};

export const neonDarkTheme: Theme = { ...baseDark, ...darkOverrides };
export const neonLightTheme: Theme = { ...baseLight, ...lightOverrides };
