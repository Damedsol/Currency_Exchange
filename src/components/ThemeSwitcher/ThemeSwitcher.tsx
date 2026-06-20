import {
	Label,
	makeStyles,
	Switch,
	shorthands,
	tokens,
	useId,
} from "@fluentui/react-components";
import React from "react";

// Import Label from Fluent UI directly

// Define styles specific to this component
const useStyles = makeStyles({
	container: {
		display: "flex",
		alignItems: "center",
		justifyContent: "flex-end", // Keep right alignment
		...shorthands.gap(tokens.spacingHorizontalS),
	},
	switchRoot: {
		// Target the internal track element for ON state
		"& input:checked + span": {
			backgroundColor: tokens.colorBrandBackground,
		},
		// Target the internal track element for OFF state
		"& input + span": {
			backgroundColor: tokens.colorNeutralBackground4,
		},
	},
});

// Define the props the component needs
interface ThemeSwitcherProps {
	isDarkMode: boolean;
	toggleTheme: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
	isDarkMode,
	toggleTheme,
}) => {
	const styles = useStyles();
	const switchId = useId("theme-switch");

	return (
		<div className={styles.container}>
			<Label htmlFor={switchId} size="medium">
				{isDarkMode ? "Dark Mode Active" : "Light Mode Active"}
			</Label>
			<Switch
				id={switchId}
				className={styles.switchRoot}
				checked={isDarkMode}
				onChange={toggleTheme}
				role="switch"
				aria-checked={isDarkMode}
			/>
		</div>
	);
};
