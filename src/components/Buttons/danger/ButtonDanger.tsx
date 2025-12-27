import {
	Button,
	ButtonProps,
	makeStyles,
	tokens,
} from "@fluentui/react-components";
import React from "react";

// Custom styles to override primary appearance for danger state
const useDangerButtonStyles = makeStyles({
	danger: {
		backgroundColor: tokens.colorPaletteRedBackground3,
		color: tokens.colorNeutralForegroundOnBrand,
		"&:hover": {
			backgroundColor: tokens.colorPaletteRedBackground3,
			color: tokens.colorNeutralForegroundOnBrand, // Keep text color consistent
		},
		"&:active": {
			backgroundColor: tokens.colorPaletteRedBackground3,
			color: tokens.colorNeutralForegroundOnBrand, // Keep text color consistent
		},
		// Ensure disabled styles are also applied if needed, although Fluent UI might handle this
		":disabled": {
			backgroundColor: tokens.colorNeutralBackgroundDisabled,
			color: tokens.colorNeutralForegroundDisabled,
		},
		":disabled:hover": {
			backgroundColor: tokens.colorNeutralBackgroundDisabled,
			color: tokens.colorNeutralForegroundDisabled,
		},
	},
});

export const ButtonDanger: React.FC<ButtonProps> = (props) => {
	const styles = useDangerButtonStyles();

	// Use Fluent UI Button with appearance="primary" and apply custom danger styles
	return (
		<Button appearance="primary" className={styles.danger} {...props}>
			{props.children}
		</Button>
	);
};
