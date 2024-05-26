import {ButtonProps, makeStyles, tokens} from "@fluentui/react-components";
import React from "react";

const useButtonStyles: () => Record<string | number, string> = makeStyles({
	root: {
		background: tokens.colorBrandBackground,
		border: "none",
		borderRadius: tokens.borderRadiusMedium,
		cursor: "pointer",
		width: "170px",
		height: "40px",
		padding: "6px 12px",
		fontFamily: tokens.fontFamilyBase,
		fontSize: tokens.fontSizeBase400,
		fontWeight: tokens.fontWeightSemibold,
		boxShadow: tokens.shadow16,
		color: "white",
		"&:hover": {
			background: tokens.colorBrandBackgroundHover,
		},
		"&:active": {
			background: tokens.colorBrandBackgroundPressed,
		},
		"&:disabled": {
			cursor: "not-allowed",
			background: tokens.colorNeutralBackgroundDisabled,
			boxShadow: "none",
			color: tokens.colorNeutralForegroundDisabled,
			"&:hover": {
				background: tokens.colorNeutralBackgroundDisabled,
			},
			"&:active": {
				background: tokens.colorNeutralBackgroundDisabled,
			},
		},
	},
	span: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
	},
});

export const ButtonPrimary: (props: ButtonProps) => React.JSX.Element = (
	props: ButtonProps,
) => {
	const { root, span } = useButtonStyles();
	return (
		<button disabled={props.disabled} className={root}>
			<span className={span} {...props}>
				{props.children}
			</span>
		</button>
	);
};
