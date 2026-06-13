import { FluentProvider } from "@fluentui/react-components";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import { neonDarkTheme, neonLightTheme } from "./theme/neonTheme";
import "./styles/main.css";

function resolveSystemTheme(): typeof neonDarkTheme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? neonDarkTheme
		: neonLightTheme;
}

function AppContainer(): React.JSX.Element {
	const [theme, setTheme] = useState(resolveSystemTheme);
	const [isDarkMode, setIsDarkMode] = useState(() => theme === neonDarkTheme);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => {
			const next = e.matches ? neonDarkTheme : neonLightTheme;
			setTheme(next);
			setIsDarkMode(e.matches);
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const toggleTheme = () => {
		const next = isDarkMode ? neonLightTheme : neonDarkTheme;
		setTheme(next);
		setIsDarkMode(!isDarkMode);
	};

	return (
		<FluentProvider id="app-container" theme={theme}>
			<App toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
		</FluentProvider>
	);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<AppContainer />
	</React.StrictMode>,
);
