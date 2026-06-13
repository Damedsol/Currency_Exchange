import { tokens, makeStyles } from "@fluentui/react-components";

export const useGlobalStyles = makeStyles({
	focusRing: {
		":focus-visible": {
			outline: `2px solid ${tokens.colorCompoundBrandStroke}`,
			outlineOffset: "2px",
			borderRadius: tokens.borderRadiusMedium,
		},
	},
	textPrefixOk: {
		"::before": {
			content: "'[OK] '",
			fontWeight: String(tokens.fontWeightSemibold),
		},
	},
	textPrefixWarn: {
		"::before": {
			content: "'[!] '",
			fontWeight: String(tokens.fontWeightSemibold),
		},
	},
	textPrefixQuestion: {
		"::before": {
			content: "'[?] '",
			fontWeight: String(tokens.fontWeightSemibold),
		},
	},
});
