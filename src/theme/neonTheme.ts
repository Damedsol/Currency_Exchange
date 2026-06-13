import { createDarkTheme, createLightTheme } from "@fluentui/react-components";
import type { BrandVariants, Theme } from "@fluentui/react-components";

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

export const neonDarkTheme: Theme = createDarkTheme(brandVariants);
export const neonLightTheme: Theme = createLightTheme(brandVariants);
