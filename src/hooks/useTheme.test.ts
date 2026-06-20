// @vitest-environment jsdom

import { type ReactNode, createElement } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./useTheme";

function wrapper(props: { children: ReactNode }): React.JSX.Element {
	return createElement(ThemeProvider, null, props.children);
}

describe("useTheme", () => {
	afterEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	it("provides default dark mode based on localStorage", () => {
		localStorage.setItem("themePreference", "dark");
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDarkMode).toBe(true);
	});

	it("provides default light mode based on localStorage", () => {
		localStorage.setItem("themePreference", "light");
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDarkMode).toBe(false);
	});

	it("toggleTheme switches between dark and light", () => {
		localStorage.setItem("themePreference", "dark");
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.isDarkMode).toBe(true);
		act(() => result.current.toggleTheme());
		expect(result.current.isDarkMode).toBe(false);
	});

	it("persists theme preference to localStorage on toggle", () => {
		localStorage.setItem("themePreference", "dark");
		const { result } = renderHook(() => useTheme(), { wrapper });
		act(() => result.current.toggleTheme());
		expect(localStorage.getItem("themePreference")).toBe("light");
	});

	it("provides the current theme object", () => {
		localStorage.setItem("themePreference", "dark");
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.theme).toBeDefined();
		expect(typeof result.current.theme).toBe("object");
	});
});
