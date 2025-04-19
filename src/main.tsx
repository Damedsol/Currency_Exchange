import {
	FluentProvider,
	webDarkTheme,
	webLightTheme,
	type Theme,
} from "@fluentui/react-components";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./styles/main.css";

// Create a container component to manage theme state
function AppContainer(): JSX.Element {
	// State for the current theme, initialize with dark theme by default
	const [theme, setTheme] = useState<Theme>(webDarkTheme);
	const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

	// Function to toggle the theme
	const toggleTheme: () => void = () => {
		const newTheme = isDarkMode ? webLightTheme : webDarkTheme;
		setTheme(newTheme);
		setIsDarkMode(!isDarkMode);
	};

	return (
		<FluentProvider id="app-container" theme={theme}>
			{/* Pass the toggle function and current state to App */}
			<App toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
		</FluentProvider>
	);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<AppContainer />
	</React.StrictMode>,
);
