import { FluentProvider } from "@fluentui/react-components";
import React, { useLayoutEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import { neonDarkTheme, neonLightTheme } from "./theme/neonTheme";
import "./styles/main.css";
import { useGlobalStyles } from "./styles/globalStyles";

function resolveSystemTheme(): typeof neonDarkTheme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? neonDarkTheme
		: neonLightTheme;
}

function GlobalStylesSlot(): null {
	useGlobalStyles();
	return null;
}

function AppContainer(): React.JSX.Element {
	const [theme, setTheme] = useState(resolveSystemTheme);
	const [isDarkMode, setIsDarkMode] = useState(() => theme === neonDarkTheme);

	useLayoutEffect(() => {
		document.documentElement.setAttribute(
			"data-theme",
			isDarkMode ? "dark" : "light",
		);
	}, [isDarkMode]);

	useLayoutEffect(() => {
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
			<GlobalStylesSlot />
			<App toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
		</FluentProvider>
	);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<AppContainer />
	</React.StrictMode>,
);
