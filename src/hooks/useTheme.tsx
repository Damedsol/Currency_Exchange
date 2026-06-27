import { FluentProvider, type Theme } from "@fluentui/react-components";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useLayoutEffect,
	useState,
	useTransition,
} from "react";
import { neonDarkTheme, neonLightTheme } from "../theme/neonTheme";

interface ThemeContextValue {
	isDarkMode: boolean;
	toggleTheme: () => void;
	theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveSystemTheme(): "dark" | "light" {
	const stored = localStorage.getItem("themePreference");
	if (stored === "dark") return "dark";
	if (stored === "light") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function resolveIsDarkMode(): boolean {
	return resolveSystemTheme() === "dark";
}

function resolveTheme(isDark: boolean): Theme {
	return isDark ? neonDarkTheme : neonLightTheme;
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({
	children,
}: ThemeProviderProps): React.JSX.Element {
	const [isDarkMode, setIsDarkMode] = useState(resolveIsDarkMode());
	const [theme, setTheme] = useState(() => resolveTheme(isDarkMode));

	useLayoutEffect(() => {
		document.documentElement.setAttribute(
			"data-theme",
			isDarkMode ? "dark" : "light",
		);
	}, [isDarkMode]);

	useLayoutEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem("themePreference")) {
				setIsDarkMode(e.matches);
				setTheme(e.matches ? neonDarkTheme : neonLightTheme);
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const [, startTransition] = useTransition();

	const toggleTheme = useCallback(() => {
		startTransition(() => {
			setIsDarkMode((prev) => {
				const next = !prev;
				setTheme(next ? neonDarkTheme : neonLightTheme);
				localStorage.setItem("themePreference", next ? "dark" : "light");
				return next;
			});
		});
	}, []);

	const ctxValue: ThemeContextValue = {
		isDarkMode,
		toggleTheme,
		theme,
	};

	return (
		<ThemeContext.Provider value={ctxValue}>
			<FluentProvider id="app-container" theme={theme}>
				{children}
			</FluentProvider>
		</ThemeContext.Provider>
	);
}
