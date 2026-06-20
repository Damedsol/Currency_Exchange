import { makeStyles, tokens } from "@fluentui/react-components";

export const useGlobalStyles = makeStyles({
	focusRing: {
		":focus-visible": {
			outline: "2px solid transparent",
			outlineOffset: "2px",
			borderRadius: tokens.borderRadiusMedium,
			boxShadow: `0 0 0 2px ${tokens.colorNeutralBackground1}, 0 0 0 4px ${tokens.colorCompoundBrandStroke}`,
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
