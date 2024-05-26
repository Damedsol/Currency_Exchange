import { ButtonProps, makeStyles, tokens } from "@fluentui/react-components";
import React from "react";

const useButtonStyles: () => Record<string | number, string> = makeStyles({
	root: {
		background: tokens.colorStatusDangerBackground3,
		border: "none",
		borderRadius: tokens.borderRadiusMedium,
		cursor: "pointer",
		width: "170px",
		height: "40px",
		padding: "6px 12px",
		fontFamily: tokens.fontFamilyBase,
		fontSize: tokens.fontSizeBase400,
		fontWeight: tokens.fontWeightSemibold,
		color: "white",
		boxShadow: tokens.shadow16,
		"&:hover": {
			background: tokens.colorStatusDangerBackground3Hover,
		},
		"&:active": {
			background: tokens.colorStatusDangerBackground3Pressed,
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

export const ButtonDanger: (props: ButtonProps) => React.JSX.Element = (
	props: ButtonProps,
) => {
	const { root, span } = useButtonStyles();
	return (
		<button className={root}>
			<span className={span} {...props}>
				{props.children}
			</span>
		</button>
	);
};
