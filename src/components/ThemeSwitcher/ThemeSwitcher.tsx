import React from 'react';
// Import Label from Fluent UI directly
import { Label, Switch, makeStyles, shorthands, tokens } from '@fluentui/react-components';
// Remove import for custom Label
// import { Label } from '../Label/Label';

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

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ isDarkMode, toggleTheme }) => {
	const styles = useStyles();

	return (
		<div className={styles.container}>
			<Label size="medium">{isDarkMode ? "Dark Mode" : "Light Mode"}</Label>
			<Switch checked={isDarkMode} onChange={toggleTheme} />
		</div>
	);
}; 