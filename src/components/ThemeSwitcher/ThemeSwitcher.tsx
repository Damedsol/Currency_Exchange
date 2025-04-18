import {
	Label,
	Switch,
	makeStyles,
	shorthands,
	tokens,
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

	return (
		<div className={styles.container}>
			<Label size="medium">
				{isDarkMode ? "Dark Mode Active" : "Light Mode Active"}
			</Label>
			<Switch checked={isDarkMode} onChange={toggleTheme} />
		</div>
	);
};
