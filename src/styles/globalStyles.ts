import { makeStyles, tokens } from "@fluentui/react-components";

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

export const useTooltipStyles = makeStyles({
	tooltip: {
		backgroundColor: tokens.colorNeutralBackground3,
		border: `1px solid ${tokens.colorBrandStroke1}`,
		color: tokens.colorNeutralForeground1,
		fontFamily: tokens.fontFamilyBase,
		fontSize: tokens.fontSizeBase200,
	},
});
